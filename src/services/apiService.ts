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
  getCaseCategories: async () => {
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/api/simulation/case-categories`, {}, false);
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

  // Start simulation
  startSimulation: async (caseId: string) => {
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/api/simulation/start`, {
        method: 'POST',
        body: JSON.stringify({ caseId })
      });
      
      if (!response.ok) {
        throw new Error('Failed to start simulation');
      }
      
      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('Error starting simulation:', error);
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