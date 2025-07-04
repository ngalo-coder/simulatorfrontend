import React from 'react';
import { Award, RotateCcw, FileText, Download, ArrowLeft, Clock, User } from 'lucide-react';
import { EvaluationData } from '../types';

interface EvaluationScreenProps {
  evaluationData: EvaluationData;
  onRestart: () => void;
  onBack: () => void;
  currentCaseId?: string | null;
}

const EvaluationScreen: React.FC<EvaluationScreenProps> = ({ 
  evaluationData, 
  onRestart, 
  onBack,
  currentCaseId 
}) => {
  const downloadEvaluation = () => {
    const content = evaluationData.evaluation || 'No evaluation available';
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `simulation-evaluation-${currentCaseId || 'session'}-${timestamp}.txt`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadHistory = () => {
    if (!evaluationData.history) return;
    
    const historyText = evaluationData.history
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n\n');
    
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `conversation-history-${currentCaseId || 'session'}-${timestamp}.txt`;
    
    const blob = new Blob([historyText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-4">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Back to Case Selection"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Award className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Session Evaluation Report</h1>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                    {currentCaseId && (
                      <span className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        Case: {currentCaseId}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              {evaluationData.history && (
                <button
                  onClick={downloadHistory}
                  className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  title="Download Conversation History"
                >
                  <Download className="w-4 h-4" />
                  History
                </button>
              )}
              {evaluationData.evaluation && (
                <button
                  onClick={downloadEvaluation}
                  className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
                  title="Download Evaluation Report"
                >
                  <Download className="w-4 h-4" />
                  Report
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Evaluation Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* AI Performance Analysis */}
            {evaluationData.evaluation && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-blue-50 px-6 py-4 border-b border-blue-200">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Award className="w-5 h-5 text-blue-600" />
                    AI Performance Analysis
                  </h2>
                </div>
                <div className="p-6">
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <pre className="text-gray-800 leading-relaxed whitespace-pre-wrap font-sans text-sm overflow-x-auto">
                      {evaluationData.evaluation}
                    </pre>
                  </div>
                </div>
              </div>
            )}

            {/* Conversation History */}
            {evaluationData.history && evaluationData.history.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-gray-600" />
                      Conversation History
                    </h2>
                    <span className="text-sm text-gray-500">
                      {evaluationData.history.length} exchanges
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="max-h-96 overflow-y-auto space-y-4 border border-gray-200 rounded-lg p-4 bg-gray-50">
                    {evaluationData.history.map((exchange, index) => (
                      <div 
                        key={index} 
                        className={`p-4 rounded-lg shadow-sm ${
                          exchange.role.toLowerCase() === 'clinician' 
                            ? 'bg-blue-50 border-l-4 border-blue-400 ml-8' 
                            : 'bg-green-50 border-l-4 border-green-400 mr-8'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            exchange.role.toLowerCase() === 'clinician' 
                              ? 'bg-blue-100 text-blue-600' 
                              : 'bg-green-100 text-green-600'
                          }`}>
                            <User className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-sm text-gray-900">
                                {exchange.role.toLowerCase() === 'clinician' ? 'You' : 'Patient'}
                              </span>
                              <span className="text-xs text-gray-500">
                                Exchange {index + 1}
                              </span>
                            </div>
                            <p className="text-gray-700 text-sm leading-relaxed">
                              {exchange.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Summary and Actions */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-6">
              {/* Session Summary */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Summary</h3>
                <div className="space-y-3">
                  {currentCaseId && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Case ID</span>
                      <span className="text-sm font-medium text-gray-900">{currentCaseId}</span>
                    </div>
                  )}
                  {evaluationData.history && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Total Exchanges</span>
                      <span className="text-sm font-medium text-gray-900">{evaluationData.history.length}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Completed</span>
                    <span className="text-sm font-medium text-gray-900">
                      {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-600">Status</span>
                    <span className="text-sm font-medium text-green-600">Evaluation Complete</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={onRestart}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105"
                  >
                    <RotateCcw className="w-5 h-5" />
                    Start New Simulation
                  </button>
                  
                  <button
                    onClick={onBack}
                    className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-all duration-200"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    Back to Cases
                  </button>
                </div>
              </div>

              {/* Tips */}
              <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">💡 Tips for Improvement</h3>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• Review the detailed analysis above</li>
                  <li>• Practice with similar cases</li>
                  <li>• Focus on systematic questioning</li>
                  <li>• Consider patient communication</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvaluationScreen;