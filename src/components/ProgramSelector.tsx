import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  
  // Check for stored program area and specialty in session storage
  useEffect(() => {
    const storedProgramArea = sessionStorage.getItem("selectedProgramArea");
    const storedSpecialty = sessionStorage.getItem("selectedSpecialty");
    const storedCaseId = sessionStorage.getItem("selectedCaseId");
    
    if (storedProgramArea) {
      console.log("Found stored program area:", storedProgramArea);
      
      // Reset app state first to ensure clean state
      resetAppState();
      
      // Use the stored program area
      onSelectProgramArea(storedProgramArea);
      
      // Clear the stored values after using them
      sessionStorage.removeItem("selectedProgramArea");
      sessionStorage.removeItem("selectedSpecialty");
      sessionStorage.removeItem("selectedCaseId");
      
      // Navigate to the main route where state-based rendering will show the next screen
      navigate('/');
    } else {
      // If no stored values, just reset the app state
      resetAppState();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Wrap the onSelectProgramArea to navigate to main route after selection
  const handleSelectProgramArea = (programArea: string) => {
    onSelectProgramArea(programArea);
    // Navigate to the main route where state-based rendering will show SpecialtySelection
    navigate('/');
  };

  return (
    <ProgramAreaSelection 
      onSelectProgramArea={handleSelectProgramArea} 
      isLoading={isLoading} 
    />
  );
};

export default ProgramSelector;