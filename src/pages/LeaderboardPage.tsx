import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/apiService';

interface LeaderboardEntry {
  userId: string;
  name: string;
  totalCases: number;
  excellentCount: number;
  excellentRate: string;
  averageScore: string;
  isContributor: boolean;
  rank: number;
}

const LeaderboardPage: React.FC = () => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('');
  const [specialties, setSpecialties] = useState<string[]>([]);

  useEffect(() => {
    fetchSpecialties();
    fetchLeaderboard();
  }, [selectedSpecialty]);

  const fetchSpecialties = async () => {
    try {
      const categories = await api.getCaseCategories();
      setSpecialties(categories.specialties || []);
    } catch (error) {
      console.error('Error fetching specialties:', error);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      // Fetch real leaderboard data from API
      const data = await api.getLeaderboard(selectedSpecialty, 20);
      
      // Add rank numbers to the data
      const rankedData = data.map((entry: any, index: number) => ({
        ...entry,
        rank: index + 1,
        userId: entry.userId?._id || entry.userId,
        name: entry.name || entry.userId?.username || 'Anonymous User'
      }));

      setLeaderboard(rankedData);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      // Fallback to empty array on error
      setLeaderboard([]);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `#${rank}`;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'text-yellow-600 bg-yellow-50';
      case 2:
        return 'text-gray-600 bg-gray-50';
      case 3:
        return 'text-orange-600 bg-orange-50';
      default:
        return 'text-blue-600 bg-blue-50';
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="bg-gray-200 h-16 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Leaderboard</h1>
        <p className="text-gray-600">See how you rank among other learners</p>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Filter by Specialty:</label>
          <select
            value={selectedSpecialty}
            onChange={(e) => setSelectedSpecialty(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Specialties</option>
            {specialties.map(specialty => (
              <option key={specialty} value={specialty}>{specialty}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Top Performers {selectedSpecialty && `- ${selectedSpecialty}`}
          </h2>
        </div>

        {leaderboard.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p className="text-lg mb-2">No leaderboard data available yet</p>
            <p className="text-sm">Complete some cases to see rankings appear!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {leaderboard.map((entry) => (
            <div
              key={entry.userId}
              className={`p-6 hover:bg-gray-50 transition-colors ${
                entry.userId === user?.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* Rank */}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${getRankColor(entry.rank)}`}>
                    {getRankIcon(entry.rank)}
                  </div>

                  {/* User Info */}
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-gray-900">
                        {entry.name}
                        {entry.userId === user?.id && (
                          <span className="ml-2 text-sm text-blue-600 font-normal">(You)</span>
                        )}
                      </h3>
                      {entry.isContributor && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                          Contributor
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {entry.totalCases} cases completed
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">
                    {entry.averageScore}%
                  </div>
                  <div className="text-sm text-gray-600">
                    {entry.excellentRate}% excellent
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Excellence Rate</span>
                  <span>{entry.excellentCount}/{entry.totalCases}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${entry.excellentRate}%` }}
                  ></div>
                </div>
              </div>
            </div>
            ))}
          </div>
        )}
      </div>

      {/* Your Rank (if not in top 5) */}
      {user && !leaderboard.slice(0, 5).find(entry => entry.userId === user.id) && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">Your Current Ranking</h3>
          <p className="text-blue-600 text-sm">
            You're currently ranked #{leaderboard.find(entry => entry.userId === user.id)?.rank || 'N/A'} overall.
            Keep completing cases to improve your ranking!
          </p>
        </div>
      )}

      {/* Call to Action */}
      <div className="mt-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white text-center">
        <h3 className="text-xl font-bold mb-2">Ready to Climb the Leaderboard?</h3>
        <p className="mb-4 opacity-90">
          Complete more cases and achieve excellent ratings to improve your ranking.
        </p>
        <button
          onClick={() => window.location.href = '/simulation'}
          className="bg-white text-blue-600 px-6 py-2 rounded-md font-medium hover:bg-gray-100 transition-colors"
        >
          Start Practicing
        </button>
      </div>
    </div>
  );
};

export default LeaderboardPage;