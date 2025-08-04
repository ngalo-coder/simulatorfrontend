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
  const { } = useAuth();
  
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
        content: `🏥 **Welcome to Virtual Patient Simulation**\n\nYou are now interacting with a virtual patient. This is a safe learning environment where you can practice your clinical skills.\n\n**How to interact:**\n• Ask questions about symptoms, medical history, or concerns\n• Conduct a virtual examination by asking specific questions\n• Practice your diagnostic reasoning\n• The patient will respond realistically based on their condition\n\n**Tips:**\n• Start with open-ended questions like "What brings you in today?"\n• Be thorough in your questioning\n• Take your time - there's no rush\n\nType your first question below to begin the consultation. Good luck! 👩‍⚕️👨‍⚕️`,
        timestamp: new Date(),
        speaks_for: 'System'
      };

      const messages = [systemMessage];

      // Add initial message from patient if available
      if (response.initialPrompt) {
        const patientMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.initialPrompt,
          timestamp: new Date(),
          speaks_for: response.speaks_for || response.patientName || 'Virtual Patient'
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
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      await streamPatientResponse(sessionData.sessionId, userMessage.content);
    } catch (error) {
      console.error('Error sending message:', error);
      
      let errorText = 'I apologize, but I\'m having trouble responding right now. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('authentication') || error.message.includes('token')) {
          errorText = 'Authentication error. Please refresh the page and try again.';
        } else if (error.message.includes('timeout')) {
          errorText = 'The response is taking longer than expected. Please try again.';
        } else if (error.message.includes('connection')) {
          errorText = 'Connection to server failed. Please check your internet connection and try again.';
        }
      }
      
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: errorText,
        timestamp: new Date(),
        speaks_for: sessionData?.patientName || 'System'
      };
      setMessages(prev => [...prev, errorMessage]);
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
        token 
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
        speaks_for: sessionData?.patientName || 'Virtual Patient'
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
                setMessages(prev => [...prev, assistantMessage]);
                hasStarted = true;
              }
              
              assistantMessage.content += data.content;
              assistantMessage.speaks_for = data.speaks_for || assistantMessage.speaks_for;
              
              setMessages(prev => 
                prev.map(msg => 
                  msg.id === assistantMessage.id 
                    ? { ...assistantMessage }
                    : msg
                )
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
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              Virtual Patient Simulation
            </h1>
            {sessionData?.patientName && (
              <p className="text-sm text-gray-600">
                Speaking with: {sessionData.patientName}
              </p>
            )}
          </div>
          <div className="flex space-x-2">
            {!isSessionEnded && (
              <button
                onClick={endSession}
                disabled={isLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                End Session
              </button>
            )}
            <button
              onClick={() => navigate('/simulation')}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Back to Cases
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`px-4 py-3 rounded-lg ${
                message.role === 'user'
                  ? 'max-w-xs lg:max-w-md bg-blue-600 text-white'
                  : message.speaks_for === 'System'
                  ? 'max-w-full bg-gradient-to-r from-green-50 to-blue-50 text-gray-800 border-l-4 border-green-500'
                  : 'max-w-xs lg:max-w-md bg-white text-gray-900 border border-gray-200'
              }`}
            >
              {message.role === 'assistant' && message.speaks_for && (
                <div className={`text-xs mb-2 font-medium ${
                  message.speaks_for === 'System' 
                    ? 'text-green-700 flex items-center' 
                    : 'text-gray-500'
                }`}>
                  {message.speaks_for === 'System' && (
                    <span className="mr-1">ℹ️</span>
                  )}
                  {message.speaks_for}
                </div>
              )}
              <div className={`whitespace-pre-wrap ${
                message.speaks_for === 'System' ? 'text-sm leading-relaxed' : ''
              }`}>
                {message.content}
              </div>
              <div className={`text-xs mt-2 ${
                message.role === 'user' 
                  ? 'text-blue-100' 
                  : message.speaks_for === 'System'
                  ? 'text-green-600'
                  : 'text-gray-500'
              }`}>
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-900 border border-gray-200 px-4 py-2 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="animate-pulse flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                </div>
                <span className="text-sm text-gray-500">Patient is typing...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Evaluation */}
      {isSessionEnded && evaluation && (
        <div className="bg-yellow-50 border-t border-yellow-200 p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">Session Evaluation</h3>
          <div className="text-sm text-yellow-700 whitespace-pre-wrap">
            {evaluation}
          </div>
        </div>
      )}

      {/* Quick Tips for First-time Users */}
      {messages.length <= 2 && !isSessionEnded && (
        <div className="bg-blue-50 border-t border-blue-200 p-4">
          <div className="text-sm text-blue-800">
            <div className="font-medium mb-2">💡 Quick Tips for Your First Consultation:</div>
            <div className="grid md:grid-cols-2 gap-2 text-xs">
              <div>• "What brings you in today?"</div>
              <div>• "Can you describe your symptoms?"</div>
              <div>• "When did this start?"</div>
              <div>• "Have you experienced this before?"</div>
            </div>
          </div>
        </div>
      )}

      {/* Input */}
      {!isSessionEnded && (
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="flex space-x-2">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={messages.length <= 1 
                ? "Start with: 'What brings you in today?' or 'How can I help you?'" 
                : "Ask your next question..."
              }
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={2}
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Press Enter to send, Shift+Enter for new line
          </div>
        </div>
      )}
    </div>
  );
};

export default SimulationChatPage;