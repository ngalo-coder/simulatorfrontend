import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/apiService';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [progressData, setProgressData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
          Continue your medical training with virtual patient simulations
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-3">Start New Case</h3>
          <p className="text-gray-600 mb-4">
            Browse available patient cases and start a new simulation
          </p>
          <Link 
            to="/simulation" 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors inline-block"
          >
            Browse Cases
          </Link>
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
                {progressData?.totalCasesCompleted || 0}
              </div>
              <div className="text-sm text-gray-600">Cases Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {progressData?.overallAverageScore ? `${Math.round(progressData.overallAverageScore)}%` : '0%'}
              </div>
              <div className="text-sm text-gray-600">Average Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {progressData?.specialtyProgress?.length || 0}
              </div>
              <div className="text-sm text-gray-600">Specialties Explored</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {progressData?.recentPerformance?.length || 0}
              </div>
              <div className="text-sm text-gray-600">Recent Cases</div>
            </div>
          </div>
        )}
      </div>

      {/* Recent Activity Section */}
      {progressData?.recentPerformance && progressData.recentPerformance.length > 0 && (
        <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {progressData.recentPerformance.slice(0, 5).map((performance: any, index: number) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div>
                  <h4 className="font-medium">{performance.caseTitle}</h4>
                  <p className="text-sm text-gray-600">
                    Completed on {new Date(performance.completedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <div className={`font-bold ${performance.score >= 90 ? 'text-green-600' : performance.score >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {performance.score}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Specialty Progress */}
      {progressData?.specialtyProgress && progressData.specialtyProgress.length > 0 && (
        <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Progress by Specialty</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {progressData.specialtyProgress.map((specialty: any, index: number) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-900">{specialty.specialty}</h4>
                <div className="mt-2 flex justify-between text-sm">
                  <span className="text-gray-600">Cases: {specialty.casesCompleted}</span>
                  <span className={`font-medium ${specialty.averageScore >= 90 ? 'text-green-600' : specialty.averageScore >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                    Avg: {Math.round(specialty.averageScore)}%
                  </span>
                </div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${specialty.averageScore >= 90 ? 'bg-green-500' : specialty.averageScore >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${Math.min(specialty.averageScore, 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
    </div>
  );
};

export default DashboardPage;