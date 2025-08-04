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
    program_area: '',
    specialty: '',
    difficulty: '',
    search: ''
  });
  const [categories, setCategories] = useState<{
    program_areas: string[];
    specialties: string[];
    specialized_areas: string[];
  }>({
    program_areas: [],
    specialties: [],
    specialized_areas: []
  });
  const [availableSpecialties, setAvailableSpecialties] = useState<string[]>([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchCases();
  }, [filters]);

  useEffect(() => {
    // When program area changes, update available specialties and reset specialty filter
    if (filters.program_area) {
      fetchSpecialtiesForProgramArea(filters.program_area);
      setFilters(prev => ({ ...prev, specialty: '' })); // Reset specialty when program area changes
    } else {
      setAvailableSpecialties(categories.specialties);
    }
  }, [filters.program_area, categories.specialties]);

  const fetchCategories = async () => {
    try {
      const response = await api.getCaseCategories();
      setCategories(response);
      setAvailableSpecialties(response.specialties || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchSpecialtiesForProgramArea = async (programArea: string) => {
    try {
      const response = await api.getCaseCategories({ program_area: programArea });
      setAvailableSpecialties(response.specialties || []);
    } catch (error) {
      console.error('Error fetching specialties for program area:', error);
      setAvailableSpecialties([]);
    }
  };

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
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Program Area - Primary Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <span className="flex items-center">
                Program Area
                <span className="ml-1 text-blue-600 text-xs">(Step 1)</span>
              </span>
            </label>
            <select
              value={filters.program_area}
              onChange={(e) => setFilters({...filters, program_area: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Program Areas</option>
              {categories.program_areas.map(area => (
                <option key={area} value={area}>{area}</option>
              ))}
            </select>
          </div>

          {/* Specialty - Secondary Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <span className="flex items-center">
                Specialty
                <span className="ml-1 text-blue-600 text-xs">(Step 2)</span>
              </span>
            </label>
            <select
              value={filters.specialty}
              onChange={(e) => setFilters({...filters, specialty: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!filters.program_area && availableSpecialties.length === 0}
            >
              <option value="">
                {filters.program_area ? 'All Specialties' : 'Select Program Area First'}
              </option>
              {availableSpecialties.map(specialty => (
                <option key={specialty} value={specialty}>{specialty}</option>
              ))}
            </select>
            {filters.program_area && availableSpecialties.length === 0 && (
              <p className="text-xs text-gray-500 mt-1">No specialties available for selected program area</p>
            )}
          </div>

          {/* Difficulty */}
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

          {/* Search */}
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
        </div>

        {/* Filter Summary */}
        {(filters.program_area || filters.specialty || filters.difficulty || filters.search) && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-blue-800 font-medium">Active filters:</span>
                {filters.program_area && (
                  <span className="px-2 py-1 bg-blue-200 text-blue-800 text-xs rounded-full">
                    Program: {filters.program_area}
                  </span>
                )}
                {filters.specialty && (
                  <span className="px-2 py-1 bg-blue-200 text-blue-800 text-xs rounded-full">
                    Specialty: {filters.specialty}
                  </span>
                )}
                {filters.difficulty && (
                  <span className="px-2 py-1 bg-blue-200 text-blue-800 text-xs rounded-full">
                    Difficulty: {filters.difficulty}
                  </span>
                )}
                {filters.search && (
                  <span className="px-2 py-1 bg-blue-200 text-blue-800 text-xs rounded-full">
                    Search: "{filters.search}"
                  </span>
                )}
              </div>
              <button
                onClick={() => setFilters({ program_area: '', specialty: '', difficulty: '', search: '' })}
                className="text-xs text-blue-600 hover:text-blue-800 underline"
              >
                Clear all
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Cases Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading cases...</p>
        </div>
      ) : cases.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-600 mb-2">No cases found matching your criteria.</p>
          <p className="text-sm text-gray-500 mb-4">
            Try adjusting your filters or search terms to find more cases.
          </p>
          <button
            onClick={() => setFilters({ program_area: '', specialty: '', difficulty: '', search: '' })}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Clear All Filters
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