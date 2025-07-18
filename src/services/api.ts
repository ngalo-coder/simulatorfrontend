// api.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://simulatorbackend.onrender.com';

/**
 * Securely retrieves the authentication token from localStorage
 */
const getAuthToken = (): string | null => {
  try {
    return localStorage.getItem('authToken');
  } catch (e) {
    console.error("Error accessing localStorage for authToken", e);
    return null;
  }
};

const getCsrfToken = (): string | null => {
  try {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'csrf_token') {
        return value;
      }
    }
    return null;
  } catch (e) {
    console.error("Error accessing document.cookie for csrf_token", e);
    return null;
  }
};

/**
 * Handles authentication failures by clearing credentials and redirecting
 */
const handleAuthFailure = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('currentUser');
  
  // Only redirect if not already on login page
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
};

/**
 * Centralized fetch function with authentication and error handling
 */
const authenticatedFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const token = getAuthToken();
  const csrfToken = getCsrfToken();
  const headers = new Headers(options.headers || {});

  // Set auth header if token exists
  if (token) {
    headers.append('Authorization', `Bearer ${token}`);
  }

  if (csrfToken) {
    headers.append('X-CSRF-TOKEN', csrfToken);
  }
  
  // Always set content type for consistency
  headers.append('Content-Type', 'application/json');

  try {
    const response = await fetch(url, { ...options, headers });
    
    // Handle authentication failures
    if (response.status === 401) {
      handleAuthFailure();
      throw new ApiError('Unauthorized: Please login again.', 401);
    }
    
    return response;
  } catch (error) {
    // Rethrow API errors, wrap other errors
    if (error instanceof ApiError) throw error;
    throw new ApiError(`Network error: ${(error as Error).message}`, 0);
  }
};


export class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

