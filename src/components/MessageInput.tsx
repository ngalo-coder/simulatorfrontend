import React, { useState, useRef } from 'react';
import { Send, Mic, Square, Loader2 } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (question: string) => void;
  onEndSession: () => void;
  isDisabled: boolean;
  isSessionActive: boolean;
  sessionId: string | null;
  isEndingSession: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ 
  onSendMessage, 
  onEndSession, 
  isDisabled, 
  isSessionActive,
  sessionId,
  isEndingSession
}) => {
  const [input, setInput] = useState('');
  const [showEndConfirmation, setShowEndConfirmation] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isDisabled && isSessionActive && !isEndingSession) {
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

  const handleEndSessionClick = () => {
    setShowEndConfirmation(true);
  };

  const confirmEndSession = () => {
    setShowEndConfirmation(false);
    onEndSession();
  };

  const cancelEndSession = () => {
    setShowEndConfirmation(false);
  };

  return (
    <div className="border-t border-gray-200 bg-white">
      {/* End Session Confirmation */}
      {showEndConfirmation && (
        <div className="bg-yellow-50 border-b border-yellow-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-yellow-800">End Session</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Are you sure you want to end this simulation session? The AI will generate a detailed evaluation of your performance.
              </p>
            </div>
            <div className="flex gap-2 ml-4">
              <button
                onClick={cancelEndSession}
                className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmEndSession}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                End & Evaluate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading indicator for session ending */}
      {isEndingSession && (
        <div className="bg-blue-50 border-b border-blue-200 p-4">
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            <div>
              <h3 className="text-sm font-medium text-blue-800">Generating Evaluation</h3>
              <p className="text-sm text-blue-700">
                Please wait while the AI analyzes your performance and generates a detailed evaluation...
              </p>
            </div>
          </div>
        </div>
      )}

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
                  isEndingSession ? "Generating evaluation..." :
                  isSessionActive 
                    ? "Type your question for the patient..." 
                    : "Session has ended. Start a new session to continue."
                }
                disabled={isDisabled || !isSessionActive || isEndingSession}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
                style={{ minHeight: '48px', maxHeight: '120px' }}
                rows={1}
              />
              <button
                type="button"
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                disabled={isDisabled || !isSessionActive || isEndingSession}
              >
                <Mic className="w-5 h-5" />
              </button>
            </div>
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-gray-500">
                {isEndingSession ? "Evaluation in progress..." :
                 isSessionActive ? "Press Enter to send, Shift+Enter for new line" : "Session inactive"}
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
                onClick={handleEndSessionClick}
                disabled={isDisabled || isEndingSession}
                className="flex-shrink-0 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 shadow-lg"
                title={isEndingSession ? "Generating Evaluation..." : "End Session & Get Evaluation"}
              >
                {isEndingSession ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Square className="w-5 h-5" />
                )}
              </button>
            )}

            {/* Send Button */}
            <button
              type="submit"
              disabled={isDisabled || !input.trim() || !isSessionActive || isEndingSession}
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