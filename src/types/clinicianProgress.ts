export interface ClinicianProgress {
  userId: string;
  beginnerCasesCompleted: number;
  intermediateCasesCompleted: number;
  advancedCasesCompleted: number;
  beginnerAverageScore: number;
  intermediateAverageScore: number;
  advancedAverageScore: number;
  totalCasesCompleted: number;
  overallAverageScore: number;
  currentProgressionLevel: string;
  lastCompletedBeginnerCase?: string;
  lastCompletedIntermediateCase?: string;
  lastCompletedAdvancedCase?: string;
  lastUpdatedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClinicianProgressResponse {
  progress: ClinicianProgress;
  recentMetrics: RecentMetric[];
}

export interface RecentMetric {
  _id: string;
  metrics: {
    overall_score: number;
    performance_label: string;
  };
  case_ref: {
    case_metadata: {
      title: string;
      difficulty: string;
    }
  };
  evaluated_at: string;
}

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
    }
  }>;
}