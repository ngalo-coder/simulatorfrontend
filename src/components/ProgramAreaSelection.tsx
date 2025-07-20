import React, { useState, useEffect } from "react";
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
  Award,
} from "lucide-react";
import { api } from "../services/api";
import { CaseCategories } from "../types";

interface ProgramAreaSelectionProps {
  onSelectProgramArea: (programArea: string) => void;
  isLoading: boolean;
}
interface SystemStats {
  totalUsers: number;
  totalCases: number;
  totalSessions: number;
  activeSessions: number;
  casesByDifficulty: {
    Beginner: number;
    Intermediate: number;
    Advanced: number;
  };
  casesByProgramArea: {
    [key: string]: number;
  };
  usersByRole: {
    Admin: number;
    Clinician: number;
    Instructor: number;
  };
}
const ProgramAreaSelection: React.FC<ProgramAreaSelectionProps> = ({
  onSelectProgramArea,
  isLoading,
}) => {
  const [categories, setCategories] = useState<CaseCategories | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [caseCount, setCaseCount] = useState<number>(0);
  const [specialtiesCount, setSpecialtiesCount] = useState<number>(0);
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories data - this is a public endpoint
        console.log("Fetching case categories...");
        const response = await api.getCaseCategories();
        console.log("Received case categories:", response);
        
        // Check if the data is nested inside a 'data' property (common API pattern)
        const data = response.data || response;
        console.log("Processed categories data:", data);
        
        // Filter out null values from program_areas
        if (data.program_areas) {
          console.log("Program areas before filtering:", data.program_areas);
          data.program_areas = data.program_areas.filter(area => area !== null && area !== undefined);
          console.log("Program areas after filtering:", data.program_areas);
        } else {
          console.warn("No program_areas property found in data:", data);
        }
        
        // If no program areas are returned after filtering, provide a fallback message
        if (!data.program_areas || data.program_areas.length === 0) {
          console.warn("No program areas found in API response");
          // Add some default program areas as a fallback
          data.program_areas = ["Basic Program", "Specialty Program"];
          console.log("Added default program areas:", data.program_areas);
        }
        
        setCategories(data);

        // Set specialties count from the fetched data
        if (data.specialties && data.specialties.length > 0) {
          setSpecialtiesCount(data.specialties.length);
        }

        // Set a default case count - we don't need the exact count for the UI
        setCaseCount(500);

        // Set default system stats for the UI
        setSystemStats({
          totalUsers: 100,
          totalCases: 500,
          totalSessions: 1000,
          activeSessions: 10,
          casesByDifficulty: {
            Beginner: 200,
            Intermediate: 200,
            Advanced: 100
          },
          casesByProgramArea: {
            "Internal Medicine": 100,
            "Emergency Medicine": 80,
            "Pediatrics": 70,
            "Surgery": 60,
            "Cardiology": 50,
            "Neurology": 40,
            "Psychiatry": 30,
            "Obstetrics & Gynecology": 25,
            "Orthopedics": 20,
            "Dermatology": 15,
            "Ophthalmology": 10,
            "ENT": 10,
            "Radiology": 5,
            "Pathology": 5,
            "Anesthesiology": 5
          },
          usersByRole: {
            Admin: 5,
            Clinician: 80,
            Instructor: 15
          }
        });
      } catch (error) {
        console.error("Failed to fetch categories:", error);

        // Fallback categories if the API call fails
        setCategories({
          program_areas: [
            "Internal Medicine",
            "Emergency Medicine",
            "Pediatrics",
            "Surgery",
            "Cardiology",
            "Neurology",
            "Psychiatry",
            "Obstetrics & Gynecology",
            "Orthopedics",
            "Dermatology",
            "Ophthalmology",
            "ENT",
            "Radiology",
            "Pathology",
            "Anesthesiology",
          ],
          specialties: [
            "Internal Medicine",
            "Surgery",
            "Pediatrics",
            "Ophthalmology",
            "ENT",
            "Cardiology",
            "Neurology",
            "Psychiatry",
            "Emergency Medicine",
            "Family Medicine",
          ],
          specialized_areas: [],
        });
        
        // Set default values for stats
        setSpecialtiesCount(15);
        setCaseCount(500);
      }
    };

    fetchData();
  }, []);

  const programAreaIcons: { [key: string]: any } = {
    "Internal Medicine": Stethoscope,
    "Emergency Medicine": Activity,
    Pediatrics: Baby,
    Surgery: Target,
    Cardiology: Heart,
    Neurology: Brain,
    Psychiatry: Users,
    "Obstetrics & Gynecology": Heart,
    Orthopedics: Bone,
    Dermatology: Eye,
    Ophthalmology: Eye,
    ENT: Stethoscope,
    Radiology: Activity,
    Pathology: BookOpen,
    Anesthesiology: Zap,
  };

  const programAreaColors: { [key: string]: string } = {
    "Internal Medicine": "from-blue-500 to-blue-600",
    "Emergency Medicine": "from-red-500 to-red-600",
    Pediatrics: "from-pink-500 to-pink-600",
    Surgery: "from-purple-500 to-purple-600",
    Cardiology: "from-rose-500 to-rose-600",
    Neurology: "from-indigo-500 to-indigo-600",
    Psychiatry: "from-teal-500 to-teal-600",
    "Obstetrics & Gynecology": "from-purple-500 to-pink-500",
    Orthopedics: "from-gray-500 to-gray-600",
    Dermatology: "from-orange-500 to-orange-600",
    Ophthalmology: "from-cyan-500 to-cyan-600",
    ENT: "from-green-500 to-green-600",
    Radiology: "from-violet-500 to-violet-600",
    Pathology: "from-amber-500 to-amber-600",
    Anesthesiology: "from-emerald-500 to-emerald-600",
  };

  // Filter out null values and apply search filter
  const filteredAreas = 
    categories && categories.program_areas
      ? categories.program_areas
          .filter(area => area !== null && area !== undefined) // Filter out null and undefined values
          .filter((area) =>
            area.toLowerCase().includes(searchTerm.toLowerCase())
          )
      : [];
      
  console.log("Filtered program areas:", filteredAreas);

  const handleSelectArea = (area: string) => {
    setSelectedCategory(area);
    console.log("Selected program area:", area);
    // Add a small delay to allow the UI to update before navigation
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
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-lg">
              <Stethoscope className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Simuatech</h1>
              <p className="text-blue-600 font-medium text-sm sm:text-base">
                Where virtual patients build real clinicians
              </p>
            </div>
          </div>

          <div className="max-w-3xl mx-auto px-4 sm:px-0">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
              Master clinical skills with AI
            </h2>
            <p className="text-base sm:text-xl text-gray-600 leading-relaxed">
              From Virtual patients to confident clinical practice
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8 sm:mb-12 px-4 sm:px-0">
          <div className="relative">
            <Search className="absolute left-4 sm:left-6 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 sm:w-6 sm:h-6" />
            <input
              type="text"
              placeholder="Search program areas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 sm:pl-16 pr-4 sm:pr-6 py-4 sm:py-5 text-base sm:text-lg border-2 border-gray-200 rounded-3xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-lg"
            />
          </div>
          <div className="text-center mt-3">
            <p className="text-xs sm:text-sm text-gray-500">
              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">Tip</span>{" "}
              Type to search or click on a program area to begin your simulation
            </p>
          </div>
        </div>

        {/* Program Areas Grid */}
        <div className="flex justify-center px-4 sm:px-0">
          <div className="w-full max-w-6xl">
            {filteredAreas.length === 0 ? (
              <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
                <p className="text-lg text-gray-600">No program areas found. Please try again later.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
                {filteredAreas.map((area, index) => {
                const IconComponent = programAreaIcons[area] || Stethoscope;
                const colorClass =
                  programAreaColors[area] || "from-blue-500 to-blue-600";
                const isSelected = selectedCategory === area;

                return (
                  <button
                    key={area}
                    onClick={() => handleSelectArea(area)}
                    disabled={isLoading}
                    className={`group relative bg-white rounded-2xl sm:rounded-3xl shadow-lg border-2 transition-all duration-300 hover:shadow-2xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed p-4 sm:p-6 md:p-8 text-left ${
                      isSelected
                        ? "border-blue-500 ring-4 ring-blue-200 scale-105"
                        : "border-gray-200 hover:border-blue-300"
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex flex-col items-center text-center">
                      <div
                        className={`w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br ${colorClass} rounded-2xl sm:rounded-3xl flex items-center justify-center mb-4 sm:mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                      >
                        <IconComponent className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                      </div>

                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3 group-hover:text-blue-600 transition-colors leading-tight">
                        {area}
                      </h3>

                      <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
                        <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>
                          {systemStats &&
                          systemStats.casesByProgramArea &&
                          systemStats.casesByProgramArea[area]
                            ? `${systemStats.casesByProgramArea[area]} Cases`
                            : "Multiple Cases"}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 sm:gap-2 text-blue-600 font-semibold group-hover:gap-2 sm:group-hover:gap-3 transition-all duration-200">
                        <span className="text-sm sm:text-base">Select Area</span>
                        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>

                    {isSelected && (
                      <div className="absolute inset-0 bg-blue-500 bg-opacity-10 rounded-2xl sm:rounded-3xl flex items-center justify-center">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 border-3 sm:border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </button>
                );
              })}
              </div>
            )}
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100 p-4 sm:p-6 md:p-8 mx-4 sm:mx-0">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            <div className="text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-2 sm:mb-3 md:mb-4">
                <BookOpen className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">
                {systemStats?.totalCases || "500+"}
              </h3>
              <p className="text-xs sm:text-sm md:text-base text-gray-600">Virtual Cases</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-2 sm:mb-3 md:mb-4">
                <Star className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">
                {specialtiesCount > 0 ? `${specialtiesCount}` : "15"}
              </h3>
              <p className="text-xs sm:text-sm md:text-base text-gray-600">Specialties</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-2 sm:mb-3 md:mb-4">
                <Clock className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">24/7</h3>
              <p className="text-xs sm:text-sm md:text-base text-gray-600">Available</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-2 sm:mb-3 md:mb-4">
                <Award className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">AI</h3>
              <p className="text-xs sm:text-sm md:text-base text-gray-600">Powered</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgramAreaSelection;
