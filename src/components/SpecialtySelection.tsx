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
  ArrowLeft,
  Search,
  ChevronRight,
  Star,
} from 'lucide-react';
import { api } from '../services/api';

interface SpecialtySelectionProps {
  programArea: string;
  onSelectSpecialty: (specialty: string) => void;
  onBack: () => void;
  isLoading: boolean;
}

const SpecialtySelection: React.FC<SpecialtySelectionProps> = ({
  programArea,
  onSelectSpecialty,
  onBack,
  isLoading
}) => {
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        setLoading(true);
        // Try to get specialties for the selected program area
        const data = await api.getCaseCategories({ program_area: programArea });
        
        if (data && data.specialties && data.specialties.length > 0) {
          setSpecialties(data.specialties);
        } else {
          // Fallback to default specialties if none are returned
          setSpecialties([
            'Internal Medicine',
            'Surgery',
            'Pediatrics',
            'Ophthalmology',
            'ENT',
            'Cardiology',
            'Neurology',
            'Psychiatry',
            'Emergency Medicine',
            'Family Medicine',
            'Obstetrics & Gynecology',
            'Dermatology',
            'Orthopedics',
            'Radiology',
            'Pathology',
            'Anesthesiology'
          ]);
        }
      } catch (error) {
        console.error('Failed to fetch specialties:', error);
        // Fallback specialties
        setSpecialties([
          'Internal Medicine',
          'Surgery',
          'Pediatrics',
          'Ophthalmology',
          'ENT',
          'Cardiology',
          'Neurology',
          'Psychiatry',
          'Emergency Medicine',
          'Family Medicine',
          'Obstetrics & Gynecology',
          'Dermatology',
          'Orthopedics',
          'Radiology',
          'Pathology',
          'Anesthesiology'
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchSpecialties();
  }, [programArea]);

  const specialtyIcons: { [key: string]: any } = {
    'Internal Medicine': Stethoscope,
    'Surgery': Activity,
    'Pediatrics': Baby,
    'Ophthalmology': Eye,
    'ENT': Stethoscope,
    'Cardiology': Heart,
    'Neurology': Brain,
    'Psychiatry': Users,
    'Emergency Medicine': Activity,
    'Family Medicine': Stethoscope,
    'Obstetrics & Gynecology': Heart,
    'Dermatology': Eye,
    'Orthopedics': Bone,
    'Radiology': Activity,
    'Pathology': Brain,
    'Anesthesiology': Activity,
  };

  const specialtyColors: { [key: string]: string } = {
    'Internal Medicine': 'from-blue-500 to-blue-600',
    'Surgery': 'from-purple-500 to-purple-600',
    'Pediatrics': 'from-pink-500 to-pink-600',
    'Ophthalmology': 'from-cyan-500 to-cyan-600',
    'ENT': 'from-green-500 to-green-600',
    'Cardiology': 'from-rose-500 to-rose-600',
    'Neurology': 'from-indigo-500 to-indigo-600',
    'Psychiatry': 'from-teal-500 to-teal-600',
    'Emergency Medicine': 'from-red-500 to-red-600',
    'Family Medicine': 'from-emerald-500 to-emerald-600',
    'Obstetrics & Gynecology': 'from-purple-500 to-pink-500',
    'Dermatology': 'from-orange-500 to-orange-600',
    'Orthopedics': 'from-gray-500 to-gray-600',
    'Radiology': 'from-violet-500 to-violet-600',
    'Pathology': 'from-amber-500 to-amber-600',
    'Anesthesiology': 'from-emerald-500 to-emerald-600',
  };

  const filteredSpecialties = specialties.filter(specialty =>
    specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectSpecialty = (specialty: string) => {
    setSelectedSpecialty(specialty);
    setTimeout(() => {
      onSelectSpecialty(specialty);
    }, 300);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading specialties...</p>
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
              <p className="text-blue-600 font-medium">
                Where virtual patients build real clinicians
              </p>
            </div>
          </div>

          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Select a Specialty in {programArea}
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              Choose a medical specialty to access relevant virtual patient cases and begin your clinical training.
            </p>
          </div>
        </div>

        {/* Back Button */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Program Areas</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
            <input
              type="text"
              placeholder="Search specialties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-16 pr-6 py-5 text-lg border-2 border-gray-200 rounded-3xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-lg"
            />
          </div>
        </div>

        {/* Specialties Grid */}
        <div className="flex justify-center">
          <div className="w-full max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {filteredSpecialties.map((specialty, index) => {
                const IconComponent = specialtyIcons[specialty] || Stethoscope;
                const colorClass = specialtyColors[specialty] || 'from-blue-500 to-blue-600';
                const isSelected = selectedSpecialty === specialty;

                return (
                  <button
                    key={specialty}
                    onClick={() => handleSelectSpecialty(specialty)}
                    disabled={isLoading}
                    className={`group relative bg-white rounded-3xl shadow-lg border-2 transition-all duration-300 hover:shadow-2xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed p-8 text-left ${
                      isSelected
                        ? 'border-blue-500 ring-4 ring-blue-200 scale-105'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex flex-col items-center text-center">
                      <div
                        className={`w-20 h-20 bg-gradient-to-br ${colorClass} rounded-3xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                      >
                        <IconComponent className="w-10 h-10 text-white" />
                      </div>

                      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors leading-tight">
                        {specialty}
                      </h3>

                      <div className="flex items-center gap-2 text-blue-600 font-semibold group-hover:gap-3 transition-all duration-200">
                        <span className="text-base">Select Specialty</span>
                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>

                    {isSelected && (
                      <div className="absolute inset-0 bg-blue-500 bg-opacity-10 rounded-3xl flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
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
                <Star className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {filteredSpecialties.length}
              </h3>
              <p className="text-gray-600">Specialties Available</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Expert-Led
              </h3>
              <p className="text-gray-600">Training</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Activity className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Real-Time
              </h3>
              <p className="text-gray-600">Feedback</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                AI-Powered
              </h3>
              <p className="text-gray-600">Learning</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpecialtySelection;