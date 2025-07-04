import React, { useState, useCallback } from 'react';
import CaseSelectionScreen from './components/CaseSelectionScreen';
import ChatScreen from './components/ChatScreen';
import EvaluationScreen from './components/EvaluationScreen';
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
  const [isSessionActive, setIsSessionActive] = useState(false);

  const handleStartSimulation = useCallback(async (caseId: string) => {
    setIsLoading(true);
    setError(null);
    setCurrentCaseId(caseId);
    setIsSessionActive(false);
    setEvaluationData(null);

    try {
      const response = await api.startSimulation(caseId);
      setSessionId(response.sessionId);
      setMessages([{
        sender: 'patient',
        text: response.initialPrompt,
        timestamp: Date.now()
      }]);
      setAppState('chatting');
      setIsSessionActive(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start simulation';
      setError(`Failed to start case "${caseId}": ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleEndSession = useCallback(async (bypassConfirmation = false) => {
    if (!sessionId) {
      console.error('handleEndSession called without sessionId');
      return;
    }

    // Only show confirmation if not bypassed by an automatic process AND the session was active from user's perspective
    if (!bypassConfirmation && isSessionActive) {
      const confirmed = window.confirm(
        'Are you sure you want to end this session? You will receive an AI evaluation of your performance.'
      );
      if (!confirmed) return;
    }

    setIsLoading(true); // Indicate loading for fetching evaluation
    setError(null);

    try {
      const response = await api.endSession(sessionId); // This fetches the full evaluation
      setIsSessionActive(false); // Ensure session is marked inactive
      setEvaluationData({
        evaluation: response.evaluation,
        history: response.history
      });
      setAppState('showing_evaluation'); // Transition to show evaluation
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to end session';
      setError(`Error ending session: ${errorMessage}`);
      // Stay in current state if evaluation fetching fails
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, isSessionActive]);

  const handleSendMessage = useCallback((question: string) => {
    if (!question.trim() || !sessionId || !isSessionActive) return;

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
        // Stream completed normally - no automatic session end
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
      },
      (streamEndSignal) => {
        // Handle automatic session end from backend
        console.log('Automatic session end signaled by stream:', streamEndSignal);
        setIsLoading(false);
        setIsSessionActive(false);
        
        // Automatically trigger handleEndSession to fetch the full evaluation
        handleEndSession(true); // Pass true to bypass confirmation
      }
    );

    // Optional: cleanup on unmount or new message
    // return cleanup;
  }, [sessionId, isSessionActive, handleEndSession]);

  const handleRestart = useCallback(() => {
    setAppState('selecting_case');
    setSessionId(null);
    setMessages([]);
    setEvaluationData(null);
    setError(null);
    setIsLoading(false);
    setCurrentCaseId(null);
    setIsSessionActive(false);
  }, []);

  const handleBack = useCallback(() => {
    setAppState('selecting_case');
    setSessionId(null);
    setMessages([]);
    setEvaluationData(null);
    setError(null);
    setIsLoading(false);
    setCurrentCaseId(null);
    setIsSessionActive(false);
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

  // If showing evaluation, render EvaluationScreen
  if (appState === 'showing_evaluation' && evaluationData) {
    return (
      <div>
        {error && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4">
            <ErrorMessage message={error} onDismiss={handleDismissError} />
          </div>
        )}
        <EvaluationScreen 
          evaluationData={evaluationData} 
          onRestart={handleRestart}
          onBack={handleBack}
          currentCaseId={currentCaseId}
        />
      </div>
    );
  }

  // If chatting (and not yet showing evaluation), render ChatScreen
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
        onRestart={handleRestart}
        onBack={handleBack}
        currentCaseId={currentCaseId}
        isSessionActive={isSessionActive}
        sessionId={sessionId}
        onEndSession={() => handleEndSession(false)} // Manual end session, no bypassConfirmation
      />
    </div>
  );
}

export default App;