import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

interface AuthState {
  token: string | null;
  currentUser: any | null; // Define a more specific User type if available
  isLoggedIn: boolean;
}

interface AuthContextType extends AuthState {
  login: (token: string, user: any) => void;
  logout: () => void;
  isLoading: boolean; // To handle async nature of checking localStorage
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    token: null,
    currentUser: null,
    isLoggedIn: false,
  });
  const [isLoading, setIsLoading] = useState(true); // Start with loading true

  useEffect(() => {
    // Check localStorage for existing token on initial load
    try {
      const token = localStorage.getItem('authToken');
      const userString = localStorage.getItem('currentUser');
      if (token && userString) {
        const currentUser = JSON.parse(userString);
        setAuthState({ token, currentUser, isLoggedIn: true });
      }
    } catch (error) {
      console.error("Error parsing auth data from localStorage", error);
      // Clear potentially corrupted data
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
    }
    setIsLoading(false); // Finished loading
  }, []);

  const login = (token: string, user: any) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('currentUser', JSON.stringify(user));
    setAuthState({ token, currentUser: user, isLoggedIn: true });
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    setAuthState({ token: null, currentUser: null, isLoggedIn: false });
    // Optionally, redirect to login page or reload
    // window.location.href = '/login'; // Or use navigate if within Router context
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
