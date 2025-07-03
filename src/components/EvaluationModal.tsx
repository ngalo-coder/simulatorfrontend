import React from 'react';
import { X, Award, CheckCircle, AlertCircle, RotateCcw } from 'lucide-react';
import { EvaluationData } from '../types';

interface EvaluationModalProps {
  evaluationData: EvaluationData;
  onRestart: () => void;
}

const EvaluationModal: React.FC<EvaluationModalProps> = ({ evaluationData, onRestart }) => {
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <Award className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Simulation Complete</h2>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Overall Score */}
          {evaluationData.overall_score && (
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

          {/* Feedback */}
          {evaluationData.feedback && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Overall Feedback</h3>
              <p className="text-gray-700 leading-relaxed">{evaluationData.feedback}</p>
            </div>
          )}

          {/* Strengths */}
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

          {/* Areas for Improvement */}
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

          {/* Additional evaluation data */}
          {Object.entries(evaluationData).map(([key, value]) => {
            if (['overall_score', 'feedback', 'strengths', 'areas_for_improvement'].includes(key)) {
              return null;
            }
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