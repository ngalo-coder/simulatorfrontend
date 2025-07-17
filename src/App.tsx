import { useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useAuthContext } from './context/AuthContext';
import { ProgramArea, Specialty } from './types';
import Header from './components/Header';
import LoginPage from './pages/LoginPage';
import SimulationPage from './pages/SimulationPage';
import AdminDashboard from './pages/AdminDashboard';
import ProgramSelector from './pages/ProgramSelector';
import { HelpCircle } from 'lucide-react';

function App() {
  const { currentUser, isAuthLoading } = useAuthContext();
  const [selectedProgramArea, setSelectedProgramArea] = useState<ProgramArea | null>(null);
  const [selectedSpecialty, setSelectedSpecialty] = useState<Specialty | null>(null);
  const [appState, setAppState] = useState<'selecting_program' | 'in_simulation'>('selecting_program');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSelectProgramArea = (program: ProgramArea, specialty: Specialty | null) => {
    setSelectedProgramArea(program);
    setSelectedSpecialty(specialty);
    setAppState('in_simulation');
    navigate('/simulate');
  };

  useEffect(() => {
    if (!isAuthLoading && currentUser) {
      if (currentUser?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/'); // Direct normal users to program selection
      }
    }
  }, [currentUser, isAuthLoading, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Header
        currentUser={currentUser}
        onNavClick={() => {
          if (currentUser?.role === 'admin') navigate('/admin');
          else navigate('/'); // Navigate to program selection for regular users
        }}
      />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/simulate"
          element={
            <SimulationPage
              programArea={selectedProgramArea}
              specialty={selectedSpecialty}
              onBackToProgramSelection={() => {
                setAppState('selecting_program');
                setSelectedProgramArea(null);
                setSelectedSpecialty(null);
                navigate('/');
              }}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
            />
          }
        />
        <Route
          path="/"
          element={
            <ProgramSelector
              onSelectProgramArea={handleSelectProgramArea}
              resetAppState={() => {
                setAppState('selecting_program');
                setSelectedProgramArea(null);
                setSelectedSpecialty(null);
              }}
              isLoading={isLoading || isAuthLoading}
            />
          }
        />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route
          path="/select-program"
          element={
            <ProgramSelector
              onSelectProgramArea={handleSelectProgramArea}
              resetAppState={() => {
                setAppState('selecting_program');
                setSelectedProgramArea(null);
                setSelectedSpecialty(null);
              }}
              isLoading={isLoading || isAuthLoading}
            />
          }
        />
      </Routes>
    </div>
  );
}

export default App;
