import React from 'react';
import './Instructions.css';
import { X, CheckCircle } from 'lucide-react';

interface InstructionsProps {
  onClose: () => void;
}

const Instructions: React.FC<InstructionsProps> = ({ onClose }) => {
  return (
    <div className="instructions-modal-overlay">
      <div className="instructions-modal-content">
        <div className="instructions-modal-header">
          <h2>How to Use the Simulator</h2>
          <button onClick={onClose} className="instructions-modal-close-btn">
            <X size={24} />
          </button>
        </div>
        <div className="instructions-modal-body">
          <ul className="instructions-list">
            <li>
              <CheckCircle className="instruction-icon" />
              <span>Log in to your account.</span>
            </li>
            <li>
              <CheckCircle className="instruction-icon" />
              <span>Select your specialty from the options provided.</span>
            </li>
            <li>
              <CheckCircle className="instruction-icon" />
              <span>Pick a patient case to begin your clinical practice.</span>
            </li>
            <li>
              <CheckCircle className="instruction-icon" />
              <span>
                Engage with the virtual patient, ask questions, and gather information to make a diagnosis.
              </span>
            </li>
            <li>
              <CheckCircle className="instruction-icon" />
              <span>
                When you have completed your assessment, press the red "End Session" button.
              </span>
            </li>
            <li>
              <CheckCircle className="instruction-icon" />
              <span>
                Wait for the evaluation report to be generated.
              </span>
            </li>
            <li>
              <CheckCircle className="instruction-icon" />
              <span>
                You can then choose to pick another patient or log out.
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Instructions;
