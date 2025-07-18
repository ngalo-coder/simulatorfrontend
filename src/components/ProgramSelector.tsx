import React, { useEffect } from 'react';
import ProgramAreaSelection from './ProgramAreaSelection';

interface ProgramSelectorProps {
  onSelectProgramArea: (programArea: string) => void;
  resetAppState: () => void;
  isLoading: boolean;
}

/**
 * This component wraps the ProgramAreaSelection component and resets the app state
 * when it mounts. This is used for the /select-program route to ensure the app state
 * is properly reset when navigating directly to this route.
 */
const ProgramSelector: React.FC<ProgramSelectorProps> = ({ 
  onSelectProgramArea, 
  resetAppState, 
  isLoading 
}) => {
  // Reset app state when this component mounts
  useEffect(() => {
    resetAppState();
  }, [resetAppState]);

  // The handleSelectProgramArea function is passed directly to the child component
  // as App.tsx will handle the state change and render the next component.
  return (
    <ProgramAreaSelection 
      onSelectProgramArea={onSelectProgramArea}
      isLoading={isLoading} 
    />
  );
};

export default ProgramSelector;