export const api = {
  /**
   * Fetch patient cases with optional filtering
   * @param filters Optional filters for program area and specialty
   * @returns Promise with patient cases array
   */
  async getCases(filters?: { program_area?: string, specialty?: string }): Promise<import('../types').PatientCase[]> {
    try {
      // Build query parameters for filtering
      const queryParams = new URLSearchParams();
      if (filters?.program_area) queryParams.append('program_area', filters.program_area);
      if (filters?.specialty) queryParams.append('specialty', filters.specialty);
      
      const endpoint = `/api/simulation/cases${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const data = await this.get<any>(endpoint);
      
      // Process the response data
      const caseList = Array.isArray(data) ? data : data.cases || [];
      
      // Map raw data to PatientCase objects
      return caseList.map((caseItem: any) => {
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
    } catch (error) {
      console.error('Error fetching cases:', error);
      if (error instanceof ApiError) throw error;
      throw new ApiError('Failed to fetch cases. Please check your internet connection.');
    }
  },

  /**
   * Fetch performance metrics for a simulation session
   * @param sessionId ID of the session to fetch metrics for
   * @returns Promise with performance metrics data
   */
  async getPerformanceMetrics(sessionId: string): Promise<import('../types').PerformanceMetrics> {
    console.log('Fetching performance metrics for session:', sessionId);
    return this.get<import('../types').PerformanceMetrics>(`/api/simulation/performance-metrics/session/${sessionId}`);
  },

  /**
   * Start a new simulation session
   * @param caseId ID of the case to simulate
   * @returns Promise with session ID and initial prompt
   */
  async startSimulation(caseId: string): Promise<{ sessionId: string; initialPrompt: string }> {
    console.log('Starting simulation for case:', caseId);
    return this.post<{ sessionId: string; initialPrompt: string }>('/api/simulation/start', { caseId });
  },

  /**
   * End a simulation session
   * @param sessionId ID of the session to end
   * @returns Promise with session end response
   */
  async endSession(sessionId: string): Promise<import('../types').SessionEndResponse> {
    console.log('Ending session:', sessionId);
    return this.post<import('../types').SessionEndResponse>('/api/simulation/end', { sessionId });
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

  /**
   * Fetch case categories with optional program area filter
   * @param filters Optional filters for program area
   * @returns Promise with case categories
   */
  async getCaseCategories(filters?: { program_area?: string }): Promise<import('../types').CaseCategories> {
    try {
      // Build query parameters for filtering
      const queryParams = new URLSearchParams();
      if (filters?.program_area) queryParams.append('program_area', filters.program_area);
      
      const endpoint = `/api/simulation/case-categories${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      return this.get<import('../types').CaseCategories>(endpoint);
    } catch (error) {
      console.error('Error fetching case categories:', error);
      if (error instanceof ApiError) throw error;
      throw new ApiError('Failed to fetch case categories. Please check your internet connection.');
    }
  },

  /**
   * Generic request handler for all HTTP methods
   * @param method HTTP method (GET, POST, PUT, PATCH, DELETE)
   * @param endpoint API endpoint path
   * @param body Optional request body for POST, PUT, PATCH
   * @returns Promise with the JSON response
   */
  async request<T = any>(method: string, endpoint: string, body?: any): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const options: RequestInit = { method };
    
    if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
      options.body = JSON.stringify(body);
    }
    
    try {
      const response = await authenticatedFetch(url, options);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.message || errorData.error || `Server error: ${response.status}`,
          response.status
        );
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error ${method} ${endpoint}:`, error);
      if (error instanceof ApiError) throw error;
      throw new ApiError(`Failed to ${method} ${endpoint}.`);
    }
  },
  
  // Convenience methods using the generic request handler
  async get<T = any>(endpoint: string): Promise<T> {
    return this.request<T>('GET', endpoint);
  },
  
  async post<T = any>(endpoint: string, body: any): Promise<T> {
    return this.request<T>('POST', endpoint, body);
  },
  
  async put<T = any>(endpoint: string, body: any): Promise<T> {
    return this.request<T>('PUT', endpoint, body);
  },
  
  async patch<T = any>(endpoint: string, body: any): Promise<T> {
    return this.request<T>('PATCH', endpoint, body);
  },
  
  async delete<T = any>(endpoint: string): Promise<T> {
    return this.request<T>('DELETE', endpoint);
  },

  // Clinician Progress Endpoints
  /**
   * Fetch clinician progress data
   * @param userId User ID to fetch progress for
   * @returns Promise with clinician progress data
   */
  async fetchClinicianProgress(userId: string): Promise<import('../types').ClinicianProgressResponse> {
    console.log('Fetching clinician progress for user:', userId);
    return this.get<import('../types').ClinicianProgressResponse>(`/api/progress/${userId}`);
  },

  /**
   * Fetch progress recommendations for a user
   * @param userId User ID to fetch recommendations for
   * @returns Promise with progress recommendations
   */
  async fetchProgressRecommendations(userId: string): Promise<import('../types').ProgressRecommendation> {
    console.log('Fetching progress recommendations for user:', userId);
    return this.get<import('../types').ProgressRecommendation>(`/api/progress/recommendations/${userId}`);
  },

  /**
   * Update clinician progress after case completion
   * @param data Progress update data
   * @returns Promise with update result
   */
  async updateProgressAfterCase(data: { userId: string, caseId: string, performanceMetricsId: string }): Promise<any> {
    console.log('Updating clinician progress after case completion:', data);
    return this.post('/api/progress/update', data);
  },

  // Admin Dashboard Endpoints
  /**
   * Fetch system statistics for admin dashboard
   * @returns Promise with system statistics
   */
  async fetchSystemStats(): Promise<any> {
    console.log('Fetching system statistics');
    return this.get('/api/admin/stats');
  },

  /**
   * Fetch all users for admin dashboard
   * @returns Promise with users data
   */
  async fetchUsers(): Promise<any> {
    console.log('Fetching users');
    return this.get('/api/admin/users');
  },

  /**
   * Fetch all cases for admin dashboard
   * @returns Promise with cases data
   */
  async fetchAdminCases(): Promise<any> {
    console.log('Fetching all cases for admin');
    return this.get('/api/admin/cases');
  },

  /**
   * Delete a user by ID
   * @param userId ID of the user to delete
   * @returns Promise with deletion result
   */
  async deleteUser(userId: string): Promise<any> {
    console.log('Deleting user:', userId);
    return this.delete(`/api/admin/users/${userId}`);
  },

  /**
   * Delete a case by ID
   * @param caseId ID of the case to delete
   * @returns Promise with deletion result
   */
  async deleteCase(caseId: string): Promise<any> {
    console.log('Deleting case:', caseId);
    return this.delete(`/api/admin/cases/${caseId}`);
  },

  // Admin User Management
  /**
   * Create a new admin user
   * @param userData User data including username, email, and password
   * @returns Promise with creation result
   */
  async createAdminUser(userData: { username: string, email: string, password: string }): Promise<any> {
    console.log('Creating admin user');
    return this.post('/api/admin/users/admin', userData);
  },

  /**
   * Update a user's role
   * @param userId ID of the user to update
   * @param role New role to assign
   * @returns Promise with update result
   */
  async updateUserRole(userId: string, role: 'user' | 'admin'): Promise<any> {
    console.log('Updating user role:', userId, role);
    return this.put(`/api/admin/users/${userId}/role`, { role });
  },

  /**
   * Update case metadata
   * @param caseId ID of the case to update
   * @param data Updated case data
   * @returns Promise with update result
   */
  async updateCase(caseId: string, data: { programArea: string, specialty: string }): Promise<any> {
    console.log('Updating case:', caseId, data);
    return this.put(`/api/admin/cases/${caseId}`, data);
  },

  /**
   * Fetch users with their performance scores
   * @returns Promise with users and scores data
   */
  async fetchUsersWithScores(): Promise<any> {
    console.log('Fetching users with scores');
    return this.get('/api/admin/users/scores');
  },

  /**
   * Fetch available program areas
   * @returns Promise with program areas array
   */
  async fetchProgramAreas(): Promise<string[]> {
    console.log('Fetching program areas');
    try {
      const result = await this.get<{programAreas: string[]}>('/api/admin/program-areas');
      return result.programAreas || [];
    } catch (error) {
      console.error('Error fetching program areas:', error);
      // Return default program areas if API fails
      return ["Basic Program", "Specialty Program"];
    }
  },

  /**
   * Fetch available specialties
   * @returns Promise with specialties array
   */
  async fetchSpecialties(): Promise<string[]> {
    console.log('Fetching specialties');
    try {
      const result = await this.get<{specialties: string[]}>('/api/admin/specialties');
      return result.specialties || [];
    } catch (error) {
      console.error('Error fetching specialties:', error);
      // Return default specialties if API fails
      return ["Internal Medicine", "Surgery", "Pediatrics", "Ophthalmology", "ENT", 
              "Cardiology", "Neurology", "Psychiatry", "Emergency Medicine", "Family Medicine"];
    }
  }

};