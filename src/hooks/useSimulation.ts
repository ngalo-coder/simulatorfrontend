import { useState, useCallback } from 'react';
import { api } from '../services/api';
import { Message, EvaluationData } from '../types';

// Define simulation state type
export type SimulationStateType = 'selecting_program' | 'selecting_specialty' | 'selecting_patient' | 'chatting' | 'showing_evaluation';

/**
 * Custom hook to manage simulation state and actions
 */
export const useSimulation = () => {
  // Simulation state
  const [simulationState, setSimulationState] = useState<SimulationStateType>('selecting_program');
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

  /**
   * Reset the simulation state
   */
  const resetSimulation = useCallback(() => {
    setSimulationState('selecting_program');
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

  /**
   * Handle program area selection
   */
  const handleSelectProgramArea = useCallback((programArea: string) => {
    setSelectedProgramArea(programArea);
    setSimulationState('selecting_specialty');
  }, []);

  /**
   * Handle specialty selection
   */
  const handleSelectSpecialty = useCallback((specialty: string) => {
    setSelectedSpecialty(specialty);
    setSimulationState('selecting_patient');
  }, []);

  /**
   * Navigate back to program selection
   */
  const handleBackToProgramSelection = useCallback(() => {
    setSelectedProgramArea(null);
    setSelectedSpecialty(null);
    setSimulationState('selecting_program');
  }, []);

  /**
   * Navigate back to specialty selection
   */
  const handleBackToSpecialtySelection = useCallback(() => {
    setSelectedSpecialty(null);
    setSimulationState('selecting_specialty');
  }, []);

  /**
   * Start a simulation with the selected case
   */
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
      setSimulationState('chatting');
      setIsSessionActive(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start simulation';
      setError(`Failed to start case "${caseId}": ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * End the current simulation session
   */
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
      setSimulationState('showing_evaluation');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to end session';
      setError(`Error ending session: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [simulationSessionId, isSessionActive]);

  /**
   * Send a message in the simulation chat
   */
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

  /**
   * Dismiss error message
   */
  const handleDismissError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    simulationState,
    selectedProgramArea,
    selectedSpecialty,
    simulationSessionId,
    messages,
    isLoading,
    error,
    evaluationData,
    currentCaseId,
    isSessionActive,
    streamingMessageIndex,
    
    // Actions
    resetSimulation,
    handleSelectProgramArea,
    handleSelectSpecialty,
    handleBackToProgramSelection,
    handleBackToSpecialtySelection,
    handleStartSimulation,
    handleEndSession,
    handleSendMessage,
    handleDismissError
  };
};