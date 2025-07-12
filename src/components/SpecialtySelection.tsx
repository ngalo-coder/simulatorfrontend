import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Stethoscope, 
  Heart, 
  Brain, 
  Activity, 
  Eye, 
  Bone, 
  Users, 
  Search,
  ChevronRight,
  Target,
  Zap,
  BookOpen,
  Star,
  Clock,
  Award
} from 'lucide-react';
import { api } from '../services/api';
import { CaseCategories } from '../types';

interface SpecialtySelectionProps {
  programArea: string;
  onBack: () => void;
  onSelectSpecialty: (specialty: string) => void;
  isLoading: boolean;
}

const SpecialtySelection: React.FC<SpecialtySelectionProps> = ({
  programArea,
  onBack,
  onSelectSpecialty,
  isLoading
}) => {
  const [categories, setCategories] = useState<CaseCategories | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await api.getCaseCategories();
        setCategories(data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        // Fallback specialties based on program area
        const fallbackSpecialties = getSpecialtiesForProgram(programArea);
        setCategories({
          program_areas: [],
          specialized_areas: fallbackSpecialties
        });
      }
    };

    fetchCategories();
  }, [programArea]);

  const getSpecialtiesForProgram = (program: string): string[] => {
    const specialtyMap: { [key: string]: string[] } = {
      'Internal Medicine': [
        'General Internal Medicine',
        'Gastroenterology',
        'Endocrinology',
        'Rheumatology',
        'Infectious Diseases',
        'Nephrology',
        'Pulmonology',
        'Hematology/Oncology'
      ],
      'Emergency Medicine': [
        'Trauma',
        'Critical Care',
        'Toxicology',
        'Emergency Procedures',
        'Pediatric Emergency',
        'Cardiac Emergency',
        'Respiratory Emergency'
      ],
      'Cardiology': [
        'Interventional Cardiology',
        'Electrophysiology',
        'Heart Failure',
        'Preventive Cardiology',
        'Cardiac Imaging',
        'Congenital Heart Disease'
      ],
      'Neurology': [
        'Stroke',
        'Epilepsy',
        'Movement Disorders',
        'Neuromuscular',
        'Headache Medicine',
        'Cognitive Neurology'
      ],
      'Pediatrics': [
        'General Pediatrics',
        'Pediatric Cardiology',
        'Pediatric Neurology',
        'Pediatric Emergency',
        'Neonatology',
        'Adolescent Medicine'
      ],
      'Surgery': [
        'General Surgery',
        'Trauma Surgery',
        'Vascular Surgery',
        'Thoracic Surgery',
        'Plastic Surgery',
        'Minimally Invasive Surgery'
      ]
    };

    return specialtyMap[program] || [
      'General Practice',
      'Acute Care',
      'Chronic Disease Management',
      'Preventive Medicine',
      'Diagnostic Medicine'
    ];
  };

  const specialtyIcons: { [key: string]: any } = {
    'General Internal Medicine': Stethoscope,
    'Gastroenterology': Activity,
    'Endocrinology': Target,
    'Rheumatology': Bone,
    'Infectious Diseases': Shield,
    'Nephrology': Heart,
    'Pulmonology': Activity,
    'Hematology/Oncology': Brain,
    'Trauma': Activity,
    'Critical Care': Heart,
    'Toxicology': Eye,
    'Emergency Procedures': Zap,
    'Pediatric Emergency': Users,
    'Cardiac Emergency': Heart,
    'Respiratory Emergency': Activity,
    'Interventional Cardiology': Heart,
    'Electrophysiology': Zap,
    'Heart Failure': Heart,
    'Preventive Cardiology': Shield,
    'Cardiac Imaging': Eye,
    'Congenital Heart Disease': Heart,
    'Stroke': Brain,
    'Epilepsy': Brain,
    'Movement Disorders': Brain,
    'Neuromuscular': Bone,
    'Headache Medicine': Brain,
    'Cognitive Neurology': Brain,
    'General Pediatrics': Users,
    'Pediatric Cardiology': Heart,
    'Pediatric Neurology': Brain,
    'Neonatology': Users,
    'Adolescent Medicine': Users,
    'General Surgery': Target,
    'Trauma Surgery': Activity,
    'Vascular Surgery': Heart,
    'Thoracic Surgery': Activity,
    'Plastic Surgery': Eye,
    'Minimally Invasive Surgery': Target
  };

  const specialtyColors: { [key: string]: string } = {
    'General Internal Medicine': 'from-blue-500 to-blue-600',
    'Gastroenterology': 'from-green-500 to-green-600',
    'Endocrinology': 'from-purple-500 to-purple-600',
    'Rheumatology': 'from-orange-500 to-orange-600',
    'Infectious Diseases': 'from-red-500 to-red-600',
    'Nephrology': 'from-cyan-500 to-cyan-600',
    'Pulmonology': 'from-teal-500 to-teal-600',
    'Hematology/Oncology': 'from-indigo-500 to-indigo-600',
    'Trauma': 'from-red-500 to-red-600',
    'Critical Care': 'from-gray-500 to-gray-600',
    'Toxicology': 'from-yellow-500 to-yellow-600',
    'Emergency Procedures': 'from-orange-500 to-orange-600',
    'Pediatric Emergency': 'from-pink-500 to-pink-600',
    'Cardiac Emergency': 'from-red-500 to-red-600',
    'Respiratory Emergency': 'from-blue-500 to-blue-600',
    'Interventional Cardiology': 'from-rose-500 to-rose-600',
    'Electrophysiology': 'from-yellow-500 to-yellow-600',
    'Heart Failure': 'from-red-500 to-red-600',
    'Preventive Cardiology': 'from-green-500 to-green-600',
    'Cardiac Imaging': 'from-blue-500 to-blue-600',
    'Congenital Heart Disease': 'from-pink-500 to-pink-600',
    'Stroke': 'from-red-500 to-red-600',
    'Epilepsy': 'from-purple-500 to-purple-600',
    'Movement Disorders': 'from-indigo-500 to-indigo-600',
    'Neuromuscular': 'from-orange-500 to-orange-600',
    'Headache Medicine': 'from-blue-500 to-blue-600',
    'Cognitive Neurology': 'from-teal-500 to-teal-600'
  };

  const availableSpecialties = categories?.specialized_areas || getSpecialtiesForProgram(programArea);
  
  const filteredSpecialties = availableSpecialties.filter(specialty =>
    specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectSpecialty = (specialty: string) => {
    setSelectedSpecialty(specialty);
    setTimeout(() => {
      onSelectSpecialty(specialty);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto p-4 lg:p-6">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 lg:p-8 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 lg:gap-6">
              <button
                onClick={onBack}
                className="p-3 lg:p-4 hover:bg-gray-100 rounded-2xl transition-all duration-200 group"
                title="Back to Program Areas"
              >
                <ArrowLeft className="w-5 h-5 lg:w-6 lg:h-6 group-hover:scale-110 transition-transform" />
              </button>
              
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">Select Specialty</h1>
                <p className="text-blue-600 font-medium text-sm lg:text-base">{programArea}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 bg-blue-50 px-3 lg:px-4 py-2 rounded-xl border border-blue-200">
              <BookOpen className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600" />
              <span className="text-blue-700 font-semibold text-sm lg:text-base">{filteredSpecialties.length} Specialties</span>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8 lg:mb-12">
          <div className="relative">
            <Search className="absolute left-4 lg:left-6 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 lg:w-6 lg:h-6" />
            <input
              type="text"
              placeholder="Search specialties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 lg:pl-16 pr-4 lg:pr-6 py-4 lg:py-5 text-base lg:text-lg border-2 border-gray-200 rounded-2xl lg:rounded-3xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-lg"
            />
          </div>
        </div>

        {/* Specialties Grid - Centered Layout for Larger Screens */}
        <div className="flex justify-center">
          <div className="w-full max-w-6xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6 mb-8 lg:mb-12">
              {filteredSpecialties.map((specialty, index) => {
                const IconComponent = specialtyIcons[specialty] || Stethoscope;
                const colorClass = specialtyColors[specialty] || 'from-blue-500 to-blue-600';
                const isSelected = selectedSpecialty === specialty;
                
                return (
                  <button
                    key={specialty}
                    onClick={() => handleSelectSpecialty(specialty)}
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
                        {specialty}
                      </h3>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-3 lg:mb-4">
                        <Users className="w-4 h-4" />
                        <span>Multiple Cases</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-blue-600 font-semibold group-hover:gap-3 transition-all duration-200">
                        <span className="text-sm lg:text-base">Select Specialty</span>
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

        {/* No Results */}
        {filteredSpecialties.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Specialties Found</h3>
            <p className="text-gray-600">Try adjusting your search criteria.</p>
          </div>
        )}

        {/* Info Section */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 lg:p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            <div className="text-center">
              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3 lg:mb-4">
                <Target className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
              </div>
              <h3 className="text-lg lg:text-2xl font-bold text-gray-900 mb-1 lg:mb-2">Specialized</h3>
              <p className="text-gray-600 text-sm lg:text-base">Focused clinical scenarios</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3 lg:mb-4">
                <Star className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
              </div>
              <h3 className="text-lg lg:text-2xl font-bold text-gray-900 mb-1 lg:mb-2">Expert</h3>
              <p className="text-gray-600 text-sm lg:text-base">Advanced case complexity</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-3 lg:mb-4">
                <Award className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
              </div>
              <h3 className="text-lg lg:text-2xl font-bold text-gray-900 mb-1 lg:mb-2">Certified</h3>
              <p className="text-gray-600 text-sm lg:text-base">Professional standards</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpecialtySelection;