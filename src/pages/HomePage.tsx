import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const HomePage: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to dashboard if user is already logged in
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    );
  }

  // Don't render the landing page if user is logged in (will redirect)
  if (user) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">
        Simuatech
      </h1>
      <p className="text-xl text-gray-600 mb-4">
        Where patients build real clinicians
      </p>
      <p className="text-lg text-gray-700 mb-4">
        Master clinical skills with AI
      </p>
      <p className="text-base text-gray-600 mb-8">
        From patients to confident clinical practice
      </p>
      
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-3">For Students</h3>
          <p className="text-gray-600 mb-4">
            Practice patient interactions, develop clinical reasoning, and receive instant feedback
          </p>
          <Link 
            to="/register" 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Get Started
          </Link>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-3">For Educators</h3>
          <p className="text-gray-600 mb-4">
            Monitor student progress, manage cases, and contribute new scenarios
          </p>
          <Link 
            to="/login" 
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
      
      <div className="bg-blue-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Key Features</h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div>
            <h4 className="font-medium">Interactive Cases</h4>
            <p className="text-gray-600">Realistic patient scenarios across multiple specialties</p>
          </div>
          <div>
            <h4 className="font-medium">AI-Powered Feedback</h4>
            <p className="text-gray-600">Instant evaluation and personalized recommendations</p>
          </div>
          <div>
            <h4 className="font-medium">Progress Tracking</h4>
            <p className="text-gray-600">Monitor your learning journey and skill development</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;