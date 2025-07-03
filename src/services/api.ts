const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://simulatorbackend.onrender.com';

export class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

export const api = {
  async getCases(): Promise<import('../types').PatientCase[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/simulation/cases`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // If the endpoint doesn't exist, return default cases
        if (response.status === 404) {
          return [
            {
              id: 'VP-ABD-001',
              title: 'Abdominal Pain Case',
              description: 'Practice taking a focused history for abdominal pain',
              category: 'Gastroenterology',
              difficulty: 'Beginner',
              estimatedTime: '15-20 minutes',
              tags: ['abdominal pain', 'history taking']
            }
          ];
        }
        
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.error || `Server error: ${response.status}`,
          response.status
        );
      }

      const data = await response.json();
      console.log('Raw cases data from server:', data);
      
      // Transform the server response to match our PatientCase interface
      const cases: import('../types').PatientCase[] = [];
      
      // Iterate over the cases object
      for (const [caseId, caseData] of Object.entries(data)) {
        const metadata = (caseData as any).case_metadata || {};
        console.log(`Processing case ${caseId}:`, { caseData, metadata });
        
        cases.push({
          id: caseId,
          title: metadata.title || caseId,
          description: metadata.description || 'No description available',
          category: metadata.category || metadata.specialty || 'General',
          difficulty: metadata.difficulty || metadata.level || 'Intermediate',
          estimatedTime: metadata.estimated_time || metadata.duration || '15-20 minutes',
          tags: metadata.tags || [],
          specialty: metadata.specialty,
          level: metadata.level,
          duration: metadata.duration,
          learningObjectives: metadata.learning_objectives,
          clinicalContext: metadata.clinical_context,
          patientAge: metadata.patient_age,
          patientGender: metadata.patient_gender,
          chiefComplaint: metadata.chief_complaint,
          presentingSymptoms: metadata.presenting_symptoms
        });
      }

      console.log('Processed cases:', cases);
      return cases;
    } catch (error) {
      console.error('Error fetching cases:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      // Return default cases if API fails
      return [
        {
          id: 'VP-ABD-001',
          title: 'Abdominal Pain Case',
          description: 'Practice taking a focused history for abdominal pain',
          category: 'Gastroenterology',
          difficulty: 'Beginner',
          estimatedTime: '15-20 minutes',
          tags: ['abdominal pain', 'history taking']
        }
      ];
    }
  },

  async startSimulation(caseId: string): Promise<{ sessionId: string; initialPrompt: string }> {
    console.log('Starting simulation for case:', caseId);
    try {
      const response = await fetch(`${API_BASE_URL}/api/simulation/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ caseId }),
      });

      console.log('Start simulation response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Start simulation error:', errorData);
        throw new ApiError(
          errorData.error || `Server error: ${response.status}`,
          response.status
        );
      }

      const result = await response.json();
      console.log('Start simulation result:', result);
      return result;
    } catch (error) {
      console.error('Error starting simulation:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to connect to the server. Please check your internet connection.');
    }
  },
};