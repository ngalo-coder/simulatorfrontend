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
import ForgotPasswordScreen from './components/ForgotPasswordScreen';
import ResetPasswordScreen from './components/ResetPasswordScreen';
import ClinicianDashboard from './components/ClinicianDashboard';
import AdminDashboard from './components/AdminDashboard';
import { api } from './services/api';
import { Message, EvaluationData } from './types';
import { useAuth } from './contexts/AuthContext';

// Define local AppState type for this component
type AppStateType = 'selecting_program' | 'selecting_specialty' | 'selecting_patient' | 'chatting' | 'showing_evaluation';

function App() {
  const { isLoggedIn, logout, isLoading: isAuthLoading } = useAuth();

  const [appState, setAppState] = useState<AppStateType>('selecting_program');
  const [selectedProgramArea, setSelectedProgramArea] = useState<string | null>(null);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [simulationSessionId, setSimulationSessionId] = useState<string | null>(null);
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
    if (!simulationSessionId) return;

    if (!bypassConfirmation && isSessionActive) {
      const confirmed = window.confirm(
        'Are you sure you want to end this session? You will receive an AI evaluation of your performance.'
      );
      if (!confirmed) return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.endSession(simulationSessionId);
      setIsSessionActive(false);
      setEvaluationData({
        evaluation: response.evaluation,
        history: response.history
      });
      setAppState('showing_evaluation');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to end session';
      setError(`Error ending session: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [simulationSessionId, isSessionActive]);

  const handleSendMessage = useCallback((question: string) => {
    if (!question.trim() || !simulationSessionId || !isSessionActive) return;

    setStreamingMessageIndex(undefined);

    const userMessage: Message = {
      sender: 'clinician',
      text: question,
      timestamp: Date.now()
    };

    const patientPlaceholder: Message = {
      sender: 'patient',
      text: '',
      timestamp: Date.now()
    };

    const newMessages = [...messages, userMessage, patientPlaceholder];
    setMessages(newMessages);
    setStreamingMessageIndex(newMessages.length - 1);
    setIsLoading(true);
    setError(null);

    let aiResponse = '';
    api.streamSimulationAsk(
      { sessionId: simulationSessionId, question },
      (chunk) => {
        aiResponse += chunk;
        setMessages(prev => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last?.sender === 'patient') last.text = aiResponse;
          return updated;
        });
      },
      () => {
        setIsLoading(false);
        setTimeout(() => setStreamingMessageIndex(undefined), 500);
      },
      (err) => {
        setIsLoading(false);
        setStreamingMessageIndex(undefined);
        setError('Communication error: ' + (err?.message || 'Unknown error'));
        setMessages(prev => {
          const updated = [...prev];
          if (updated[updated.length - 1]?.sender === 'patient' && updated[updated.length - 1].text === '') {
            updated.pop();
          }
          return updated;
        });
      },
      () => {
        setIsLoading(false);
        setStreamingMessageIndex(undefined);
        setIsSessionActive(false);
        handleEndSession(true);
      }
    );
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
    handleRestart();
  }, [handleRestart]);

  const handleDismissError = useCallback(() => {
    setError(null);
  }, []);

  const handleLogout = () => {
    logout();
    handleRestart();
  };

  const AppContent: React.FC = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    useEffect(() => {
      if (!isAuthLoading && !isLoggedIn) {
        if (window.location.pathname !== '/register' && window.location.pathname !== '/login') {
          navigate('/login');
        }
      } else if (!isAuthLoading && isLoggedIn) {
        const isAtAuthPage = window.location.pathname === '/login' || window.location.pathname === '/register';
        if (isAtAuthPage || window.location.pathname === '/') {
          if (currentUser?.role === 'admin') {
            navigate('/admin');
          } else {
            navigate('/'); // Direct normal users to program selection
          }
        }
      }
    }, [isLoggedIn, isAuthLoading, navigate, currentUser]);

    if (isAuthLoading) return <div>Loading...</div>;

    if (!isLoggedIn) {
      return (
        <Routes>
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/register" element={<RegistrationScreen />} />
          <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
          <Route path="/reset-password/:token" element={<ResetPasswordScreen />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      );
    }

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
            <div className="flex gap-3">
              <button
                onClick={() => {
                  if (currentUser?.role === 'admin') navigate('/admin');
                  else navigate('/'); // Navigate to program selection for regular users
                }}
                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg"
              >
                {currentUser?.role === 'admin' ? 'Dashboard' : 'Home'}
              </button>
              {currentUser?.role === 'admin' && (
                <button
                  onClick={() => navigate('/admin')}
                  className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg"
                >
                  Admin
                </button>
              )}
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg"
              >
                Logout
              </button>
            </div>
          )}
        </header>
        <main className="flex-grow">
          {error && (
            <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4 mt-4">
              <ErrorMessage message={error} onDismiss={handleDismissError} />
            </div>
          )}
          <Routes>
            <Route path="/" element={
              appState === 'selecting_program' ? (
                <ProgramAreaSelection onSelectProgramArea={handleSelectProgramArea} isLoading={isLoading || isAuthLoading} />
              ) : appState === 'selecting_specialty' ? (
                <SpecialtySelection
                  programArea={selectedProgramArea!}
                  onSelectSpecialty={handleSelectSpecialty}
                  onBack={handleBackToProgramSelection}
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
                  sessionId={simulationSessionId}
                  onEndSession={() => handleEndSession(false)}
                  streamingMessageIndex={streamingMessageIndex}
                />
              ) : appState === 'showing_evaluation' && evaluationData ? (
                <EvaluationScreen
                  evaluationData={evaluationData}
                  onRestart={handleRestart}
                  onBack={handleBack}
                  currentCaseId={currentCaseId}
                  sessionId={simulationSessionId}
                />
              ) : (
                <Navigate to="/" replace />
              )
            }/>
            <Route path="/dashboard" element={<ClinicianDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
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
