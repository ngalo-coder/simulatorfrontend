import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProgramAreaSelection from './ProgramAreaSelection';
import SpecialtySelection from './SpecialtySelection';
import PatientQueueScreen from './PatientQueueScreen';
import ChatScreen from './ChatScreen';
import EvaluationScreen from './EvaluationScreen';
import ErrorMessage from './ErrorMessage';
import ClinicianDashboard from './ClinicianDashboard';
import AdminDashboard from './AdminDashboard';
import UserGuide from './UserGuide';
import ProgramSelector from './ProgramSelector';
import { useAuth } from '../contexts/AuthContext';
import { SimulationStateType } from '../hooks/useSimulation';
import { Message, EvaluationData } from '../types';

interface MainContentProps {
  simulationState: SimulationStateType;
  selectedProgramArea: string | null;
  selectedSpecialty: string | null;
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  evaluationData: EvaluationData | null;
  currentCaseId: string | null;
  isSessionActive: boolean;
  simulationSessionId: string | null;
  streamingMessageIndex: number | undefined;
  showUserGuide: boolean;
  isAuthLoading: boolean;
  
  // Actions
  handleSelectProgramArea: (programArea: string) => void;
  handleSelectSpecialty: (specialty: string) => void;
  handleBackToProgramSelection: () => void;
  handleBackToSpecialtySelection: () => void;
  handleStartSimulation: (caseId: string) => void;
  handleSendMessage: (message: string) => void;
  handleEndSession: (bypassConfirmation: boolean) => void;
  handleRestart: () => void;
  handleBack: () => void;
  handleDismissError: () => void;
  resetAppState: () => void;
  onCloseUserGuide: () => void;
}

/**
 * Main content component that handles routing and content display
 */
const MainContent: React.FC<MainContentProps> = ({
  simulationState,
  selectedProgramArea,
  selectedSpecialty,
  messages,
  isLoading,
  error,
  evaluationData,
  currentCaseId,
  isSessionActive,
  simulationSessionId,
  streamingMessageIndex,
  showUserGuide,
  isAuthLoading,
  
  // Actions
  handleSelectProgramArea,
  handleSelectSpecialty,
  handleBackToProgramSelection,
  handleBackToSpecialtySelection,
  handleStartSimulation,
  handleSendMessage,
  handleEndSession,
  handleRestart,
  handleBack,
  handleDismissError,
  resetAppState,
  onCloseUserGuide
}) => {
  const { currentUser } = useAuth();

  return (
    <main className="flex-grow">
      {error && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4 mt-4">
          <ErrorMessage message={error} onDismiss={handleDismissError} />
        </div>
      )}
      
      {showUserGuide && (
        <UserGuide 
          onClose={onCloseUserGuide} 
          userRole={currentUser?.role as 'user' | 'admin'} 
        />
      )}
      
      <Routes>
        <Route path="/" element={
          simulationState === 'selecting_program' ? (
            <ProgramAreaSelection 
              onSelectProgramArea={handleSelectProgramArea} 
              isLoading={isLoading || isAuthLoading} 
            />
          ) : simulationState === 'selecting_specialty' ? (
            <SpecialtySelection
              programArea={selectedProgramArea!}
              onSelectSpecialty={handleSelectSpecialty}
              onBack={handleBackToProgramSelection}
              isLoading={isLoading}
            />
          ) : simulationState === 'selecting_patient' ? (
            <PatientQueueScreen
              programArea={selectedProgramArea!}
              specialty={selectedSpecialty!}
              onBack={handleBackToSpecialtySelection}
              onStartCase={handleStartSimulation}
              isLoading={isLoading}
            />
          ) : simulationState === 'chatting' ? (
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
          ) : simulationState === 'showing_evaluation' && evaluationData ? (
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
        
        <Route path="/select-program" element={
          <ProgramSelector 
            onSelectProgramArea={handleSelectProgramArea}
            resetAppState={resetAppState}
            isLoading={isLoading || isAuthLoading}
          />
        } />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </main>
  );
};

export default MainContent;