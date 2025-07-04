import React from 'react';
import { ArrowLeft, User, Activity } from 'lucide-react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import EvaluationModal from './EvaluationModal';
import { Message, EvaluationData } from '../types';

interface ChatScreenProps {
  messages: Message[];
  onSendMessage: (question: string) => void;
  onEndSession: () => void;
  isLoading: boolean;
  evaluationData: EvaluationData | null;
  onRestart: () => void;
  onBack: () => void;
  currentCaseId?: string | null;
  isSessionActive: boolean;
  sessionId: string | null;
}

const ChatScreen: React.FC<ChatScreenProps> = ({
  messages,
  onSendMessage,
  onEndSession,
  isLoading,
  evaluationData,
  onRestart,
  onBack,
  currentCaseId,
  isSessionActive,
  sessionId
}) => {
  const isSimulationComplete = evaluationData !== null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto bg-white shadow-xl min-h-screen flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <h1 className="font-semibold text-gray-900">Virtual Patient</h1>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      isSessionActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                    }`} />
                    <span className="text-sm text-gray-500">
                      {isSimulationComplete ? 'Session Complete' : isSessionActive ? 'Active Session' : 'Session Ended'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Activity className="w-4 h-4" />
              <span>Case: {currentCaseId || 'VP-ABD-001'}</span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <MessageList messages={messages} isLoading={isLoading} />

        {/* Input */}
        <MessageInput 
          onSendMessage={onSendMessage}
          onEndSession={onEndSession}
          isDisabled={isLoading || !isSessionActive}
          isSessionActive={isSessionActive}
          sessionId={sessionId}
        />

        {/* Evaluation Modal */}
        {evaluationData && (
          <EvaluationModal 
            evaluationData={evaluationData} 
            onRestart={onRestart} 
          />
        )}
      </div>
    </div>
  );
};

export default ChatScreen;