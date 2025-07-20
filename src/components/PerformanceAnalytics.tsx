import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  CircularProgress,
  Alert,
  Button,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  InfoOutlined,
  TrendingUp,
  TrendingDown,
  RemoveOutlined,
  Download as DownloadIcon,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
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
  Radar,
  Scatter,
  ScatterChart,
  ZAxis,
} from 'recharts';

// Types for performance data
interface CompetencyScore {
  history_taking: number;
  risk_factor_assessment: number;
  differential_diagnosis: number;
  communication_and_empathy: number;
  clinical_urgency: number;
}

interface PerformanceMetric {
  _id: string;
  session_ref: string;
  case_ref: {
    _id: string;
    case_metadata: {
      title: string;
      difficulty: string;
      specialty: string;
      program_area: string;
    };
  };
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
  evaluated_at: string;
}

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
  competencyScores: CompetencyScore;
  recentMetrics: PerformanceMetric[];
}

interface PerformanceTrend {
  date: string;
  score: number;
  difficulty: string;
  specialty: string;
}

interface SpecialtyPerformance {
  specialty: string;
  averageScore: number;
  casesCompleted: number;
}

interface DifficultyBreakdown {
  difficulty: string;
  casesCompleted: number;
  averageScore: number;
}

interface CompetencyBreakdown {
  competency: string;
  score: number;
  fullMark: number;
}

interface PerformanceAnalyticsProps {
  userId?: string; // Optional - if not provided, use current user
}

