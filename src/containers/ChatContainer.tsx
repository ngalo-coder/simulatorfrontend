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
            { role: 'ai', content: result.initialPrompt }
          ]);
        }
      })
      .catch(err => {
        if (isMounted) {
          setMessages([
            { role: 'ai', content: 'Failed to start simulation. Please try again.' }
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
        { role: 'system', content: 'Session not started. Please try again.' }
      ]);
      return;
    }

    setMessages(prev => [
      ...prev,
      { role: 'user', content: question },
      { role: 'ai', content: '' } // Placeholder for streaming response
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
          updated[updated.length - 1] = { role: 'ai', content: aiResponse };
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
          { role: 'system', content: 'Error receiving response from server.' }
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

  return (
    <ChatScreen
      messages={messages}
      onSendMessage={handleSendMessage}
      isLoading={isLoading}
      evaluationData={evaluationData}
      onRestart={handleRestart}
      onBack={onBack}
      currentCaseId={caseId}
    />
  );
};

export default ChatContainer;