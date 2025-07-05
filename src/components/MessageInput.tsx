import React, { useState, useRef } from 'react';
import { Send, Mic, Square, Zap, Brain, AlertTriangle } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (question: string) => void;
  isDisabled: boolean;
  isSessionActive: boolean;
  sessionId: string | null;
  onEndSession: () => Promise<void>;
}

const MessageInput: React.FC<MessageInputProps> = ({ 
  onSendMessage, 
  isDisabled, 
  isSessionActive,
  sessionId,
  onEndSession
}) => {
  const [input, setInput] = useState('');
  const [isEndingSession, setIsEndingSession] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isDisabled && isSessionActive) {
      onSendMessage(input.trim());
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  const handleEndSession = async () => {
    setIsEndingSession(true);
    try {
      await onEndSession();
    } catch (error) {
      console.error('Error ending session:', error);
    } finally {
      setIsEndingSession(false);
    }
  };

  const quickQuestions = [
    "Can you tell me more about your symptoms?",
    "When did this pain first start?",
    "Have you experienced this before?",
    "Are you taking any medications?",
    "Do you have any allergies?"
  ];

  return (
    <div className="bg-gradient-to-r from-gray-50 to-white border-t border-gray-200">
      {/* Quick Questions Bar */}
      {isSessionActive && input.length === 0 && (
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <Brain className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-gray-700">Quick Questions</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {quickQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => setInput(question)}
                className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded-lg border border-blue-200 transition-all duration-200 hover:scale-105"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="p-6">
        <form onSubmit={handleSubmit} className="flex items-end gap-4">
          <div className="flex-1">
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder={
                  isSessionActive 
                    ? "Ask your next clinical question..." 
                    : "Session has ended. Start a new session to continue."
                }
                disabled={isDisabled || !isSessionActive}
                className="w-full px-5 py-4 pr-14 border-2 border-gray-200 rounded-2xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed transition-all duration-200 bg-white shadow-sm"
                style={{ minHeight: '56px', maxHeight: '120px' }}
                rows={1}
              />
              <button
                type="button"
                className="absolute right-4 top-4 text-gray-400 hover:text-blue-600 transition-colors disabled:hover:text-gray-400"
                disabled={isDisabled || !isSessionActive}
                title="Voice input (coming soon)"
              >
                <Mic className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex justify-between items-center mt-2">
              <div className="flex items-center gap-4">
                <p className="text-xs text-gray-500">
                  {isSessionActive ? "Press Enter to send, Shift+Enter for new line" : "Session inactive"}
                </p>
                {isSessionActive && (
                  <div className="flex items-center gap-1 text-emerald-600">
                    <Zap className="w-3 h-3" />
                    <span className="text-xs font-medium">Live</span>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-400">
                {input.length}/500
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            {/* End Session Button */}
            {isSessionActive && sessionId && (
              <button
                type="button"
                onClick={handleEndSession}
                disabled={isDisabled || isEndingSession}
                className="flex-shrink-0 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white p-4 rounded-2xl transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 shadow-lg group"
                title="End Session & Get Evaluation"
              >
                {isEndingSession ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <Square className="w-5 h-5 group-hover:scale-110 transition-transform" />
                )}
              </button>
            )}

            {/* Send Button */}
            <button
              type="submit"
              disabled={isDisabled || !input.trim() || !isSessionActive}
              className="flex-shrink-0 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white p-4 rounded-2xl transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 shadow-lg group"
              title="Send Message"
            >
              <Send className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </form>

        {/* Session Status */}
        {!isSessionActive && (
          <div className="mt-4 flex items-center gap-2 text-amber-600 bg-amber-50 px-4 py-3 rounded-xl border border-amber-200">
            <AlertTriangle className="w-5 h-5" />
            <span className="text-sm font-medium">
              Session has ended. You can review your evaluation or start a new case.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageInput;