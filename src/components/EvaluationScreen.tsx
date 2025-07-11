import React from 'react';
import { 
  Award, 
  RotateCcw, 
  FileText, 
  Download, 
  ArrowLeft, 
  Clock, 
  User, 
  Star,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Target,
  Brain,
  Heart,
  Zap,
  BookOpen,
  Trophy,
  Medal,
  Sparkles
} from 'lucide-react';
import { EvaluationData } from '../types';

import { PerformanceMetrics, MetricsData } from '../types';
import { api } from '../services/api'; // Import api service

interface EvaluationScreenProps {
  evaluationData: EvaluationData;
  onRestart: () => void;
  onBack: () => void;
  currentCaseId?: string | null;
  sessionId: string | null; // Add sessionId
}

const EvaluationScreen: React.FC<EvaluationScreenProps> = ({ 
  evaluationData, 
  onRestart, 
  onBack,
  currentCaseId,
  sessionId // Add sessionId
}) => {
  const [performanceMetrics, setPerformanceMetrics] = React.useState<PerformanceMetrics | null>(null);
  const [metricsError, setMetricsError] = React.useState<string | null>(null);
  const [isLoadingMetrics, setIsLoadingMetrics] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (sessionId) {
      setIsLoadingMetrics(true);
      setMetricsError(null);
      api.getPerformanceMetrics(sessionId)
        .then(data => {
          setPerformanceMetrics(data);
        })
        .catch(err => {
          console.error("Failed to fetch performance metrics:", err);
          setMetricsError(err.message || "Failed to load detailed metrics.");
        })
        .finally(() => {
          setIsLoadingMetrics(false);
        });
    }
  }, [sessionId]);

  const downloadEvaluation = () => {
    const content = performanceMetrics?.raw_evaluation_text || evaluationData.evaluation || 'No evaluation available';
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `simulation-evaluation-${currentCaseId || performanceMetrics?.case_ref?.case_metadata?.case_id || 'session'}-${timestamp}.txt`;
    
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

  // Helper to format metric keys into readable names
  const formatMetricName = (key: string): string => {
    return key
      .replace(/_/g, ' ')
      .replace(/rating$/, '')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
      .trim();
  };

  // Helper to get styling for ratings
  const getRatingConfig = (rating?: string) => {
    const normalizedRating = rating?.toLowerCase() || '';
    if (normalizedRating.includes('excellent') || normalizedRating.includes('very good') || normalizedRating.includes('strong')) return { color: 'text-emerald-600', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200', icon: Trophy };
    if (normalizedRating.includes('good') || normalizedRating.includes('satisfactory') || normalizedRating.includes('reached')) return { color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200', icon: Medal };
    if (normalizedRating.includes('fair') || normalizedRating.includes('adequate')) return { color: 'text-amber-600', bgColor: 'bg-amber-50', borderColor: 'border-amber-200', icon: Star };
    if (normalizedRating.includes('needs improvement') || normalizedRating.includes('poor') || normalizedRating.includes('not reached')) return { color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200', icon: AlertCircle };
    return { color: 'text-gray-600', bgColor: 'bg-gray-50', borderColor: 'border-gray-200', icon: Target };
  };

  const renderMetricItem = (key: string, value?: string) => {
    if (!value) return null;
    const ratingConfig = getRatingConfig(value);
    const displayName = formatMetricName(key);

    // Special handling for overall_diagnosis_accuracy
    if (key === 'overall_diagnosis_accuracy') {
      return (
        <div key={key} className={`text-center p-6 rounded-2xl border-2 ${ratingConfig.bgColor} ${ratingConfig.borderColor} shadow-sm`}>
          <div className={`w-12 h-12 ${ratingConfig.bgColor} rounded-full flex items-center justify-center mx-auto mb-3 border ${ratingConfig.borderColor}`}>
            {React.createElement(ratingConfig.icon, { className: `w-6 h-6 ${ratingConfig.color}` })}
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">{displayName}</h3>
          <p className={`text-2xl font-bold ${ratingConfig.color}`}>{value}</p>
        </div>
      );
    }

    // Standard display for other ratings
    return (
      <div key={key} className={`p-5 rounded-2xl border-l-4 ${ratingConfig.borderColor} ${ratingConfig.bgColor} shadow-sm`}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-800 text-md">{displayName}</h3>
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${ratingConfig.color} ${ratingConfig.bgColor} border ${ratingConfig.borderColor}`}>
            {React.createElement(ratingConfig.icon, { className: "w-4 h-4" })}
            <span>{value}</span>
          </div>
        </div>
      </div>
    );
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Enhanced Header */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button
                onClick={onBack}
                className="p-3 hover:bg-gray-100 rounded-2xl transition-all duration-200 group"
                title="Back to Case Selection"
              >
                <ArrowLeft className="w-6 h-6 group-hover:scale-110 transition-transform" />
              </button>
              
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl shadow-lg">
                    <Award className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-400 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                </div>
                
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Session Evaluation Report</h1>
                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    {currentCaseId && (
                      <span className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span className="font-medium">Case: {currentCaseId}</span>
                      </span>
                    )}
                    <span className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-lg border border-gray-200">
                      <Clock className="w-4 h-4 text-gray-600" />
                      <span className="font-medium">
                        {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              {evaluationData.history && (
                <button
                  onClick={downloadHistory}
                  className="flex items-center gap-2 px-4 py-3 text-sm bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200 transform hover:scale-105 border border-gray-200"
                  title="Download Conversation History"
                >
                  <Download className="w-4 h-4" />
                  <span className="font-medium">History</span>
                </button>
              )}
              {evaluationData.evaluation && (
                <button
                  onClick={downloadEvaluation}
                  className="flex items-center gap-2 px-4 py-3 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-xl transition-all duration-200 transform hover:scale-105 border border-blue-200"
                  title="Download Evaluation Report"
                >
                  <Download className="w-4 h-4" />
                  <span className="font-medium">Report</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="xl:col-span-3 space-y-8">
            {/* Structured Performance Metrics */}
            {isLoadingMetrics && (
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center">
                <div className="flex justify-center items-center">
                  <Clock className="w-6 h-6 text-blue-500 animate-spin mr-2" />
                  <p className="text-lg text-gray-700">Loading performance metrics...</p>
                </div>
              </div>
            )}
            {metricsError && (
              <div className="bg-red-50 rounded-3xl shadow-xl border border-red-200 p-8 text-center">
                <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <p className="text-lg text-red-700">Error loading metrics: {metricsError}</p>
              </div>
            )}
            {performanceMetrics && (
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-8 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold mb-1">Performance Report</h2>
                      <p className="text-blue-100">Your clinical history-taking assessment.</p>
                    </div>
                     {performanceMetrics.case_ref?.case_metadata?.title && (
                       <span className="bg-white bg-opacity-20 px-3 py-1.5 rounded-lg text-sm font-medium shadow">
                         {performanceMetrics.case_ref.case_metadata.title}
                       </span>
                    )}
                  </div>
                </div>

                <div className="p-8 space-y-6">
                  {/* Performance Overview Score & Label */}
                  {performanceMetrics.metrics?.overall_score !== undefined && performanceMetrics.metrics?.performance_label && (
                    <div className={`bg-white rounded-2xl shadow-lg border-l-8 ${getRatingConfig(performanceMetrics.metrics.performance_label).borderColor} p-6 mb-8`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-gray-800 mb-1">Overall Performance</h3>
                          <p className={`text-3xl font-bold ${getRatingConfig(performanceMetrics.metrics.performance_label).color}`}>
                            {performanceMetrics.metrics.overall_score}%
                          </p>
                        </div>
                        <div className="text-right">
                           <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-lg font-semibold ${getRatingConfig(performanceMetrics.metrics.performance_label).color} ${getRatingConfig(performanceMetrics.metrics.performance_label).bgColor} border-2 ${getRatingConfig(performanceMetrics.metrics.performance_label).borderColor}`}>
                            {React.createElement(getRatingConfig(performanceMetrics.metrics.performance_label).icon, { className: "w-6 h-6" })}
                            <span>{performanceMetrics.metrics.performance_label}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Evaluation Summary */}
                  {performanceMetrics.evaluation_summary && (
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-100 shadow">
                       <h3 className="text-xl font-semibold text-purple-800 mb-3 flex items-center gap-2">
                        <Sparkles className="w-5 h-5" />
                        Evaluation Summary
                      </h3>
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap font-sans text-sm">
                        {performanceMetrics.evaluation_summary}
                      </p>
                    </div>
                  )}

                  {/* Detailed Metrics Title */}
                  <div className="pt-4">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      Detailed Metric Ratings
                    </h3>
                  </div>

                  {/* Overall Diagnosis Accuracy (if present) */}
                  {performanceMetrics.metrics?.overall_diagnosis_accuracy && (
                    <div className="pb-2"> {/* Adjusted padding */}
                     {renderMetricItem('overall_diagnosis_accuracy', performanceMetrics.metrics.overall_diagnosis_accuracy)}
                    </div>
                  )}

                  {/* Other Metric Ratings */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {Object.entries(performanceMetrics.metrics)
                      .filter(([key]) => key !== 'overall_diagnosis_accuracy') // Already rendered
                      .map(([key, value]) => renderMetricItem(key, value))}
                  </div>
                </div>
              </div>
            )}

            {/* AI Performance Analysis (Raw Text) */}
            {(performanceMetrics?.raw_evaluation_text || evaluationData.evaluation) && (
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-6 text-white">
                  <h2 className="text-xl font-bold flex items-center gap-3">
                    <Sparkles className="w-6 h-6" />
                    Detailed AI Evaluation
                  </h2>
                  <p className="text-purple-100 mt-1">The full textual analysis of the session.</p>
                </div>
                <div className="p-8">
                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 border-2 border-gray-100">
                    <pre className="text-gray-800 leading-relaxed whitespace-pre-wrap font-sans text-sm overflow-x-auto">
                      {performanceMetrics?.raw_evaluation_text || evaluationData.evaluation}
                    </pre>
                  </div>
                </div>
              </div>
            )}

            {/* Conversation History */}
            {evaluationData.history && evaluationData.history.length > 0 && (
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-teal-500 to-cyan-600 p-6 text-white">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold flex items-center gap-3">
                      <FileText className="w-6 h-6" />
                      Conversation History
                    </h2>
                    <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm font-medium">
                      {evaluationData.history.length} exchanges
                    </span>
                  </div>
                  <p className="text-teal-100 mt-1">Complete record of your clinical interview</p>
                </div>
                <div className="p-8">
                  <div className="max-h-96 overflow-y-auto space-y-4 border-2 border-gray-100 rounded-2xl p-6 bg-gradient-to-br from-gray-50 to-white">
                    {evaluationData.history.map((exchange, index) => (
                      <div 
                        key={index} 
                        className={`p-5 rounded-2xl shadow-sm border-l-4 ${
                          exchange.role.toLowerCase() === 'clinician' 
                            ? 'bg-blue-50 border-l-blue-400 ml-8' 
                            : 'bg-emerald-50 border-l-emerald-400 mr-8'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                            exchange.role.toLowerCase() === 'clinician' 
                              ? 'bg-blue-100 text-blue-600' 
                              : 'bg-emerald-100 text-emerald-600'
                          }`}>
                            <User className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="font-bold text-sm text-gray-900">
                                {exchange.role.toLowerCase() === 'clinician' ? 'You (Clinician)' : 'Virtual Patient'}
                              </span>
                              <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">
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

          {/* Enhanced Sidebar */}
          <div className="xl:col-span-1">
            <div className="sticky top-6 space-y-6">
              {/* Session Summary */}
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Session Summary
                </h3>
                <div className="space-y-4">
                  {currentCaseId && (
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-sm text-gray-600 font-medium">Case ID</span>
                      <span className="text-sm font-bold text-gray-900 bg-blue-50 px-3 py-1 rounded-lg">{currentCaseId}</span>
                    </div>
                  )}
                  {evaluationData.history && (
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-sm text-gray-600 font-medium">Total Exchanges</span>
                      <span className="text-sm font-bold text-gray-900">{evaluationData.history.length}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-sm text-gray-600 font-medium">Completed</span>
                    <span className="text-sm font-bold text-gray-900">
                      {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-sm text-gray-600 font-medium">Status</span>
                    <span className="text-sm font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Complete
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Next Steps</h3>
                <div className="space-y-4">
                  <button
                    onClick={onRestart}
                    className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-200 transform hover:scale-105 shadow-lg"
                  >
                    <RotateCcw className="w-5 h-5" />
                    Start New Simulation
                  </button>
                  
                  <button
                    onClick={onBack}
                    className="w-full flex items-center justify-center gap-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-4 px-6 rounded-2xl transition-all duration-200 transform hover:scale-105"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    Back to Cases
                  </button>
                </div>
              </div>

              {/* Learning Tips */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl border-2 border-amber-200 p-6">
                <h3 className="text-lg font-bold text-amber-900 mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Learning Tips
                </h3>
                <ul className="text-sm text-amber-800 space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <span>Review the detailed analysis above</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <span>Practice with similar cases</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <span>Focus on systematic questioning</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <span>Consider patient communication</span>
                  </li>
                </ul>
              </div>

              {/* Achievement Badge */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl border-2 border-purple-200 p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-purple-900 mb-2">Session Complete!</h3>
                <p className="text-sm text-purple-700">
                  You've successfully completed a clinical history-taking simulation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvaluationScreen;