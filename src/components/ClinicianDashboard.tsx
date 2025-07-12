import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { fetchClinicianProgress, fetchProgressRecommendations } from '../services/api';
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Divider,
  Grid,
  LinearProgress,
  Paper,
  Typography,
  useTheme
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { School, Star, TrendingUp, Assignment } from '@mui/icons-material';

interface ProgressData {
  beginnerCasesCompleted: number;
  intermediateCasesCompleted: number;
  advancedCasesCompleted: number;
  beginnerAverageScore: number;
  intermediateAverageScore: number;
  advancedAverageScore: number;
  totalCasesCompleted: number;
  overallAverageScore: number;
  currentProgressionLevel: string;
}

interface RecentMetric {
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

interface Recommendation {
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

const ClinicianDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [recentMetrics, setRecentMetrics] = useState<RecentMetric[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (currentUser && currentUser._id) {
        try {
          setLoading(true);
          
          // Fetch progress data
          const progressData = await fetchClinicianProgress(currentUser._id);
          setProgress(progressData.progress);
          setRecentMetrics(progressData.recentMetrics || []);
          
          // Fetch recommendations
          const recommendationsData = await fetchProgressRecommendations(currentUser._id);
          setRecommendations(recommendationsData);
          
          setLoading(false);
        } catch (error) {
          console.error('Error loading dashboard data:', error);
          setLoading(false);
        }
      }
    };

    loadDashboardData();
  }, [currentUser]);

  if (loading) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!progress) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          No progress data available yet
        </Typography>
        <Typography>
          Complete some cases to see your progress and performance metrics.
        </Typography>
      </Container>
    );
  }

  // Prepare data for charts
  const casesCompletedData = [
    { name: 'Beginner', value: progress.beginnerCasesCompleted },
    { name: 'Intermediate', value: progress.intermediateCasesCompleted },
    { name: 'Advanced', value: progress.advancedCasesCompleted }
  ];

  const averageScoresData = [
    { name: 'Beginner', score: progress.beginnerAverageScore },
    { name: 'Intermediate', score: progress.intermediateAverageScore },
    { name: 'Advanced', score: progress.advancedAverageScore }
  ];

  const COLORS = [theme.palette.primary.main, theme.palette.secondary.main, theme.palette.error.main];

  // Calculate progress to next level
  const getProgressToNextLevel = () => {
    switch (progress.currentProgressionLevel) {
      case 'Beginner':
        return {
          casesNeeded: Math.max(0, 10 - progress.beginnerCasesCompleted),
          scoreNeeded: 70,
          currentProgress: progress.beginnerCasesCompleted >= 10 ? 
            (progress.beginnerAverageScore / 70) * 100 : 
            (progress.beginnerCasesCompleted / 10) * 100
        };
      case 'Intermediate':
        return {
          casesNeeded: Math.max(0, 15 - progress.intermediateCasesCompleted),
          scoreNeeded: 75,
          currentProgress: progress.intermediateCasesCompleted >= 15 ? 
            (progress.intermediateAverageScore / 75) * 100 : 
            (progress.intermediateCasesCompleted / 15) * 100
        };
      case 'Advanced':
        return {
          casesNeeded: Math.max(0, 10 - progress.advancedCasesCompleted),
          scoreNeeded: 80,
          currentProgress: progress.advancedCasesCompleted >= 10 ? 
            (progress.advancedAverageScore / 80) * 100 : 
            (progress.advancedCasesCompleted / 10) * 100
        };
      default:
        return {
          casesNeeded: 0,
          scoreNeeded: 0,
          currentProgress: 100
        };
    }
  };

  const nextLevelProgress = getProgressToNextLevel();

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Clinician Progress Dashboard
      </Typography>
      
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Assignment color="primary" sx={{ mr: 2 }} />
                <Typography variant="h6" component="div">
                  Total Cases
                </Typography>
              </Box>
              <Typography variant="h4" component="div" sx={{ mt: 2 }}>
                {progress.totalCasesCompleted}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Star color="primary" sx={{ mr: 2 }} />
                <Typography variant="h6" component="div">
                  Avg Score
                </Typography>
              </Box>
              <Typography variant="h4" component="div" sx={{ mt: 2 }}>
                {progress.overallAverageScore.toFixed(1)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <School color="primary" sx={{ mr: 2 }} />
                <Typography variant="h6" component="div">
                  Current Level
                </Typography>
              </Box>
              <Typography variant="h4" component="div" sx={{ mt: 2 }}>
                {progress.currentProgressionLevel}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <TrendingUp color="primary" sx={{ mr: 2 }} />
                <Typography variant="h6" component="div">
                  Next Level
                </Typography>
              </Box>
              <Typography variant="body1" component="div" sx={{ mt: 2 }}>
                {progress.currentProgressionLevel === 'Expert' 
                  ? 'Maximum level reached!' 
                  : `${nextLevelProgress.casesNeeded} more cases with ${nextLevelProgress.scoreNeeded}+ score`}
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={Math.min(100, nextLevelProgress.currentProgress)} 
                sx={{ mt: 1 }} 
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Cases Completed by Difficulty
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={casesCompletedData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {casesCompletedData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Average Scores by Difficulty
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={averageScoresData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="score" fill={theme.palette.primary.main} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Recommendations */}
      {recommendations && (
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Personalized Recommendations
          </Typography>
          <Typography variant="body1" paragraph>
            <strong>Current Level:</strong> {recommendations.currentLevel}
          </Typography>
          <Typography variant="body1" paragraph>
            <strong>Recommended Difficulty:</strong> {recommendations.recommendedDifficulty}
          </Typography>
          <Typography variant="body1" paragraph>
            {recommendations.recommendationReason}
          </Typography>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="h6" gutterBottom>
            Recommended Cases
          </Typography>
          
          <Grid container spacing={2}>
            {recommendations.recommendedCases.map((caseItem) => (
              <Grid item xs={12} sm={6} md={4} key={caseItem.case_metadata.case_id}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      {caseItem.case_metadata.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {caseItem.case_metadata.specialty}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Difficulty: {caseItem.case_metadata.difficulty}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}
      
      {/* Recent Performance */}
      {recentMetrics.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Recent Performance
          </Typography>
          <Grid container spacing={2}>
            {recentMetrics.map((metric) => (
              <Grid item xs={12} sm={6} md={4} key={metric._id}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      {metric.case_ref.case_metadata.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Difficulty: {metric.case_ref.case_metadata.difficulty}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Score: {metric.metrics.overall_score}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Rating: {metric.metrics.performance_label}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Date: {new Date(metric.evaluated_at).toLocaleDateString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}
    </Container>
  );
};

export default ClinicianDashboard;