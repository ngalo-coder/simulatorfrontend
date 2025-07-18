import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

/**
 * User interface for type safety
 */
export interface User {
  id?: string;
  _id?: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  [key: string]: any; // Allow for additional properties
}

interface AuthState {
  token: string | null;
  currentUser: User | null;
  isLoggedIn: boolean;
}

interface AuthContextType extends AuthState {
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  isLoading: boolean;
}

// Storage keys as constants for consistency
const STORAGE_KEY_TOKEN = 'authToken';
const STORAGE_KEY_USER = 'currentUser';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Securely retrieves and parses user data from localStorage
 */
const getUserFromStorage = (): User | null => {
  try {
    const userString = localStorage.getItem(STORAGE_KEY_USER);
    if (!userString) return null;
    
    const user = JSON.parse(userString);
    // Validate that it's a user object
    if (user && typeof user === 'object' && 'username' in user) {
      return user as User;
    }
    return null;
  } catch (error) {
    console.error("Error parsing user data from localStorage", error);
    return null;
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    token: null,
    currentUser: null,
    isLoggedIn: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize auth state from localStorage
    const initializeAuth = () => {
      try {
        const token = localStorage.getItem(STORAGE_KEY_TOKEN);
        const user = getUserFromStorage();
        
        if (token && user) {
          setAuthState({ token, currentUser: user, isLoggedIn: true });
        }
      } catch (error) {
        console.error("Error initializing auth state", error);
        // Clear potentially corrupted data
        localStorage.removeItem(STORAGE_KEY_TOKEN);
        localStorage.removeItem(STORAGE_KEY_USER);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeAuth();
  }, []);

  /**
   * Logs in a user and stores their credentials
   */
  const login = (token: string, user: User) => {
    if (!token || !user) {
      console.error("Invalid login attempt: Missing token or user data");
      return;
    }
    
    try {
      localStorage.setItem(STORAGE_KEY_TOKEN, token);
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
      setAuthState({ token, currentUser: user, isLoggedIn: true });
    } catch (error) {
      console.error("Error storing auth data", error);
    }
  };

  /**
   * Logs out a user and clears their credentials
   */
  const logout = () => {
    try {
      localStorage.removeItem(STORAGE_KEY_TOKEN);
      localStorage.removeItem(STORAGE_KEY_USER);
      setAuthState({ token: null, currentUser: null, isLoggedIn: false });
    } catch (error) {
      console.error("Error during logout", error);
    }
  };

  /**
   * Updates user data without changing authentication status
   */
  const updateUser = (userData: Partial<User>) => {
    if (!authState.currentUser) return;
    
    try {
      const updatedUser = { ...authState.currentUser, ...userData };
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updatedUser));
      setAuthState(prev => ({ ...prev, currentUser: updatedUser }));
    } catch (error) {
      console.error("Error updating user data", error);
    }
  };

  const contextValue: AuthContextType = {
    ...authState,
    login,
    logout,
    updateUser,
    isLoading
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook to access authentication context
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
