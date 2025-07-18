import React from 'react';
import { Navigate } from 'react-router-dom';
import ProgramAreaSelection from './ProgramAreaSelection';
import SpecialtySelection from './SpecialtySelection';
import PatientQueueScreen from './PatientQueueScreen';
import ChatScreen from './ChatScreen';
import EvaluationScreen from './EvaluationScreen';
import { Message, EvaluationData } from '../types';

/**
 * Props for the SimulationFlowRouter component
 */
interface SimulationFlowRouterProps {
  // App state
  appState: 'selecting_program' | 'selecting_specialty' | 'selecting_patient' | 'chatting' | 'showing_evaluation';
  selectedProgramArea: string | null;
  selectedSpecialty: string | null;
  messages: Message[];
  isLoading: boolean;
  isAuthLoading: boolean;
  currentCaseId: string | null;
  isSessionActive: boolean;
  simulationSessionId: string | null;
  streamingMessageIndex: number | undefined;
  evaluationData: EvaluationData | null;
  
  // Event handlers
  handleSelectProgramArea: (programArea: string) => void;
  handleSelectSpecialty: (specialty: string) => void;
  handleBackToProgramSelection: () => void;
  handleBackToSpecialtySelection: () => void;
  handleStartSimulation: (caseId: string) => Promise<void>;
  handleSendMessage: (question: string) => void;
  handleEndSession: (bypassConfirmation?: boolean) => Promise<void>;
  handleRestart: () => void;
  handleBack: () => void;
}

/**
 * Component that handles routing between different simulation flow states
 */
const SimulationFlowRouter: React.FC<SimulationFlowRouterProps> = ({
  appState,
  selectedProgramArea,
  selectedSpecialty,
  messages,
  isLoading,
  isAuthLoading,
  currentCaseId,
  isSessionActive,
  simulationSessionId,
  streamingMessageIndex,
  evaluationData,
  handleSelectProgramArea,
  handleSelectSpecialty,
  handleBackToProgramSelection,
  handleBackToSpecialtySelection,
  handleStartSimulation,
  handleSendMessage,
  handleEndSession,
  handleRestart,
  handleBack
}) => {
  // Render the appropriate component based on the current app state
  switch (appState) {
    case 'selecting_program':
      return (
        <ProgramAreaSelection 
          onSelectProgramArea={handleSelectProgramArea} 
          isLoading={isLoading || isAuthLoading} 
        />
      );
      
    case 'selecting_specialty':
      // Ensure we have a program area before showing specialty selection
      if (!selectedProgramArea) {
        return <Navigate to="/" replace />;
      }
      
      return (
        <SpecialtySelection
          programArea={selectedProgramArea}
          onSelectSpecialty={handleSelectSpecialty}
          onBack={handleBackToProgramSelection}
          isLoading={isLoading}
        />
      );
      
    case 'selecting_patient':
      // Ensure we have both program area and specialty before showing patient queue
      if (!selectedProgramArea || !selectedSpecialty) {
        return <Navigate to="/" replace />;
      }
      
      return (
        <PatientQueueScreen
          programArea={selectedProgramArea}
          specialty={selectedSpecialty}
          onBack={handleBackToSpecialtySelection}
          onStartCase={handleStartSimulation}
          isLoading={isLoading}
        />
      );
      
    case 'chatting':
      // Ensure we have a session ID before showing chat screen
      if (!simulationSessionId) {
        return <Navigate to="/" replace />;
      }
      
      return (
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
      );
      
    case 'showing_evaluation':
      // Ensure we have evaluation data before showing evaluation screen
      if (!evaluationData) {
        return <Navigate to="/" replace />;
      }
      
      return (
        <EvaluationScreen
          evaluationData={evaluationData}
          onRestart={handleRestart}
          onBack={handleBack}
          currentCaseId={currentCaseId}
          sessionId={simulationSessionId}
        />
      );
      
    default:
      // Fallback for unexpected states
      return <Navigate to="/" replace />;
  }
};

export default SimulationFlowRouter;