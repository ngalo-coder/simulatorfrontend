import React from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">
        Virtual Patient Simulation Platform
      </h1>
      <p className="text-xl text-gray-600 mb-8">
        Practice clinical skills with AI-powered virtual patients
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