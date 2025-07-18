import React, { useState } from 'react';
import { api } from '../services/api';
import ChatScreen from '../components/ChatScreen';
import { Message, EvaluationData } from '../types';

interface ChatContainerProps {
  caseId: string;
  onBack: () => void;
}

const ChatContainer: React.FC<ChatContainerProps> = ({ caseId, onBack }) => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [evaluationData, setEvaluationData] = useState<EvaluationData | null>(null);

  // Start simulation when caseId changes
  React.useEffect(() => {
    let isMounted = true;
    setSessionId(null);
    setMessages([]);
    setEvaluationData(null);

    api.startSimulation(caseId)
      .then(result => {
        if (isMounted) {
          setSessionId(result.sessionId);
          setMessages([
            { sender: 'patient', text: result.initialPrompt, timestamp: Date.now() }
          ]);
        }
      })
      .catch(err => {
        if (isMounted) {
          setMessages([
            { sender: 'patient', text: 'Failed to start simulation. Please try again.', timestamp: Date.now() }
          ]);
        }
      });

    return () => { isMounted = false; };
  }, [caseId]);

  // Handle sending a message and streaming the response
  const handleSendMessage = (question: string) => {
    if (!sessionId) {
      setMessages(prev => [
        ...prev,
        { sender: 'patient', text: 'Session not started. Please try again.', timestamp: Date.now() }
      ]);
      return;
    }

    setMessages(prev => [
      ...prev,
      { sender: 'clinician', text: question, timestamp: Date.now() },
      { sender: 'patient', text: '', timestamp: Date.now() } // Placeholder for streaming response
    ]);
    setIsLoading(true);

    let aiResponse = '';
    const cleanup = api.streamSimulationAsk(
      { sessionId, question },
      (chunk) => {
        aiResponse += chunk;
        setMessages(prev => {
          // Update the last message (AI) with the new chunk
          const updated = [...prev];
          updated[updated.length - 1] = { sender: 'patient', text: aiResponse, timestamp: Date.now() };
          return updated;
        });
      },
      () => {
        setIsLoading(false);
        // Optionally: check if simulation is complete and setEvaluationData
      },
      (err) => {
        setIsLoading(false);
        setMessages(prev => [
          ...prev,
          { sender: 'patient', text: 'Error receiving response from server.', timestamp: Date.now() }
        ]);
      }
    );

    // Optional: cleanup on unmount or new message
    // return cleanup;
  };

  const handleRestart = () => {
    setSessionId(null);
    setMessages([]);
    setEvaluationData(null);
    // Optionally, you can trigger a re-mount or call startSimulation again
  };

  const handleEndSession = async () => {
    if (sessionId) {
      const data = await api.endSession(sessionId);
      setEvaluationData(data);
    }
  }

  return (
    <ChatScreen
      messages={messages}
      onSendMessage={handleSendMessage}
      isLoading={isLoading}
      onRestart={handleRestart}
      onBack={onBack}
      currentCaseId={caseId}
      isSessionActive={!evaluationData}
      sessionId={sessionId}
      onEndSession={handleEndSession}
    />
  );
};

export default ChatContainer;