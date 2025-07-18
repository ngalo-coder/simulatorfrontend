import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Grid,
  LinearProgress,
  Paper,
  Typography,
  useTheme,
  Avatar,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { 
  School, 
  Star, 
  TrendingUp, 
  Assignment, 
  PlayArrow, 
  EmojiEvents, 
  Psychology,
  MedicalServices,
  QuestionAnswer,
  AccessTime,
  Favorite,
  Info,
  ArrowForward
} from '@mui/icons-material';

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
  competencyScores?: {
    history_taking: number;
    risk_factor_assessment: number;
    differential_diagnosis: number;
    communication_and_empathy: number;
    clinical_urgency: number;
  };
}

interface RecentMetric {
  _id: string;
  metrics: {
    overall_score: number;
    performance_label: string;
    history_taking_rating?: string;
    risk_factor_assessment_rating?: string;
    differential_diagnosis_questioning_rating?: string;
    communication_and_empathy_rating?: string;
    clinical_urgency_rating?: string;
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
      program_area: string;
    }
  }>;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
}

const ClinicianDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [recentMetrics, setRecentMetrics] = useState<RecentMetric[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!currentUser) {
        console.log('No currentUser object available');
        setLoading(false);
        return;
      }
      
      console.log('Current user object:', currentUser);
      
      // Get the user ID, handling different property names
      const userId = currentUser._id || currentUser.id || currentUser.userId;
      
      if (!userId) {
        console.error('User ID not found in currentUser object:', currentUser);
        setLoading(false);
        return;
      }
      
      console.log('Using user ID:', userId);
      
      try {
        setLoading(true);
        console.log('Loading dashboard data for user:', userId);
        
        try {
          // Fetch progress data
          const progressData = await api.fetchClinicianProgress(userId);
          console.log('Progress data received:', progressData);
          
          if (progressData && progressData.progress) {
            setProgress(progressData.progress);
            setRecentMetrics(progressData.recentMetrics || []);
            
            // Generate achievements based on progress
            generateAchievements(progressData.progress);
          } else {
            console.log('No progress data available for user');
            // Set progress to null to show the empty state
            setProgress(null);
          }
        } catch (progressError) {
          console.error('Error fetching progress data:', progressError);
          // Continue with other data fetching even if progress fails
        }
        
        try {
          // Fetch recommendations
          const recommendationsData = await api.fetchProgressRecommendations(userId);
          console.log('Recommendations data received:', recommendationsData);
          setRecommendations(recommendationsData);
        } catch (recError) {
          console.error('Error fetching recommendations:', recError);
          // Continue even if recommendations fail
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        // Always set loading to false to prevent infinite loading state
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [currentUser]);

  const generateAchievements = (progressData: ProgressData | null) => {
    if (!progressData) return;
    
    const achievements: Achievement[] = [
      {
        id: 'first_case',
        title: 'First Steps',
        description: 'Complete your first case',
        icon: <PlayArrow />,
        unlocked: progressData.totalCasesCompleted >= 1
      },
      {
        id: 'five_cases',
        title: 'Getting Started',
        description: 'Complete 5 cases',
        icon: <Assignment />,
        unlocked: progressData.totalCasesCompleted >= 5,
        progress: Math.min(progressData.totalCasesCompleted, 5),
        maxProgress: 5
      },
      {
        id: 'ten_cases',
        title: 'Dedicated Learner',
        description: 'Complete 10 cases',
        icon: <School />,
        unlocked: progressData.totalCasesCompleted >= 10,
        progress: Math.min(progressData.totalCasesCompleted, 10),
        maxProgress: 10
      },
      {
        id: 'high_score',
        title: 'Excellence',
        description: 'Achieve a score of 90 or higher',
        icon: <EmojiEvents />,
        unlocked: progressData.overallAverageScore >= 90
      },
      {
        id: 'intermediate',
        title: 'Moving Up',
        description: 'Reach Intermediate level',
        icon: <TrendingUp />,
        unlocked: ['Intermediate', 'Advanced', 'Expert'].includes(progressData.currentProgressionLevel)
      },
      {
        id: 'advanced',
        title: 'Advanced Clinician',
        description: 'Reach Advanced level',
        icon: <Psychology />,
        unlocked: ['Advanced', 'Expert'].includes(progressData.currentProgressionLevel)
      }
    ];
    
    setAchievements(achievements);
  };

  const handleStartSimulation = () => {
    navigate('/select-program');
  };

  const handleStartRecommendedCase = (programArea: string, specialty: string, caseId: string) => {
    // Store these in session storage to maintain state through navigation
    sessionStorage.setItem('selectedProgramArea', programArea);
    sessionStorage.setItem('selectedSpecialty', specialty);
    sessionStorage.setItem('selectedCaseId', caseId);
    
    // Navigate to the program selection page
    navigate('/select-program');
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 100px)' }}>
        <Box textAlign="center">
          <CircularProgress size={60} sx={{ mb: 3 }} />
          <Typography variant="h6" color="text.secondary">
            Loading your dashboard...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (!progress) {
    return (
      <Container maxWidth="md" sx={{ mt: 8, textAlign: 'center' }}>
        <Box sx={{ 
          p: 6, 
          borderRadius: 4, 
          bgcolor: 'background.paper',
          boxShadow: 3,
          background: 'linear-gradient(to right bottom, #ffffff, #f8f9ff)'
        }}>
          <MedicalServices sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom fontWeight="bold">
            Welcome to Your Clinical Dashboard
          </Typography>
          <Typography variant="body1" paragraph color="text.secondary" sx={{ mb: 4 }}>
            You haven't completed any cases yet. Start your first simulation to begin tracking your progress and performance.
          </Typography>
          <Button 
            variant="contained" 
            size="large"
            startIcon={<PlayArrow />}
            onClick={handleStartSimulation}
            sx={{ 
              px: 4, 
              py: 1.5, 
              borderRadius: 2,
              background: 'linear-gradient(45deg, #3f51b5 30%, #2196f3 90%)',
              boxShadow: '0 3px 5px 2px rgba(33, 150, 243, .3)'
            }}
          >
            Start Your First Simulation
          </Button>
        </Box>
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

  // Prepare competency data for radar chart
  const competencyData = progress.competencyScores ? [
    { subject: 'History Taking', A: progress.competencyScores.history_taking, fullMark: 100 },
    { subject: 'Risk Assessment', A: progress.competencyScores.risk_factor_assessment, fullMark: 100 },
    { subject: 'Differential Diagnosis', A: progress.competencyScores.differential_diagnosis, fullMark: 100 },
    { subject: 'Communication', A: progress.competencyScores.communication_and_empathy, fullMark: 100 },
    { subject: 'Clinical Urgency', A: progress.competencyScores.clinical_urgency, fullMark: 100 }
  ] : [
    { subject: 'History Taking', A: 70, fullMark: 100 },
    { subject: 'Risk Assessment', A: 65, fullMark: 100 },
    { subject: 'Differential Diagnosis', A: 75, fullMark: 100 },
    { subject: 'Communication', A: 80, fullMark: 100 },
    { subject: 'Clinical Urgency', A: 60, fullMark: 100 }
  ];

  const COLORS = [
    theme.palette.primary.main, 
    theme.palette.secondary.main, 
    theme.palette.error.main
  ];

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
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      {/* Header with action button */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 4,
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 2
      }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Your Clinical Dashboard
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Track your progress, review performance, and find recommended cases
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          color="primary" 
          size="large"
          startIcon={<PlayArrow />}
          onClick={handleStartSimulation}
          sx={{ 
            borderRadius: 2,
            px: 3,
            background: 'linear-gradient(45deg, #3f51b5 30%, #2196f3 90%)',
            boxShadow: '0 3px 5px 2px rgba(33, 150, 243, .3)'
          }}
        >
          Start New Simulation
        </Button>
      </Box>
      
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            borderRadius: 3, 
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            height: '100%',
            transition: 'transform 0.3s',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: '0 6px 25px rgba(0,0,0,0.15)'
            }
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <Assignment />
                </Avatar>
                <Typography variant="h6" component="div">
                  Total Cases
                </Typography>
              </Box>
              <Typography variant="h3" component="div" sx={{ mt: 2, fontWeight: 'bold' }}>
                {progress.totalCasesCompleted}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {progress.totalCasesCompleted > 0 
                  ? `Great job completing ${progress.totalCasesCompleted} case${progress.totalCasesCompleted !== 1 ? 's' : ''}!` 
                  : 'Start your first case today!'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            borderRadius: 3, 
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            height: '100%',
            transition: 'transform 0.3s',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: '0 6px 25px rgba(0,0,0,0.15)'
            }
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                  <Star />
                </Avatar>
                <Typography variant="h6" component="div">
                  Avg Score
                </Typography>
              </Box>
              <Typography variant="h3" component="div" sx={{ mt: 2, fontWeight: 'bold' }}>
                {progress.overallAverageScore.toFixed(1)}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {progress.overallAverageScore >= 90 ? 'Excellent performance!' :
                 progress.overallAverageScore >= 80 ? 'Very good performance!' :
                 progress.overallAverageScore >= 70 ? 'Good performance!' :
                 'Keep practicing to improve!'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            borderRadius: 3, 
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            height: '100%',
            transition: 'transform 0.3s',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: '0 6px 25px rgba(0,0,0,0.15)'
            }
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                  <School />
                </Avatar>
                <Typography variant="h6" component="div">
                  Current Level
                </Typography>
              </Box>
              <Typography variant="h3" component="div" sx={{ mt: 2, fontWeight: 'bold' }}>
                {progress.currentProgressionLevel}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {progress.currentProgressionLevel === 'Expert' ? 'You\'ve reached the highest level!' :
                 progress.currentProgressionLevel === 'Advanced' ? 'Almost at expert level!' :
                 progress.currentProgressionLevel === 'Intermediate' ? 'Making great progress!' :
                 'Keep practicing to advance!'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            borderRadius: 3, 
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            height: '100%',
            transition: 'transform 0.3s',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: '0 6px 25px rgba(0,0,0,0.15)'
            }
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                  <TrendingUp />
                </Avatar>
                <Typography variant="h6" component="div">
                  Next Level
                </Typography>
              </Box>
              {progress.currentProgressionLevel === 'Expert' ? (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="h5" component="div" fontWeight="bold">
                    Maximum Level
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    You've reached the highest level!
                  </Typography>
                </Box>
              ) : (
                <>
                  <Box sx={{ mt: 2, mb: 1 }}>
                    <Typography variant="body1" component="div">
                      {nextLevelProgress.casesNeeded > 0 
                        ? `${nextLevelProgress.casesNeeded} more cases` 
                        : `Score ${nextLevelProgress.scoreNeeded}+ points`}
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={Math.min(100, nextLevelProgress.currentProgress)} 
                    sx={{ 
                      height: 10, 
                      borderRadius: 5,
                      bgcolor: 'rgba(0,0,0,0.1)',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 5,
                        background: 'linear-gradient(45deg, #3f51b5 30%, #2196f3 90%)',
                      }
                    }} 
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {Math.round(nextLevelProgress.currentProgress)}% complete
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ 
            p: 3, 
            borderRadius: 3, 
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            height: '100%'
          }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Cases by Difficulty
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
                <RechartsTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ 
            p: 3, 
            borderRadius: 3, 
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            height: '100%'
          }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Average Scores
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
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="score" fill={theme.palette.primary.main} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ 
            p: 3, 
            borderRadius: 3, 
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            height: '100%'
          }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Competency Breakdown
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={competencyData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar name="Skills" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Achievements Section */}
      <Paper sx={{ 
        p: 3, 
        mb: 4, 
        borderRadius: 3, 
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        background: 'linear-gradient(to right bottom, #ffffff, #f8f9ff)'
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" fontWeight="bold">
            Your Achievements
          </Typography>
          <Tooltip title="Complete cases to unlock achievements">
            <IconButton>
              <Info />
            </IconButton>
          </Tooltip>
        </Box>
        
        <Grid container spacing={2}>
          {achievements.map((achievement) => (
            <Grid item xs={12} sm={6} md={4} key={achievement.id}>
              <Card sx={{ 
                borderRadius: 2, 
                opacity: achievement.unlocked ? 1 : 0.7,
                bgcolor: achievement.unlocked ? 'white' : 'rgba(0,0,0,0.03)',
                border: achievement.unlocked ? `1px solid ${theme.palette.primary.main}` : '1px solid rgba(0,0,0,0.1)'
              }}>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={1}>
                    <Avatar 
                      sx={{ 
                        bgcolor: achievement.unlocked ? 'primary.main' : 'grey.400',
                        mr: 2
                      }}
                    >
                      {achievement.icon}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {achievement.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {achievement.description}
                      </Typography>
                    </Box>
                  </Box>
                  
                  {achievement.progress !== undefined && achievement.maxProgress !== undefined && (
                    <Box sx={{ mt: 1 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={(achievement.progress / achievement.maxProgress) * 100}
                        sx={{ 
                          height: 6, 
                          borderRadius: 3,
                          bgcolor: 'rgba(0,0,0,0.1)',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 3,
                          }
                        }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                        {achievement.progress} / {achievement.maxProgress}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
                  <Chip 
                    label={achievement.unlocked ? "Unlocked" : "Locked"} 
                    size="small"
                    color={achievement.unlocked ? "primary" : "default"}
                    variant={achievement.unlocked ? "filled" : "outlined"}
                  />
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>
      
      {/* Recommendations */}
      {recommendations && (
        <Paper sx={{ 
          p: 3, 
          mb: 4, 
          borderRadius: 3, 
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          background: 'linear-gradient(to right bottom, #f0f7ff, #e6f0ff)'
        }}>
          <Typography variant="h5" gutterBottom fontWeight="bold">
            Personalized Recommendations
          </Typography>
          
          <Box sx={{ 
            p: 2, 
            mb: 3, 
            bgcolor: 'rgba(255,255,255,0.7)', 
            borderRadius: 2,
            border: '1px solid rgba(33, 150, 243, 0.3)'
          }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" color="text.secondary">
                  Current Level
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {recommendations.currentLevel}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" color="text.secondary">
                  Recommended Difficulty
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {recommendations.recommendedDifficulty}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" color="text.secondary">
                  Recommendation Reason
                </Typography>
                <Typography variant="body1">
                  {recommendations.recommendationReason}
                </Typography>
              </Grid>
            </Grid>
          </Box>
          
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Recommended Cases for You
          </Typography>
          
          <Grid container spacing={2}>
            {recommendations.recommendedCases.map((caseItem) => (
              <Grid item xs={12} sm={6} md={4} key={caseItem.case_metadata.case_id}>
                <Card sx={{ 
                  borderRadius: 2,
                  transition: 'transform 0.3s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 6px 25px rgba(0,0,0,0.15)'
                  }
                }}>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                      {caseItem.case_metadata.title}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                      <Chip 
                        label={caseItem.case_metadata.specialty} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                      />
                      <Chip 
                        label={caseItem.case_metadata.difficulty} 
                        size="small" 
                        color={
                          caseItem.case_metadata.difficulty === 'Easy' ? 'success' :
                          caseItem.case_metadata.difficulty === 'Intermediate' ? 'warning' :
                          'error'
                        }
                        variant="outlined"
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Program Area: {caseItem.case_metadata.program_area}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button 
                      size="small" 
                      color="primary"
                      endIcon={<ArrowForward />}
                      onClick={() => handleStartRecommendedCase(
                        caseItem.case_metadata.program_area,
                        caseItem.case_metadata.specialty,
                        caseItem.case_metadata.case_id
                      )}
                    >
                      Start Case
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}
      
      {/* Recent Performance */}
      {recentMetrics.length > 0 && (
        <Paper sx={{ 
          p: 3, 
          borderRadius: 3, 
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
          <Typography variant="h5" gutterBottom fontWeight="bold">
            Recent Performance
          </Typography>
          
          <Grid container spacing={2}>
            {recentMetrics.map((metric) => (
              <Grid item xs={12} sm={6} md={4} key={metric._id}>
                <Card sx={{ 
                  borderRadius: 2,
                  border: '1px solid rgba(0,0,0,0.1)'
                }}>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                      {metric.case_ref.case_metadata.title}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                      <Chip 
                        label={metric.case_ref.case_metadata.specialty} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                      />
                      <Chip 
                        label={metric.case_ref.case_metadata.difficulty} 
                        size="small" 
                        color={
                          metric.case_ref.case_metadata.difficulty === 'Easy' ? 'success' :
                          metric.case_ref.case_metadata.difficulty === 'Intermediate' ? 'warning' :
                          'error'
                        }
                        variant="outlined"
                      />
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                        Score:
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {metric.metrics.overall_score}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                        Rating:
                      </Typography>
                      <Chip 
                        label={metric.metrics.performance_label} 
                        size="small"
                        color={
                          metric.metrics.performance_label === 'Excellent' ? 'success' :
                          metric.metrics.performance_label === 'Very Good' ? 'primary' :
                          metric.metrics.performance_label === 'Good' ? 'info' :
                          metric.metrics.performance_label === 'Fair' ? 'warning' :
                          'error'
                        }
                      />
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AccessTime sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
                      <Typography variant="body2" color="text.secondary">
                        {new Date(metric.evaluated_at).toLocaleDateString()}
                      </Typography>
                    </Box>
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