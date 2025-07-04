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
  evaluation?: string; // New field for detailed AI evaluation
  [key: string]: any;
}

export interface SessionEndResponse {
  sessionEnded: boolean;
  evaluation: string; // Changed from 'summary' to 'evaluation'
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
}

export type AppState = 'selecting_case' | 'chatting';