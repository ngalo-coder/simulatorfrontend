import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './contexts/AuthContext'; // Import AuthProvider

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <React.StrictMode>
      <AuthProvider>
        <App />
      </AuthProvider>
    </React.StrictMode>
  );
} else {
  console.error("Failed to find the root element. The app cannot be mounted.");
}
