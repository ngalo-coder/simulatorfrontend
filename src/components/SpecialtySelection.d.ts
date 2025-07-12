import React from 'react';

interface SpecialtySelectionProps {
  programArea: string;
  onSelectSpecialty: (specialty: string) => void;
  onBack: () => void;
  isLoading: boolean;
}

declare const SpecialtySelection: React.FC<SpecialtySelectionProps>;

export default SpecialtySelection;