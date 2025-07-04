import React, { useState, useRef } from 'react';
import { Send, Mic, Square } from 'lucide-react';

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

  return (
    <div className="border-t border-gray-200 bg-white">
      <div className="p-4">
        <form onSubmit={handleSubmit} className="flex items-end gap-3">
          <div className="flex-1">
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder={
                  isSessionActive 
                    ? "Type your question for the patient..." 
                    : "Session has ended. Start a new session to continue."
                }
                disabled={isDisabled || !isSessionActive}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
                style={{ minHeight: '48px', maxHeight: '120px' }}
                rows={1}
              />
              <button
                type="button"
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                disabled={isDisabled || !isSessionActive}
              >
                <Mic className="w-5 h-5" />
              </button>
            </div>
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-gray-500">
                {isSessionActive ? "Press Enter to send, Shift+Enter for new line" : "Session inactive"}
              </p>
              <p className="text-xs text-gray-400">
                {input.length}/500
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            {/* End Session Button */}
            {isSessionActive && sessionId && (
              <button
                type="button"
                onClick={handleEndSession}
                disabled={isDisabled || isEndingSession}
                className="flex-shrink-0 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 shadow-lg"
                title="End Session & Get Evaluation"
              >
                <Square className="w-5 h-5" />
              </button>
            )}

            {/* Send Button */}
            <button
              type="submit"
              disabled={isDisabled || !input.trim() || !isSessionActive}
              className="flex-shrink-0 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 shadow-lg"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MessageInput;