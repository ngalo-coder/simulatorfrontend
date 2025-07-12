export interface Message {
  sender: 'patient' | 'clinician';
  text: string;
  timestamp: number;
}

export interface EvaluationData {
  overall_score?: number;
  feedback?: string;
  strengths?: string[];
  areas_for_improvement?: string[];
  evaluation?: string; // Detailed AI evaluation string
  history?: Array<{
    role: string;
    content: string;
  }>;
  [key: string]: any;
}

export interface SessionEndResponse {
  sessionEnded: boolean;
  evaluation: string; // Full AI evaluation text
  history: Array<{
    role: string;
    content: string;
  }>;
}

export interface SimulationStartResponse {
  sessionId: string;
  initialPrompt: string;
}

export interface SimulationAskResponse {
  response: string;
  isFinal: boolean;
  evaluation?: EvaluationData;
}

export interface PatientCase {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  estimatedTime: string;
  tags: string[];
  specialty?: string;
  level?: string;
  duration?: string;
  learningObjectives?: string[];
  clinicalContext?: string;
  patientAge?: number;
  patientGender?: string;
  chiefComplaint?: string;
  presentingSymptoms?: string[];
  programArea?: string;
  specializedArea?: string;
}

export type AppState = 'selecting_case' | 'chatting' | 'showing_evaluation';

export interface CaseCategories {
  program_areas: string[];
  specialties: string[];
  specialized_areas: string[];
}
export * from './performanceMetrics'; // Export PerformanceMetrics types
export * from './clinicianProgress'; // Export ClinicianProgress types