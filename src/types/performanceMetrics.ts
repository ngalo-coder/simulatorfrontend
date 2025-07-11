export interface PerformanceMetricsCaseMetadata {
  case_id: string;
  title: string;
}

export interface PerformanceMetricsCaseRef {
  _id: string;
  case_metadata: PerformanceMetricsCaseMetadata;
}

export interface MetricsData {
  history_taking_rating?: string;
  risk_factor_assessment_rating?: string;
  differential_diagnosis_rating?: string;
  clinical_examination_rating?: string;
  investigation_plan_rating?: string;
  treatment_plan_rating?: string;
  patient_communication_rating?: string;
  professionalism_rating?: string;
  overall_impression_rating?: string;
  clinical_urgency_rating?: string;
  overall_diagnosis_accuracy?: string;
  [key: string]: string | undefined; // For any other dynamic rating fields
}

export interface PerformanceMetrics {
  _id: string;
  session_ref: string;
  case_ref: PerformanceMetricsCaseRef;
  metrics: MetricsData;
  evaluation_summary: string;
  raw_evaluation_text: string;
  evaluated_at: string; // ISO date string
}
