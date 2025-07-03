import React, { useState, useCallback } from 'react';
import CaseSelectionScreen from './components/CaseSelectionScreen';
import ChatScreen from './components/ChatScreen';
import ErrorMessage from './components/ErrorMessage';
import { api } from './services/api';
import { Message, EvaluationData, AppState } from './types';

const API_URL = import.meta.env.VITE_API_URL || 'https://simulatorbackend.onrender.com';

function App() {
  const [appState, setAppState] = useState<AppState>('selecting_case');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [evaluationData, setEvaluationData] = useState<EvaluationData | null>(null);
  const [currentCaseId, setCurrentCaseId] = useState<string | null>(null);

  const handleStartSimulation = useCallback(async (caseId: string) => {
    console.log('App: Starting simulation for case:', caseId);
    setIsLoading(true);
    setError(null);
    setCurrentCaseId(caseId);
    
    try {
      const response = await api.startSimulation(caseId);
      console.log('App: Simulation started successfully:', response);
      setSessionId(response.sessionId);
      setMessages([{
        sender: 'patient',
        text: response.initialPrompt,
        timestamp: Date.now()
      }]);
      setAppState('chatting');
    } catch (err) {
      console.error('App: Error starting simulation:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to start simulation';
      setError(`Failed to start case "${caseId}": ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSendMessage = useCallback(async (question: string) => {
    if (!question.trim() || !sessionId) return;

    console.log('App: Sending message:', { sessionId, question });

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

    try {
      // Make POST request to start the streaming response
      const response = await fetch(`${API_URL}/api/simulation/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId, question }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      // Check if response is Server-Sent Events
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/event-stream')) {
        console.log('Received SSE response, processing stream...');
        
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        
        if (!reader) {
          throw new Error('Failed to get response reader');
        }

        let buffer = '';
        
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            console.log('Stream completed');
            setIsLoading(false);
            break;
          }
          
          // Decode the chunk and add to buffer
          buffer += decoder.decode(value, { stream: true });
          
          // Process complete lines
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // Keep incomplete line in buffer
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.slice(6); // Remove 'data: ' prefix
              
              if (dataStr.trim() === '') continue; // Skip empty data lines
              
              try {
                const data = JSON.parse(dataStr);
                console.log('Received SSE data:', data);
                
                if (data.type === 'chunk') {
                  // Append the new chunk to the patient's message
                  setMessages(prev => {
                    const newMessages = [...prev];
                    const lastMessage = newMessages[newMessages.length - 1];
                    if (lastMessage && lastMessage.sender === 'patient') {
                      lastMessage.text += data.content;
                    }
                    return newMessages;
                  });
                } else if (data.type === 'done') {
                  console.log('Stream completed via done message');
                  setIsLoading(false);
                  
                  // Check for evaluation data
                  if (data.evaluation) {
                    setEvaluationData(data.evaluation);
                  }
                } else if (data.type === 'final') {
                  console.log('Final message with evaluation');
                  setIsLoading(false);
                  
                  // Set the final response if provided
                  if (data.response) {
                    setMessages(prev => {
                      const newMessages = [...prev];
                      const lastMessage = newMessages[newMessages.length - 1];
                      if (lastMessage && lastMessage.sender === 'patient') {
                        lastMessage.text = data.response;
                      }
                      return newMessages;
                    });
                  }
                  
                  // Show evaluation
                  if (data.evaluation) {
                    setEvaluationData(data.evaluation);
                  }
                } else if (data.type === 'error') {
                  console.error('Stream error:', data.message || data.content);
                  const errorMessage = data.message || data.content || 'The AI service encountered an error. Please try asking your question again.';
                  setError(errorMessage);
                  setIsLoading(false);
                  
                  // Remove the placeholder message
                  setMessages(prev => {
                    const newMessages = [...prev];
                    if (newMessages[newMessages.length - 1]?.sender === 'patient' && 
                        newMessages[newMessages.length - 1]?.text === '') {
                      newMessages.pop();
                    }
                    return newMessages;
                  });
                  break;
                }
              } catch (parseError) {
                console.error('Error parsing SSE data:', parseError);
                console.error('Raw data:', dataStr);
              }
            }
          }
        }
      } else {
        // Fallback to regular JSON response
        console.log('Received regular JSON response');
        const result = await response.json();
        
        // Remove the placeholder message
        setMessages(prev => {
          const newMessages = [...prev];
          if (newMessages[newMessages.length - 1]?.sender === 'patient' && 
              newMessages[newMessages.length - 1]?.text === '') {
            newMessages.pop();
          }
          return newMessages;
        });

        const patientMessage: Message = {
          sender: 'patient',
          text: result.response,
          timestamp: Date.now()
        };

        setMessages(prev => [...prev, patientMessage]);

        if (result.isFinal && result.evaluation) {
          setEvaluationData(result.evaluation);
        }
        
        setIsLoading(false);
      }

    } catch (err) {
      console.error('App: Error sending message:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(`Communication error: ${errorMessage}`);
      setIsLoading(false);
      
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