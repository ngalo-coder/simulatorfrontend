import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/apiService';
import PrivacySettingsModal from '../components/PrivacySettings';
import DataExportModal from '../components/DataExportModal';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [progressData, setProgressData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showPrivacySettings, setShowPrivacySettings] = useState(false);
  const [showDataExport, setShowDataExport] = useState(false);

  useEffect(() => {
    const fetchProgressData = async () => {
      if (user?.id) {
        try {
          const data = await api.getUserProgress(user.id);
          setProgressData(data);
        } catch (error) {
          console.error('Error fetching progress data:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchProgressData();
  }, [user?.id]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.username}!
        </h1>
        <p className="text-gray-600">
          Continue your medical training with patient simulations
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-3">Start New Case</h3>
          <p className="text-gray-600 mb-4">
            Browse available patient cases by program area and specialty
          </p>
          <div className="space-y-2">
            <Link 
              to="/browse-cases" 
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors inline-block w-full text-center"
            >
              Browse Cases
            </Link>
            <Link 
              to="/simulation" 
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors inline-block w-full text-center text-sm"
            >
              View All Cases
            </Link>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-3">My Progress</h3>
          <p className="text-gray-600 mb-4">
            View your performance metrics and learning progress
          </p>
          <Link 
            to="/progress" 
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors inline-block"
          >
            View Progress
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-3">Leaderboard</h3>
          <p className="text-gray-600 mb-4">
            See how you rank among other learners
          </p>
          <Link 
            to="/leaderboard" 
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors inline-block"
          >
            View Rankings
          </Link>
        </div>
      </div>

      <div className="bg-blue-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Quick Stats</h3>
        {loading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading your progress...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {progressData?.progress?.totalCasesCompleted || 0}
              </div>
              <div className="text-sm text-gray-600">Cases Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {progressData?.progress?.overallAverageScore ? `${Math.round(progressData.progress.overallAverageScore)}%` : '0%'}
              </div>
              <div className="text-sm text-gray-600">Average Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {progressData?.recentMetrics?.length || 0}
              </div>
              <div className="text-sm text-gray-600">Recent Cases</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {progressData?.progress?.beginnerCasesCompleted + progressData?.progress?.intermediateCasesCompleted + progressData?.progress?.advancedCasesCompleted || 0}
              </div>
              <div className="text-sm text-gray-600">Total by Difficulty</div>
            </div>
          </div>
        )}
      </div>

      {/* Recent Activity Section */}
      {progressData?.recentMetrics && progressData.recentMetrics.length > 0 && (
        <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {progressData.recentMetrics.slice(0, 5).map((metric: any, index: number) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div>
                  <h4 className="font-medium">{metric.case_ref?.case_metadata?.title || 'Unknown Case'}</h4>
                  <p className="text-sm text-gray-600">
                    {metric.case_ref?.case_metadata?.specialty} • {metric.case_ref?.case_metadata?.difficulty}
                  </p>
                  <p className="text-sm text-gray-600">
                    Completed on {new Date(metric.evaluated_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <div className={`font-bold ${metric.metrics?.overall_score >= 90 ? 'text-green-600' : metric.metrics?.overall_score >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {Math.round(metric.metrics?.overall_score || 0)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Progress by Difficulty */}
      {progressData?.progress && (
        <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Progress by Difficulty</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-900">Beginner</h4>
              <div className="mt-2 flex justify-between text-sm">
                <span className="text-gray-600">Cases: {progressData.progress.beginnerCasesCompleted}</span>
                <span className={`font-medium ${progressData.progress.beginnerAverageScore >= 90 ? 'text-green-600' : progressData.progress.beginnerAverageScore >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                  Avg: {Math.round(progressData.progress.beginnerAverageScore)}%
                </span>
              </div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${progressData.progress.beginnerAverageScore >= 90 ? 'bg-green-500' : progressData.progress.beginnerAverageScore >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${Math.min(progressData.progress.beginnerAverageScore, 100)}%` }}
                ></div>
              </div>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-900">Intermediate</h4>
              <div className="mt-2 flex justify-between text-sm">
                <span className="text-gray-600">Cases: {progressData.progress.intermediateCasesCompleted}</span>
                <span className={`font-medium ${progressData.progress.intermediateAverageScore >= 90 ? 'text-green-600' : progressData.progress.intermediateAverageScore >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                  Avg: {Math.round(progressData.progress.intermediateAverageScore)}%
                </span>
              </div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${progressData.progress.intermediateAverageScore >= 90 ? 'bg-green-500' : progressData.progress.intermediateAverageScore >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${Math.min(progressData.progress.intermediateAverageScore, 100)}%` }}
                ></div>
              </div>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-900">Advanced</h4>
              <div className="mt-2 flex justify-between text-sm">
                <span className="text-gray-600">Cases: {progressData.progress.advancedCasesCompleted}</span>
                <span className={`font-medium ${progressData.progress.advancedAverageScore >= 90 ? 'text-green-600' : progressData.progress.advancedAverageScore >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                  Avg: {Math.round(progressData.progress.advancedAverageScore)}%
                </span>
              </div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${progressData.progress.advancedAverageScore >= 90 ? 'bg-green-500' : progressData.progress.advancedAverageScore >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${Math.min(progressData.progress.advancedAverageScore, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Privacy & Data Section */}
      <div className="mt-8 bg-blue-50 border border-blue-200 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-3 flex items-center">
          <span className="mr-2">🔒</span>
          Privacy & Data Control
        </h3>
        <p className="text-gray-700 mb-4">
          Your privacy is important to us. Control how your data is used and who can see your progress.
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowPrivacySettings(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Privacy Settings
          </button>
          <button
            onClick={() => setShowDataExport(true)}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
          >
            Export My Data
          </button>
          <Link 
            to="/leaderboard" 
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors inline-block"
          >
            Leaderboard Settings
          </Link>
        </div>
      </div>

      {user?.role === 'admin' && (
        <div className="mt-8 bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">Admin Actions</h3>
          <Link 
            to="/admin" 
            className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 transition-colors inline-block"
          >
            Admin Dashboard
          </Link>
        </div>
      )}

      {/* Privacy Settings Modal */}
      {showPrivacySettings && (
        <PrivacySettingsModal onClose={() => setShowPrivacySettings(false)} />
      )}

      {/* Data Export Modal */}
      {showDataExport && (
        <DataExportModal onClose={() => setShowDataExport(false)} />
      )}
    </div>
  );
};

export default DashboardPage;