const PerformanceAnalytics: React.FC<PerformanceAnalyticsProps> = ({ userId }) => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [performanceTrends, setPerformanceTrends] = useState<PerformanceTrend[]>([]);
  const [specialtyPerformance, setSpecialtyPerformance] = useState<SpecialtyPerformance[]>([]);
  const [difficultyBreakdown, setDifficultyBreakdown] = useState<DifficultyBreakdown[]>([]);
  const [competencyBreakdown, setCompetencyBreakdown] = useState<CompetencyBreakdown[]>([]);
  const [timeRange, setTimeRange] = useState<string>('all');
  const [specialty, setSpecialty] = useState<string>('all');
  const [availableSpecialties, setAvailableSpecialties] = useState<string[]>([]);

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  const DIFFICULTY_COLORS = {
    'Beginner': '#00C49F',
    'Easy': '#00C49F',
    'Intermediate': '#FFBB28',
    'Hard': '#FF8042',
    'Advanced': '#FF8042'
  };

  // Rating to score mapping
  const ratingToScore = {
    'Excellent': 100,
    'Very good': 85,
    'Good': 70,
    'Fair': 55,
    'Poor': 40
  };

  useEffect(() => {
    fetchData();
  }, [userId, timeRange, specialty]);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const targetUserId = userId || currentUser?._id || currentUser?.id;
      
      if (!targetUserId) {
        setError('User ID not found');
        setIsLoading(false);
        return;
      }

      // Fetch progress data
      const progressResponse = await api.fetchClinicianProgress(targetUserId);
      setProgressData(progressResponse.progress);
      
      if (progressResponse.recentMetrics) {
        const metrics = progressResponse.recentMetrics;
        setPerformanceMetrics(metrics);
        
        // Extract available specialties
        const specialties = [...new Set(metrics.map(m => m.case_ref.case_metadata.specialty))];
        setAvailableSpecialties(specialties);
        
        // Process metrics for different visualizations
        processMetricsData(metrics);
      }
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError('Failed to load analytics data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const processMetricsData = (metrics: PerformanceMetric[]) => {
    // Apply filters
    let filteredMetrics = [...metrics];
    
    // Filter by time range
    if (timeRange !== 'all') {
      const now = new Date();
      let cutoffDate = new Date();
      
      switch (timeRange) {
        case 'week':
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          cutoffDate.setMonth(now.getMonth() - 3);
          break;
        case 'year':
          cutoffDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      filteredMetrics = filteredMetrics.filter(m => new Date(m.evaluated_at) >= cutoffDate);
    }
    
    // Filter by specialty
    if (specialty !== 'all') {
      filteredMetrics = filteredMetrics.filter(m => m.case_ref.case_metadata.specialty === specialty);
    }
    
    // Process performance trends (scores over time)
    const trends = filteredMetrics.map(m => ({
      date: new Date(m.evaluated_at).toLocaleDateString(),
      score: m.metrics.overall_score,
      difficulty: m.case_ref.case_metadata.difficulty,
      specialty: m.case_ref.case_metadata.specialty
    }));
    setPerformanceTrends(trends);
    
    // Process specialty performance
    const specialtyMap = new Map<string, {total: number, count: number}>();
    filteredMetrics.forEach(m => {
      const specialty = m.case_ref.case_metadata.specialty;
      if (!specialtyMap.has(specialty)) {
        specialtyMap.set(specialty, { total: 0, count: 0 });
      }
      const current = specialtyMap.get(specialty)!;
      current.total += m.metrics.overall_score;
      current.count += 1;
    });
    
    const specialtyData = Array.from(specialtyMap.entries()).map(([specialty, data]) => ({
      specialty,
      averageScore: data.count > 0 ? Math.round(data.total / data.count) : 0,
      casesCompleted: data.count
    }));
    setSpecialtyPerformance(specialtyData);
    
    // Process difficulty breakdown
    const difficultyMap = new Map<string, {total: number, count: number}>();
    filteredMetrics.forEach(m => {
      const difficulty = m.case_ref.case_metadata.difficulty;
      if (!difficultyMap.has(difficulty)) {
        difficultyMap.set(difficulty, { total: 0, count: 0 });
      }
      const current = difficultyMap.get(difficulty)!;
      current.total += m.metrics.overall_score;
      current.count += 1;
    });
    
    const difficultyData = Array.from(difficultyMap.entries()).map(([difficulty, data]) => ({
      difficulty,
      averageScore: data.count > 0 ? Math.round(data.total / data.count) : 0,
      casesCompleted: data.count
    }));
    setDifficultyBreakdown(difficultyData);
    
    // Process competency breakdown
    if (progressData?.competencyScores) {
      const competencyData = [
        { competency: 'History Taking', score: progressData.competencyScores.history_taking, fullMark: 100 },
        { competency: 'Risk Assessment', score: progressData.competencyScores.risk_factor_assessment, fullMark: 100 },
        { competency: 'Differential Diagnosis', score: progressData.competencyScores.differential_diagnosis, fullMark: 100 },
        { competency: 'Communication', score: progressData.competencyScores.communication_and_empathy, fullMark: 100 },
        { competency: 'Clinical Urgency', score: progressData.competencyScores.clinical_urgency, fullMark: 100 }
      ];
      setCompetencyBreakdown(competencyData);
    } else {
      // Calculate competency scores from metrics if not available in progress data
      const competencyMap = {
        'History Taking': { total: 0, count: 0 },
        'Risk Assessment': { total: 0, count: 0 },
        'Differential Diagnosis': { total: 0, count: 0 },
        'Communication': { total: 0, count: 0 },
        'Clinical Urgency': { total: 0, count: 0 }
      };
      
      filteredMetrics.forEach(m => {
        if (m.metrics.history_taking_rating) {
          competencyMap['History Taking'].total += ratingToScore[m.metrics.history_taking_rating as keyof typeof ratingToScore] || 0;
          competencyMap['History Taking'].count += 1;
        }
        if (m.metrics.risk_factor_assessment_rating) {
          competencyMap['Risk Assessment'].total += ratingToScore[m.metrics.risk_factor_assessment_rating as keyof typeof ratingToScore] || 0;
          competencyMap['Risk Assessment'].count += 1;
        }
        if (m.metrics.differential_diagnosis_questioning_rating) {
          competencyMap['Differential Diagnosis'].total += ratingToScore[m.metrics.differential_diagnosis_questioning_rating as keyof typeof ratingToScore] || 0;
          competencyMap['Differential Diagnosis'].count += 1;
        }
        if (m.metrics.communication_and_empathy_rating) {
          competencyMap['Communication'].total += ratingToScore[m.metrics.communication_and_empathy_rating as keyof typeof ratingToScore] || 0;
          competencyMap['Communication'].count += 1;
        }
        if (m.metrics.clinical_urgency_rating) {
          competencyMap['Clinical Urgency'].total += ratingToScore[m.metrics.clinical_urgency_rating as keyof typeof ratingToScore] || 0;
          competencyMap['Clinical Urgency'].count += 1;
        }
      });
      
      const competencyData = Object.entries(competencyMap).map(([competency, data]) => ({
        competency,
        score: data.count > 0 ? Math.round(data.total / data.count) : 0,
        fullMark: 100
      }));
      setCompetencyBreakdown(competencyData);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleTimeRangeChange = (event: SelectChangeEvent) => {
    setTimeRange(event.target.value);
  };

  const handleSpecialtyChange = (event: SelectChangeEvent) => {
    setSpecialty(event.target.value);
  };

  const exportToCsv = () => {
    // Create CSV content
    const headers = ['Date', 'Case', 'Specialty', 'Difficulty', 'Score', 'Performance Label'];
    const rows = performanceMetrics.map(m => [
      new Date(m.evaluated_at).toLocaleDateString(),
      m.case_ref.case_metadata.title,
      m.case_ref.case_metadata.specialty,
      m.case_ref.case_metadata.difficulty,
      m.metrics.overall_score,
      m.metrics.performance_label
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'performance_data.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Loading analytics data...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!progressData || performanceMetrics.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="info">
          No performance data available yet. Complete some simulation cases to see your analytics.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Performance Analytics
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel id="time-range-label">Time Range</InputLabel>
            <Select
              labelId="time-range-label"
              value={timeRange}
              label="Time Range"
              onChange={handleTimeRangeChange}
              size="small"
            >
              <MenuItem value="all">All Time</MenuItem>
              <MenuItem value="week">Last Week</MenuItem>
              <MenuItem value="month">Last Month</MenuItem>
              <MenuItem value="quarter">Last Quarter</MenuItem>
              <MenuItem value="year">Last Year</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel id="specialty-label">Specialty</InputLabel>
            <Select
              labelId="specialty-label"
              value={specialty}
              label="Specialty"
              onChange={handleSpecialtyChange}
              size="small"
            >
              <MenuItem value="all">All Specialties</MenuItem>
              {availableSpecialties.map(spec => (
                <MenuItem key={spec} value={spec}>{spec}</MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Button 
            variant="outlined" 
            startIcon={<DownloadIcon />}
            onClick={exportToCsv}
          >
            Export Data
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Cases Completed
              </Typography>
              <Typography variant="h4">
                {progressData.totalCasesCompleted}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {progressData.beginnerCasesCompleted} Beginner, {progressData.intermediateCasesCompleted} Intermediate, {progressData.advancedCasesCompleted} Advanced
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Overall Average Score
              </Typography>
              <Typography variant="h4">
                {progressData.overallAverageScore.toFixed(1)}%
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                {progressData.overallAverageScore >= 80 ? (
                  <TrendingUp color="success" fontSize="small" sx={{ mr: 0.5 }} />
                ) : progressData.overallAverageScore >= 60 ? (
                  <RemoveOutlined color="primary" fontSize="small" sx={{ mr: 0.5 }} />
                ) : (
                  <TrendingDown color="error" fontSize="small" sx={{ mr: 0.5 }} />
                )}
                <Typography variant="body2" color="text.secondary">
                  {progressData.overallAverageScore >= 80 ? 'Excellent' : 
                   progressData.overallAverageScore >= 70 ? 'Very Good' :
                   progressData.overallAverageScore >= 60 ? 'Good' :
                   progressData.overallAverageScore >= 50 ? 'Fair' : 'Needs Improvement'}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Current Level
              </Typography>
              <Typography variant="h4">
                {progressData.currentProgressionLevel}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {progressData.currentProgressionLevel === 'Beginner' ? 'Complete more cases to advance' :
                 progressData.currentProgressionLevel === 'Intermediate' ? 'Working toward Advanced' :
                 'Highest level achieved'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Recent Performance
              </Typography>
              <Typography variant="h4">
                {performanceMetrics.length > 0 ? 
                  `${performanceMetrics[0].metrics.overall_score}%` : 
                  'N/A'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {performanceMetrics.length > 0 ? 
                  `Last case: ${new Date(performanceMetrics[0].evaluated_at).toLocaleDateString()}` : 
                  'No recent cases'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs for different analytics views */}
      <Box sx={{ mb: 2 }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="analytics tabs">
          <Tab label="Performance Trends" />
          <Tab label="Competency Analysis" />
          <Tab label="Specialty Breakdown" />
          <Tab label="Detailed History" />
        </Tabs>
      </Box>

      {/* Performance Trends Tab */}
      <TabPanel value={activeTab} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Performance Over Time</Typography>
                <Tooltip title="Shows your score progression across all completed cases">
                  <IconButton size="small">
                    <InfoOutlined fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart
                  data={performanceTrends}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <RechartsTooltip 
                    formatter={(value, name, props) => [`${value}%`, 'Score']}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#8884d8" 
                    activeDot={{ r: 8 }} 
                    name="Performance Score"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Score Distribution by Difficulty</Typography>
                <Tooltip title="Shows how your scores vary across different difficulty levels">
                  <IconButton size="small">
                    <InfoOutlined fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart
                  margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                >
                  <CartesianGrid />
                  <XAxis 
                    type="category" 
                    dataKey="difficulty" 
                    name="Difficulty" 
                  />
                  <YAxis 
                    type="number" 
                    dataKey="score" 
                    name="Score" 
                    domain={[0, 100]} 
                  />
                  <ZAxis 
                    type="number" 
                    range={[100, 500]} 
                  />
                  <RechartsTooltip 
                    cursor={{ strokeDasharray: '3 3' }} 
                    formatter={(value, name, props) => {
                      if (name === 'Score') return [`${value}%`, name];
                      return [value, name];
                    }}
                  />
                  <Legend />
                  <Scatter 
                    name="Performance Scores" 
                    data={performanceTrends} 
                    fill="#8884d8"
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Average Score by Difficulty</Typography>
                <Tooltip title="Shows your average performance across different difficulty levels">
                  <IconButton size="small">
                    <InfoOutlined fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={difficultyBreakdown}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="difficulty" />
                  <YAxis domain={[0, 100]} />
                  <RechartsTooltip 
                    formatter={(value, name, props) => {
                      if (name === 'Average Score') return [`${value}%`, name];
                      return [value, name];
                    }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="averageScore" 
                    name="Average Score" 
                    fill="#8884d8" 
                  >
                    {difficultyBreakdown.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={DIFFICULTY_COLORS[entry.difficulty as keyof typeof DIFFICULTY_COLORS] || '#8884d8'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Competency Analysis Tab */}
      <TabPanel value={activeTab} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Competency Radar</Typography>
                <Tooltip title="Shows your performance across different clinical competencies">
                  <IconButton size="small">
                    <InfoOutlined fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart outerRadius={150} data={competencyBreakdown}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="competency" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar
                    name="Your Score"
                    dataKey="score"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.6}
                  />
                  <Legend />
                  <RechartsTooltip />
                </RadarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Competency Breakdown</Typography>
                <Tooltip title="Detailed view of your performance in each competency area">
                  <IconButton size="small">
                    <InfoOutlined fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Competency</TableCell>
                      <TableCell>Score</TableCell>
                      <TableCell>Rating</TableCell>
                      <TableCell>Strength/Weakness</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {competencyBreakdown.map((item) => (
                      <TableRow key={item.competency}>
                        <TableCell>{item.competency}</TableCell>
                        <TableCell>{item.score}%</TableCell>
                        <TableCell>
                          {item.score >= 90 ? 'Excellent' : 
                           item.score >= 80 ? 'Very Good' :
                           item.score >= 70 ? 'Good' :
                           item.score >= 60 ? 'Fair' : 'Needs Improvement'}
                        </TableCell>
                        <TableCell>
                          {item.score >= 80 ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', color: 'success.main' }}>
                              <TrendingUp fontSize="small" sx={{ mr: 0.5 }} />
                              Strength
                            </Box>
                          ) : item.score < 60 ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', color: 'error.main' }}>
                              <TrendingDown fontSize="small" sx={{ mr: 0.5 }} />
                              Weakness
                            </Box>
                          ) : (
                            <Box sx={{ display: 'flex', alignItems: 'center', color: 'info.main' }}>
                              <RemoveOutlined fontSize="small" sx={{ mr: 0.5 }} />
                              Average
                            </Box>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom>Improvement Recommendations</Typography>
                <Divider sx={{ mb: 2 }} />
                
                {competencyBreakdown
                  .filter(item => item.score < 70)
                  .map(item => (
                    <Box key={item.competency} sx={{ mb: 1 }}>
                      <Typography variant="body2" fontWeight="bold">
                        {item.competency}:
                      </Typography>
                      <Typography variant="body2">
                        {item.competency === 'History Taking' && 
                          'Focus on asking more comprehensive questions about patient history. Consider using structured frameworks like OLDCARTS.'}
                        {item.competency === 'Risk Assessment' && 
                          'Improve your ability to identify risk factors. Pay attention to family history and lifestyle factors.'}
                        {item.competency === 'Differential Diagnosis' && 
                          'Work on developing broader differential diagnoses. Consider using systematic approaches like VINDICATE.'}
                        {item.competency === 'Communication' && 
                          'Practice more empathetic communication. Use open-ended questions and reflective listening.'}
                        {item.competency === 'Clinical Urgency' && 
                          'Focus on recognizing urgent clinical situations. Review red flags for common presentations.'}
                      </Typography>
                    </Box>
                  ))}
                
                {competencyBreakdown.filter(item => item.score < 70).length === 0 && (
                  <Typography variant="body2">
                    You're performing well across all competencies! Continue practicing to maintain your skills.
                  </Typography>
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Specialty Breakdown Tab */}
      <TabPanel value={activeTab} index={2}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Performance by Specialty</Typography>
                <Tooltip title="Shows your average score across different medical specialties">
                  <IconButton size="small">
                    <InfoOutlined fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={specialtyPerformance}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis type="category" dataKey="specialty" width={150} />
                  <RechartsTooltip 
                    formatter={(value, name, props) => {
                      if (name === 'Average Score') return [`${value}%`, name];
                      return [value, name];
                    }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="averageScore" 
                    name="Average Score" 
                    fill="#8884d8" 
                  >
                    {specialtyPerformance.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Cases Completed by Specialty</Typography>
                <Tooltip title="Shows the distribution of cases you've completed across specialties">
                  <IconButton size="small">
                    <InfoOutlined fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={specialtyPerformance}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={150}
                    fill="#8884d8"
                    dataKey="casesCompleted"
                    nameKey="specialty"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {specialtyPerformance.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    formatter={(value, name, props) => [`${value} cases`, name]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Specialty Performance Analysis</Typography>
                <Tooltip title="Detailed breakdown of your performance across specialties">
                  <IconButton size="small">
                    <InfoOutlined fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Specialty</TableCell>
                      <TableCell>Cases Completed</TableCell>
                      <TableCell>Average Score</TableCell>
                      <TableCell>Performance Level</TableCell>
                      <TableCell>Recommendation</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {specialtyPerformance.map((item) => (
                      <TableRow key={item.specialty}>
                        <TableCell>{item.specialty}</TableCell>
                        <TableCell>{item.casesCompleted}</TableCell>
                        <TableCell>{item.averageScore}%</TableCell>
                        <TableCell>
                          {item.averageScore >= 90 ? 'Excellent' : 
                           item.averageScore >= 80 ? 'Very Good' :
                           item.averageScore >= 70 ? 'Good' :
                           item.averageScore >= 60 ? 'Fair' : 'Needs Improvement'}
                        </TableCell>
                        <TableCell>
                          {item.casesCompleted < 3 ? (
                            'Complete more cases for better assessment'
                          ) : item.averageScore < 70 ? (
                            'Focus on improving in this specialty'
                          ) : item.averageScore >= 85 ? (
                            'Try more challenging cases'
                          ) : (
                            'Continue practicing'
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Detailed History Tab */}
      <TabPanel value={activeTab} index={3}>
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Case History</Typography>
            <Tooltip title="Complete history of all your simulation sessions">
              <IconButton size="small">
                <InfoOutlined fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Case</TableCell>
                  <TableCell>Specialty</TableCell>
                  <TableCell>Difficulty</TableCell>
                  <TableCell>Score</TableCell>
                  <TableCell>Performance</TableCell>
                  <TableCell>Key Feedback</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {performanceMetrics.map((metric) => (
                  <TableRow key={metric._id}>
                    <TableCell>{new Date(metric.evaluated_at).toLocaleDateString()}</TableCell>
                    <TableCell>{metric.case_ref.case_metadata.title}</TableCell>
                    <TableCell>{metric.case_ref.case_metadata.specialty}</TableCell>
                    <TableCell>{metric.case_ref.case_metadata.difficulty}</TableCell>
                    <TableCell>{metric.metrics.overall_score}%</TableCell>
                    <TableCell>{metric.metrics.performance_label}</TableCell>
                    <TableCell>
                      <Tooltip title={metric.metrics.evaluation_summary || "No summary available"}>
                        <span>
                          {metric.metrics.evaluation_summary
                            ? `${metric.metrics.evaluation_summary.substring(0, 50)}...`
                            : "No summary available"}
                        </span>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </TabPanel>
    </Container>
  );
};

// TabPanel component for tab content
function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

export default PerformanceAnalytics;