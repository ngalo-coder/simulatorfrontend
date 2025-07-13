import React, { useState, useEffect, useMemo } from 'react';
import { 
  Stethoscope, 
  Play, 
  Loader2, 
  Clock, 
  BookOpen, 
  AlertCircle, 
  Search, 
  Filter, 
  X, 
  ChevronDown, 
  User, 
  Calendar, 
  Target, 
  Building, 
  Microscope, 
  Users,
  Star,
  TrendingUp,
  Award,
  Brain,
  Heart,
  Activity,
  Zap,
  Shield,
  CheckCircle,
  ArrowRight,
  Grid3X3,
  List,
  Shuffle
} from 'lucide-react';
import { PatientCase, CaseCategories } from '../types';
import { api } from '../services/api';

interface CaseSelectionScreenProps {
  onStart: (caseId: string) => void;
  isLoading: boolean;
}

interface FilterState {
  category: string;
  difficulty: string;
  searchTerm: string;
  estimatedTimeRange: string;
  specialty: string;
  programArea: string;
  specializedArea: string;
}

const CaseSelectionScreen: React.FC<CaseSelectionScreenProps> = ({ onStart, isLoading }) => {
  const [cases, setCases] = useState<PatientCase[]>([]);
  const [selectedCase, setSelectedCase] = useState<string | null>(null);
  const [loadingCases, setLoadingCases] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const [filters, setFilters] = useState<FilterState>({
    category: '',
    difficulty: '',
    searchTerm: '',
    estimatedTimeRange: '',
    specialty: '',
    programArea: '',
    specializedArea: ''
  });

  const [caseCategories, setCaseCategories] = useState<CaseCategories>({ program_areas: [], specialized_areas: [] });

  // State for Queue Mode
  const [isQueueModeActive, setIsQueueModeActive] = useState(false);
  const [currentQueue, setCurrentQueue] = useState<PatientCase[]>([]);
  const [currentQueueIndex, setCurrentQueueIndex] = useState(0);
  const [completedCasesInQueue, setCompletedCasesInQueue] = useState<string[]>([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoadingCategories(true);
        const categories = await api.getCaseCategories();
        setCaseCategories(categories);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load categories');
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        setLoadingCases(true);
        const filtersToApply: { program_area?: string; specialized_area?: string, specialty?: string } = {};
        if (filters.programArea) filtersToApply.program_area = filters.programArea;
        if (filters.specializedArea) filtersToApply.specialized_area = filters.specializedArea;
        if (filters.specialty) filtersToApply.specialty = filters.specialty;

        const fetchedCases = await api.getCases(Object.keys(filtersToApply).length > 0 ? filtersToApply : undefined);

        if (isQueueModeActive) {
          setCurrentQueue(fetchedCases);
          setCurrentQueueIndex(0);
          setCompletedCasesInQueue([]);
          setCases(fetchedCases);
          if (fetchedCases.length > 0) {
            setSelectedCase(fetchedCases[0].id);
          } else {
            setSelectedCase(null);
          }
        } else {
          setCases(fetchedCases);
          if (fetchedCases.length > 0 && !selectedCase) {
            setSelectedCase(fetchedCases[0].id);
          } else if (fetchedCases.length === 0) {
            setSelectedCase(null);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load cases');
      } finally {
        setLoadingCases(false);
      }
    };

    fetchCases();
  }, [filters.programArea, filters.specializedArea, filters.specialty, isQueueModeActive]);

  // Extract unique values for filter options
  const filterOptions = useMemo(() => {
    const sourceForOptions = cases;
    const categories = [...new Set(sourceForOptions.map(c => c.category).filter(Boolean))];
    const difficulties = [...new Set(sourceForOptions.map(c => c.difficulty).filter(Boolean))];
    const timeRanges = [...new Set(cases.map(c => c.estimatedTime || c.duration).filter(Boolean))];
    const specialties = [...new Set(cases.map(c => c.specialty).filter(Boolean))];
    
    return {
      categories: categories.sort(),
      difficulties: ['Beginner', 'Intermediate', 'Advanced'].filter(d => difficulties.includes(d)),
      timeRanges: timeRanges.sort(),
      specialties: specialties.sort(),
      programAreas: caseCategories.program_areas.sort(),
      specializedAreas: caseCategories.specialized_areas.sort()
    };
  }, [cases, caseCategories]);

  // Client-side search filtering
  const clientFilteredCases = useMemo(() => {
    return cases.filter(patientCase => {
      const matchesSearch = !filters.searchTerm || 
        patientCase.title?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        patientCase.description?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        patientCase.id.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        patientCase.tags?.some(tag => tag.toLowerCase().includes(filters.searchTerm.toLowerCase())) ||
        patientCase.chiefComplaint?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        patientCase.programArea?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        patientCase.specializedArea?.toLowerCase().includes(filters.searchTerm.toLowerCase());
      
      const matchesCategory = !filters.category || patientCase.category === filters.category;
      const matchesDifficulty = !filters.difficulty || patientCase.difficulty === filters.difficulty;
      const matchesTimeRange = !filters.estimatedTimeRange || 
        patientCase.estimatedTime === filters.estimatedTimeRange ||
        patientCase.duration === filters.estimatedTimeRange;
      const matchesSpecialty = !filters.specialty || patientCase.specialty === filters.specialty;
      
      return matchesSearch && matchesCategory && matchesDifficulty && matchesTimeRange && matchesSpecialty;
    });
  }, [cases, filters]);

  // Group cases by program area or specialty
  const groupedCases = useMemo(() => {
    const groups: { [key: string]: PatientCase[] } = {};
    
    clientFilteredCases.forEach(patientCase => {
      const groupKey = patientCase.programArea || patientCase.specialty || patientCase.category || 'General Medicine';
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(patientCase);
    });
    
    return groups;
  }, [clientFilteredCases]);

  const handleStart = () => {
    if (selectedCaseData) {
      onStart(selectedCaseData.id);
    }
  };

  const handleNextCase = () => {
    if (isQueueModeActive && currentQueueIndex < currentQueue.length - 1) {
      const nextIndex = currentQueueIndex + 1;
      setCurrentQueueIndex(nextIndex);
      setSelectedCase(currentQueue[nextIndex].id);
      if (currentQueue[currentQueueIndex]) {
         setCompletedCasesInQueue(prev => [...prev, currentQueue[currentQueueIndex].id]);
      }
    }
  };

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      difficulty: '',
      searchTerm: '',
      estimatedTimeRange: '',
      specialty: '',
      programArea: '',
      specializedArea: ''
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  const getDifficultyConfig = (difficulty?: string) => {
    switch (difficulty) {
      case 'Beginner': 
        return { 
          color: 'bg-emerald-50 text-emerald-700 border-emerald-200', 
          icon: Shield,
          gradient: 'from-emerald-400 to-teal-500'
        };
      case 'Intermediate': 
        return { 
          color: 'bg-amber-50 text-amber-700 border-amber-200', 
          icon: TrendingUp,
          gradient: 'from-amber-400 to-orange-500'
        };
      case 'Advanced': 
        return { 
          color: 'bg-red-50 text-red-700 border-red-200', 
          icon: Zap,
          gradient: 'from-red-400 to-pink-500'
        };
      default: 
        return { 
          color: 'bg-gray-50 text-gray-700 border-gray-200', 
          icon: BookOpen,
          gradient: 'from-gray-400 to-gray-500'
        };
    }
  };

  const getCategoryConfig = (category: string) => {
    const configs = [
      { color: 'bg-blue-50 text-blue-700 border-blue-200', icon: Heart, gradient: 'from-blue-400 to-indigo-500' },
      { color: 'bg-purple-50 text-purple-700 border-purple-200', icon: Brain, gradient: 'from-purple-400 to-violet-500' },
      { color: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: Activity, gradient: 'from-indigo-400 to-blue-500' },
      { color: 'bg-pink-50 text-pink-700 border-pink-200', icon: Stethoscope, gradient: 'from-pink-400 to-rose-500' },
      { color: 'bg-teal-50 text-teal-700 border-teal-200', icon: Target, gradient: 'from-teal-400 to-cyan-500' },
      { color: 'bg-orange-50 text-orange-700 border-orange-200', icon: Award, gradient: 'from-orange-400 to-red-500' }
    ];
    const index = category.length % configs.length;
    return configs[index];
  };

  const selectedCaseData = useMemo(() => {
    if (isQueueModeActive) {
      return currentQueue.length > currentQueueIndex ? currentQueue[currentQueueIndex] : null;
    }
    return selectedCase ? cases.find(c => c.id === selectedCase) : null;
  }, [selectedCase, cases, currentQueue, currentQueueIndex, isQueueModeActive]);

  if (loadingCases || loadingCategories) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 text-center border border-gray-100">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-6 shadow-lg">
              <Stethoscope className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Virtual Patient Simulator
            </h1>
            <p className="text-gray-600 leading-relaxed">
              Preparing your medical education experience
            </p>
          </div>
          <div className="flex items-center justify-center gap-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <p className="text-sm text-gray-500 mt-4">Loading available cases...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 text-center border border-red-100">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl mb-6 shadow-lg">
              <AlertCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Connection Error
            </h1>
            <p className="text-gray-600 leading-relaxed mb-4">{error}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Enhanced Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-6 shadow-lg">
            <Stethoscope className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Virtual Patient Simulator
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto mb-6">
            Master clinical history-taking with AI-powered virtual patients. 
            Practice, learn, and excel in your medical education journey.
          </p>
          
          {/* Stats Bar */}
          <div className="flex justify-center items-center gap-8 text-sm">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-gray-700">
                {isQueueModeActive ? currentQueue.length : cases.length} Cases Available
              </span>
            </div>
            {isQueueModeActive && currentQueue.length > 0 && (
              <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full shadow-sm border border-green-200">
                <Users className="w-4 h-4 text-green-600" />
                <span className="font-medium text-green-700">
                  Queue: {currentQueueIndex + 1} of {currentQueue.length}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Left Column - Search, Filters, and Cases/Queue View */}
          <div className="xl:col-span-3 space-y-8">
            {/* Enhanced Search and Filter Bar */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex flex-col lg:flex-row gap-4 items-start">
                {/* Search */}
                {!isQueueModeActive && (
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Search cases by title, symptoms, or specialty..."
                        value={filters.searchTerm}
                        onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                        className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                      />
                    </div>
                  </div>
                )}

                {/* Control Buttons */}
                <div className="flex gap-3">
                  {/* View Mode Toggle */}
                  {!isQueueModeActive && (
                    <div className="flex bg-gray-100 rounded-lg p-1">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all ${
                          viewMode === 'grid'
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-gray-600 hover:text-gray-800'
                        }`}
                      >
                        <Grid3X3 className="w-4 h-4" />
                        <span className="text-sm font-medium">Grid</span>
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all ${
                          viewMode === 'list'
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-gray-600 hover:text-gray-800'
                        }`}
                      >
                        <List className="w-4 h-4" />
                        <span className="text-sm font-medium">List</span>
                      </button>
                    </div>
                  )}

                  {/* Filter Toggle */}
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-2 px-4 py-3 border rounded-xl transition-all duration-200 ${
                      showFilters || hasActiveFilters
                        ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm'
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50 bg-white'
                    }`}
                  >
                    <Filter className="w-5 h-5" />
                    <span className="font-medium">Filters</span>
                    {hasActiveFilters && (
                      <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                        {Object.values(filters).filter(v => v !== '').length}
                      </span>
                    )}
                    <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Queue Mode Toggle */}
                  <button
                    onClick={() => setIsQueueModeActive(!isQueueModeActive)}
                    className={`flex items-center gap-2 px-4 py-3 border rounded-xl transition-all duration-200 ${
                      isQueueModeActive
                        ? 'bg-green-50 border-green-200 text-green-700 shadow-sm'
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50 bg-white'
                    }`}
                  >
                    {isQueueModeActive ? <Shuffle className="w-5 h-5" /> : <Users className="w-5 h-5" />}
                    <span className="font-medium">{isQueueModeActive ? 'Queue Mode' : 'Browse Mode'}</span>
                  </button>
                </div>
              </div>

              {/* Enhanced Filter Options */}
              {showFilters && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Program Area Filter */}
                    {caseCategories.program_areas.length > 0 && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                          <Building className="w-4 h-4 text-blue-600" />
                          Program Area
                        </label>
                        <select
                          value={filters.programArea}
                          onChange={(e) => handleFilterChange('programArea', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all duration-200"
                        >
                          <option value="">All Program Areas</option>
                          {caseCategories.program_areas.map(programArea => (
                            <option key={programArea} value={programArea}>{programArea}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Specialized Area Filter */}
                    {caseCategories.specialized_areas.length > 0 && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                          <Microscope className="w-4 h-4 text-purple-600" />
                          Specialized Area
                        </label>
                        <select
                          value={filters.specializedArea}
                          onChange={(e) => handleFilterChange('specializedArea', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all duration-200"
                        >
                          <option value="">All Specialized Areas</option>
                          <option value="null">General Medicine</option>
                          {caseCategories.specialized_areas.map(specializedArea => (
                            <option key={specializedArea} value={specializedArea}>{specializedArea}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Difficulty Filter */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">Difficulty Level</label>
                      <select
                        value={filters.difficulty}
                        onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all duration-200"
                      >
                        <option value="">All Levels</option>
                        {filterOptions.difficulties.map(difficulty => (
                          <option key={difficulty} value={difficulty}>{difficulty}</option>
                        ))}
                      </select>
                    </div>

                    {/* Category Filter */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">Medical Category</label>
                      <select
                        value={filters.category}
                        onChange={(e) => handleFilterChange('category', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all duration-200"
                      >
                        <option value="">All Categories</option>
                        {filterOptions.categories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>

                    {/* Specialty Filter */}
                    {filterOptions.specialties.length > 0 && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">Medical Specialty</label>
                        <select
                          value={filters.specialty}
                          onChange={(e) => handleFilterChange('specialty', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all duration-200"
                        >
                          <option value="">All Specialties</option>
                          {filterOptions.specialties.map(specialty => (
                            <option key={specialty} value={specialty}>{specialty}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Duration Filter */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">Session Duration</label>
                      <select
                        value={filters.estimatedTimeRange}
                        onChange={(e) => handleFilterChange('estimatedTimeRange', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all duration-200"
                      >
                        <option value="">Any Duration</option>
                        {filterOptions.timeRanges.map(timeRange => (
                          <option key={timeRange} value={timeRange}>{timeRange}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Clear Filters */}
                  {hasActiveFilters && (
                    <div className="mt-6 flex justify-end">
                      <button
                        onClick={clearFilters}
                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg"
                      >
                        <X className="w-4 h-4" />
                        Clear all filters
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Results Summary */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <p className="text-gray-600 font-medium">
                  Showing <span className="text-blue-600 font-bold">{clientFilteredCases.length}</span> of <span className="font-bold">{cases.length}</span> cases
                  {(hasActiveFilters || filters.programArea || filters.specializedArea) && (
                    <span className="ml-2 text-blue-600 font-semibold">(filtered)</span>
                  )}
                </p>
              </div>
            </div>

            {/* Conditional Rendering: Queue View or Browse View */}
            {isQueueModeActive ? (
              // Enhanced Queue View
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                {currentQueue.length > 0 && currentQueueIndex < currentQueue.length && selectedCaseData ? (
                  <div className="p-8">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">Current Case in Queue</h2>
                      <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full border border-green-200">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-700">
                          Case {currentQueueIndex + 1} of {currentQueue.length}
                        </span>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-4">
                            <h3 className="text-xl font-bold text-gray-900">{selectedCaseData.title}</h3>
                            <span className="text-xs text-gray-500 bg-white px-3 py-1 rounded-full">
                              {selectedCaseData.id}
                            </span>
                          </div>
                          <p className="text-gray-700 mb-4 leading-relaxed">
                            {selectedCaseData.description}
                          </p>
                          
                          {/* Enhanced metadata display */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {(selectedCaseData.programArea || selectedCaseData.specializedArea) && (
                              <div className="space-y-2">
                                {selectedCaseData.programArea && (
                                  <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-blue-200">
                                    <Building className="w-4 h-4 text-blue-600" />
                                    <span className="text-sm font-medium text-gray-700">{selectedCaseData.programArea}</span>
                                  </div>
                                )}
                                {selectedCaseData.specializedArea && (
                                  <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-purple-200">
                                    <Microscope className="w-4 h-4 text-purple-600" />
                                
                                    <span className="text-sm font-medium text-gray-700">{selectedCaseData.specializedArea}</span>
                                  </div>
                                )}
                              </div>
                            )}
                            
                            <div className="flex items-center gap-4">
                              {selectedCaseData.difficulty && (
                                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${getDifficultyConfig(selectedCaseData.difficulty).color}`}>
                                  {React.createElement(getDifficultyConfig(selectedCaseData.difficulty).icon, { className: "w-4 h-4" })}
                                  <span className="text-sm font-medium">{selectedCaseData.difficulty}</span>
                                </div>
                              )}
                              {(selectedCaseData.estimatedTime || selectedCaseData.duration) && (
                                <div className="flex items-center gap-2 text-gray-600 bg-white px-3 py-2 rounded-lg border border-gray-200">
                                  <Clock className="w-4 h-4" />
                                  <span className="text-sm font-medium">{selectedCaseData.estimatedTime || selectedCaseData.duration}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Queue is Empty</h3>
                    <p className="text-gray-600 mb-6">
                      No cases match your current filter criteria, or you've completed all cases in the queue.
                    </p>
                    <button
                      onClick={() => setIsQueueModeActive(false)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200"
                    >
                      Switch to Browse Mode
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // Enhanced Browse View
              <div className="space-y-8">
                {Object.entries(groupedCases).map(([groupName, groupCases]) => (
                  <div key={groupName} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${getCategoryConfig(groupName).color}`}>
                            {React.createElement(getCategoryConfig(groupName).icon, { className: "w-5 h-5" })}
                            <span className="font-semibold">{groupName}</span>
                          </div>
                          <span className="text-gray-500 font-medium">
                            {groupCases.length} case{groupCases.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-8">
                      <div className={viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : 'space-y-4'}>
                        {groupCases.map((patientCase) => (
                          <div
                            key={patientCase.id}
                            className={`group border-2 rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:shadow-xl ${
                              selectedCase === patientCase.id 
                                ? 'border-blue-500 bg-blue-50 shadow-lg transform scale-[1.02]' 
                                : 'border-gray-200 hover:border-blue-300 bg-white hover:bg-blue-50'
                            }`}
                            onClick={() => setSelectedCase(patientCase.id)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                  <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-700 transition-colors">
                                    {patientCase.title}
                                  </h3>
                                  <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                    {patientCase.id}
                                  </span>
                                </div>
                                
                                <p className="text-gray-600 mb-4 leading-relaxed">
                                  {patientCase.description}
                                </p>

                                {/* Enhanced case metadata */}
                                {(patientCase.programArea || patientCase.specializedArea) && (
                                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                                    {patientCase.programArea && (
                                      <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-lg border border-blue-200">
                                        <Building className="w-3 h-3" />
                                        <span className="text-xs font-medium">{patientCase.programArea}</span>
                                      </div>
                                    )}
                                    {patientCase.specializedArea && (
                                      <div className="flex items-center gap-1 bg-purple-50 text-purple-700 px-3 py-1 rounded-lg border border-purple-200">
                                        <Microscope className="w-3 h-3" />
                                        <span className="text-xs font-medium">{patientCase.specializedArea}</span>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {patientCase.chiefComplaint && (
                                  <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
                                    <span className="text-xs font-semibold text-red-700 uppercase tracking-wide">Chief Complaint</span>
                                    <p className="text-sm text-red-800 mt-1">{patientCase.chiefComplaint}</p>
                                  </div>
                                )}

                                {(patientCase.patientAge || patientCase.patientGender) && (
                                  <div className="flex items-center gap-4 mb-4">
                                    {patientCase.patientAge && (
                                      <div className="flex items-center gap-2 text-gray-600">
                                        <Calendar className="w-4 h-4" />
                                        <span className="text-sm font-medium">{patientCase.patientAge} years old</span>
                                      </div>
                                    )}
                                    {patientCase.patientGender && (
                                      <div className="flex items-center gap-2 text-gray-600">
                                        <User className="w-4 h-4" />
                                        <span className="text-sm font-medium">{patientCase.patientGender}</span>
                                      </div>
                                    )}
                                  </div>
                                )}

                                <div className="flex items-center gap-3 mb-4 flex-wrap">
                                  {patientCase.difficulty && (
                                    <div className={`flex items-center gap-2 px-3 py-1 rounded-lg border ${getDifficultyConfig(patientCase.difficulty).color}`}>
                                      {React.createElement(getDifficultyConfig(patientCase.difficulty).icon, { className: "w-4 h-4" })}
                                      <span className="text-sm font-medium">{patientCase.difficulty}</span>
                                    </div>
                                  )}
                                  {(patientCase.estimatedTime || patientCase.duration) && (
                                    <div className="flex items-center gap-2 text-gray-600">
                                      <Clock className="w-4 h-4" />
                                      <span className="text-sm font-medium">{patientCase.estimatedTime || patientCase.duration}</span>
                                    </div>
                                  )}
                                </div>

                                {patientCase.tags && patientCase.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-2">
                                    {patientCase.tags.slice(0, 4).map((tag, index) => (
                                      <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-md">
                                        {tag}
                                      </span>
                                    ))}
                                    {patientCase.tags.length > 4 && (
                                      <span className="text-xs text-gray-500 px-2 py-1">
                                        +{patientCase.tags.length - 4} more
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                              
                              <div className="ml-4 flex flex-col items-center gap-3">
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                  selectedCase === patientCase.id 
                                    ? 'border-blue-500 bg-blue-500' 
                                    : 'border-gray-300 group-hover:border-blue-400'
                                }`}>
                                  {selectedCase === patientCase.id && <div className="w-3 h-3 bg-white rounded-full" />}
                                </div>
                                {selectedCase === patientCase.id && (
                                  <ArrowRight className="w-5 h-5 text-blue-500 animate-pulse" />
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}

                {clientFilteredCases.length === 0 && (
                  <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-gray-100">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No cases found</h3>
                    <p className="text-gray-600 mb-6">Try adjusting your search terms or filters to find more cases.</p>
                    {hasActiveFilters && (
                      <button 
                        onClick={clearFilters} 
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200"
                      >
                        Clear all filters
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Enhanced Right Column - Case Details */}
          <div className="xl:col-span-1">
            <div className="sticky top-6">
              {selectedCaseData ? (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white">
                    <h3 className="text-xl font-bold mb-2">
                      {isQueueModeActive && currentQueue.length > 0 
                        ? `Queue Progress` 
                        : "Case Details"}
                    </h3>
                    {isQueueModeActive && currentQueue.length > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-white bg-opacity-20 rounded-full h-2">
                          <div 
                            className="bg-white h-2 rounded-full transition-all duration-300"
                            style={{ width: `${((currentQueueIndex + 1) / currentQueue.length) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">
                          {currentQueueIndex + 1}/{currentQueue.length}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-6 space-y-6">
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2 text-lg">{selectedCaseData.title}</h4>
                      <p className="text-gray-600 leading-relaxed">{selectedCaseData.description}</p>
                    </div>

                    {(selectedCaseData.programArea || selectedCaseData.specializedArea) && (
                      <div>
                        <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                          <Building className="w-5 h-5 text-blue-600" />
                          Program Classification
                        </h4>
                        <div className="space-y-3">
                          {selectedCaseData.programArea && (
                            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                              <Building className="w-4 h-4 text-blue-600" />
                              <div>
                                <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Program Area</span>
                                <p className="text-sm text-blue-800 font-medium">{selectedCaseData.programArea}</p>
                              </div>
                            </div>
                          )}
                          {selectedCaseData.specializedArea && (
                            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                              <Microscope className="w-4 h-4 text-purple-600" />
                              <div>
                                <span className="text-xs font-semibold text-purple-700 uppercase tracking-wide">Specialized Area</span>
                                <p className="text-sm text-purple-800 font-medium">{selectedCaseData.specializedArea}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {selectedCaseData.clinicalContext && (
                      <div>
                        <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                          <Activity className="w-5 h-5 text-green-600" />
                          Clinical Context
                        </h4>
                        <p className="text-gray-600 bg-green-50 p-3 rounded-lg border border-green-200">{selectedCaseData.clinicalContext}</p>
                      </div>
                    )}

                    {selectedCaseData.learningObjectives && selectedCaseData.learningObjectives.length > 0 && (
                      <div>
                        <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                          <Target className="w-5 h-5 text-orange-600" />
                          Learning Objectives
                        </h4>
                        <ul className="space-y-2">
                          {selectedCaseData.learningObjectives.map((objective, index) => (
                            <li key={index} className="flex items-start gap-3 p-2 bg-orange-50 rounded-lg border border-orange-200">
                              <CheckCircle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-orange-800">{objective}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {selectedCaseData.presentingSymptoms && selectedCaseData.presentingSymptoms.length > 0 && (
                      <div>
                        <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                          <Heart className="w-5 h-5 text-red-600" />
                          Presenting Symptoms
                        </h4>
                        <div className="grid grid-cols-1 gap-2">
                          {selectedCaseData.presentingSymptoms.map((symptom, index) => (
                            <div key={index} className="flex items-center gap-2 p-2 bg-red-50 rounded-lg border border-red-200">
                              <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0" />
                              <span className="text-sm text-red-800 font-medium">{symptom}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="pt-6 border-t border-gray-200 space-y-4">
                      <button
                        onClick={handleStart}
                        disabled={isLoading || !selectedCaseData}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-lg transform hover:scale-105 disabled:hover:scale-100"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Starting Session...
                          </>
                        ) : (
                          <>
                            <Play className="w-5 h-5" />
                            Start Case Simulation
                          </>
                        )}
                      </button>

                      {isQueueModeActive && currentQueue.length > 0 && (
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={handleNextCase}
                            disabled={currentQueueIndex >= currentQueue.length - 1}
                            className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 text-gray-700 font-semibold py-3 px-4 rounded-xl transition-all duration-200"
                          >
                            <ArrowRight className="w-4 h-4" />
                            Next
                          </button>
                          <button
                            onClick={() => setIsQueueModeActive(false)}
                            className="flex items-center justify-center gap-2 bg-red-100 hover:bg-red-200 text-red-700 font-semibold py-3 px-4 rounded-xl transition-all duration-200"
                          >
                            <X className="w-4 h-4" />
                            Exit
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {isQueueModeActive && currentQueue.length === 0 && !loadingCases ? "Queue is Empty" : "Select a Case"}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {isQueueModeActive && currentQueue.length === 0 && !loadingCases
                      ? "No cases match your current filters for the queue. Adjust filters or switch to browse mode."
                      : "Choose a case from the list to view details and start your simulation."}
                  </p>
                  {isQueueModeActive && (
                    <button
                      onClick={() => setIsQueueModeActive(false)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200"
                    >
                      Switch to Browse Mode
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Footer */}
        <div className="mt-16 pt-8 border-t border-gray-200 text-center">
          <div className="flex justify-center items-center gap-8 mb-4">
            <div className="flex items-center gap-2 text-gray-600">
              <Shield className="w-4 h-4" />
              <span className="text-sm">AI-Powered Learning</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Award className="w-4 h-4" />
              <span className="text-sm">Medical Education Excellence</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Target className="w-4 h-4" />
              <span className="text-sm">Skill Development</span>
            </div>
          </div>
          <p className="text-sm text-gray-500">
            This simulation uses advanced AI to create realistic patient interactions for educational purposes.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CaseSelectionScreen;