import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/apiService';

// Removed unused interfaces - using dynamic data from API instead

const CaseBrowsingPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'program' | 'specialty'>('program');
  const [selectedProgramArea, setSelectedProgramArea] = useState<string>('');
  const [programAreas, setProgramAreas] = useState<string[]>([]);
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [specialtyCounts, setSpecialtyCounts] = useState<Record<string, number>>({});

  // Program area configurations with descriptions and icons
  const programAreaConfig: Record<string, { description: string; icon: string }> = {
    'Basic Program': {
      description: 'Foundational medical cases covering essential clinical skills and common presentations',
      icon: '🏥'
    },
    'Specialty Program': {
      description: 'Advanced cases in specialized medical fields requiring deeper clinical expertise',
      icon: '🔬'
    }
  };

  // Specialty configurations with descriptions
  const specialtyConfig: Record<string, string> = {
    'General Surgery': 'Surgical cases covering common procedures and surgical decision-making',
    'Internal Medicine': 'Complex medical cases focusing on diagnosis and management of internal conditions',
    'Pediatrics': 'Child and adolescent health cases with age-specific considerations',
    'Reproductive Health': 'Cases related to reproductive system health and family planning',
    'Emergency Medicine': 'Acute care scenarios requiring rapid assessment and intervention',
    'Cardiology': 'Heart and cardiovascular system cases',
    'Neurology': 'Neurological conditions and brain-related cases',
    'Psychiatry': 'Mental health and psychiatric condition cases'
  };

  useEffect(() => {
    fetchProgramAreas();
  }, []);

  useEffect(() => {
    if (selectedProgramArea) {
      fetchSpecialtiesForProgram(selectedProgramArea);
    }
  }, [selectedProgramArea]);

  const fetchProgramAreas = async () => {
    try {
      setLoading(true);
      const response = await api.getCaseCategories();
      setProgramAreas(response.program_areas || []);
    } catch (error) {
      console.error('Error fetching program areas:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSpecialtiesForProgram = async (programArea: string) => {
    try {
      setLoading(true);
      const response = await api.getCaseCategories({ program_area: programArea });
      setSpecialties(response.specialties || []);
      
      // Use case counts from backend response (no need for individual API calls)
      setSpecialtyCounts(response.specialty_counts || {});
    } catch (error) {
      console.error('Error fetching specialties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProgramAreaSelect = (programArea: string) => {
    setSelectedProgramArea(programArea);
    setStep('specialty');
  };

  const handleSpecialtySelect = (specialty: string) => {
    // Save the specialty context for smart "All Cases" functionality
    api.setSpecialtyContext(selectedProgramArea, specialty);
    
    // Navigate to the main simulation page with pre-selected filters
    navigate('/simulation', { 
      state: { 
        preselectedFilters: {
          program_area: selectedProgramArea,
          specialty: specialty
        }
      }
    });
  };

  const handleBackToPrograms = () => {
    setStep('program');
    setSelectedProgramArea('');
    setSpecialties([]);
    setSpecialtyCounts({});
  };

  if (loading && step === 'program') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading program areas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {step === 'program' ? 'Choose Program Area' : 'Choose Specialty'}
            </h1>
            <p className="text-gray-600">
              {step === 'program' 
                ? 'Select a program area to explore available medical cases'
                : `Select a specialty within ${selectedProgramArea}`
              }
            </p>
          </div>
          {step === 'specialty' && (
            <button
              onClick={handleBackToPrograms}
              className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:text-blue-800 transition-colors"
            >
              <span>←</span>
              <span>Back to Programs</span>
            </button>
          )}
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="mb-6">
        <nav className="flex items-center space-x-2 text-sm text-gray-600">
          <span 
            className={`${step === 'program' ? 'font-semibold text-blue-600' : 'hover:text-blue-600 cursor-pointer'}`}
            onClick={step === 'specialty' ? handleBackToPrograms : undefined}
          >
            Program Area
          </span>
          {step === 'specialty' && (
            <>
              <span>→</span>
              <span className="font-semibold text-blue-600">
                {selectedProgramArea} → Specialty
              </span>
            </>
          )}
        </nav>
      </div>

      {/* Program Area Selection */}
      {step === 'program' && (
        <div className="grid md:grid-cols-2 gap-6">
          {programAreas.map((programArea) => {
            const config = programAreaConfig[programArea] || { 
              description: 'Medical cases in this program area', 
              icon: '📚' 
            };
            
            return (
              <div
                key={programArea}
                onClick={() => handleProgramAreaSelect(programArea)}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-200 cursor-pointer border-2 border-transparent hover:border-blue-200"
              >
                <div className="flex items-start space-x-4">
                  <div className="text-4xl">{config.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {programArea}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {config.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-blue-600 font-medium">
                        Explore Cases →
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Specialty Selection */}
      {step === 'specialty' && (
        <div>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading specialties...</p>
            </div>
          ) : specialties.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Specialties Available
              </h3>
              <p className="text-gray-600 mb-4">
                There are no specialties available for {selectedProgramArea} at the moment.
              </p>
              <button
                onClick={handleBackToPrograms}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Choose Different Program
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {specialties.map((specialty) => {
                const description = specialtyConfig[specialty] || 'Specialized medical cases in this field';
                const caseCount = specialtyCounts[specialty] || 0;
                
                return (
                  <div
                    key={specialty}
                    onClick={() => handleSpecialtySelect(specialty)}
                    className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-200 cursor-pointer border-2 border-transparent hover:border-blue-200"
                  >
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {specialty}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3">
                        {description}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">
                          {caseCount} case{caseCount !== 1 ? 's' : ''}
                        </span>
                        {caseCount > 0 && (
                          <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                        )}
                      </div>
                      <span className="text-sm text-blue-600 font-medium">
                        View Cases →
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Quick Access */}
      <div className="mt-12 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Access</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => {
              // Check if there's a current specialty context
              const context = api.getSpecialtyContext();
              if (context) {
                // Navigate with context awareness - will show all cases in the current specialty
                navigate('/simulation');
              } else {
                // Clear any context and show truly all cases
                api.clearSpecialtyContext();
                navigate('/simulation');
              }
            }}
            className="px-4 py-2 bg-white text-gray-700 rounded-lg border border-gray-300 hover:border-gray-400 transition-colors text-sm"
          >
            {(() => {
              const context = api.getSpecialtyContext();
              return context ? `All ${context.specialty} Cases` : 'Browse All Cases';
            })()}
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-white text-gray-700 rounded-lg border border-gray-300 hover:border-gray-400 transition-colors text-sm"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default CaseBrowsingPage;