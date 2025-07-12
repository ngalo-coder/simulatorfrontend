import React, { useState, useEffect } from 'react';
import { 
  Stethoscope, 
  Heart, 
  Brain, 
  Baby, 
  Eye, 
  Bone, 
  Activity, 
  Users, 
  ArrowRight,
  Search,
  Filter,
  ChevronRight,
  Star,
  Clock,
  BookOpen,
  Target,
  Zap,
  Award
} from 'lucide-react';
import { api } from '../services/api';
import { CaseCategories } from '../types';

interface ProgramAreaSelectionProps {
  onSelectProgramArea: (programArea: string) => void;
  isLoading: boolean;
}

const ProgramAreaSelection: React.FC<ProgramAreaSelectionProps> = ({ 
  onSelectProgramArea, 
  isLoading 
}) => {
  const [categories, setCategories] = useState<CaseCategories | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await api.getCaseCategories();
        setCategories(data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        // Fallback categories
        setCategories({
          program_areas: [
            'Internal Medicine',
            'Emergency Medicine', 
            'Pediatrics',
            'Surgery',
            'Cardiology',
            'Neurology',
            'Psychiatry',
            'Obstetrics & Gynecology',
            'Orthopedics',
            'Dermatology',
            'Ophthalmology',
            'ENT',
            'Radiology',
            'Pathology',
            'Anesthesiology'
          ],
          specialized_areas: []
        });
      }
    };

    fetchCategories();
  }, []);

  const programAreaIcons: { [key: string]: any } = {
    'Internal Medicine': Stethoscope,
    'Emergency Medicine': Activity,
    'Pediatrics': Baby,
    'Surgery': Target,
    'Cardiology': Heart,
    'Neurology': Brain,
    'Psychiatry': Users,
    'Obstetrics & Gynecology': Heart,
    'Orthopedics': Bone,
    'Dermatology': Eye,
    'Ophthalmology': Eye,
    'ENT': Stethoscope,
    'Radiology': Activity,
    'Pathology': BookOpen,
    'Anesthesiology': Zap
  };

  const programAreaColors: { [key: string]: string } = {
    'Internal Medicine': 'from-blue-500 to-blue-600',
    'Emergency Medicine': 'from-red-500 to-red-600',
    'Pediatrics': 'from-pink-500 to-pink-600',
    'Surgery': 'from-purple-500 to-purple-600',
    'Cardiology': 'from-rose-500 to-rose-600',
    'Neurology': 'from-indigo-500 to-indigo-600',
    'Psychiatry': 'from-teal-500 to-teal-600',
    'Obstetrics & Gynecology': 'from-purple-500 to-pink-500',
    'Orthopedics': 'from-gray-500 to-gray-600',
    'Dermatology': 'from-orange-500 to-orange-600',
    'Ophthalmology': 'from-cyan-500 to-cyan-600',
    'ENT': 'from-green-500 to-green-600',
    'Radiology': 'from-violet-500 to-violet-600',
    'Pathology': 'from-amber-500 to-amber-600',
    'Anesthesiology': 'from-emerald-500 to-emerald-600'
  };

  const filteredAreas = categories?.program_areas.filter(area =>
    area.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleSelectArea = (area: string) => {
    setSelectedCategory(area);
    setTimeout(() => {
      onSelectProgramArea(area);
    }, 300);
  };

  if (!categories) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading program areas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-lg">
              <Stethoscope className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Simuatech</h1>
              <p className="text-blue-600 font-medium">Where virtual patients build real clinicians</p>
            </div>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              From virtual patients to confident clinical practice
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              Master clinical skills with AI. Choose your medical specialty to access relevant virtual patient cases and begin your clinical training journey.
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
            <input
              type="text"
              placeholder="Search program areas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-16 pr-6 py-5 text-lg border-2 border-gray-200 rounded-3xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-lg"
            />
          </div>
        </div>

        {/* Program Areas Grid */}
        <div className="flex justify-center">
          <div className="w-full max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 lg:gap-6 mb-8 lg:mb-12">
          {filteredAreas.map((area, index) => {
            const IconComponent = programAreaIcons[area] || Stethoscope;
            const colorClass = programAreaColors[area] || 'from-blue-500 to-blue-600';
            const isSelected = selectedCategory === area;
            
            return (
              <button
                key={area}
                onClick={() => handleSelectArea(area)}
                disabled={isLoading}
                className={`group relative bg-white rounded-2xl lg:rounded-3xl shadow-lg border-2 transition-all duration-300 hover:shadow-2xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed p-6 lg:p-8 text-left ${
                  isSelected 
                    ? 'border-blue-500 ring-4 ring-blue-200 scale-105' 
                    : 'border-gray-200 hover:border-blue-300'
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex flex-col items-center text-center">
                  <div className={`w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br ${colorClass} rounded-2xl lg:rounded-3xl flex items-center justify-center mb-4 lg:mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
                  </div>
                  
                  <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-2 lg:mb-3 group-hover:text-blue-600 transition-colors leading-tight">
                    {area}
                  </h3>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-3 lg:mb-4">
                    <Users className="w-4 h-4" />
                    <span>Multiple Cases</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-blue-600 font-semibold group-hover:gap-3 transition-all duration-200">
                    <span className="text-sm lg:text-base">Select Area</span>
                    <ChevronRight className="w-4 h-4 lg:w-5 lg:h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {isSelected && (
                  <div className="absolute inset-0 bg-blue-500 bg-opacity-10 rounded-2xl lg:rounded-3xl flex items-center justify-center">
                    <div className="w-6 h-6 lg:w-8 lg:h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </button>
            );
          })}
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">500+</h3>
              <p className="text-gray-600">Virtual Cases</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">15</h3>
              <p className="text-gray-600">Specialties</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">24/7</h3>
              <p className="text-gray-600">Available</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">AI</h3>
              <p className="text-gray-600">Powered</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgramAreaSelection;