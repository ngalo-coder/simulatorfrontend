// Message type for chat interactions
export interface Message {
  sender: 'clinician' | 'patient';
  text: string;
  timestamp: number;
}

// Evaluation data returned after a session
export interface EvaluationData {
  evaluation: string;
  history?: Message[];
}

// Response when ending a session
export interface SessionEndResponse {
  evaluation: string;
  history: Message[];
}

// Patient case data structure
export interface PatientCase {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  estimatedTime: string;
  tags?: string[];
  specialty?: string;
  level?: string;
  duration?: string;
  learningObjectives?: string[];
  clinicalContext?: string;
  patientAge?: string;
  patientGender?: string;
  chiefComplaint?: string;
  presentingSymptoms?: string[];
  programArea?: string;
  specializedArea?: string;
}

// Case categories response
export interface CaseCategories {
  program_areas: string[];
  specialties: string[];
  specialized_areas?: string[];
}

// Performance metrics data
export interface MetricsData {
  history_taking_rating: string;
  risk_factor_assessment_rating: string;
  differential_diagnosis_questioning_rating: string;
  communication_and_empathy_rating: string;
  clinical_urgency_rating: string;
  overall_diagnosis_accuracy: string;
  overall_score: number;
  performance_label: string;
}

// Performance metrics response
export interface PerformanceMetrics {
  _id: string;
  session_ref: string;
  case_ref: {
    case_metadata: {
      title: string;
      difficulty: string;
    }
  };
  user_ref: string;
  metrics: MetricsData;
  evaluation_summary: string;
  raw_evaluation_text: string;
  evaluated_at: string;
  createdAt: string;
  updatedAt: string;
}

// Clinician progress response
export interface ClinicianProgressResponse {
  progress: {
    beginnerCasesCompleted: number;
    intermediateCasesCompleted: number;
    advancedCasesCompleted: number;
    beginnerAverageScore: number;
    intermediateAverageScore: number;
    advancedAverageScore: number;
    totalCasesCompleted: number;
    overallAverageScore: number;
    currentProgressionLevel: string;
    competencyScores?: {
      history_taking: number;
      risk_factor_assessment: number;
      differential_diagnosis: number;
      communication_and_empathy: number;
      clinical_urgency: number;
    };
  };
  recentMetrics: Array<{
    _id: string;
    metrics: {
      overall_score: number;
      performance_label: string;
    };
    case_ref: {
      case_metadata: {
        title: string;
        difficulty: string;
        case_id: string;
        specialty: string;
        program_area: string;
      }
    };
    evaluated_at: string;
  }>;
}

// Progress recommendation response
export interface ProgressRecommendation {
  currentLevel: string;
  recommendedDifficulty: string;
  recommendationReason: string;
  recommendedCases: Array<{
    case_metadata: {
      case_id: string;
      title: string;
      specialty: string;
      difficulty: string;
      program_area: string;
    }
  }>;
}