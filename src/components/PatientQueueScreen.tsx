import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  User, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  Star, 
  Filter,
  Search,
  MoreVertical,
  Play,
  Calendar,
  MapPin,
  Activity,
  Heart,
  Thermometer,
  Stethoscope,
  Users,
  ChevronRight,
  Timer,
  Target,
  BookOpen,
  Zap
} from 'lucide-react';
import { PatientCase } from '../types';
import { api } from '../services/api';

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
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [loadingCases, setLoadingCases] = useState(true);

  useEffect(() => {
    const fetchCases = async () => {
      setLoadingCases(true);
      try {
        const data = await api.getCases({ program_area: programArea, specialty: specialty });
        setCases(data);
        setFilteredCases(data);
      } catch (error) {
        console.error('Failed to fetch cases:', error);
      } finally {
        setLoadingCases(false);
      }
    };

    fetchCases();
  }, [programArea, specialty]);

  useEffect(() => {
    let filtered = cases;

    if (searchTerm) {
      filtered = filtered.filter(case_ =>
        case_.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        case_.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        case_.chiefComplaint?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(case_ => case_.difficulty === selectedDifficulty);
    }

    setFilteredCases(filtered);
  }, [cases, searchTerm, selectedDifficulty]);

  const getDifficultyConfig = (difficulty?: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner':
        return { color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200', icon: CheckCircle };
      case 'intermediate':
        return { color: 'text-amber-600', bgColor: 'bg-amber-50', borderColor: 'border-amber-200', icon: Clock };
      case 'advanced':
        return { color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200', icon: AlertCircle };
      default:
        return { color: 'text-gray-600', bgColor: 'bg-gray-50', borderColor: 'border-gray-200', icon: Star };
    }
  };

  const getUrgencyLevel = (symptoms?: string[]) => {
    if (!symptoms) return 'routine';
    const urgentSymptoms = ['chest pain', 'shortness of breath', 'severe pain', 'bleeding'];
    const hasUrgent = symptoms.some(symptom => 
      urgentSymptoms.some(urgent => symptom.toLowerCase().includes(urgent))
    );
    return hasUrgent ? 'urgent' : 'routine';
  };

  const getUrgencyConfig = (urgency: string) => {
    switch (urgency) {
      case 'urgent':
        return { color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200', pulse: true };
      default:
        return { color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200', pulse: false };
    }
  };

  const handleStartCase = (caseId: string) => {
    setSelectedPatient(caseId);
    setTimeout(() => {
      onStartCase(caseId);
    }, 500);
  };

  if (loadingCases) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading patient queue...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button
                onClick={onBack}
                className="p-3 hover:bg-gray-100 rounded-2xl transition-all duration-200 group"
                title="Back to Specialty Selection"
              >
                <ArrowLeft className="w-6 h-6 group-hover:scale-110 transition-transform" />
              </button>
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Program: {programArea}</span>
                <span className="text-sm text-gray-500">Specialty: {specialty}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-xl border border-blue-200">
                <Users className="w-5 h-5 text-blue-600" />
                <span className="text-blue-700 font-semibold">{filteredCases.length} Patients</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Search and Filters */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search patients by name, complaint, or symptoms..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>
            
            <div className="flex gap-4">
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
              >
                <option value="all">All Levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>
        </div>

        {/* Patient Queue */}
        <div className="space-y-4">
          {filteredCases.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Patients Found</h3>
              <p className="text-gray-600">Try adjusting your search criteria or filters.</p>
            </div>
          ) : (
            filteredCases.map((case_, index) => {
              const difficultyConfig = getDifficultyConfig(case_.difficulty);
              const urgency = getUrgencyLevel(case_.presentingSymptoms);
              const urgencyConfig = getUrgencyConfig(urgency);
              const isSelected = selectedPatient === case_.id;
              
              return (
                <div
                  key={case_.id}
                  className={`bg-white rounded-3xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${
                    isSelected 
                      ? 'border-blue-500 ring-4 ring-blue-200' 
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="p-8">
                    <div className="flex items-start justify-between mb-6">
                      {/* Patient Info */}
                      <div className="flex items-start gap-6 flex-1">
                        <div className="relative">
                          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${urgencyConfig.bgColor} ${urgencyConfig.borderColor} border-2`}>
                            <User className={`w-8 h-8 ${urgencyConfig.color}`} />
                          </div>
                          {urgencyConfig.pulse && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full animate-pulse"></div>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-2">
                            <h3 className="text-xl font-bold text-gray-900">{case_.title}</h3>
                            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                              ID: {case_.id}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-6 mb-4 text-sm text-gray-600">
                            {case_.patientAge && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {case_.patientAge} years old
                              </span>
                            )}
                            {case_.patientGender && (
                              <span className="flex items-center gap-1">
                                <User className="w-4 h-4" />
                                {case_.patientGender}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {case_.estimatedTime}
                            </span>
                          </div>
                          
                          <div className="mb-4">
                            <p className="text-gray-700 font-medium mb-2">Chief Complaint:</p>
                            <p className="text-lg text-gray-900 font-semibold">
                              {case_.chiefComplaint || case_.description}
                            </p>
                          </div>
                          
                          {case_.presentingSymptoms && case_.presentingSymptoms.length > 0 && (
                            <div className="mb-4">
                              <p className="text-gray-700 font-medium mb-2">Presenting Symptoms:</p>
                              <div className="flex flex-wrap gap-2">
                                {case_.presentingSymptoms.slice(0, 4).map((symptom, idx) => (
                                  <span
                                    key={idx}
                                    className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-sm border border-blue-200"
                                  >
                                    {symptom}
                                  </span>
                                ))}
                                {case_.presentingSymptoms.length > 4 && (
                                  <span className="bg-gray-50 text-gray-600 px-3 py-1 rounded-lg text-sm border border-gray-200">
                                    +{case_.presentingSymptoms.length - 4} more
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Status and Actions */}
                      <div className="flex flex-col items-end gap-4">
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${difficultyConfig.bgColor} ${difficultyConfig.borderColor}`}>
                          {React.createElement(difficultyConfig.icon, { className: `w-4 h-4 ${difficultyConfig.color}` })}
                          <span className={`text-sm font-semibold ${difficultyConfig.color}`}>
                            {case_.difficulty}
                          </span>
                        </div>
                        
                        {urgency === 'urgent' && (
                          <div className="flex items-center gap-2 px-3 py-1 bg-red-50 text-red-700 rounded-full border border-red-200">
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-sm font-semibold">Urgent</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Action Button */}
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleStartCase(case_.id)}
                        disabled={isLoading}
                        className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 shadow-lg group"
                      >
                        {isSelected ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Starting Session...
                          </>
                        ) : (
                          <>
                            <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            Begin Consultation
                            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Mobile Continue Button - Fixed at bottom */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {filteredCases.length} patients available
          </div>
          <div className="text-sm text-blue-600 font-semibold">
            Select a patient to begin
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientQueueScreen;