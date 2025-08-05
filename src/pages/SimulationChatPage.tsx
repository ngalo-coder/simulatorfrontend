import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/apiService';
import { useAuth } from '../hooks/useAuth';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  speaks_for?: string;
}

const SimulationChatPage: React.FC = () => {
  const { caseId, sessionId } = useParams();
  const navigate = useNavigate();

  // Add custom styles for animations
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fade-in {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .animate-fade-in {
        animation: fade-in 0.3s ease-out forwards;
      }
      @keyframes pulse-glow {
        0%, 100% { box-shadow: 0 0 5px rgba(59, 130, 246, 0.5); }
        50% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.8); }
      }
      .pulse-glow {
        animation: pulse-glow 2s infinite;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  const {} = useAuth();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionData, setSessionData] = useState<any>(null);
  const [isSessionEnded, setIsSessionEnded] = useState(false);
  const [evaluation, setEvaluation] = useState<string>('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (caseId && !sessionId) {
      startNewSimulation();
    } else if (sessionId) {
      // Load existing session if needed
      setSessionData({ sessionId });
    }

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [caseId, sessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const startNewSimulation = async () => {
    if (!caseId) return;

    try {
      setIsLoading(true);
      const response = await api.startSimulation(caseId);

      setSessionData(response);

      // Add system welcome message
      const systemMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `🏥 **Welcome to Simuatech**\n\nYou are now interacting with ${
          response.patientName || 'your patient'
        }. This is a safe learning environment where you can practice your clinical skills.\n\n**How to interact:**\n• Ask questions about symptoms, medical history, or concerns\n• Conduct a virtual examination by asking specific questions\n• Practice your diagnostic reasoning\n• The patient will respond realistically based on their condition\n\n**Tips:**\n• Start with open-ended questions like "What brings you in today?"\n• Be thorough in your questioning\n• Take your time - there's no rush\n\nType your first question below to begin the consultation. Good luck! 👩‍⚕️👨‍⚕️`,
        timestamp: new Date(),
        speaks_for: 'System',
      };

      const messages = [systemMessage];

      // Add initial message from patient if available
      if (response.initialPrompt) {
        const patientMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.initialPrompt,
          timestamp: new Date(),
          speaks_for: response.speaks_for || response.patientName || 'Patient',
        };
        messages.push(patientMessage);
      }

      setMessages(messages);

      // Update URL to include session ID
      navigate(`/simulation/${caseId}/session/${response.sessionId}`, { replace: true });
    } catch (error) {
      console.error('Error starting simulation:', error);
      alert('Failed to start simulation. Please try again.');
      navigate('/simulation');
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !sessionData?.sessionId || isLoading || isSessionEnded) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      await streamPatientResponse(sessionData.sessionId, userMessage.content);
    } catch (error) {
      console.error('Error sending message:', error);

      let errorText = "I apologize, but I'm having trouble responding right now. Please try again.";

      if (error instanceof Error) {
        if (error.message.includes('authentication') || error.message.includes('token')) {
          errorText = 'Authentication error. Please refresh the page and try again.';
        } else if (error.message.includes('timeout')) {
          errorText = 'The response is taking longer than expected. Please try again.';
        } else if (error.message.includes('connection')) {
          errorText =
            'Connection to server failed. Please check your internet connection and try again.';
        }
      }

      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: errorText,
        timestamp: new Date(),
        speaks_for: sessionData?.patientName || 'System',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const streamPatientResponse = (sessionId: string, question: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const token = localStorage.getItem('authToken');

      if (!token) {
        reject(new Error('No authentication token found'));
        return;
      }

      const queryParams = new URLSearchParams({
        sessionId,
        question,
        token,
      });

      const eventSource = new EventSource(
        `${import.meta.env.VITE_API_URL}/api/simulation/ask?${queryParams.toString()}`
      );

      eventSourceRef.current = eventSource;

      let assistantMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        speaks_for: sessionData?.patientName || 'Patient',
      };

      let hasStarted = false;
      let connectionEstablished = false;

      eventSource.onopen = () => {
        console.log('EventSource connection opened');
        connectionEstablished = true;
      };

      eventSource.onmessage = (event) => {
        try {
          console.log('Received SSE data:', event.data);
          const data = JSON.parse(event.data);

          switch (data.type) {
            case 'chunk':
              if (!hasStarted) {
                setMessages((prev) => [...prev, assistantMessage]);
                hasStarted = true;
              }

              assistantMessage.content += data.content;
              assistantMessage.speaks_for = data.speaks_for || assistantMessage.speaks_for;

              setMessages((prev) =>
                prev.map((msg) => (msg.id === assistantMessage.id ? { ...assistantMessage } : msg))
              );
              break;

            case 'done':
              console.log('Stream completed');
              eventSource.close();
              resolve();
              break;

            case 'session_end':
              console.log('Session ended by system');
              setIsSessionEnded(true);
              if (data.summary) {
                setEvaluation(data.summary);
              }
              eventSource.close();
              resolve();
              break;

            default:
              console.log('Unknown event type:', data.type);
          }
        } catch (err) {
          console.error('Error parsing SSE data:', err, 'Raw data:', event.data);
          eventSource.close();
          reject(err);
        }
      };

      eventSource.onerror = (err) => {
        console.error('EventSource error:', err);
        console.error('EventSource readyState:', eventSource.readyState);

        if (!connectionEstablished) {
          // Connection failed to establish
          reject(new Error('Failed to establish connection to server'));
        } else {
          // Connection was established but then failed
          reject(new Error('Connection to server was lost'));
        }

        eventSource.close();
      };

      // Cleanup timeout
      setTimeout(() => {
        if (eventSource.readyState !== EventSource.CLOSED) {
          console.log('Request timeout, closing EventSource');
          eventSource.close();
          reject(new Error('Request timeout - no response from server'));
        }
      }, 60000); // Increased timeout to 60 seconds
    });
  };

  const endSession = async () => {
    if (!sessionData?.sessionId) return;

    try {
      setIsLoading(true);
      const response = await api.endSimulation(sessionData.sessionId);

      setIsSessionEnded(true);
      setEvaluation(response.evaluation || 'Session completed successfully.');
    } catch (error) {
      console.error('Error ending session:', error);
      alert('Failed to end session properly.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (isLoading && messages.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Starting your simulation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-gradient-to-br from-blue-50 via-white to-indigo-50 -mx-4 sm:-mx-6 lg:-mx-8 -my-8">
      {/* Enhanced Header with Patient Info */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">ST</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Simuatech</h1>
                  <p className="text-xs text-gray-500">Medical Simulation Platform</p>
                </div>
              </div>

              {sessionData?.patientName && (
                <div className="flex items-center space-x-3 ml-8 pl-8 border-l border-gray-200">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-lg">👤</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{sessionData.patientName}</p>
                    <p className="text-sm text-gray-600 flex items-center">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                      Active Session
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <div className="text-right mr-4">
                <p className="text-xs text-gray-500">Session Time</p>
                <p className="text-sm font-mono text-gray-700">{new Date().toLocaleTimeString()}</p>
              </div>

              {!isSessionEnded && (
                <button
                  onClick={endSession}
                  disabled={isLoading}
                  className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 disabled:opacity-50 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <span className="flex items-center space-x-2">
                    <span>🏁</span>
                    <span>End Session</span>
                  </span>
                </button>
              )}
              <button
                onClick={() => navigate('/simulation')}
                className="px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <span className="flex items-center space-x-2">
                  <span>←</span>
                  <span>Back to Cases</span>
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        {!isSessionEnded && (
          <div className="px-6 pb-3">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
              <span>Session Progress</span>
              <span>{messages.filter((m) => m.role === 'user').length} questions asked</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(
                    (messages.filter((m) => m.role === 'user').length / 10) * 100,
                    100
                  )}%`,
                }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Messages with Better Visual Design */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((message, index) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            } animate-fade-in`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div
              className={`flex items-start space-x-3 ${
                message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              {/* Avatar */}
              <div
                className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
                    : message.speaks_for === 'System'
                    ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                    : 'bg-gradient-to-br from-purple-500 to-pink-600'
                }`}
              >
                <span className="text-white text-sm font-medium">
                  {message.role === 'user' ? '👨‍⚕️' : message.speaks_for === 'System' ? 'ℹ️' : '🤒'}
                </span>
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-md lg:max-w-lg ${
                  message.role === 'user' ? 'text-right' : 'text-left'
                }`}
              >
                {/* Speaker Label */}
                {message.role === 'assistant' && message.speaks_for && (
                  <div
                    className={`text-xs mb-2 font-semibold ${
                      message.speaks_for === 'System' ? 'text-green-700' : 'text-purple-700'
                    }`}
                  >
                    {message.speaks_for === 'System' ? 'System Guide' : message.speaks_for}
                  </div>
                )}

                {/* Message Content */}
                <div
                  className={`px-4 py-3 rounded-2xl shadow-md ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white'
                      : message.speaks_for === 'System'
                      ? 'bg-gradient-to-br from-green-50 to-emerald-50 text-gray-800 border-l-4 border-green-400'
                      : 'bg-white text-gray-900 border border-gray-200 shadow-lg'
                  }`}
                >
                  <div
                    className={`whitespace-pre-wrap ${
                      message.speaks_for === 'System' ? 'text-sm leading-relaxed' : ''
                    }`}
                  >
                    {message.content}
                  </div>
                </div>

                {/* Timestamp */}
                <div
                  className={`text-xs mt-2 ${
                    message.role === 'user' ? 'text-blue-600' : 'text-gray-500'
                  }`}
                >
                  {message.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start animate-fade-in">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                <span className="text-white text-sm font-medium">🤒</span>
              </div>
              <div className="max-w-md lg:max-w-lg">
                <div className="text-xs mb-2 font-semibold text-purple-700">
                  {sessionData?.patientName || 'Patient'}
                </div>
                <div className="bg-white text-gray-900 border border-gray-200 shadow-lg px-4 py-3 rounded-2xl pulse-glow">
                  <div className="flex items-center space-x-3">
                    <div className="flex space-x-1">
                      <div
                        className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                        style={{ animationDelay: '0ms' }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                        style={{ animationDelay: '150ms' }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                        style={{ animationDelay: '300ms' }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 font-medium">
                      {sessionData?.patientName || 'Patient'} is thinking...
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Enhanced Evaluation Report */}
      {isSessionEnded && evaluation && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border-t border-blue-200 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">📋</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Session Evaluation Report</h3>
                    <p className="text-sm text-gray-600">
                      Patient: {sessionData?.patientName || 'Patient'} • Completed:{' '}
                      {new Date().toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Session ID</div>
                  <div className="text-xs font-mono text-gray-700">
                    {sessionData?.sessionId?.slice(-8) || 'N/A'}
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <div className="prose prose-sm max-w-none">
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <span className="mr-2">🎯</span>
                      Performance Summary
                    </h4>
                    <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {evaluation}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mt-6">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h5 className="font-semibold text-green-800 mb-2 flex items-center">
                        <span className="mr-2">✅</span>
                        Strengths
                      </h5>
                      <p className="text-sm text-green-700">
                        Review your evaluation above for specific strengths identified during this
                        session.
                      </p>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <h5 className="font-semibold text-amber-800 mb-2 flex items-center">
                        <span className="mr-2">💡</span>
                        Areas for Improvement
                      </h5>
                      <p className="text-sm text-amber-700">
                        Check your evaluation for recommendations on areas to focus on for future
                        cases.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h5 className="font-semibold text-blue-800 mb-2 flex items-center">
                      <span className="mr-2">🚀</span>
                      Next Steps
                    </h5>
                    <div className="text-sm text-blue-700 space-y-2">
                      <p>• Review your performance metrics in the Progress section</p>
                      <p>• Try similar cases to reinforce your learning</p>
                      <p>• Challenge yourself with cases of increasing difficulty</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
                <div className="text-xs text-gray-500">
                  This evaluation was generated by Simuatech AI to help improve your clinical
                  skills.
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => navigate('/progress')}
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                  >
                    View Progress
                  </button>
                  <button
                    onClick={() => navigate('/simulation')}
                    className="px-4 py-2 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 transition-colors"
                  >
                    Try Another Case
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Smart Suggestions Panel */}
      {messages.length <= 2 && !isSessionEnded && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-t border-blue-200 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🎯</span>
                <h3 className="font-bold text-blue-900">Smart Consultation Starters</h3>
              </div>
              <div className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                Click to use
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { icon: '🗣️', text: 'What brings you in today?', category: 'Opening' },
                { icon: '🤒', text: 'Can you describe your symptoms?', category: 'Symptoms' },
                { icon: '⏰', text: 'When did this start?', category: 'Timeline' },
                { icon: '📋', text: 'Any medical history I should know?', category: 'History' },
              ].map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => setInputMessage(suggestion.text)}
                  className="text-left p-3 bg-white rounded-lg border border-blue-200 hover:border-blue-400 hover:shadow-md transition-all duration-200 group"
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-lg">{suggestion.icon}</span>
                    <span className="text-xs font-medium text-blue-600">{suggestion.category}</span>
                  </div>
                  <div className="text-sm text-gray-700 group-hover:text-blue-800 font-medium">
                    "{suggestion.text}"
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-4 text-center">
              <p className="text-xs text-blue-700">
                💡 These are evidence-based consultation starters used by medical professionals
                worldwide
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Input Section */}
      {!isSessionEnded && (
        <div className="bg-white border-t border-gray-200 shadow-lg">
          <div className="p-6">
            <div className="flex items-end space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={
                      messages.length <= 1
                        ? "Start with: 'What brings you in today?' or 'How can I help you?'"
                        : 'Ask your next question...'
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 resize-none transition-all duration-200 text-gray-900 placeholder-gray-500"
                    rows={2}
                    disabled={isLoading}
                  />
                  <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                    {inputMessage.length}/500
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="text-xs text-gray-500 flex items-center space-x-4">
                    <span>💡 Press Enter to send, Shift+Enter for new line</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <span className="flex items-center">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>
                      AI Ready
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <span>Send</span>
                    <span>📤</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimulationChatPage;
