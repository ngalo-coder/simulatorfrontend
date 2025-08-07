// Simple API service for the virtual patient frontend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5003';

// Auth utilities
const getAuthToken = (): string | null => {
  try {
    return localStorage.getItem('authToken');
  } catch (e) {
    return null;
  }
};

const isTokenValid = (): boolean => {
  const token = getAuthToken();
  const userData = localStorage.getItem('currentUser');
  return !!(token && userData);
};

const authenticatedFetch = async (url: string, options: RequestInit = {}, autoLogout: boolean = true): Promise<Response> => {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.append('Authorization', `Bearer ${token}`);
    console.log('Making authenticated request to:', url, 'with token:', token.substring(0, 20) + '...');
  } else {
    console.log('Making unauthenticated request to:', url);
  }
  
  headers.append('Content-Type', 'application/json');

  const response = await fetch(url, { ...options, headers });
  
  console.log('Response status:', response.status, 'for URL:', url);
  
  // Only auto-logout for auth-related endpoints or when explicitly requested
  if (response.status === 401 && autoLogout && (url.includes('/auth/') || url.includes('/admin/'))) {
    console.log('Auto-logout triggered for:', url);
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    window.location.href = '/login';
  }
  
  return response;
};

export const api = {
  // Check if user is authenticated
  isAuthenticated: () => isTokenValid(),

  // Get user cases/progress data
  getUserProgress: async (userId: string) => {
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/api/progress/${userId}`, {}, false);
      if (!response.ok) {
        // If it's a 401, it might just mean no progress data exists yet
        if (response.status === 401) {
          console.log('No progress data found for user, returning default values');
          return {
            totalCasesCompleted: 0,
            overallAverageScore: 0,
            specialtyProgress: [],
            recentPerformance: []
          };
        }
        throw new Error('Failed to fetch user progress');
      }
      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('Error fetching user progress:', error);
      // Return default data for new users
      return {
        totalCasesCompleted: 0,
        overallAverageScore: 0,
        specialtyProgress: [],
        recentPerformance: []
      };
    }
  },

  // Get available cases
  getCases: async (filters?: any) => {
    try {
      const queryParams = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) queryParams.append(key, value.toString());
        });
      }
      
      const response = await authenticatedFetch(
        `${API_BASE_URL}/api/simulation/cases?${queryParams.toString()}`,
        {},
        false
      );
      
      if (!response.ok) {
        if (response.status === 401) {
          console.log('Authentication required for cases');
          return {
            cases: [],
            currentPage: 1,
            totalPages: 1,
            totalCases: 0
          };
        }
        throw new Error('Failed to fetch cases');
      }
      
      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('Error fetching cases:', error);
      // Return empty array for now
      return {
        cases: [],
        currentPage: 1,
        totalPages: 1,
        totalCases: 0
      };
    }
  },

  // Get case categories
  getCaseCategories: async (filters?: { program_area?: string }) => {
    try {
      const queryParams = new URLSearchParams();
      if (filters?.program_area) {
        queryParams.append('program_area', filters.program_area);
      }
      
      const endpoint = `/api/simulation/case-categories${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await authenticatedFetch(`${API_BASE_URL}${endpoint}`, {}, false);
      
      if (!response.ok) {
        if (response.status === 401) {
          console.log('Authentication required for case categories');
          return {
            program_areas: [],
            specialties: [],
            specialized_areas: []
          };
        }
        throw new Error('Failed to fetch case categories');
      }
      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('Error fetching case categories:', error);
      return {
        program_areas: [],
        specialties: [],
        specialized_areas: []
      };
    }
  },

  // Start simulation with enhanced debugging
  startSimulation: async (caseId: string) => {
    try {
      console.log('📡 Starting simulation for case:', caseId);
      
      const response = await authenticatedFetch(`${API_BASE_URL}/api/simulation/start`, {
        method: 'POST',
        body: JSON.stringify({ caseId })
      });
      
      if (!response.ok) {
        console.error('❌ API Response not OK:', response.status, response.statusText);
        throw new Error(`Failed to start simulation: ${response.status} ${response.statusText}`);
      }
      
      // Get the raw response text first for debugging
      const responseText = await response.text();
      console.log('📡 Raw API Response Text:', responseText);
      
      // Parse the JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ Failed to parse JSON response:', parseError);
        throw new Error('Invalid JSON response from server');
      }
      
      console.log('📡 Parsed API Response:', data);
      console.log('📡 Response structure analysis:');
      console.log('  - Top level keys:', Object.keys(data));
      console.log('  - Has data property:', 'data' in data);
      console.log('  - data content:', data.data);
      
      // Check both possible response structures
      const responseData = data.data || data;
      console.log('📡 Final responseData:', responseData);
      console.log('📡 Response data keys:', Object.keys(responseData));
      
      // Log all possible patient name fields
      console.log('📡 Patient name analysis:');
      console.log('  - patientName:', responseData.patientName);
      console.log('  - patient_name:', responseData.patient_name);
      console.log('  - name:', responseData.name);
      console.log('  - speaks_for:', responseData.speaks_for);
      
      // Log all possible initial prompt fields
      console.log('📡 Initial prompt analysis:');
      console.log('  - initialPrompt:', responseData.initialPrompt);
      console.log('  - initial_prompt:', responseData.initial_prompt);
      console.log('  - prompt:', responseData.prompt);
      console.log('  - message:', responseData.message);
      
      // Check if initialPrompt exists and has content
      const initialPrompt = responseData.initialPrompt || 
                           responseData.initial_prompt || 
                           responseData.prompt || 
                           responseData.message || 
                           '';
                           
      console.log('📡 Resolved initial prompt:', {
        value: initialPrompt,
        type: typeof initialPrompt,
        length: initialPrompt?.length || 0,
        trimmedLength: initialPrompt?.trim()?.length || 0
      });
      
      return responseData;
    } catch (error) {
      console.error('❌ Error in startSimulation:', error);
      throw error;
    }
  },

  // End simulation
  endSimulation: async (sessionId: string) => {
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/api/simulation/end`, {
        method: 'POST',
        body: JSON.stringify({ sessionId })
      });
      
      if (!response.ok) {
        throw new Error('Failed to end simulation');
      }
      
      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('Error ending simulation:', error);
      throw error;
    }
  },

  // Get leaderboard data
  getLeaderboard: async (specialty?: string, limit: number = 10) => {
    try {
      const queryParams = new URLSearchParams();
      if (specialty) queryParams.append('specialty', specialty);
      queryParams.append('limit', limit.toString());
      
      const response = await authenticatedFetch(
        `${API_BASE_URL}/api/performance/leaderboard?${queryParams.toString()}`,
        {},
        false
      );
      
      if (!response.ok) {
        if (response.status === 401) {
          console.log('Authentication required for leaderboard');
          return [];
        }
        throw new Error('Failed to fetch leaderboard');
      }
      
      const data = await response.json();
      return data || [];
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }
  },

  // Admin APIs
  getSystemStats: async () => {
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/api/admin/stats`);
      if (!response.ok) {
        throw new Error('Failed to fetch system stats');
      }
      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('Error fetching system stats:', error);
      return {
        totalUsers: 0,
        totalCases: 0,
        totalSessions: 0,
        activeUsers: 0
      };
    }
  }
};

export default api;