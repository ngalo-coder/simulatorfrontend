import React, { useState, useEffect } from 'react';
import {
  Stethoscope,
  ArrowLeft,
  Search,
  Clock,
  Tag,
  BarChart,
  User,
  FileText,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Filter,
  X
} from 'lucide-react';
import { api } from '../services/api';
import { PatientCase } from '../types';

interface PatientQueueScreenProps {
  programArea: string;
  specialty: string;
  onBack: () => void;
  onStartCase: (caseId: string) => void;
  isLoading: boolean;
}

const PatientQueueScreen: React.FC<PatientQueueScreenProps> = ({
  programArea,
  specialty,
  onBack,
  onStartCase,
  isLoading
}) => {
  const [cases, setCases] = useState<PatientCase[]>([]);
  const [filteredCases, setFilteredCases] = useState<PatientCase[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCase, setSelectedCase] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    difficulty: [] as string[],
    showFilters: false
  });

  // Check if there's a selected case in session storage (from recommendations)
  useEffect(() => {
    const selectedCaseId = sessionStorage.getItem('selectedCaseId');
    if (selectedCaseId) {
      // Clear it from session storage
      sessionStorage.removeItem('selectedCaseId');
      // Start the case
      handleStartCase(selectedCaseId);
    }
  }, []);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch cases filtered by program area and specialty
        const casesData = await api.getCases({ 
          program_area: programArea,
          specialty: specialty 
        });
        
        setCases(casesData);
        setFilteredCases(casesData);
      } catch (error) {
        console.error('Failed to fetch cases:', error);
        setError('Failed to load patient cases. Please try again.');
        
        // Set some fallback cases for testing
        const fallbackCases: PatientCase[] = [
          {
            id: 'case-1',
            title: 'Chest Pain Evaluation',
            description: 'A 55-year-old male presenting with acute chest pain radiating to the left arm.',
            category: specialty,
            difficulty: 'Intermediate',
            estimatedTime: '15-20 minutes',
            tags: ['Cardiology', 'Emergency'],
            specialty: specialty,
            programArea: programArea
          },
          {
            id: 'case-2',
            title: 'Abdominal Pain Assessment',
            description: 'A 42-year-old female with lower right quadrant abdominal pain and fever.',
            category: specialty,
            difficulty: 'Beginner',
            estimatedTime: '10-15 minutes',
            tags: ['Gastroenterology', 'General Practice'],
            specialty: specialty,
            programArea: programArea
          },
          {
            id: 'case-3',
            title: 'Headache Diagnosis',
            description: 'A 35-year-old patient with recurring severe headaches and visual disturbances.',
            category: specialty,
            difficulty: 'Advanced',
            estimatedTime: '20-25 minutes',
            tags: ['Neurology', 'Pain Management'],
            specialty: specialty,
            programArea: programArea
          }
        ];
        
        setCases(fallbackCases);
        setFilteredCases(fallbackCases);
      } finally {
        setLoading(false);
      }
    };

    fetchCases();
  }, [programArea, specialty]);

  useEffect(() => {
    // Apply search and filters
    let result = cases;
    
    // Apply search term
    if (searchTerm) {
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Apply difficulty filters
    if (filters.difficulty.length > 0) {
      result = result.filter((c) => filters.difficulty.includes(c.difficulty));
    }
    
    setFilteredCases(result);
  }, [searchTerm, filters, cases]);

  const handleStartCase = (caseId: string) => {
    setSelectedCase(caseId);
    setTimeout(() => {
      onStartCase(caseId);
    }, 500);
  };

  const toggleDifficultyFilter = (difficulty: string) => {
    setFilters(prev => {
      const newDifficulties = prev.difficulty.includes(difficulty)
        ? prev.difficulty.filter(d => d !== difficulty)
        : [...prev.difficulty, difficulty];
      
      return {
        ...prev,
        difficulty: newDifficulties
      };
    });
  };

  const toggleFiltersVisibility = () => {
    setFilters(prev => ({
      ...prev,
      showFilters: !prev.showFilters
    }));
  };

  const clearFilters = () => {
    setFilters({
      difficulty: [],
      showFilters: true
    });
    setSearchTerm('');
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
      case 'easy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate':
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced':
      case 'hard':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading patient cases...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-lg">
              <Stethoscope className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Simuatech</h1>
              <p className="text-blue-600 font-medium">
                Where virtual patients build real clinicians
              </p>
            </div>
          </div>

          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Patient Queue: {specialty}
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              Select a patient case to begin your clinical simulation
            </p>
          </div>
        </div>

        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Specialties</span>
          </button>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-2xl shadow-md p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search cases by title, description, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            
            <button
              onClick={toggleFiltersVisibility}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
            >
              <Filter className="w-5 h-5" />
              <span>Filters</span>
            </button>
            
            {(filters.difficulty.length > 0 || searchTerm) && (
              <button
                onClick={clearFilters}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
                <span>Clear</span>
              </button>
            )}
          </div>
          
          {/* Filter Options */}
          {filters.showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div>
                <h3 className="font-medium mb-2">Difficulty:</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => toggleDifficultyFilter('Beginner')}
                    className={`px-3 py-1 rounded-full border transition-colors ${
                      filters.difficulty.includes('Beginner')
                        ? 'bg-green-100 text-green-800 border-green-300'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-green-50'
                    }`}
                  >
                    Beginner
                  </button>
                  <button
                    onClick={() => toggleDifficultyFilter('Intermediate')}
                    className={`px-3 py-1 rounded-full border transition-colors ${
                      filters.difficulty.includes('Intermediate')
                        ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-yellow-50'
                    }`}
                  >
                    Intermediate
                  </button>
                  <button
                    onClick={() => toggleDifficultyFilter('Advanced')}
                    className={`px-3 py-1 rounded-full border transition-colors ${
                      filters.difficulty.includes('Advanced')
                        ? 'bg-red-100 text-red-800 border-red-300'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-red-50'
                    }`}
                  >
                    Advanced
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Cases Grid */}
        {filteredCases.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Cases Found</h3>
            <p className="text-gray-600 mb-4">
              No cases match your current search criteria. Try adjusting your filters or search term.
            </p>
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredCases.map((patientCase) => {
              const isSelected = selectedCase === patientCase.id;
              
              return (
                <div
                  key={patientCase.id}
                  className={`bg-white rounded-2xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl ${
                    isSelected ? 'ring-4 ring-blue-200 scale-[1.02]' : ''
                  }`}
                >
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {patientCase.title}
                    </h3>
                    
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {patientCase.chiefComplaint 
                        ? `Patient presenting with ${patientCase.chiefComplaint.toLowerCase()}`
                        : patientCase.description && patientCase.description !== "A universal template for creating virtual patient simulation cases."
                          ? patientCase.description
                          : `${patientCase.title} simulation case`}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className={`px-3 py-1 text-sm rounded-full border ${getDifficultyColor(patientCase.difficulty)}`}>
                        {patientCase.difficulty}
                      </span>
                      
                      {patientCase.tags?.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded-full border border-blue-100"
                        >
                          {tag}
                        </span>
                      ))}
                      
                      {patientCase.tags && patientCase.tags.length > 2 && (
                        <span className="px-3 py-1 text-sm bg-gray-50 text-gray-600 rounded-full border border-gray-100">
                          +{patientCase.tags.length - 2} more
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-500 text-sm">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{patientCase.estimatedTime}</span>
                      </div>
                      
                      <button
                        onClick={() => handleStartCase(patientCase.id)}
                        disabled={isLoading || isSelected}
                        className="flex items-center gap-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSelected ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></div>
                            <span>Starting...</span>
                          </>
                        ) : (
                          <>
                            <span>Start Case</span>
                            <ChevronRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Stats Section */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {filteredCases.length}
              </h3>
              <p className="text-gray-600">Available Cases</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Realistic
              </h3>
              <p className="text-gray-600">Patient Interactions</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BarChart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Detailed
              </h3>
              <p className="text-gray-600">Performance Analysis</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Skill
              </h3>
              <p className="text-gray-600">Development</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientQueueScreen;