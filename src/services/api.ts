// api.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://simulatorbackend.onrender.com';
// const API_BASE_URL = 'http://localhost:5001'; // For local testing

// Function to get the auth token from localStorage
const getAuthToken = (): string | null => {
  try {
    return localStorage.getItem('authToken');
  } catch (e) {
    console.error("Error accessing localStorage for authToken", e);
    return null;
  }
};

// Centralized fetch function to include Authorization header and handle 401
const authenticatedFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.append('Authorization', `Bearer ${token}`);
  }
  headers.append('Content-Type', 'application/json'); // Ensure Content-Type is set

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    // Handle unauthorized access: e.g., clear token, redirect to login
    console.error('Unauthorized access - 401');
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    // Consider a more robust way to trigger logout, e.g., via AuthContext or event
    if (window.location.pathname !== '/login') {
      window.location.href = '/login'; // Force redirect
    }
    // Throw an error to stop further processing in the calling function
    throw new ApiError('Unauthorized: Please login again.', 401);
  }

  return response;
};


export class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

export const api = {
  async getCases(filters?: { program_area?: string, specialty?: string }): Promise<import('../types').PatientCase[]> {
    let url = `${API_BASE_URL}/api/simulation/cases`;
    if (filters) {
      const queryParams = new URLSearchParams();
      if (filters.program_area) queryParams.append('program_area', filters.program_area);
      if (filters.specialty) queryParams.append('specialty', filters.specialty);
      if (queryParams.toString()) {
        url += `?${queryParams.toString()}`;
      }
    }

    try {
      const response = await authenticatedFetch(url, { method: 'GET' });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.error || `Server error: ${response.status}`,
          response.status
        );
      }

      const data = await response.json();
      console.log('Raw cases data from server:', data);

      // Check if the response has a 'cases' property and use it
      const caseList = Array.isArray(data) ? data : data.cases || [];

      const cases: import('../types').PatientCase[] = caseList.map((caseItem: any) => {
        const caseId = caseItem.case_id || caseItem.id || caseItem.title || 'unknown';
        const caseMetadata = caseItem.case_metadata || caseItem;

        return {
          id: caseId,
          title: caseMetadata.title || caseItem.title || caseId,
          description: caseMetadata.description || caseItem.description || 'No description available',
          category: caseMetadata.category || caseItem.category || 'General',
          difficulty: caseMetadata.difficulty || caseItem.difficulty || 'Intermediate',
          estimatedTime: caseMetadata.estimated_time || caseMetadata.estimated_duration_min
            ? `${caseMetadata.estimated_duration_min} minutes`
            : caseMetadata.duration || '15-20 minutes',
          tags: caseMetadata.tags || caseItem.tags || [],
          specialty: caseMetadata.specialty || caseItem.specialty,
          level: caseMetadata.level || caseItem.level,
          duration: caseMetadata.duration || caseItem.duration,
          learningObjectives: caseMetadata.learning_objectives || caseItem.learning_objectives,
          clinicalContext: caseMetadata.clinical_context || caseItem.clinical_context,
          patientAge: caseMetadata.patient_age || caseItem.patient_age,
          patientGender: caseMetadata.patient_gender || caseItem.patient_gender,
          chiefComplaint: caseMetadata.chief_complaint || caseItem.chief_complaint,
          presentingSymptoms: caseMetadata.presenting_symptoms || caseItem.presenting_symptoms,
          programArea: caseMetadata.program_area || caseItem.program_area,
          specializedArea: caseMetadata.specialized_area || caseItem.specialized_area
        };
      });

      console.log('Processed cases:', cases);
      return cases;
    } catch (error) {
      console.error('Error fetching cases:', error);
      if (error instanceof ApiError) throw error;
      throw new ApiError('Failed to fetch cases. Please check your internet connection.');
    }
  },

  async getPerformanceMetrics(sessionId: string): Promise<import('../types').PerformanceMetrics> {
    console.log('Fetching performance metrics for session:', sessionId);
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/api/simulation/performance-metrics/session/${sessionId}`, {
        method: 'GET',
      });

      console.log('Performance metrics response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Performance metrics error:', errorData);
        throw new ApiError(
          errorData.error || `Server error: ${response.status}`,
          response.status
        );
      }

      const result = await response.json();
      console.log('Performance metrics result:', result);
      return result;
    } catch (error) {
      console.error('Error fetching performance metrics:', error);
      if (error instanceof ApiError) throw error;
      throw new ApiError('Failed to fetch performance metrics. Please check your internet connection.');
    }
  },

  async startSimulation(caseId: string): Promise<{ sessionId: string; initialPrompt: string }> {
    console.log('Starting simulation for case:', caseId);
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/api/simulation/start`, {
        method: 'POST',
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
      const response = await authenticatedFetch(`${API_BASE_URL}/api/simulation/end`, {
        method: 'POST',
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
    let url = `${API_BASE_URL}/api/simulation/ask?${query}`;

    // For EventSource, token needs to be passed as a query parameter if backend supports it,
    // or the backend needs to handle session/cookie based auth for EventSource.
    // If your backend expects a Bearer token for EventSource via query param (e.g., 'token'), use:
    const token = getAuthToken();
    if (token) {
      // Assuming backend can accept token via query param named 'token' or 'access_token'
      // This is NOT standard for Bearer tokens but sometimes used for EventSource
      url += `&token=${encodeURIComponent(token)}`;
    }

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
  },

  async getCaseCategories(filters?: { program_area?: string }): Promise<import('../types').CaseCategories> {
    try {
      let url = `${API_BASE_URL}/api/simulation/case-categories`;
      if (filters && filters.program_area) {
        url += `?program_area=${encodeURIComponent(filters.program_area)}`;
      }
      
      const response = await authenticatedFetch(url, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.error || `Server error: ${response.status}`,
          response.status
        );
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching case categories:', error);
      if (error instanceof ApiError) throw error;
      throw new ApiError('Failed to fetch case categories. Please check your internet connection.');
    }
  },

  // Add post method for convenience, using authenticatedFetch
  async post(endpoint: string, body: any): Promise<any> {
    const url = `${API_BASE_URL}${endpoint}`; // Assuming all API endpoints are under /api
    try {
      const response = await authenticatedFetch(url, {
        method: 'POST',
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.message || errorData.error || `Server error: ${response.status}`,
          response.status
        );
      }
      return response.json();
    } catch (error) {
      console.error(`Error POST ${endpoint}:`, error);
      if (error instanceof ApiError) throw error;
      throw new ApiError(`Failed to POST to ${endpoint}.`);
    }
  },

  // Add get method for convenience, using authenticatedFetch
  async get(endpoint: string): Promise<any> {
    const url = `${API_BASE_URL}${endpoint}`; // Assuming all API endpoints are under /api
    try {
      const response = await authenticatedFetch(url, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.message || errorData.error || `Server error: ${response.status}`,
          response.status
        );
      }
      return response.json();
    } catch (error) {
      console.error(`Error GET ${endpoint}:`, error);
      if (error instanceof ApiError) throw error;
      throw new ApiError(`Failed to GET from ${endpoint}.`);
    }
  },

  // Add patch method for convenience, using authenticatedFetch
  async patch(endpoint: string, body: any): Promise<any> {
    const url = `${API_BASE_URL}${endpoint}`; // Assuming all API endpoints are under /api
    try {
      const response = await authenticatedFetch(url, {
        method: 'PATCH',
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.message || errorData.error || `Server error: ${response.status}`,
          response.status
        );
      }
      return response.json();
    } catch (error) {
      console.error(`Error PATCH ${endpoint}:`, error);
      if (error instanceof ApiError) throw error;
      throw new ApiError(`Failed to PATCH to ${endpoint}.`);
    }
  },

  // Clinician Progress Endpoints
  async fetchClinicianProgress(userId: string): Promise<import('../types').ClinicianProgressResponse> {
    console.log('Fetching clinician progress for user:', userId);
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/api/progress/${userId}`, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.error || `Server error: ${response.status}`,
          response.status
        );
      }

      const result = await response.json();
      console.log('Clinician progress result:', result);
      return result;
    } catch (error) {
      console.error('Error fetching clinician progress:', error);
      if (error instanceof ApiError) throw error;
      throw new ApiError('Failed to fetch clinician progress. Please check your internet connection.');
    }
  },

  async fetchProgressRecommendations(userId: string): Promise<import('../types').ProgressRecommendation> {
    console.log('Fetching progress recommendations for user:', userId);
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/api/progress/recommendations/${userId}`, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.error || `Server error: ${response.status}`,
          response.status
        );
      }

      const result = await response.json();
      console.log('Progress recommendations result:', result);
      return result;
    } catch (error) {
      console.error('Error fetching progress recommendations:', error);
      if (error instanceof ApiError) throw error;
      throw new ApiError('Failed to fetch progress recommendations. Please check your internet connection.');
    }
  },

  async updateProgressAfterCase(data: { userId: string, caseId: string, performanceMetricsId: string }): Promise<any> {
    console.log('Updating clinician progress after case completion:', data);
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/api/progress/update`, {
        method: 'POST',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.error || `Server error: ${response.status}`,
          response.status
        );
      }

      const result = await response.json();
      console.log('Progress update result:', result);
      return result;
    } catch (error) {
      console.error('Error updating clinician progress:', error);
      if (error instanceof ApiError) throw error;
      throw new ApiError('Failed to update clinician progress. Please check your internet connection.');
    }
  },

  // Admin Dashboard Endpoints
  async fetchSystemStats(): Promise<any> {
    console.log('Fetching system statistics');
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/api/admin/stats`, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.error || `Server error: ${response.status}`,
          response.status
        );
      }

      const result = await response.json();
      console.log('System stats result:', result);
      return result;
    } catch (error) {
      console.error('Error fetching system stats:', error);
      if (error instanceof ApiError) throw error;
      throw new ApiError('Failed to fetch system statistics. Please check your internet connection.');
    }
  },

  async fetchUsers(): Promise<any> {
    console.log('Fetching users');
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/api/admin/users`, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.error || `Server error: ${response.status}`,
          response.status
        );
      }

      const result = await response.json();
      console.log('Users result:', result);
      return result;
    } catch (error) {
      console.error('Error fetching users:', error);
      if (error instanceof ApiError) throw error;
      throw new ApiError('Failed to fetch users. Please check your internet connection.');
    }
  },

  async fetchAdminCases(): Promise<any> {
    console.log('Fetching all cases for admin');
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/api/admin/cases`, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.error || `Server error: ${response.status}`,
          response.status
        );
      }

      const result = await response.json();
      console.log('Admin cases result:', result);
      return result;
    } catch (error) {
      console.error('Error fetching admin cases:', error);
      if (error instanceof ApiError) throw error;
      throw new ApiError('Failed to fetch cases. Please check your internet connection.');
    }
  },

  async deleteUser(userId: string): Promise<any> {
    console.log('Deleting user:', userId);
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.error || `Server error: ${response.status}`,
          response.status
        );
      }

      const result = await response.json();
      console.log('Delete user result:', result);
      return result;
    } catch (error) {
      console.error('Error deleting user:', error);
      if (error instanceof ApiError) throw error;
      throw new ApiError('Failed to delete user. Please check your internet connection.');
    }
  },

  async deleteCase(caseId: string): Promise<any> {
    console.log('Deleting case:', caseId);
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/api/admin/cases/${caseId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.error || `Server error: ${response.status}`,
          response.status
        );
      }

      const result = await response.json();
      console.log('Delete case result:', result);
      return result;
    } catch (error) {
      console.error('Error deleting case:', error);
      if (error instanceof ApiError) throw error;
      throw new ApiError('Failed to delete case. Please check your internet connection.');
    }
  },

  // Admin User Management
  async createAdminUser(userData: { username: string, email: string, password: string }): Promise<any> {
    console.log('Creating admin user');
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/api/admin/users/admin`, {
        method: 'POST',
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.error || `Server error: ${response.status}`,
          response.status
        );
      }

      const result = await response.json();
      console.log('Create admin user result:', result);
      return result;
    } catch (error) {
      console.error('Error creating admin user:', error);
      if (error instanceof ApiError) throw error;
      throw new ApiError('Failed to create admin user. Please check your internet connection.');
    }
  },

  async updateUserRole(userId: string, role: 'user' | 'admin'): Promise<any> {
    console.log('Updating user role:', userId, role);
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/api/admin/users/${userId}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.error || `Server error: ${response.status}`,
          response.status
        );
      }

      const result = await response.json();
      console.log('Update user role result:', result);
      return result;
    } catch (error) {
      console.error('Error updating user role:', error);
      if (error instanceof ApiError) throw error;
      throw new ApiError('Failed to update user role. Please check your internet connection.');
    }
  },

  async updateCase(caseId: string, data: { programArea: string, specialty: string }): Promise<any> {
    console.log('Updating case:', caseId, data);
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/api/admin/cases/${caseId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.error || `Server error: ${response.status}`,
          response.status
        );
      }

      const result = await response.json();
      console.log('Update case result:', result);
      return result;
    } catch (error) {
      console.error('Error updating case:', error);
      if (error instanceof ApiError) throw error;
      throw new ApiError('Failed to update case. Please check your internet connection.');
    }
  }
};