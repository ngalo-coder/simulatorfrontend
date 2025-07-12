import React, { useState, useCallback, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import ProgramAreaSelection from './components/ProgramAreaSelection';
import SpecialtySelection from './components/SpecialtySelection';
import PatientQueueScreen from './components/PatientQueueScreen';
import ChatScreen from './components/ChatScreen';
import EvaluationScreen from './components/EvaluationScreen';
import ErrorMessage from './components/ErrorMessage';
import RegistrationScreen from './components/RegistrationScreen';
import LoginScreen from './components/LoginScreen';
import { api } from './services/api';
import { Message, EvaluationData, AppState } from './types';
import { useAuth } from './contexts/AuthContext'; // Import useAuth

// Removed the local AuthState interface and initialAuthState function, as this is now handled by AuthContext

type AppState = 'selecting_program' | 'selecting_patient' | 'chatting' | 'showing_evaluation';

function App() {
  const { isLoggedIn, logout, isLoading: isAuthLoading } = useAuth(); // Add logout from useAuth

  // App state related to simulation flow
  const [appState, setAppState] = useState<'selecting_program' | 'selecting_specialty' | 'selecting_patient' | 'chatting' | 'showing_evaluation'>('selecting_program');
  const [selectedProgramArea, setSelectedProgramArea] = useState<string | null>(null);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [simulationSessionId, setSimulationSessionId] = useState<string | null>(null); // Renamed to avoid conflict if any
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [evaluationData, setEvaluationData] = useState<EvaluationData | null>(null);
  const [currentCaseId, setCurrentCaseId] = useState<string | null>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [streamingMessageIndex, setStreamingMessageIndex] = useState<number | undefined>(undefined);

  const handleSelectProgramArea = useCallback((programArea: string) => {
    setSelectedProgramArea(programArea);
    setAppState('selecting_specialty');
  }, []);

  const handleSelectSpecialty = useCallback((specialty: string) => {
    setSelectedSpecialty(specialty);
    setAppState('selecting_patient');
  }, []);

  const handleBackToProgramSelection = useCallback(() => {
    setSelectedProgramArea(null);
    setSelectedSpecialty(null);
    setAppState('selecting_program');
  }, []);

  const handleBackToSpecialtySelection = useCallback(() => {
    setSelectedSpecialty(null);
    setAppState('selecting_specialty');
  }, []);

  const handleStartSimulation = useCallback(async (caseId: string) => {
    setIsLoading(true);
    setError(null);
    setCurrentCaseId(caseId);
    setIsSessionActive(false);
    setEvaluationData(null);

    try {
      const response = await api.startSimulation(caseId);
      setSimulationSessionId(response.sessionId);
      setMessages([{
        sender: 'patient',
        text: response.initialPrompt,
        timestamp: Date.now()
      }]);
      setAppState('chatting');
      setIsSessionActive(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start simulation';
      setError(`Failed to start case "${caseId}": ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleEndSession = useCallback(async (bypassConfirmation = false) => {
    if (!simulationSessionId) {
      console.error('handleEndSession called without simulationSessionId');
      return;
    }

    // Only show confirmation if not bypassed by an automatic process AND the session was active from user's perspective
    if (!bypassConfirmation && isSessionActive) {
      const confirmed = window.confirm(
        'Are you sure you want to end this session? You will receive an AI evaluation of your performance.'
      );
      if (!confirmed) return;
    }

    setIsLoading(true); // Indicate loading for fetching evaluation
    setError(null);

    try {
      const response = await api.endSession(simulationSessionId); // This fetches the full evaluation
      setIsSessionActive(false); // Ensure session is marked inactive
      setEvaluationData({
        evaluation: response.evaluation,
        history: response.history
      });
      setAppState('showing_evaluation'); // Transition to show evaluation
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to end session';
      setError(`Error ending session: ${errorMessage}`);
      // Stay in current state if evaluation fetching fails
    } finally {
      setIsLoading(false);
    }
  }, [simulationSessionId, isSessionActive]);

  const handleSendMessage = useCallback((question: string) => {
    if (!question.trim() || !simulationSessionId || !isSessionActive) return;

    // Clear any previous streaming state
    setStreamingMessageIndex(undefined);

    // Add the user's message to the state immediately
    const userMessage: Message = {
      sender: 'clinician',
      text: question,
      timestamp: Date.now()
    };

    // Add a placeholder for the patient's streaming response
    const patientPlaceholder: Message = {
      sender: 'patient',
      text: '',
      timestamp: Date.now()
    };

    const newMessages = [...messages, userMessage, patientPlaceholder];
    setMessages(newMessages);
    
    // Set streaming index to the patient placeholder message
    setStreamingMessageIndex(newMessages.length - 1);
    
    setIsLoading(true);
    setError(null);

    let aiResponse = '';
    const cleanup = api.streamSimulationAsk(
      { sessionId: simulationSessionId, question }, // Use simulationSessionId
      (chunk) => {
        aiResponse += chunk;
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage && lastMessage.sender === 'patient') {
            lastMessage.text = aiResponse;
          }
          return newMessages;
        });
      },
      () => {
        setIsLoading(false);
        setStreamingMessageIndex(undefined);
        // Stream completed normally - no automatic session end
      },
      (err) => {
        setIsLoading(false);
        setStreamingMessageIndex(undefined);
        setError('Communication error: ' + (err?.message || 'Unknown error'));
        // Remove the placeholder message
        setMessages(prev => {
          const newMessages = [...prev];
          if (newMessages[newMessages.length - 1]?.sender === 'patient' &&
              newMessages[newMessages.length - 1]?.text === '') {
            newMessages.pop();
          }
          return newMessages;
        });
      },
      (streamEndSignal) => {
        // Handle automatic session end from backend
        console.log('Automatic session end signaled by stream:', streamEndSignal);
        setIsLoading(false);
        setStreamingMessageIndex(undefined);
        setIsSessionActive(false);
        
        // Automatically trigger handleEndSession to fetch the full evaluation
        handleEndSession(true); // Pass true to bypass confirmation
      }
    );

    // Optional: cleanup on unmount or new message
    // return cleanup;
  }, [simulationSessionId, isSessionActive, handleEndSession, messages]);

  const handleRestart = useCallback(() => {
    setAppState('selecting_program');
    setSelectedProgramArea(null);
    setSelectedSpecialty(null);
    setSimulationSessionId(null);
    setMessages([]);
    setEvaluationData(null);
    setError(null);
    setIsLoading(false);
    setCurrentCaseId(null);
    setIsSessionActive(false);
    setStreamingMessageIndex(undefined);
  }, []);

  const handleBack = useCallback(() => {
    setAppState('selecting_program');
    setSelectedProgramArea(null);
    setSelectedSpecialty(null);
    setSimulationSessionId(null);
    setMessages([]);
    setEvaluationData(null);
    setError(null);
    setIsLoading(false);
    setCurrentCaseId(null);
    setIsSessionActive(false);
    setStreamingMessageIndex(undefined);
  }, []);

  const handleDismissError = useCallback(() => {
    setError(null);
  }, []);

  const handleLogout = () => {
    logout(); // Call logout from AuthContext
    // AppContent's useEffect will handle navigation to /login
    // Reset any app-specific states if necessary
    setAppState('selecting_program');
    setSelectedProgramArea(null);
    setSelectedSpecialty(null);
    setSimulationSessionId(null);
    setMessages([]);
    setEvaluationData(null);
    setCurrentCaseId(null);
    setIsSessionActive(false);
    setError(null);
    setStreamingMessageIndex(undefined);
  };

  // This component will wrap the main application logic and manage routing
  const AppContent: React.FC = () => {
    const navigate = useNavigate(); // Hook for navigation

    // Effect to redirect if not logged in, or set initial app state
    useEffect(() => {
      if (!isAuthLoading && !isLoggedIn) { // Check isAuthLoading
        // If not logged in and not on register/login, redirect to login
        if (window.location.pathname !== '/register' && window.location.pathname !== '/login') {
          navigate('/login');
        }
      } else if (!isAuthLoading && isLoggedIn) {
        // If logged in and on login/register, redirect to home
        if (window.location.pathname === '/login' || window.location.pathname === '/register') {
          navigate('/');
        }
      }
    }, [isLoggedIn, isAuthLoading, navigate]);

    if (isAuthLoading) {
      return <div>Loading...</div>; // Or a proper loading spinner
    }

    if (!isLoggedIn) {
      // Routes for unauthenticated users
      return (
        <Routes>
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/register" element={<RegistrationScreen />} />
          {/* Redirect any other unauthenticated access to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      );
    }

    // Main application content for authenticated users
    return (
      <div className="flex flex-col min-h-screen">
        <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-4 flex justify-between items-center shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
              <span className="text-xl font-bold">S</span>
            </div>
            <h1 className="text-xl font-bold">Simuatech</h1>
          </div>
          {isLoggedIn && (
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Logout
            </button>
          )}
        </header>
        <main className="flex-grow">
          {error && (
            <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4 mt-4"> {/* Adjusted top for header */}
              <ErrorMessage message={error} onDismiss={handleDismissError} />
            </div>
          )}
          <Routes>
            <Route path="/" element={
              appState === 'selecting_program' ? (
                <ProgramAreaSelection 
                  onSelectProgramArea={handleSelectProgramArea} 
                  isLoading={isLoading || isAuthLoading} 
                />
              ) : appState === 'selecting_specialty' ? (
                <SpecialtySelection
                  programArea={selectedProgramArea!}
                  onBack={handleBackToProgramSelection}
                  onSelectSpecialty={handleSelectSpecialty}
                  isLoading={isLoading}
                />
              ) : appState === 'selecting_patient' ? (
                <PatientQueueScreen
                  programArea={selectedProgramArea!}
                  specialty={selectedSpecialty!}
                  onBack={handleBackToSpecialtySelection}
                  onStartCase={handleStartSimulation}
                  isLoading={isLoading}
                />
              ) : appState === 'chatting' ? (
                <ChatScreen
                messages={messages}
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
                onRestart={handleRestart}
                onBack={handleBack}
                currentCaseId={currentCaseId}
                isSessionActive={isSessionActive}
                sessionId={simulationSessionId} // Use simulationSessionId
                onEndSession={() => handleEndSession(false)}
              />
            ) : appState === 'showing_evaluation' && evaluationData ? (
              <EvaluationScreen
                evaluationData={evaluationData}
                onRestart={handleRestart}
                onBack={handleBack}
                currentCaseId={currentCaseId}
                sessionId={simulationSessionId} // Pass simulationSessionId
              />
            ) : (
              <Navigate to="/" replace /> // Fallback, should ideally not be hit if appState is managed well
            )
          }/>
          {/* Add other authenticated routes here if needed */}
          <Route path="*" element={<Navigate to="/" replace />} /> {/* Redirect unknown paths to home */}
          </Routes>
        </main>
      </div>
    );
  };

  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;