import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/apiService';

interface Case {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  estimated_time: string;
  specialty?: string;
  patient_age?: number;
  patient_gender?: string;
  chief_complaint?: string;
}

const SimulationPage: React.FC = () => {
  const navigate = useNavigate();
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [startingSimulation, setStartingSimulation] = useState(false);
  const [filters, setFilters] = useState({
    specialty: '',
    difficulty: '',
    search: ''
  });

  useEffect(() => {
    fetchCases();
  }, [filters]);

  const fetchCases = async () => {
    try {
      setLoading(true);
      const response = await api.getCases(filters);
      setCases(response.cases || []);
    } catch (error) {
      console.error('Error fetching cases:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartSimulation = async (case_: Case) => {
    try {
      setStartingSimulation(true);
      const response = await api.startSimulation(case_.id);
      // Navigate to simulation interface with session ID
      navigate(`/simulation/${case_.id}/session/${response.sessionId}`);
    } catch (error) {
      console.error('Error starting simulation:', error);
      alert('Failed to start simulation. Please try again.');
    } finally {
      setStartingSimulation(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Virtual Patient Cases
        </h1>
        <p className="text-gray-600">
          Select a case to begin your simulation experience
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h3 className="text-lg font-semibold mb-4">Filter Cases</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              placeholder="Search cases..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Specialty
            </label>
            <select
              value={filters.specialty}
              onChange={(e) => setFilters({...filters, specialty: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Specialties</option>
              <option value="Internal Medicine">Internal Medicine</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Emergency Medicine">Emergency Medicine</option>
              <option value="Pediatrics">Pediatrics</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Difficulty
            </label>
            <select
              value={filters.difficulty}
              onChange={(e) => setFilters({...filters, difficulty: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
        </div>
      </div>

      {/* Cases Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading cases...</p>
        </div>
      ) : cases.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-600">No cases found matching your criteria.</p>
          <button
            onClick={() => setFilters({ specialty: '', difficulty: '', search: '' })}
            className="mt-4 text-blue-600 hover:text-blue-800"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cases.map((case_) => (
            <div key={case_.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="mb-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                    {case_.title}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(case_.difficulty)}`}>
                    {case_.difficulty}
                  </span>
                </div>
                <p className="text-gray-600 text-sm line-clamp-3 mb-3">
                  {case_.description}
                </p>
              </div>

              <div className="space-y-2 mb-4 text-sm">
                {case_.specialty && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Specialty:</span>
                    <span className="text-gray-900">{case_.specialty}</span>
                  </div>
                )}
                {case_.estimated_time && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Duration:</span>
                    <span className="text-gray-900">{case_.estimated_time}</span>
                  </div>
                )}
                {case_.patient_age && case_.patient_gender && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Patient:</span>
                    <span className="text-gray-900">{case_.patient_age}y {case_.patient_gender}</span>
                  </div>
                )}
                {case_.chief_complaint && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Chief Complaint:</span>
                    <span className="text-gray-900 text-right">{case_.chief_complaint}</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => handleStartSimulation(case_)}
                disabled={startingSimulation}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
              >
                {startingSimulation ? 'Starting...' : 'Start Simulation'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SimulationPage;