import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../services/api";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  LinearProgress,
  Paper,
  Typography,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  PlayArrow,
  TrendingUp,
  History,
  Assessment,
  Star,
  ArrowForward,
} from "@mui/icons-material";

interface PerformanceMetric {
  _id: string;
  metrics: {
    overall_score: number;
    performance_label: string;
    history_taking_rating: string;
    risk_factor_assessment_rating: string;
    differential_diagnosis_questioning_rating: string;
    communication_and_empathy_rating: string;
    clinical_urgency_rating: string;
    evaluation_summary: string;
  };
  case_ref: {
    case_metadata: {
      title: string;
      difficulty: string;
      case_id: string;
      specialty: string;
      program_area: string;
    };
  };
  evaluated_at: string;
}

interface ProgressData {
  totalCasesCompleted: number;
  overallAverageScore: number;
  currentProgressionLevel: string;
  recentMetrics: PerformanceMetric[];
  competencyScores?: {
    history_taking: number;
    risk_factor_assessment: number;
    differential_diagnosis: number;
    communication_and_empathy: number;
    clinical_urgency: number;
  };
}

interface RecommendedCase {
  case_metadata: {
    case_id: string;
    title: string;
    specialty: string;
    difficulty: string;
    program_area: string;
  };
}

const MinimalClinicianDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [recommendedCases, setRecommendedCases] = useState<RecommendedCase[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const userId = currentUser?._id || currentUser?.id;
        
        if (!userId) {
          setError("User ID not found. Please log in again.");
          setIsLoading(false);
          return;
        }
        
        // Fetch user progress data
        const progressResponse = await api.fetchClinicianProgress(userId);
        console.log("Progress data:", progressResponse);
        setProgressData(progressResponse);
        
        // Fetch recommended cases
        const recommendationsResponse = await api.fetchProgressRecommendations(userId);
        console.log("Recommendations:", recommendationsResponse);
        if (recommendationsResponse && recommendationsResponse.recommendedCases) {
          setRecommendedCases(recommendationsResponse.recommendedCases);
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [currentUser]);

  const handleStartSimulation = () => {
    navigate("/select-program");
  };

  const handleStartRecommendedCase = (
    programArea: string,
    specialty: string,
    caseId: string
  ) => {
    // Store these in session storage to maintain state through navigation
    sessionStorage.setItem("selectedProgramArea", programArea);
    sessionStorage.setItem("selectedSpecialty", specialty);
    sessionStorage.setItem("selectedCaseId", caseId);

    // Navigate to the program selection page
    navigate("/select-program");
  };

  // Function to get color based on score
  const getScoreColor = (score: number) => {
    if (score >= 90) return "success";
    if (score >= 70) return "primary";
    if (score >= 50) return "warning";
    return "error";
  };

  // Function to get color based on rating
  const getRatingColor = (rating: string) => {
    switch (rating) {
      case "Excellent": return "success";
      case "Very good": return "primary";
      case "Good": return "info";
      case "Fair": return "warning";
      case "Poor": return "error";
      default: return "default";
    }
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: "center" }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Loading your dashboard...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button 
          variant="contained" 
          sx={{ mt: 2 }}
          onClick={handleStartSimulation}
        >
          Start New Simulation
        </Button>
      </Container>
    );
  }

  // If no progress data yet, show welcome screen
  if (!progressData || progressData.totalCasesCompleted === 0) {
    return (
      <Container maxWidth="md" sx={{ mt: 8, textAlign: "center" }}>
        <Paper sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h4" gutterBottom>
            Welcome to Your Clinical Dashboard
          </Typography>
          <Typography variant="body1" paragraph color="text.secondary">
            You haven't completed any cases yet. Start your first simulation to begin tracking your progress and performance.
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<PlayArrow />}
            onClick={handleStartSimulation}
          >
            Start Your First Simulation
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      {/* Header with action button */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Your Clinical Dashboard
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Track your progress and review your performance
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<PlayArrow />}
          onClick={handleStartSimulation}
        >
          Start New Simulation
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Assessment sx={{ color: "primary.main", mr: 1 }} />
                <Typography variant="h6">Total Cases</Typography>
              </Box>
              <Typography variant="h3" fontWeight="bold">
                {progressData.totalCasesCompleted}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Cases completed so far
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Star sx={{ color: "secondary.main", mr: 1 }} />
                <Typography variant="h6">Average Score</Typography>
              </Box>
              <Typography variant="h3" fontWeight="bold">
                {progressData.overallAverageScore.toFixed(1)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Your overall performance score
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <TrendingUp sx={{ color: "success.main", mr: 1 }} />
                <Typography variant="h6">Current Level</Typography>
              </Box>
              <Typography variant="h3" fontWeight="bold">
                {progressData.currentProgressionLevel}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Your progression level
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Performance */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom fontWeight="bold">
          Recent Performance
        </Typography>
        
        {progressData.recentMetrics && progressData.recentMetrics.length > 0 ? (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Case</TableCell>
                  <TableCell>Specialty</TableCell>
                  <TableCell>Score</TableCell>
                  <TableCell>Performance</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {progressData.recentMetrics.slice(0, 5).map((metric) => (
                  <TableRow key={metric._id}>
                    <TableCell>{metric.case_ref.case_metadata.title}</TableCell>
                    <TableCell>{metric.case_ref.case_metadata.specialty}</TableCell>
                    <TableCell>
                      <Chip 
                        label={`${metric.metrics.overall_score}%`}
                        color={getScoreColor(metric.metrics.overall_score) as "success" | "primary" | "warning" | "error"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={metric.metrics.performance_label}
                        color={getRatingColor(metric.metrics.performance_label) as "success" | "primary" | "info" | "warning" | "error" | "default"}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(metric.evaluated_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography variant="body1" color="text.secondary">
            No recent performance data available.
          </Typography>
        )}
      </Paper>

      {/* Competency Breakdown */}
      {progressData.competencyScores && (
        <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
          <Typography variant="h5" gutterBottom fontWeight="bold">
            Competency Breakdown
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="subtitle1">History Taking</Typography>
              <Box display="flex" alignItems="center">
                <Box sx={{ width: '100%', mr: 1 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={progressData.competencyScores.history_taking} 
                    sx={{ height: 10, borderRadius: 5 }}
                  />
                </Box>
                <Box minWidth={35}>
                  <Typography variant="body2" color="text.secondary">
                    {progressData.competencyScores.history_taking}%
                  </Typography>
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="subtitle1">Risk Factor Assessment</Typography>
              <Box display="flex" alignItems="center">
                <Box sx={{ width: '100%', mr: 1 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={progressData.competencyScores.risk_factor_assessment} 
                    sx={{ height: 10, borderRadius: 5 }}
                  />
                </Box>
                <Box minWidth={35}>
                  <Typography variant="body2" color="text.secondary">
                    {progressData.competencyScores.risk_factor_assessment}%
                  </Typography>
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="subtitle1">Differential Diagnosis</Typography>
              <Box display="flex" alignItems="center">
                <Box sx={{ width: '100%', mr: 1 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={progressData.competencyScores.differential_diagnosis} 
                    sx={{ height: 10, borderRadius: 5 }}
                  />
                </Box>
                <Box minWidth={35}>
                  <Typography variant="body2" color="text.secondary">
                    {progressData.competencyScores.differential_diagnosis}%
                  </Typography>
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="subtitle1">Communication & Empathy</Typography>
              <Box display="flex" alignItems="center">
                <Box sx={{ width: '100%', mr: 1 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={progressData.competencyScores.communication_and_empathy} 
                    sx={{ height: 10, borderRadius: 5 }}
                  />
                </Box>
                <Box minWidth={35}>
                  <Typography variant="body2" color="text.secondary">
                    {progressData.competencyScores.communication_and_empathy}%
                  </Typography>
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="subtitle1">Clinical Urgency</Typography>
              <Box display="flex" alignItems="center">
                <Box sx={{ width: '100%', mr: 1 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={progressData.competencyScores.clinical_urgency} 
                    sx={{ height: 10, borderRadius: 5 }}
                  />
                </Box>
                <Box minWidth={35}>
                  <Typography variant="body2" color="text.secondary">
                    {progressData.competencyScores.clinical_urgency}%
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Recommended Cases */}
      {recommendedCases.length > 0 && (
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h5" gutterBottom fontWeight="bold">
            Recommended Cases
          </Typography>
          
          <Grid container spacing={2}>
            {recommendedCases.slice(0, 3).map((caseItem) => (
              <Grid item xs={12} sm={6} md={4} key={caseItem.case_metadata.case_id}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {caseItem.case_metadata.title}
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Chip 
                        label={caseItem.case_metadata.specialty} 
                        size="small" 
                        color="primary"
                        sx={{ mr: 1, mb: 1 }}
                      />
                      <Chip 
                        label={caseItem.case_metadata.difficulty} 
                        size="small"
                        color={
                          caseItem.case_metadata.difficulty === "Beginner" ? "success" :
                          caseItem.case_metadata.difficulty === "Intermediate" ? "warning" : "error"
                        }
                        sx={{ mb: 1 }}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Program Area: {caseItem.case_metadata.program_area}
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    <Button
                      variant="outlined"
                      size="small"
                      endIcon={<ArrowForward />}
                      onClick={() => handleStartRecommendedCase(
                        caseItem.case_metadata.program_area,
                        caseItem.case_metadata.specialty,
                        caseItem.case_metadata.case_id
                      )}
                      sx={{ mt: 1 }}
                    >
                      Start Case
                    </Button>
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

export default MinimalClinicianDashboard;