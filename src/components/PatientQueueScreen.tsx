import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { PatientCase } from '../types';
import {
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  TextField,
  Box,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  ArrowBack,
  Search,
  FilterList,
  Clear,
  ChevronRight,
  AccessTime,
} from '@mui/icons-material';

interface PatientQueueScreenProps {
  programArea: string;
  specialty: string;
  onBack: () => void;
  onStartCase: (caseId: string) => void;
  isLoading: boolean;
}

const PatientQueueScreen: React.FC<PatientQueueScreenProps> = ({
  programArea,
  specialty,
  onBack,
  onStartCase,
  isLoading,
}) => {
  const [cases, setCases] = useState<PatientCase[]>([]);
  const [filteredCases, setFilteredCases] = useState<PatientCase[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCase, setSelectedCase] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    difficulty: [] as string[],
    showFilters: false,
  });

  // Check if there's a selected case in session storage (from recommendations)
  useEffect(() => {
    const selectedCaseId = sessionStorage.getItem('selectedCaseId');
    if (selectedCaseId) {
      // Clear it from session storage
      sessionStorage.removeItem('selectedCaseId');
      // Start the case
      handleStartCase(selectedCaseId);
    }
  }, []);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch cases filtered by program area and specialty
        const casesData = await api.getCases({ 
          program_area: programArea,
          specialty: specialty 
        });
        
        setCases(casesData);
        setFilteredCases(casesData);
      } catch (error) {
        console.error('Failed to fetch cases:', error);
        setError('Failed to load patient cases. Please try again.');
        
        // Set some fallback cases for testing
        const fallbackCases: PatientCase[] = [
          {
            id: 'case-1',
            title: 'Chest Pain Evaluation',
            description: 'A 55-year-old male presenting with acute chest pain radiating to the left arm.',
            category: specialty,
            difficulty: 'Intermediate',
            estimatedTime: '15-20 minutes',
            tags: ['Cardiology', 'Emergency'],
            specialty: specialty,
            programArea: programArea
          },
          {
            id: 'case-2',
            title: 'Abdominal Pain Assessment',
            description: 'A 42-year-old female with lower right quadrant abdominal pain and fever.',
            category: specialty,
            difficulty: 'Beginner',
            estimatedTime: '10-15 minutes',
            tags: ['Gastroenterology', 'General Practice'],
            specialty: specialty,
            programArea: programArea
          },
          {
            id: 'case-3',
            title: 'Headache Diagnosis',
            description: 'A 35-year-old patient with recurring severe headaches and visual disturbances.',
            category: specialty,
            difficulty: 'Advanced',
            estimatedTime: '20-25 minutes',
            tags: ['Neurology', 'Pain Management'],
            specialty: specialty,
            programArea: programArea
          }
        ];
        
        setCases(fallbackCases);
        setFilteredCases(fallbackCases);
      } finally {
        setLoading(false);
      }
    };

    fetchCases();
  }, [programArea, specialty]);

  useEffect(() => {
    // Apply search and filters
    let result = cases;
    
    // Apply search term
    if (searchTerm) {
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.tags?.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Apply difficulty filters
    if (filters.difficulty.length > 0) {
      result = result.filter((c) => filters.difficulty.includes(c.difficulty));
    }
    
    setFilteredCases(result);
  }, [searchTerm, filters, cases]);

  const handleStartCase = (caseId: string) => {
    setSelectedCase(caseId);
    setTimeout(() => {
      onStartCase(caseId);
    }, 500);
  };

  const toggleDifficultyFilter = (difficulty: string) => {
    setFilters((prev) => {
      const newDifficulties = prev.difficulty.includes(difficulty)
        ? prev.difficulty.filter((d) => d !== difficulty)
        : [...prev.difficulty, difficulty];
      
      return {
        ...prev,
        difficulty: newDifficulties,
      };
    });
  };

  const toggleFiltersVisibility = () => {
    setFilters((prev) => ({
      ...prev,
      showFilters: !prev.showFilters,
    }));
  };

  const clearFilters = () => {
    setFilters({
      difficulty: [],
      showFilters: true,
    });
    setSearchTerm('');
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
      case 'easy':
        return 'success';
      case 'intermediate':
      case 'medium':
        return 'warning';
      case 'advanced':
      case 'hard':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Patient Queue: {specialty}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Select a patient case to begin your clinical simulation.
        </Typography>
      </Box>

      <Button
        startIcon={<ArrowBack />}
        onClick={onBack}
        sx={{ mb: 2 }}
      >
        Back to Specialties
      </Button>

      <Card sx={{ p: 2, mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search cases by title, description, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <Search sx={{ color: 'text.disabled', mr: 1 }} />
                ),
              }}
            />
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              startIcon={<FilterList />}
              onClick={toggleFiltersVisibility}
            >
              Filters
            </Button>
          </Grid>
          {(filters.difficulty.length > 0 || searchTerm) && (
            <Grid item>
              <Button
                variant="outlined"
                color="error"
                startIcon={<Clear />}
                onClick={clearFilters}
              >
                Clear
              </Button>
            </Grid>
          )}
        </Grid>
        {filters.showFilters && (
          <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="subtitle2" gutterBottom>
              Difficulty:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {['Beginner', 'Intermediate', 'Advanced'].map((difficulty) => (
                <Chip
                  key={difficulty}
                  label={difficulty}
                  clickable
                  color={
                    filters.difficulty.includes(difficulty)
                      ? getDifficultyColor(difficulty)
                      : 'default'
                  }
                  onClick={() => toggleDifficultyFilter(difficulty)}
                  variant={
                    filters.difficulty.includes(difficulty)
                      ? 'filled'
                      : 'outlined'
                  }
                />
              ))}
            </Box>
          </Box>
        )}
      </Card>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {filteredCases.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Search sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No Cases Found
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            No cases match your current search criteria. Try adjusting your
            filters or search term.
          </Typography>
          <Button variant="contained" onClick={clearFilters}>
            Clear Filters
          </Button>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {filteredCases.map((patientCase) => {
            const isSelected = selectedCase === patientCase.id;
            return (
              <Grid item xs={12} sm={6} md={4} key={patientCase.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    border: isSelected ? 2 : 1,
                    borderColor: isSelected ? 'primary.main' : 'divider',
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="div" gutterBottom>
                      {patientCase.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      {patientCase.chiefComplaint
                        ? `Patient presenting with ${patientCase.chiefComplaint.toLowerCase()}`
                        : patientCase.description &&
                          patientCase.description !==
                            'A universal template for creating virtual patient simulation cases.'
                        ? patientCase.description
                        : `${patientCase.title} simulation case`}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                      <Chip
                        label={patientCase.difficulty}
                        size="small"
                        color={getDifficultyColor(patientCase.difficulty)}
                      />
                      {patientCase.tags?.slice(0, 2).map((tag) => (
                        <Chip key={tag} label={tag} size="small" />
                      ))}
                    </Box>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        color: 'text.secondary',
                      }}
                    >
                      <AccessTime sx={{ mr: 0.5, fontSize: '1rem' }} />
                      <Typography variant="caption">
                        {patientCase.estimatedTime}
                      </Typography>
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button
                      fullWidth
                      variant="contained"
                      endIcon={<ChevronRight />}
                      onClick={() => handleStartCase(patientCase.id)}
                      disabled={isLoading || isSelected}
                    >
                      {isSelected ? (
                        <CircularProgress size={24} />
                      ) : (
                        'Start Case'
                      )}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Container>
  );
};

export default PatientQueueScreen;