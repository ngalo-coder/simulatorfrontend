import React, { useEffect, useRef } from 'react';
import { User, UserCheck, Loader2, Stethoscope, Brain, Clock } from 'lucide-react';
import { Message } from '../types';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
}

const MessageList: React.FC<MessageListProps> = ({ messages, isLoading }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {messages.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Stethoscope className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to Begin</h3>
          <p className="text-gray-600">Start your clinical history-taking session by asking your first question.</p>
        </div>
      )}

      {messages.map((message, index) => (
        <div
          key={index}
          className={`flex ${message.sender === 'clinician' ? 'justify-end' : 'justify-start'} animate-fade-in`}
        >
          <div className={`flex items-start gap-4 max-w-[85%] ${message.sender === 'clinician' ? 'flex-row-reverse' : 'flex-row'}`}>
            {/* Enhanced Avatar */}
            <div className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg border-2 ${
              message.sender === 'clinician' 
                ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-blue-300' 
                : 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-emerald-300'
            }`}>
              {message.sender === 'clinician' ? (
                <UserCheck className="w-6 h-6" />
              ) : (
                <User className="w-6 h-6" />
              )}
            </div>

            {/* Enhanced Message bubble */}
            <div className={`relative p-5 rounded-2xl shadow-lg border ${
              message.sender === 'clinician'
                ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-blue-300 rounded-br-md'
                : 'bg-white text-gray-900 border-gray-200 rounded-bl-md'
            }`}>
              {/* Message header */}
              <div className={`flex items-center gap-2 mb-2 ${
                message.sender === 'clinician' ? 'text-blue-100' : 'text-gray-500'
              }`}>
                {message.sender === 'clinician' ? (
                  <Brain className="w-4 h-4" />
                ) : (
                  <Stethoscope className="w-4 h-4" />
                )}
                <span className="text-xs font-semibold uppercase tracking-wide">
                  {message.sender === 'clinician' ? 'You (Clinician)' : 'Virtual Patient'}
                </span>
              </div>

              {/* Message content */}
              <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">
                {message.text}
              </p>

              {/* Message footer */}
              <div className={`flex items-center gap-2 mt-3 pt-2 border-t ${
                message.sender === 'clinician' 
                  ? 'text-blue-100 border-blue-400' 
                  : 'text-gray-400 border-gray-200'
              }`}>
                <Clock className="w-3 h-3" />
                <span className="text-xs font-medium">
                  {new Date(message.timestamp).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>

              {/* Message tail */}
              <div className={`absolute top-4 ${
                message.sender === 'clinician' 
                  ? 'right-0 transform translate-x-2' 
                  : 'left-0 transform -translate-x-2'
              }`}>
                <div className={`w-4 h-4 rotate-45 ${
                  message.sender === 'clinician' 
                    ? 'bg-gradient-to-br from-blue-500 to-indigo-600 border-r border-b border-blue-300' 
                    : 'bg-white border-r border-b border-gray-200'
                }`} />
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Enhanced Loading indicator */}
      {isLoading && (
        <div className="flex justify-start animate-fade-in">
          <div className="flex items-start gap-4 max-w-[85%]">
            <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-2 border-emerald-300 flex items-center justify-center shadow-lg">
              <User className="w-6 h-6" />
            </div>
            <div className="relative bg-white p-5 rounded-2xl rounded-bl-md shadow-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-2 text-gray-500">
                <Stethoscope className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wide">Virtual Patient</span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm text-gray-600 font-medium">Patient is responding...</span>
              </div>

              {/* Loading message tail */}
              <div className="absolute top-4 left-0 transform -translate-x-2">
                <div className="w-4 h-4 rotate-45 bg-white border-r border-b border-gray-200" />
              </div>
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;