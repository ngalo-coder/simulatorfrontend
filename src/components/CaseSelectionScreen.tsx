import React, { useState, useEffect, useMemo } from 'react';
import { Stethoscope, Play, Loader2, Clock, BookOpen, AlertCircle, Search, Filter, X, ChevronDown, User, Calendar, Target, Building, Microscope, Users } from 'lucide-react';
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
  const [isQueueModeActive, setIsQueueModeActive] = useState(false); // Default to false
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
        const filtersToApply: { program_area?: string; specialized_area?: string } = {};
        if (filters.programArea) filtersToApply.program_area = filters.programArea;
        if (filters.specializedArea) filtersToApply.specialized_area = filters.specializedArea;

        const fetchedCases = await api.getCases(Object.keys(filtersToApply).length > 0 ? filtersToApply : undefined);

        // If queue mode is active, populate the queue
        if (isQueueModeActive) {
          setCurrentQueue(fetchedCases);
          setCurrentQueueIndex(0);
          setCompletedCasesInQueue([]);
          // Also update 'cases' for other parts of the UI that might (temporarily) still use it
          // and for filterOptions derivation until fully refactored for queue.
          setCases(fetchedCases);
          if (fetchedCases.length > 0) {
            setSelectedCase(fetchedCases[0].id); // Select the first case in the queue by default
          } else {
            setSelectedCase(null);
          }
        } else {
          // Original behavior: update cases for list/grid view
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
  }, [filters.programArea, filters.specializedArea, isQueueModeActive]); // Added isQueueModeActive dependency

  // Extract unique values for filter options (excluding program/specialized areas which come from API)
  const filterOptions = useMemo(() => {
    // When in queue mode, filter options should ideally be based on all possible cases,
    // not just the current queue or the 'cases' state if it's also reflecting the queue.
    // For now, it will derive from 'cases' which is updated similarly in both modes.
    // This might need refinement if 'cases' solely represents the queue in queue mode.
    const sourceForOptions = cases;
    const categories = [...new Set(sourceForOptions.map(c => c.category).filter(Boolean))];
    const difficulties = [...new Set(sourceForOptions.map(c => c.difficulty).filter(Boolean))];
    const timeRanges = [...new Set(cases.map(c => c.estimatedTime || c.duration).filter(Boolean))];
    const specialties = [...new Set(cases.map(c => c.specialty).filter(Boolean))];
    // programAreas and specializedAreas are now from caseCategories state
    
    return {
      categories: categories.sort(),
      difficulties: ['Beginner', 'Intermediate', 'Advanced'].filter(d => difficulties.includes(d)),
      timeRanges: timeRanges.sort(),
      specialties: specialties.sort(),
      programAreas: caseCategories.program_areas.sort(),
      specializedAreas: caseCategories.specialized_areas.sort()
    };
  }, [cases, caseCategories]);

  // Client-side search filtering (applied on top of server-side filters)
  const clientFilteredCases = useMemo(() => {
    return cases.filter(patientCase => {
      const matchesSearch = !filters.searchTerm || 
        patientCase.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        patientCase.description.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        patientCase.id.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        patientCase.tags?.some(tag => tag.toLowerCase().includes(filters.searchTerm.toLowerCase())) ||
        patientCase.chiefComplaint?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        patientCase.programArea?.toLowerCase().includes(filters.searchTerm.toLowerCase()) || // Keep for search
        patientCase.specializedArea?.toLowerCase().includes(filters.searchTerm.toLowerCase()); // Keep for search
      
      // Category, Difficulty, TimeRange, Specialty filters are still client-side for now
      const matchesCategory = !filters.category || patientCase.category === filters.category;
      const matchesDifficulty = !filters.difficulty || patientCase.difficulty === filters.difficulty;
      const matchesTimeRange = !filters.estimatedTimeRange || 
        patientCase.estimatedTime === filters.estimatedTimeRange ||
        patientCase.duration === filters.estimatedTimeRange;
      const matchesSpecialty = !filters.specialty || patientCase.specialty === filters.specialty;
      // ProgramArea and SpecializedArea are handled by server-side filtering via API call
      
      return matchesSearch && matchesCategory && matchesDifficulty && matchesTimeRange && matchesSpecialty;
    });
  }, [cases, filters]);


  // Group cases by program area or specialty
  const groupedCases = useMemo(() => {
    const groups: { [key: string]: PatientCase[] } = {};
    
    clientFilteredCases.forEach(patientCase => {
      const groupKey = patientCase.programArea || patientCase.specialty || patientCase.category || 'Other';
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(patientCase);
    });
    
    return groups;
  }, [clientFilteredCases]);

  const handleStart = () => {
    // In queue mode, selectedCase is implicitly currentQueue[currentQueueIndex].id
    // In browse mode, selectedCase is set by clicking on a case.
    // selectedCaseData is already derived correctly for both modes.
    if (selectedCaseData) {
      onStart(selectedCaseData.id);
    }
  };

  const handleNextCase = () => {
    if (isQueueModeActive && currentQueueIndex < currentQueue.length - 1) {
      const nextIndex = currentQueueIndex + 1;
      setCurrentQueueIndex(nextIndex);
      // Automatically select the next case in the queue for display
      setSelectedCase(currentQueue[nextIndex].id);
      // Optional: Add current (now previous) case to completedCasesInQueue
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

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Advanced': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = [
      'bg-blue-100 text-blue-800 border-blue-200',
      'bg-purple-100 text-purple-800 border-purple-200',
      'bg-indigo-100 text-indigo-800 border-indigo-200',
      'bg-pink-100 text-pink-800 border-pink-200',
      'bg-teal-100 text-teal-800 border-teal-200',
      'bg-orange-100 text-orange-800 border-orange-200'
    ];
    const index = category.length % colors.length;
    return colors[index];
  };

  const selectedCaseData = useMemo(() => {
    if (isQueueModeActive) {
      return currentQueue.length > currentQueueIndex ? currentQueue[currentQueueIndex] : null;
    }
    return selectedCase ? cases.find(c => c.id === selectedCase) : null;
  }, [selectedCase, cases, currentQueue, currentQueueIndex, isQueueModeActive]);

  if (loadingCases || loadingCategories) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Stethoscope className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Virtual Patient Simulator
            </h1>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            <span className="text-gray-600">Loading available cases...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Error Loading Cases
            </h1>
            <p className="text-gray-600">{error}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Stethoscope className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Virtual Patient Simulator
          </h1>
          <p className="text-gray-600 leading-relaxed max-w-2xl mx-auto">
            Practice your clinical history-taking skills with our AI-powered virtual patients. 
            Choose from {isQueueModeActive ? currentQueue.length : cases.length} available cases to begin your simulation.
            {isQueueModeActive && currentQueue.length > 0 && (
              <span className="block text-sm mt-1"> (Now viewing case {currentQueueIndex + 1} of {currentQueue.length} in your queue)</span>
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Search, Filters, and Cases/Queue View */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search and Filter Bar (Always Visible) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col md:flex-row gap-4 items-start">
                {/* Search (conditionally hidden in queue mode for this example) */}
                {!isQueueModeActive && (
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Search cases by title, description, tags, symptoms, or program area..."
                        value={filters.searchTerm}
                        onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                )}

                {/* Filter Toggle Button */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-4 py-3 border rounded-lg transition-colors ${
                    showFilters || hasActiveFilters
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Filter className="w-5 h-5" />
                  <span>Filters</span>
                  {hasActiveFilters && (
                    <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {Object.values(filters).filter(v => v !== '').length}
                    </span>
                  )}
                  <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </button>

                {/* Queue Mode Toggle Button */}
                <button
                  onClick={() => setIsQueueModeActive(!isQueueModeActive)}
                  className={`flex items-center gap-2 px-4 py-3 border rounded-lg transition-colors ${
                    isQueueModeActive
                      ? 'bg-green-50 border-green-200 text-green-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {isQueueModeActive ? <User className="w-5 h-5" /> : <Users className="w-5 h-5" />}
                  <span>{isQueueModeActive ? 'Queue Mode' : 'Browse Mode'}</span>
                </button>
              </div>

              {/* Filter Options */}
              {showFilters && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Program Area Filter */}
                    {caseCategories.program_areas.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                          <Building className="w-4 h-4" />
                          Program Area
                        </label>
                        <select
                          value={filters.programArea}
                          onChange={(e) => handleFilterChange('programArea', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                          <Microscope className="w-4 h-4" />
                          Specialized Area
                        </label>
                        <select
                          value={filters.specializedArea}
                          onChange={(e) => handleFilterChange('specializedArea', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">All Specialized Areas</option>
                          <option value="null">None / General</option>
                          {caseCategories.specialized_areas.map(specializedArea => (
                            <option key={specializedArea} value={specializedArea}>{specializedArea}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Specialty Filter */}
                    {filterOptions.specialties.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Specialty</label>
                        <select
                          value={filters.specialty}
                          onChange={(e) => handleFilterChange('specialty', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">All Specialties</option>
                          {filterOptions.specialties.map(specialty => (
                            <option key={specialty} value={specialty}>{specialty}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Category Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                      <select
                        value={filters.category}
                        onChange={(e) => handleFilterChange('category', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">All Categories</option>
                        {filterOptions.categories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>

                    {/* Difficulty Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                      <select
                        value={filters.difficulty}
                        onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">All Difficulties</option>
                        {filterOptions.difficulties.map(difficulty => (
                          <option key={difficulty} value={difficulty}>{difficulty}</option>
                        ))}
                      </select>
                    </div>

                    {/* Time Range Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                      <select
                        value={filters.estimatedTimeRange}
                        onChange={(e) => handleFilterChange('estimatedTimeRange', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">All Durations</option>
                        {filterOptions.timeRanges.map(timeRange => (
                          <option key={timeRange} value={timeRange}>{timeRange}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Clear Filters */}
                  {hasActiveFilters && (
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={clearFilters}
                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                      >
                        <X className="w-4 h-4" />
                        Clear all filters
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Conditional Rendering: Queue View or Browse View */}
            {isQueueModeActive ? (
              // Queue View
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                {currentQueue.length > 0 && currentQueueIndex < currentQueue.length && selectedCaseData ? (
                  <div>
                    <h2 className="text-xl font-semibold mb-2">Current Case in Queue:</h2>
                    <p className="text-sm text-gray-600 mb-4">Displaying case {currentQueueIndex + 1} of {currentQueue.length}. Use the right panel for details and to start.</p>
                    {/* Simplified display of the current case in queue - details are on the right */}
                     <div className="border-2 rounded-lg p-4 border-blue-500 bg-blue-50 shadow-md">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-gray-900">{selectedCaseData.title}</h3>
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                {selectedCaseData.id}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">
                              {selectedCaseData.description}
                            </p>
                            {/* Display other relevant details from selectedCaseData if needed here */}
                             {(selectedCaseData.programArea || selectedCaseData.specializedArea) && (
                                <div className="flex items-center gap-2 mb-3 text-xs">
                                  {selectedCaseData.programArea && (
                                    <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-200">
                                      <Building className="w-3 h-3" />
                                      <span>{selectedCaseData.programArea}</span>
                                    </div>
                                  )}
                                  {selectedCaseData.specializedArea && (
                                    <div className="flex items-center gap-1 bg-purple-50 text-purple-700 px-2 py-1 rounded border border-purple-200">
                                      <Microscope className="w-3 h-3" />
                                      <span>{selectedCaseData.specializedArea}</span>
                                    </div>
                                  )}
                                </div>
                              )}
                              <div className="flex items-center gap-3 text-xs flex-wrap">
                                {selectedCaseData.difficulty && (
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(selectedCaseData.difficulty)}`}>
                                    {selectedCaseData.difficulty}
                                  </span>
                                )}
                                {(selectedCaseData.estimatedTime || selectedCaseData.duration) && (
                                  <div className="flex items-center gap-1 text-gray-600">
                                    <Clock className="w-3 h-3" />
                                    <span>{selectedCaseData.estimatedTime || selectedCaseData.duration}</span>
                                  </div>
                                )}
                              </div>
                          </div>
                        </div>
                      </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Queue is Empty or Finished</h3>
                    <p className="text-gray-600">
                      No cases match your current filter criteria, or you've completed all cases in the queue.
                      Try adjusting your filters or switching to browse mode.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              // Browse View (Existing Logic)
              <>
                <div className="flex justify-between items-center">
                  <p className="text-gray-600">
                    Showing {clientFilteredCases.length} of {cases.length} cases
                    {(hasActiveFilters || filters.programArea || filters.specializedArea) && (
                      <span className="ml-2 text-blue-600 font-medium">(filtered)</span>
                    )}
                  </p>
                </div>
                <div className="space-y-6">
                  {Object.entries(groupedCases).map(([groupName, groupCases]) => (
                    <div key={groupName} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getCategoryColor(groupName)}`}>{groupName}</span>
                          <span className="text-gray-500 text-sm">{groupCases.length} case{groupCases.length !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="grid grid-cols-1 gap-4">
                          {groupCases.map((patientCase) => (
                            <div
                              key={patientCase.id}
                              className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                                selectedCase === patientCase.id ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-gray-200 hover:border-gray-300'
                              }`}
                              onClick={() => setSelectedCase(patientCase.id)}
                            >
                               <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <h3 className="font-semibold text-gray-900">{patientCase.title}</h3>
                                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                      {patientCase.id}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-600 mb-3">{patientCase.description}</p>
                                  {(patientCase.programArea || patientCase.specializedArea) && (
                                    <div className="flex items-center gap-2 mb-3 text-xs">
                                      {patientCase.programArea && (
                                        <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-200">
                                          <Building className="w-3 h-3" /> <span>{patientCase.programArea}</span>
                                        </div>
                                      )}
                                      {patientCase.specializedArea && (
                                        <div className="flex items-center gap-1 bg-purple-50 text-purple-700 px-2 py-1 rounded border border-purple-200">
                                          <Microscope className="w-3 h-3" /> <span>{patientCase.specializedArea}</span>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                   {patientCase.chiefComplaint && (
                                    <div className="mb-3">
                                      <span className="text-xs font-medium text-gray-700">Chief Complaint: </span>
                                      <span className="text-xs text-gray-600">{patientCase.chiefComplaint}</span>
                                    </div>
                                  )}
                                  {(patientCase.patientAge || patientCase.patientGender) && (
                                    <div className="flex items-center gap-4 mb-3 text-xs text-gray-600">
                                      {patientCase.patientAge && (
                                        <div className="flex items-center gap-1">
                                          <Calendar className="w-3 h-3" />
                                          <span>{patientCase.patientAge} years old</span>
                                        </div>
                                      )}
                                      {patientCase.patientGender && (
                                        <div className="flex items-center gap-1">
                                          <User className="w-3 h-3" />
                                          <span>{patientCase.patientGender}</span>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                  <div className="flex items-center gap-3 text-xs flex-wrap">
                                    {patientCase.difficulty && (
                                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(patientCase.difficulty)}`}>
                                        {patientCase.difficulty}
                                      </span>
                                    )}
                                    {(patientCase.estimatedTime || patientCase.duration) && (
                                      <div className="flex items-center gap-1 text-gray-600">
                                        <Clock className="w-3 h-3" />
                                        <span>{patientCase.estimatedTime || patientCase.duration}</span>
                                      </div>
                                    )}
                                  </div>
                                  {patientCase.tags && patientCase.tags.length > 0 && (
                                    <div className="mt-3 flex flex-wrap gap-1">
                                      {patientCase.tags.slice(0, 3).map((tag, index) => (
                                        <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                          {tag}
                                        </span>
                                      ))}
                                      {patientCase.tags.length > 3 && (
                                        <span className="text-xs text-gray-500">
                                          +{patientCase.tags.length - 3} more
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ml-3 ${selectedCase === patientCase.id ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`}>
                                  {selectedCase === patientCase.id && <div className="w-2 h-2 bg-white rounded-full" />}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {clientFilteredCases.length === 0 && (
                  <div className="text-center py-12">
                    <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" /> {/* Adjusted icon size for emphasis */}
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No cases found</h3>
                    <p className="text-gray-600 mb-4">Try adjusting your search terms or filters.</p>
                    {hasActiveFilters && <button onClick={clearFilters} className="text-blue-600 hover:text-blue-700 font-medium">Clear all filters</button>}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Right Column - Case Details (Remains largely the same, driven by selectedCaseData) */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              {selectedCaseData ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {isQueueModeActive && currentQueue.length > 0 ? `Current Case (${currentQueueIndex +1} of ${currentQueue.length})` : "Case Details"}
                  </h3>

                   <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">{selectedCaseData.title}</h4>
                      <p className="text-sm text-gray-600">{selectedCaseData.description}</p>
                    </div>

                    {(selectedCaseData.programArea || selectedCaseData.specializedArea) && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Program Classification</h4>
                        <div className="space-y-2">
                          {selectedCaseData.programArea && (
                            <div className="flex items-center gap-2">
                              <Building className="w-4 h-4 text-blue-600" />
                              <span className="text-sm text-gray-700"><span className="font-medium">Program Area:</span> {selectedCaseData.programArea}</span>
                            </div>
                          )}
                          {selectedCaseData.specializedArea && (
                            <div className="flex items-center gap-2">
                              <Microscope className="w-4 h-4 text-purple-600" />
                              <span className="text-sm text-gray-700"><span className="font-medium">Specialized Area:</span> {selectedCaseData.specializedArea}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {selectedCaseData.clinicalContext && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Clinical Context</h4>
                        <p className="text-sm text-gray-600">{selectedCaseData.clinicalContext}</p>
                      </div>
                    )}

                    {selectedCaseData.learningObjectives && selectedCaseData.learningObjectives.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                          <Target className="w-4 h-4" />
                          Learning Objectives
                        </h4>
                        <ul className="space-y-1">
                          {selectedCaseData.learningObjectives.map((objective, index) => (
                            <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                              {objective}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {selectedCaseData.presentingSymptoms && selectedCaseData.presentingSymptoms.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Presenting Symptoms</h4>
                        <div className="flex flex-wrap gap-1">
                          {selectedCaseData.presentingSymptoms.map((symptom, index) => (
                            <span key={index} className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded border border-red-200">
                              {symptom}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="pt-4 border-t border-gray-200 space-y-3">
                      <button
                        onClick={handleStart}
                        disabled={isLoading || !selectedCaseData}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                      >
                        {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" />Starting...</> : <><Play className="w-5 h-5" />Start Case</>}
                      </button>

                      {isQueueModeActive && currentQueue.length > 0 && (
                        <div className="flex space-x-2">
                          <button
                            onClick={handleNextCase}
                            disabled={currentQueueIndex >= currentQueue.length - 1}
                            className="flex-1 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-all duration-200 text-sm"
                          >
                            Next Case in Queue
                          </button>
                           <button
                            onClick={() => setIsQueueModeActive(false)}
                            className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 font-semibold py-2 px-4 rounded-lg transition-all duration-200 text-sm"
                          >
                            Exit Queue
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {isQueueModeActive && currentQueue.length === 0 && !loadingCases ? "Queue is Empty" : "Select a Case"}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {isQueueModeActive && currentQueue.length === 0 && !loadingCases
                      ? "No cases match your current filters for the queue. Adjust filters or switch to browse mode."
                      : "Choose a case from the list or queue to view details and start."}
                  </p>
                   {isQueueModeActive && (
                     <button
                        onClick={() => setIsQueueModeActive(false)}
                        className="mt-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-all duration-200 text-sm"
                      >
                        Exit Queue & Browse All
                      </button>
                   )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">
            This simulation uses AI to create realistic patient interactions for educational purposes.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CaseSelectionScreen;
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No cases found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search terms or filters to find more cases.
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Case Details */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              {selectedCaseData ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Case Details</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">{selectedCaseData.title}</h4>
                      <p className="text-sm text-gray-600">{selectedCaseData.description}</p>
                    </div>

                    {/* Program Area and Specialized Area */}
                    {(selectedCaseData.programArea || selectedCaseData.specializedArea) && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Program Classification</h4>
                        <div className="space-y-2">
                          {selectedCaseData.programArea && (
                            <div className="flex items-center gap-2">
                              <Building className="w-4 h-4 text-blue-600" />
                              <span className="text-sm text-gray-700">
                                <span className="font-medium">Program Area:</span> {selectedCaseData.programArea}
                              </span>
                            </div>
                          )}
                          {selectedCaseData.specializedArea && (
                            <div className="flex items-center gap-2">
                              <Microscope className="w-4 h-4 text-purple-600" />
                              <span className="text-sm text-gray-700">
                                <span className="font-medium">Specialized Area:</span> {selectedCaseData.specializedArea}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {selectedCaseData.clinicalContext && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Clinical Context</h4>
                        <p className="text-sm text-gray-600">{selectedCaseData.clinicalContext}</p>
                      </div>
                    )}

                    {selectedCaseData.learningObjectives && selectedCaseData.learningObjectives.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                          <Target className="w-4 h-4" />
                          Learning Objectives
                        </h4>
                        <ul className="space-y-1">
                          {selectedCaseData.learningObjectives.map((objective, index) => (
                            <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                              {objective}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {selectedCaseData.presentingSymptoms && selectedCaseData.presentingSymptoms.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Presenting Symptoms</h4>
                        <div className="flex flex-wrap gap-1">
                          {selectedCaseData.presentingSymptoms.map((symptom, index) => (
                            <span key={index} className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded border border-red-200">
                              {symptom}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="pt-4 border-t border-gray-200">
                      <button
                        onClick={handleStart}
                        disabled={isLoading}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Starting...
                          </>
                        ) : (
                          <>
                            <Play className="w-5 h-5" />
                            Start Case
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Case</h3>
                  <p className="text-sm text-gray-600">
                    Choose a case from the list to view detailed information and start your simulation.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">
            This simulation uses AI to create realistic patient interactions for educational purposes.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CaseSelectionScreen;