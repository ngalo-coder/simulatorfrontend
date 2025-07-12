import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Stethoscope, Eye, Brain, Heart, Lungs, Bone } from 'lucide-react';
import { api } from '../services/api';

const specialtyIcons = {
  'Internal Medicine': Heart,
  'Surgery': Bone,
  'Pediatrics': Stethoscope,
  'Obstetrics and Gynaecology': Stethoscope,
  'Ophthalmology': Eye,
  'Neurology': Brain,
  'Pulmonology': Lungs,
  // Add more specialty-to-icon mappings as needed
};

const specialtyColors = {
  'Internal Medicine': 'from-blue-500 to-blue-600',
  'Surgery': 'from-green-500 to-green-600',
  'Pediatrics': 'from-purple-500 to-purple-600',
  'Obstetrics and Gynaecology': 'from-pink-500 to-pink-600',
  'Ophthalmology': 'from-amber-500 to-amber-600',
  'Neurology': 'from-indigo-500 to-indigo-600',
  'Pulmonology': 'from-cyan-500 to-cyan-600',
  // Add more specialty-to-color mappings as needed
};

const SpecialtySelection = ({ programArea, onSelectSpecialty, onBack, isLoading }) => {
  const [specialties, setSpecialties] = useState([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchSpecialties() {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch specialties for the selected program area
        const response = await api.getCaseCategories({ program_area: programArea });
        setSpecialties(response.specialties || []);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching specialties:', err);
        setError('Failed to load specialties. Please try again.');
        setLoading(false);
      }
    }

    fetchSpecialties();
  }, [programArea]);

  const handleSpecialtySelect = (specialty) => {
    setSelectedSpecialty(specialty);
    setTimeout(() => {
      onSelectSpecialty(specialty);
    }, 300);
  };

  const filteredSpecialties = specialties.filter(specialty =>
    specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-lg text-gray-600">Loading specialties...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-4 max-w-md">
          <p>{error}</p>
        </div>
        <button 
          onClick={onBack}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Program Areas</span>
        </button>

        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Select a Specialty in {programArea}
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed mb-8">
            Choose a medical specialty to access relevant virtual patient cases and begin your clinical training journey.
          </p>

          <div className="relative mb-8">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search specialties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {filteredSpecialties.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">No specialties found for {programArea}.</p>
              <button
                onClick={onBack}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
              >
                Go Back
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {filteredSpecialties.map((specialty, index) => {
                const IconComponent = specialtyIcons[specialty] || Stethoscope;
                const colorClass = specialtyColors[specialty] || 'from-blue-500 to-blue-600';
                const isSelected = selectedSpecialty === specialty;

                return (
                  <button
                    key={index}
                    onClick={() => handleSpecialtySelect(specialty)}
                    className={`relative flex flex-col items-center text-center p-8 rounded-2xl shadow-md border-2 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-transparent bg-white hover:border-blue-200'
                    }`}
                  >
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${colorClass} flex items-center justify-center mb-4`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{specialty}</h3>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpecialtySelection;