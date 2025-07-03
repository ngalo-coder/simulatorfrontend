import React, { useState, useCallback } from 'react';
import CaseSelectionScreen from './components/CaseSelectionScreen';
import ChatScreen from './components/ChatScreen';
import ErrorMessage from './components/ErrorMessage';
import { api } from './services/api';
import { Message, EvaluationData, AppState } from './types';

function App() {
  const [appState, setAppState] = useState<AppState>('selecting_case');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [evaluationData, setEvaluationData] = useState<EvaluationData | null>(null);
  const [currentCaseId, setCurrentCaseId] = useState<string | null>(null);

  const handleStartSimulation = useCallback(async (caseId: string) => {
    setIsLoading(true);
    setError(null);
    setCurrentCaseId(caseId);

    try {
      const response = await api.startSimulation(caseId);
      setSessionId(response.sessionId);
      setMessages([{
        sender: 'patient',
        text: response.initialPrompt,
        timestamp: Date.now()
      }]);
      setAppState('chatting');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start simulation';
      setError(`Failed to start case "${caseId}": ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSendMessage = useCallback((question: string) => {
    if (!question.trim() || !sessionId) return;

    // Add the user's message to the state immediately
    const userMessage: Message = {
      sender: 'clinician',
      text: question,
      timestamp: Date.now()
    };

    // Add a placeholder for the patient's streaming response
    const patientPlaceholder: Message = {
      sender: 'patient',
      text: '',
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage, patientPlaceholder]);
    setIsLoading(true);
    setError(null);

    let aiResponse = '';
    const cleanup = api.streamSimulationAsk(
      { sessionId, question },
      (chunk) => {
        aiResponse += chunk;
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage && lastMessage.sender === 'patient') {
            lastMessage.text = aiResponse;
          }
          return newMessages;
        });
      },
      () => {
        setIsLoading(false);
        // Optionally: set evaluation data if your backend sends it
      },
      (err) => {
        setIsLoading(false);
        setError('Communication error: ' + (err?.message || 'Unknown error'));
        // Remove the placeholder message
        setMessages(prev => {
          const newMessages = [...prev];
          if (newMessages[newMessages.length - 1]?.sender === 'patient' &&
              newMessages[newMessages.length - 1]?.text === '') {
            newMessages.pop();
          }
          return newMessages;
        });
      }
    );

    // Optional: cleanup on unmount or new message
    // return cleanup;
  }, [sessionId]);

  const handleRestart = useCallback(() => {
    setAppState('selecting_case');
    setSessionId(null);
    setMessages([]);
    setEvaluationData(null);
    setError(null);
    setIsLoading(false);
    setCurrentCaseId(null);
  }, []);

  const handleBack = useCallback(() => {
    setAppState('selecting_case');
    setSessionId(null);
    setMessages([]);
    setEvaluationData(null);
    setError(null);
    setIsLoading(false);
    setCurrentCaseId(null);
  }, []);

  const handleDismissError = useCallback(() => {
    setError(null);
  }, []);

  if (appState === 'selecting_case') {
    return (
      <div>
        {error && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4">
            <ErrorMessage message={error} onDismiss={handleDismissError} />
          </div>
        )}
        <CaseSelectionScreen onStart={handleStartSimulation} isLoading={isLoading} />
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-40 w-full max-w-md px-4">
          <ErrorMessage message={error} onDismiss={handleDismissError} />
        </div>
      )}
      <ChatScreen
        messages={messages}
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        evaluationData={evaluationData}
        onRestart={handleRestart}
        onBack={handleBack}
        currentCaseId={currentCaseId}
      />
    </div>
  );
}

export default App;