import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

interface AuthState {
  token: string | null;
  currentUser: any | null; // Define a more specific User type if available
  isLoggedIn: boolean;
  redirectTo: string | null;
}

interface AuthContextType extends AuthState {
  login: (token: string, user: any, redirectTo?: string) => void;
  logout: () => void;
  isLoading: boolean; // To handle async nature of checking localStorage
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    token: null,
    currentUser: null,
    isLoggedIn: false,
    redirectTo: null,
  });
  const [isLoading, setIsLoading] = useState(true); // Start with loading true

  useEffect(() => {
    // Check localStorage for existing token on initial load
    try {
      const token = localStorage.getItem('authToken');
      const userString = localStorage.getItem('currentUser');
      if (token && userString) {
        const currentUser = JSON.parse(userString);
        setAuthState({ token, currentUser, isLoggedIn: true, redirectTo: null });
      }
    } catch (error) {
      console.error("Error parsing auth data from localStorage", error);
      // Clear potentially corrupted data
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
    }
    setIsLoading(false); // Finished loading
  }, []);

  const login = (token: string, user: any, redirectTo?: string) => {
    localStorage.setItem('authToken', token);
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('currentUser');
    }
    setAuthState({ token, currentUser: user, isLoggedIn: true, redirectTo: redirectTo || null });
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
