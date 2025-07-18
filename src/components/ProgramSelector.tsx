import React from "react";
import { useNavigate } from "react-router-dom";
import ProgramAreaSelection from "./ProgramAreaSelection";

interface ProgramSelectorProps {
  onSelectProgramArea: (programArea: string) => void;
  resetAppState: () => void;
  isLoading: boolean;
}

/**
 * This component wraps the ProgramAreaSelection component. It is used for the /select-program route.
 */
const ProgramSelector: React.FC<ProgramSelectorProps> = ({
  onSelectProgramArea,
  resetAppState,
  isLoading,
}) => {
  const navigate = useNavigate();

  // This function is called when a program area is selected.
  // It calls the onSelectProgramArea prop to update the app state,
  // and then navigates to the main route.
  const handleSelectProgramArea = (programArea: string) => {
    onSelectProgramArea(programArea);
    navigate("/");
  };

  // Reset the app state when the component mounts.
  React.useEffect(() => {
    resetAppState();
  }, [resetAppState]);

  return (
    <ProgramAreaSelection
      onSelectProgramArea={handleSelectProgramArea}
      isLoading={isLoading}
    />
  );
};

export default ProgramSelector;
