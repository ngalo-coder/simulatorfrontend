import React, { useEffect } from 'react';
import { AlertCircle, X, AlertTriangle, Info } from 'lucide-react';

/**
 * Message severity levels
 */
export type MessageSeverity = 'error' | 'warning' | 'info';

/**
 * Props for the ErrorMessage component
 */
interface ErrorMessageProps {
  /** The message to display */
  message: string;
  /** Function to call when the message is dismissed */
  onDismiss: () => void;
  /** Message severity level (default: 'error') */
  severity?: MessageSeverity;
  /** Auto-dismiss timeout in milliseconds (0 to disable) */
  autoDismissTimeout?: number;
}

/**
 * A reusable message component for displaying errors, warnings, and info messages
 */
const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  message, 
  onDismiss, 
  severity = 'error',
  autoDismissTimeout = 0
}) => {
  // Auto-dismiss the message after the specified timeout
  useEffect(() => {
    if (autoDismissTimeout > 0) {
      const timer = setTimeout(() => {
        onDismiss();
      }, autoDismissTimeout);
      
      return () => clearTimeout(timer);
    }
  }, [autoDismissTimeout, onDismiss]);
  
  // Configure styles based on severity
  const styles = {
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      iconColor: 'text-red-600',
      hover: 'hover:text-red-800',
      iconComponent: AlertCircle
    },
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-800',
      iconColor: 'text-amber-600',
      hover: 'hover:text-amber-800',
      iconComponent: AlertTriangle
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      iconColor: 'text-blue-600',
      hover: 'hover:text-blue-800',
      iconComponent: Info
    }
  };
  
  const currentStyle = styles[severity];
  const IconComponent = currentStyle.iconComponent;
  
  return (
    <div className={`mb-4 ${currentStyle.bg} border ${currentStyle.border} rounded-lg p-4 animate-fade-in shadow-sm`} 
         role="alert" 
         aria-live="assertive">
      <div className="flex items-start gap-3">
        <IconComponent className={`w-5 h-5 ${currentStyle.iconColor} flex-shrink-0 mt-0.5`} aria-hidden="true" />
        <div className="flex-1">
          <p className={`${currentStyle.text} text-sm`}>{message}</p>
        </div>
        <button
          onClick={onDismiss}
          className={`${currentStyle.iconColor} ${currentStyle.hover} transition-colors`}
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ErrorMessage;