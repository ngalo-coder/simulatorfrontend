import React from 'react';
import { Award, CheckCircle, AlertCircle, RotateCcw, FileText, Download } from 'lucide-react';
import { EvaluationData } from '../types';

interface EvaluationModalProps {
  evaluationData: EvaluationData;
  onRestart: () => void;
}

const EvaluationModal: React.FC<EvaluationModalProps> = ({ evaluationData, onRestart }) => {
  const hasFullEvaluation = evaluationData.overall_score !== undefined;
  const hasDetailedEvaluation = evaluationData.evaluation !== undefined;
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="w-6 h-6 text-green-600" />;
    if (score >= 60) return <AlertCircle className="w-6 h-6 text-yellow-600" />;
    return <AlertCircle className="w-6 h-6 text-red-600" />;
  };

  const downloadEvaluation = () => {
    const content = evaluationData.evaluation || evaluationData.feedback || 'No evaluation available';
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `simulation-evaluation-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Format the evaluation text to preserve line breaks
  const formatEvaluationText = (text: string) => {
    return text.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < text.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${hasFullEvaluation ? 'bg-blue-100' : 'bg-gray-100'}`}>
                {hasFullEvaluation ? (
                  <Award className="w-6 h-6 text-blue-600" />
                ) : (
                  <FileText className="w-6 h-6 text-gray-600" />
                )}
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                {hasDetailedEvaluation ? 'AI Performance Evaluation' : hasFullEvaluation ? 'Simulation Complete' : 'Session Summary'}
              </h2>
            </div>
            {hasDetailedEvaluation && (
              <button
                onClick={downloadEvaluation}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                title="Download Evaluation"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
            )}
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Overall Score - only show if available */}
          {hasFullEvaluation && evaluationData.overall_score && (
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                {getScoreIcon(evaluationData.overall_score)}
                <span className={`text-3xl font-bold ${getScoreColor(evaluationData.overall_score)}`}>
                  {evaluationData.overall_score}%
                </span>
              </div>
              <p className="text-gray-600">Overall Performance Score</p>
            </div>
          )}

          {/* Detailed AI Evaluation */}
          {hasDetailedEvaluation && (
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-600" />
                Detailed Performance Analysis
              </h3>
              <div className="bg-white rounded-lg p-4 border border-blue-100">
                <pre className="text-gray-700 leading-relaxed whitespace-pre-wrap font-sans text-sm">
                  {formatEvaluationText(evaluationData.evaluation)}
                </pre>
              </div>
            </div>
          )}

          {/* Fallback Feedback */}
          {!hasDetailedEvaluation && evaluationData.feedback && (
            <div className={`rounded-lg p-4 ${hasFullEvaluation ? 'bg-blue-50' : 'bg-gray-50'}`}>
              <h3 className="font-semibold text-gray-900 mb-2">
                {hasFullEvaluation ? 'Overall Feedback' : 'Session Summary'}
              </h3>
              <p className="text-gray-700 leading-relaxed">{evaluationData.feedback}</p>
            </div>
          )}

          {/* Strengths - only show if available */}
          {evaluationData.strengths && evaluationData.strengths.length > 0 && (
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Strengths
              </h3>
              <ul className="space-y-2">
                {evaluationData.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-gray-700">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Areas for Improvement - only show if available */}
          {evaluationData.areas_for_improvement && evaluationData.areas_for_improvement.length > 0 && (
            <div className="bg-yellow-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                Areas for Improvement
              </h3>
              <ul className="space-y-2">
                {evaluationData.areas_for_improvement.map((area, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-gray-700">{area}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Session History - if available */}
          {evaluationData.history && evaluationData.history.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-600" />
                Session History ({evaluationData.history.length} exchanges)
              </h3>
              <div className="max-h-40 overflow-y-auto space-y-2">
                {evaluationData.history.slice(0, 5).map((exchange: any, index: number) => (
                  <div key={index} className="text-xs bg-white p-2 rounded border">
                    <span className="font-medium text-blue-600">{exchange.role}:</span>
                    <span className="text-gray-700 ml-2">{exchange.content.substring(0, 100)}...</span>
                  </div>
                ))}
                {evaluationData.history.length > 5 && (
                  <p className="text-xs text-gray-500 text-center">
                    ... and {evaluationData.history.length - 5} more exchanges
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Additional evaluation data */}
          {Object.entries(evaluationData).map(([key, value]) => {
            if (['overall_score', 'feedback', 'evaluation', 'strengths', 'areas_for_improvement', 'history'].includes(key)) {
              return null;
            }
            if (!value) return null;
            
            return (
              <div key={key} className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2 capitalize">
                  {key.replace(/_/g, ' ')}
                </h3>
                <p className="text-gray-700">
                  {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                </p>
              </div>
            );
          })}
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
            <button
              onClick={onRestart}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
            >
              <RotateCcw className="w-5 h-5" />
              Start New Simulation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvaluationModal;