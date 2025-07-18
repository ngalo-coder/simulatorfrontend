import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HelpCircle } from 'lucide-react';
import { useAuth, User } from '../contexts/AuthContext';

interface AppHeaderProps {
  onShowUserGuide: () => void;
  onLogout: () => void;
}

/**
 * Application header component with navigation and user controls
 */
const AppHeader: React.FC<AppHeaderProps> = ({ onShowUserGuide, onLogout }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  return (
    <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-4 flex flex-col sm:flex-row justify-between items-center shadow-lg">
      <div className="flex items-center gap-3 mb-3 sm:mb-0">
        <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
          <span className="text-xl font-bold">S</span>
        </div>
        <h1 className="text-xl font-bold">Simuatech</h1>
      </div>
      
      <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
        <button
          onClick={onShowUserGuide}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-3 sm:px-4 rounded-lg flex items-center gap-1 sm:gap-2 text-sm sm:text-base transition-colors duration-200"
          title="Help & Instructions"
        >
          <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden xs:inline">Help</span>
        </button>
        
        <button
          onClick={() => {
            if (currentUser?.role === 'admin') navigate('/admin');
            else navigate('/dashboard');
          }}
          className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-3 sm:px-4 rounded-lg text-sm sm:text-base transition-colors duration-200"
        >
          Dashboard
        </button>
        
        {currentUser?.role === 'admin' && (
          <button
            onClick={() => navigate('/admin')}
            className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-3 sm:px-4 rounded-lg text-sm sm:text-base transition-colors duration-200"
          >
            Admin
          </button>
        )}
        
        <button
          onClick={onLogout}
          className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-3 sm:px-4 rounded-lg text-sm sm:text-base transition-colors duration-200"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default AppHeader;