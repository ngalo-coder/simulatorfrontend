// App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import CaseBrowsingPage from './pages/CaseBrowsingPage';
import SimulationPage from './pages/SimulationPage';
import SimulationChatPage from './pages/SimulationChatPage';
import ProgressPage from './pages/ProgressPage';
import LeaderboardPage from './pages/LeaderboardPage';
import AdminPage from './pages/AdminPage';

// Import components
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import { useNotification } from './components/NotificationToast';

function App() {
  const { NotificationContainer } = useNotification();

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <NotificationContainer />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/browse-cases" 
              element={
                <ProtectedRoute>
                  <CaseBrowsingPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/simulation" 
              element={
                <ProtectedRoute>
                  <SimulationPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/simulation/:caseId/session/:sessionId?" 
              element={
                <ProtectedRoute>
                  <SimulationChatPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/progress" 
              element={
                <ProtectedRoute>
                  <ProgressPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/leaderboard" 
              element={
                <ProtectedRoute>
                  <LeaderboardPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute requireAdmin>
                  <AdminPage />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;