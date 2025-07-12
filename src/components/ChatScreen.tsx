import React from 'react';
import { 
  ArrowLeft, 
  User, 
  Activity, 
  Stethoscope, 
  Clock, 
  MessageCircle,
  Brain,
  Heart,
  Shield,
  Zap
} from 'lucide-react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { Message } from '../types';

interface ChatScreenProps {
  messages: Message[];
  onSendMessage: (question: string) => void;
  isLoading: boolean;
  onRestart: () => void;
  onBack: () => void;
  currentCaseId?: string | null;
  isSessionActive: boolean;
  sessionId: string | null;
  onEndSession: () => Promise<void>;
  streamingMessageIndex?: number; // Add prop for streaming message index
}

const ChatScreen: React.FC<ChatScreenProps> = ({
  messages,
  onSendMessage,
  isLoading,
  onRestart,
  onBack,
  currentCaseId,
  isSessionActive,
  sessionId,
  onEndSession,
  streamingMessageIndex
}) => {
  const getSessionStatusConfig = () => {
    if (isSessionActive) {
      return {
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-200',
        icon: Heart,
        text: 'Active Session',
        pulse: true
      };
    }
    return {
      color: 'text-gray-500',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      icon: Shield,
      text: 'Session Ended',
      pulse: false
    };
  };

  const statusConfig = getSessionStatusConfig();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto bg-white shadow-2xl min-h-screen flex flex-col lg:rounded-3xl lg:my-6 overflow-hidden border border-gray-200">
        {/* Enhanced Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 lg:p-8 shadow-lg lg:rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 lg:gap-6">
              <button
                onClick={onBack}
                className="p-3 lg:p-4 hover:bg-white hover:bg-opacity-20 rounded-xl transition-all duration-200 group"
                title="Back to Case Selection"
              >
                <ArrowLeft className="w-5 h-5 lg:w-6 lg:h-6 group-hover:scale-110 transition-transform" />
              </button>
              
              <div className="flex items-center gap-4 lg:gap-6">
                <div className="relative">
                  <div className="w-14 h-14 lg:w-16 lg:h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white border-opacity-30">
                    <User className="w-7 h-7 lg:w-8 lg:h-8 text-white" />
                  </div>
                  {isSessionActive && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 lg:w-6 lg:h-6 bg-emerald-400 rounded-full border-2 border-white animate-pulse" />
                  )}
                </div>
                
                <div>
                  <h1 className="text-xl lg:text-2xl font-bold mb-1">Virtual Patient</h1>
                  <div className="flex items-center gap-3 lg:gap-4">
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${statusConfig.bgColor} ${statusConfig.borderColor}`}>
                      <div className={`w-2 h-2 rounded-full ${isSessionActive ? 'bg-emerald-500' : 'bg-gray-400'} ${statusConfig.pulse ? 'animate-pulse' : ''}`} />
                      <span className={`text-sm lg:text-base font-medium ${statusConfig.color}`}>
                        {statusConfig.text}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-blue-100">
                      <MessageCircle className="w-4 h-4 lg:w-5 lg:h-5" />
                      <span className="text-sm lg:text-base font-medium">
                        {Math.floor(messages.length / 2)} exchanges
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="flex items-center gap-2 text-blue-100 mb-1">
                <Activity className="w-4 h-4 lg:w-5 lg:h-5" />
                <span className="text-sm lg:text-base font-medium">Case ID</span>
              </div>
              <span className="text-lg lg:text-xl font-bold bg-white bg-opacity-20 px-3 py-1 lg:px-4 lg:py-2 rounded-lg">
                {currentCaseId || 'VP-001'}
              </span>
            </div>
          </div>
        </div>

        {/* Session Info Bar */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200 px-6 lg:px-8 py-4 lg:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6 lg:gap-8">
              <div className="flex items-center gap-2 text-blue-700">
                <Stethoscope className="w-5 h-5 lg:w-6 lg:h-6" />
                <span className="font-semibold text-base lg:text-lg">Clinical History Taking Session</span>
              </div>
              
              <div className="flex items-center gap-2 text-blue-600">
                <Clock className="w-4 h-4 lg:w-5 lg:h-5" />
                <span className="text-sm lg:text-base font-medium">
                  Started {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-4 lg:gap-6">
              <div className="flex items-center gap-2 text-blue-600">
                <Brain className="w-4 h-4 lg:w-5 lg:h-5" />
                <span className="text-sm lg:text-base font-medium">AI-Powered Patient</span>
              </div>
              
              {isSessionActive && (
                <div className="flex items-center gap-2 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200">
                  <Zap className="w-4 h-4 lg:w-5 lg:h-5" />
                  <span className="text-sm lg:text-base font-semibold">Live Session</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 bg-gradient-to-b from-gray-50 to-white">
          <MessageList
            messages={messages}
            isLoading={isLoading}
            streamingMessageId={streamingMessageIndex}
          />
        </div>

        {/* Enhanced Input Area */}
        <div className="border-t border-gray-200 bg-white">
          <MessageInput 
            onSendMessage={onSendMessage}
            isDisabled={isLoading || !isSessionActive}
            isSessionActive={isSessionActive}
            sessionId={sessionId}
            onEndSession={onEndSession}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatScreen;