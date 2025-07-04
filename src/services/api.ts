// api.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://simulatorbackend.onrender.com'
// 'http://localhost:5001';

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
        if (response.status === 404) {
          return [
            {
              id: 'VP-ABD-002',
              title: 'Abdominal Pain Case',
              description: 'Practice taking a focused history for abdominal pain',
              category: 'Gastroenterology',
              difficulty: 'Beginner',
              estimatedTime: '15-20 minutes',
              tags: ['abdominal pain', 'history taking'],
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

      const cases: import('../types').PatientCase[] = data.map((caseItem: any) => {
        const caseId = caseItem.case_id || caseItem.id || caseItem.title || 'unknown';

        return {
          id: caseId,
          title: caseItem.title || caseId,
          description: caseItem.description || 'No description available',
          category: caseItem.category || 'General',
          difficulty: caseItem.difficulty || 'Intermediate',
          estimatedTime: caseItem.estimated_duration_min
            ? `${caseItem.estimated_duration_min} minutes`
            : '15-20 minutes',
          tags: caseItem.tags || [],
          specialty: caseItem.specialty,
          level: caseItem.level,
          duration: caseItem.duration,
          learningObjectives: caseItem.learning_objectives,
          clinicalContext: caseItem.clinical_context,
          patientAge: caseItem.patient_age,
          patientGender: caseItem.patient_gender,
          chiefComplaint: caseItem.chief_complaint,
          presentingSymptoms: caseItem.presenting_symptoms
        };
      });

      console.log('Processed cases:', cases);
      return cases;
    } catch (error) {
      console.error('Error fetching cases:', error);
      if (error instanceof ApiError) throw error;
      
      return [
        {
          id: 'VP-ABD-002',
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
      if (error instanceof ApiError) throw error;
      throw new ApiError('Failed to connect to the server. Please check your internet connection.');
    }
  },

  async endSession(sessionId: string): Promise<import('../types').SessionEndResponse> {
    console.log('Ending session:', sessionId);
    try {
      const response = await fetch(`${API_BASE_URL}/end`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      });

      console.log('End session response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('End session error:', errorData);
        throw new ApiError(
          errorData.error || `Server error: ${response.status}`,
          response.status
        );
      }

      const result = await response.json();
      console.log('End session result:', result);
      return result;
    } catch (error) {
      console.error('Error ending session:', error);
      if (error instanceof ApiError) throw error;
      throw new ApiError('Failed to end session. Please check your internet connection.');
    }
  },

  streamSimulationAsk(
    params: { sessionId: string; question: string },
    onChunk: (chunk: string) => void,
    onDone: () => void,
    onError?: (err: any) => void,
    onSessionEnd?: (summary: string) => void
  ) {
    const query = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}/api/simulation/ask?${query}`;
    const eventSource = new EventSource(url);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'chunk') {
          onChunk(data.content);
        } else if (data.type === 'done') {
          eventSource.close();
          onDone();
        } else if (data.type === 'session_end') {
          if (onSessionEnd) {
            onSessionEnd(data.summary);
          }
          eventSource.close();
        }
      } catch (err) {
        if (onError) onError(err);
        eventSource.close();
      }
    };

    eventSource.onerror = (err) => {
      if (onError) onError(err);
      eventSource.close();
    };

    return () => eventSource.close(); // Cleanup function
  }
};