import React, { useState, useCallback, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";

// Component imports
import ProgramAreaSelection from "./components/ProgramAreaSelection";
import SpecialtySelection from "./components/SpecialtySelection";
import PatientQueueScreen from "./components/PatientQueueScreen";
import ChatScreen from "./components/ChatScreen";
import EvaluationScreen from "./components/EvaluationScreen";
import ErrorMessage from "./components/ErrorMessage";
import RegistrationScreen from "./components/RegistrationScreen";
import LoginScreen from "./components/LoginScreen";
import ForgotPasswordScreen from "./components/ForgotPasswordScreen";
import ResetPasswordScreen from "./components/ResetPasswordScreen";
import ClinicianDashboard from "./components/ClinicianDashboard";
import AdminDashboard from "./components/AdminDashboard";
import MinimalClinicianDashboard from "./components/MinimalClinicianDashboard";
import MinimalAdminDashboard from "./components/MinimalAdminDashboard";
import DebugApiTester from "./components/DebugApiTester";
import PerformanceAnalytics from "./components/PerformanceAnalytics";
import UserGuide from "./components/UserGuide";
import ProgramSelector from "./components/ProgramSelector";

// Services and utilities
import { api } from "./services/api";
import { Message, EvaluationData } from "./types";
import { useAuth } from "./contexts/AuthContext";
import { HelpCircle } from "lucide-react";
// Import only what we need

/**
 * Application state types for the simulation flow
 */
type AppStateType =
  | "selecting_program" // User is selecting a program area
  | "selecting_specialty" // User is selecting a specialty within a program
  | "selecting_patient" // User is selecting a patient case
  | "chatting" // User is in an active simulation session
  | "showing_evaluation"; // User is viewing evaluation results

/**
 * Main application component
 */
function App() {
  // Authentication state
  const { isLoggedIn, logout, isLoading: isAuthLoading } = useAuth();

  // Simulation flow state
  const [appState, setAppState] = useState<AppStateType>("selecting_program");
  const [selectedProgramArea, setSelectedProgramArea] = useState<string | null>(
    null
  );
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(
    null
  );
  const [simulationSessionId, setSimulationSessionId] = useState<string | null>(
    null
  );
  const [currentCaseId, setCurrentCaseId] = useState<string | null>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);

  // Chat and evaluation state
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamingMessageIndex, setStreamingMessageIndex] = useState<
    number | undefined
  >(undefined);
  const [evaluationData, setEvaluationData] = useState<EvaluationData | null>(
    null
  );

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUserGuide, setShowUserGuide] = useState(false);

  const handleSelectProgramArea = useCallback((programArea: string) => {
    console.log("Selected program area in App.tsx:", programArea);
    setSelectedProgramArea(programArea);
    setAppState("selecting_specialty");
    // We'll use the AppContent component's useEffect to handle navigation
  }, []);

  const handleSelectSpecialty = useCallback(
    (specialty: string) => {
      setSelectedSpecialty(specialty);
      setAppState("selecting_patient");
    },
    [selectedProgramArea]
  );

  const handleStartSimulation = useCallback(async (caseId: string) => {
    if (!caseId) {
      setError("Invalid case ID provided");
      return;
    }

    // Reset state for new simulation
    setIsLoading(true);
    setError(null);
    setCurrentCaseId(caseId);
    setIsSessionActive(false);
    setEvaluationData(null);
    setMessages([]);

    try {
      const response = await api.startSimulation(caseId);

      if (!response?.sessionId) {
        throw new Error("Invalid response from server");
      }

      // Set up the new simulation session
      setSimulationSessionId(response.sessionId);
      setMessages([
        {
          sender: "patient",
          text: response.initialPrompt,
          timestamp: Date.now(),
          speaks_for: response.speaks_for,
        },
      ]);
      setAppState("chatting");
      setIsSessionActive(true);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to start simulation";
      setError(`Failed to start case "${caseId}": ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Ends the current simulation session and shows evaluation
   * @param bypassConfirmation Whether to skip the confirmation dialog
   */
  const handleEndSession = useCallback(
    async (bypassConfirmation = false) => {
      // Validate session state
      if (!simulationSessionId) {
        setError("No active session to end");
        return;
      }

      // Confirm with user unless bypassed
      if (!bypassConfirmation && isSessionActive) {
        const confirmed = window.confirm(
          "Are you sure you want to end this session? You will receive an AI evaluation of your performance."
        );
        if (!confirmed) return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await api.endSession(simulationSessionId);

        // Update state with evaluation results
        setIsSessionActive(false);
        setEvaluationData({
          evaluation: response.evaluation,
          history: response.history,
        });
        setAppState("showing_evaluation");
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to end session";
        setError(`Error ending session: ${errorMessage}`);
      } finally {
        setIsLoading(false);
      }
    },
    [simulationSessionId, isSessionActive]
  );

  /**
   * Sends a message to the virtual patient and handles the streaming response
   * @param question The clinician's question to send
   */
  const handleSendMessage = useCallback(
    (question: string) => {
      // Validate inputs and session state
      if (!question?.trim() || !simulationSessionId || !isSessionActive) {
        return;
      }

      // Reset streaming state
      setStreamingMessageIndex(undefined);
      setError(null);

      // Create messages
      const userMessage: Message = {
        sender: "clinician",
        text: question.trim(),
        timestamp: Date.now(),
      };

      const patientPlaceholder: Message = {
        sender: "patient",
        text: "",
        timestamp: Date.now(),
      };

      // Update UI state
      const newMessages = [...messages, userMessage, patientPlaceholder];
      setMessages(newMessages);
      setStreamingMessageIndex(newMessages.length - 1);
      setIsLoading(true);

      // Track the response text
      let aiResponse = "";

      // Stream the response from the API
      api.streamSimulationAsk(
        { sessionId: simulationSessionId, question: question.trim() },
        // Handle incoming chunks
        (chunk, speaks_for) => {
          aiResponse += chunk;
          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last?.sender === "patient") {
              last.text = aiResponse;
              if (speaks_for) {
                last.speaks_for = speaks_for;
              }
            }
            return updated;
          });
        },
        // Handle completion
        () => {
          setIsLoading(false);
          setTimeout(() => setStreamingMessageIndex(undefined), 500);
        },
        // Handle errors
        (err) => {
          setIsLoading(false);
          setStreamingMessageIndex(undefined);
          setError("Communication error: " + (err?.message || "Unknown error"));

          // Remove empty patient message if there was an error
          setMessages((prev) => {
            const updated = [...prev];
            if (
              updated.length > 0 &&
              updated[updated.length - 1]?.sender === "patient" &&
              updated[updated.length - 1].text === ""
            ) {
              return updated.slice(0, -1);
            }
            return updated;
          });
        },
        // Handle session end
        () => {
          setIsLoading(false);
          setStreamingMessageIndex(undefined);
          setIsSessionActive(false);
          handleEndSession(true);
        }
      );
    },
    [simulationSessionId, isSessionActive, handleEndSession, messages]
  );

  /**
   * Resets the application state to start a new simulation
   */
  const handleRestart = useCallback(() => {
    // Reset all simulation state
    setAppState("selecting_program");
    setSelectedProgramArea(null);
    setSelectedSpecialty(null);
    setSimulationSessionId(null);
    setCurrentCaseId(null);
    setIsSessionActive(false);

    // Clear UI state
    setMessages([]);
    setEvaluationData(null);
    setError(null);
    setIsLoading(false);
    setStreamingMessageIndex(undefined);
  }, []);

  /**
   * Handles back navigation from evaluation screen
   */
  const handleBack = useCallback(() => {
    // Currently just restarts the flow
    handleRestart();
    // Could be enhanced to go back one step in the flow instead
  }, [handleRestart]);

  /**
   * Dismisses error messages
   */
  const handleDismissError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Handles user logout
   */
  const handleLogout = useCallback(() => {
    logout();
    handleRestart();
  }, [logout, handleRestart]);

  /**
   * Inner component that handles routing and authentication state
   */
  const AppContent: React.FC = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    // Handle authentication redirects
    useEffect(() => {
      if (isAuthLoading) {
        // Wait for auth to initialize
        return;
      }

      if (!isLoggedIn) {
        // Redirect to login if not on an auth page
        const authPages = [
          "/register",
          "/login",
          "/forgot-password",
          "/reset-password",
        ];
        const isAtAuthPage = authPages.some(
          (path) =>
            window.location.pathname === path ||
            window.location.pathname.startsWith("/reset-password/")
        );

        if (!isAtAuthPage) {
          navigate("/login");
        }
      } else {
        // Redirect logged-in users from auth pages to appropriate dashboard
        const isAtAuthPage = ["/login", "/register"].includes(
          window.location.pathname
        );
        if (isAtAuthPage) {
          if (currentUser?.role === "admin") {
            navigate("/admin");
          } else {
            navigate("/dashboard");
          }
        }
      }
    }, [isLoggedIn, isAuthLoading, navigate, currentUser]);

    // Handle app state navigation
    useEffect(() => {
      if (isAuthLoading || !isLoggedIn) return;

      console.log("App state changed:", appState);
      console.log("Selected program area:", selectedProgramArea);
      console.log("Selected specialty:", selectedSpecialty);

      if (appState === "selecting_specialty" && selectedProgramArea) {
        console.log("Navigating to specialty selection screen");
        navigate(`/specialty/${encodeURIComponent(selectedProgramArea)}`);
      } else if (
        appState === "selecting_patient" &&
        selectedProgramArea &&
        selectedSpecialty
      ) {
        console.log("Navigating to patient queue screen");
        navigate(
          `/patients/${encodeURIComponent(
            selectedProgramArea
          )}/${encodeURIComponent(selectedSpecialty)}`
        );
      } else if (appState === "chatting" && simulationSessionId) {
        console.log("Navigating to chat screen");
        navigate("/simulation");
      } else if (appState === "showing_evaluation" && evaluationData) {
        console.log("Navigating to evaluation screen");
        navigate("/evaluation");
      }
    }, [
      appState,
      selectedProgramArea,
      selectedSpecialty,
      simulationSessionId,
      evaluationData,
      navigate,
      isLoggedIn,
      isAuthLoading,
    ]);

    // Show loading state while auth is initializing
    if (isAuthLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">Loading...</p>
          </div>
        </div>
      );
    }

    // Show auth routes for non-authenticated users
    if (!isLoggedIn) {
      return (
        <Routes>
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/register" element={<RegistrationScreen />} />
          <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
          <Route
            path="/reset-password/:token"
            element={<ResetPasswordScreen />}
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      );
    }

    return (
      <div className="flex flex-col min-h-screen">
        <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-4 shadow-lg">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center">
            {/* Logo and brand */}
            <div className="flex items-center gap-3 mb-3 sm:mb-0">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center shadow-inner">
                <span className="text-xl font-bold">S</span>
              </div>
              <h1 className="text-xl font-bold">Simuatech</h1>
            </div>

            {/* Navigation buttons */}
            {isLoggedIn && (
              <nav className="flex flex-wrap justify-center gap-2 sm:gap-3">
                {/* Help button */}
                <button
                  onClick={() => setShowUserGuide(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-3 sm:px-4 rounded-lg flex items-center gap-1 sm:gap-2 text-sm sm:text-base transition-all duration-200 hover:shadow-md"
                  title="Help & Instructions"
                  aria-label="Help and Instructions"
                >
                  <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden xs:inline">Help</span>
                </button>

                {/* Dashboard button */}
                <button
                  onClick={() => {
                    navigate(
                      currentUser?.role === "admin" ? "/admin" : "/dashboard"
                    );
                  }}
                  className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-3 sm:px-4 rounded-lg text-sm sm:text-base transition-all duration-200 hover:shadow-md"
                  aria-label="Go to Dashboard"
                >
                  Dashboard
                </button>
                
                {/* Analytics button */}
                <button
                  onClick={() => navigate("/analytics")}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-3 sm:px-4 rounded-lg text-sm sm:text-base transition-all duration-200 hover:shadow-md"
                  aria-label="Go to Analytics"
                >
                  Analytics
                </button>

                {/* Admin button - only shown to admin users */}
                {currentUser?.role === "admin" && (
                  <button
                    onClick={() => navigate("/admin")}
                    className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-3 sm:px-4 rounded-lg text-sm sm:text-base transition-all duration-200 hover:shadow-md"
                    aria-label="Go to Admin Dashboard"
                  >
                    Admin
                  </button>
                )}

                {/* Logout button */}
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-3 sm:px-4 rounded-lg text-sm sm:text-base transition-all duration-200 hover:shadow-md"
                  aria-label="Logout"
                >
                  Logout
                </button>
              </nav>
            )}
          </div>
        </header>
        <main className="flex-grow">
          {error && (
            <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4 mt-4">
              <ErrorMessage message={error} onDismiss={handleDismissError} />
            </div>
          )}
          {showUserGuide && (
            <UserGuide
              onClose={() => setShowUserGuide(false)}
              userRole={currentUser?.role as "user" | "admin"}
            />
          )}
          <Routes>
            {/* Main simulation flow route */}
            <Route
              path="/"
              element={
                <ProgramAreaSelection
                  onSelectProgramArea={handleSelectProgramArea}
                  isLoading={isLoading || isAuthLoading}
                />
              }
            />

            {/* Dashboard routes */}
            <Route path="/dashboard" element={<MinimalClinicianDashboard />} />
            <Route path="/admin" element={<MinimalAdminDashboard />} />
            <Route path="/debug-api" element={<DebugApiTester />} />
            <Route path="/analytics" element={<PerformanceAnalytics />} />

            {/* Program selection route */}
            <Route
              path="/select-program"
              element={
                <ProgramSelector
                  onSelectProgramArea={handleSelectProgramArea}
                  resetAppState={() => {
                    setAppState("selecting_program");
                    setSelectedProgramArea(null);
                    setSelectedSpecialty(null);
                  }}
                  isLoading={isLoading || isAuthLoading}
                />
              }
            />

            {/* Fallback route */}
            <Route
              path="/specialty/:programArea"
              element={
                appState === "selecting_specialty" && selectedProgramArea ? (
                  <SpecialtySelection
                    programArea={selectedProgramArea}
                    onSelectSpecialty={handleSelectSpecialty}
                    onBack={() => {
                      setAppState("selecting_program");
                      setSelectedProgramArea(null);
                    }}
                    isLoading={isLoading}
                  />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            <Route
              path="/patients/:programArea/:specialty"
              element={
                appState === "selecting_patient" &&
                selectedProgramArea &&
                selectedSpecialty ? (
                  <PatientQueueScreen
                    programArea={selectedProgramArea}
                    specialty={selectedSpecialty}
                    onBack={() => {
                      setAppState("selecting_specialty");
                    }}
                    onStartCase={handleStartSimulation}
                    isLoading={isLoading}
                  />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            <Route
              path="/simulation"
              element={
                appState === "chatting" && simulationSessionId ? (
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
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            <Route
              path="/evaluation"
              element={
                appState === "showing_evaluation" && evaluationData ? (
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
              }
            />
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
