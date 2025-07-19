import React, { useState } from 'react';
import { api } from '../services/api';
import { adminApi } from '../services/adminApi';
import {
  Box,
  Button,
  Container,
  Paper,
  Typography,
  TextField,
  Divider
} from '@mui/material';

/**
 * A component for testing API endpoints directly
 */
const DebugApiTester: React.FC = () => {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testProgramAreas = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminApi.getProgramAreasWithCounts();
      console.log('Program areas response:', response);
      setResults(response);
    } catch (err) {
      console.error('Error fetching program areas:', err);
      setError('Failed to fetch program areas');
    } finally {
      setLoading(false);
    }
  };

  const testSpecialties = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminApi.getSpecialtiesWithCounts();
      console.log('Specialties response:', response);
      setResults(response);
    } catch (err) {
      console.error('Error fetching specialties:', err);
      setError('Failed to fetch specialties');
    } finally {
      setLoading(false);
    }
  };

  const createSampleData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Create sample program areas
      const programAreas = ['Basic Program', 'Specialty Program', 'Advanced Program'];
      for (const pa of programAreas) {
        await adminApi.addProgramArea(pa);
      }
      
      // Create sample specialties
      const specialties = [
        { name: 'Internal Medicine', programArea: 'Basic Program' },
        { name: 'Surgery', programArea: 'Specialty Program' },
        { name: 'Pediatrics', programArea: 'Basic Program' },
        { name: 'Cardiology', programArea: 'Specialty Program' },
        { name: 'Neurology', programArea: 'Specialty Program' }
      ];
      
      for (const spec of specialties) {
        await adminApi.addSpecialty(spec.name, spec.programArea);
      }
      
      setResults({ message: 'Sample data created successfully' });
    } catch (err) {
      console.error('Error creating sample data:', err);
      setError('Failed to create sample data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>API Tester</Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Use this tool to test API endpoints and create sample data
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <Button 
            variant="contained" 
            onClick={testProgramAreas}
            disabled={loading}
            sx={{ mr: 2 }}
          >
            Test Program Areas
          </Button>
          
          <Button 
            variant="contained" 
            onClick={testSpecialties}
            disabled={loading}
            sx={{ mr: 2 }}
          >
            Test Specialties
          </Button>
          
          <Button 
            variant="contained" 
            color="secondary"
            onClick={createSampleData}
            disabled={loading}
          >
            Create Sample Data
          </Button>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        {loading && <Typography>Loading...</Typography>}
        
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        
        {results && (
          <Box>
            <Typography variant="h6" gutterBottom>Results:</Typography>
            <TextField
              multiline
              fullWidth
              rows={10}
              value={JSON.stringify(results, null, 2)}
              InputProps={{
                readOnly: true,
              }}
            />
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default DebugApiTester;