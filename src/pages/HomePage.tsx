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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400 transition-colors duration-200">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  // Don't render the landing page if user is logged in (will redirect)
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 -mx-4 sm:-mx-6 lg:-mx-8 -my-8 transition-colors duration-200">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white text-3xl font-bold">🏥</span>
              </div>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 transition-colors duration-200">
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                Simuatech
              </span>
            </h1>

            <p className="text-2xl md:text-3xl text-gray-700 dark:text-gray-300 mb-4 font-light transition-colors duration-200">
              Where virtual patients build real clinicians
            </p>

            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto transition-colors duration-200">
              Simuatech will help you master clinical skills with AI-powered patient simulations.
              Practice, learn, and excel in a safe, interactive environment.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link
                to="/register"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Start Learning Free
              </Link>
              <Link
                to="/login"
                className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-8 py-4 rounded-lg text-lg font-semibold border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-white dark:bg-gray-800 py-16 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-200">
              How Simuatech Works
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto transition-colors duration-200">
              Follow these simple steps to start your clinical training journey
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-6 transition-colors duration-200">
                <span className="text-2xl">📝</span>
              </div>
              <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white transition-colors duration-200">
                1. Create Account
              </h3>
              <p className="text-gray-600 dark:text-gray-400 transition-colors duration-200 text-sm">
                Sign up for free and set up your learning profile. Choose your specialty and
                experience level.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6 transition-colors duration-200">
                <span className="text-2xl">🔍</span>
              </div>
              <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white transition-colors duration-200">
                2. Browse Cases
              </h3>
              <p className="text-gray-600 dark:text-gray-400 transition-colors duration-200 text-sm">
                Explore our library of patient cases organized by program area and specialty.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-6 transition-colors duration-200">
                <span className="text-2xl">💬</span>
              </div>
              <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white transition-colors duration-200">
                3. Start Chat
              </h3>
              <p className="text-gray-600 dark:text-gray-400 transition-colors duration-200 text-sm">
                Start chatting with the AI simulator. Ask questions, gather information, and conduct
                your examination.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-6 transition-colors duration-200">
                <span className="text-2xl">🩺</span>
              </div>
              <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white transition-colors duration-200">
                4. Add Diagnosis
              </h3>
              <p className="text-gray-600 dark:text-gray-400 transition-colors duration-200 text-sm">
                Based on your findings, provide your diagnosis before ending the session.
              </p>
            </div>
          </div>

          {/* Additional Steps */}
          <div className="grid md:grid-cols-2 gap-6 mt-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-6 transition-colors duration-200">
                <span className="text-2xl">⏹️</span>
              </div>
              <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white transition-colors duration-200">
                5. End Session
              </h3>
              <p className="text-gray-600 dark:text-gray-400 transition-colors duration-200 text-sm">
                Press the End button and wait for your comprehensive evaluation and performance
                feedback.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mx-auto mb-6 transition-colors duration-200">
                <span className="text-2xl">🔄</span>
              </div>
              <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white transition-colors duration-200">
                6. Choose Another
              </h3>
              <p className="text-gray-600 dark:text-gray-400 transition-colors duration-200 text-sm">
                Continue learning by choosing another case to further develop your clinical skills.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 dark:bg-gray-900 py-16 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-200">
              Why Choose Simuatech?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 transition-colors duration-200">
              Advanced features designed for effective clinical learning
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4 transition-colors duration-200">
                <span className="text-xl">🤖</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white transition-colors duration-200">
                AI-Powered Patients
              </h3>
              <p className="text-gray-600 dark:text-gray-400 transition-colors duration-200">
                Realistic patient interactions powered by advanced AI that responds naturally to
                your questions and examinations.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4 transition-colors duration-200">
                <span className="text-xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white transition-colors duration-200">
                Instant Feedback
              </h3>
              <p className="text-gray-600 dark:text-gray-400 transition-colors duration-200">
                Get immediate evaluation of your clinical reasoning, diagnostic skills, and patient
                communication.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4 transition-colors duration-200">
                <span className="text-xl">🎯</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white transition-colors duration-200">
                Multiple Specialties
              </h3>
              <p className="text-gray-600 dark:text-gray-400 transition-colors duration-200">
                Cases spanning General Surgery, Internal Medicine, Pediatrics, Reproductive Health,
                and more.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200">
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center mb-4 transition-colors duration-200">
                <span className="text-xl">📈</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white transition-colors duration-200">
                Progress Tracking
              </h3>
              <p className="text-gray-600 dark:text-gray-400 transition-colors duration-200">
                Monitor your learning journey with detailed analytics and performance metrics across
                different specialties.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center mb-4 transition-colors duration-200">
                <span className="text-xl">🏆</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white transition-colors duration-200">
                Leaderboards
              </h3>
              <p className="text-gray-600 dark:text-gray-400 transition-colors duration-200">
                Compete with peers, track your ranking, and stay motivated with gamified learning
                experiences.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center mb-4 transition-colors duration-200">
                <span className="text-xl">🔒</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white transition-colors duration-200">
                Safe Learning
              </h3>
              <p className="text-gray-600 dark:text-gray-400 transition-colors duration-200">
                Practice without consequences in a safe environment where mistakes become valuable
                learning opportunities.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Target Audience Section */}
      <div className="bg-white dark:bg-gray-800 py-16 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-200">
              Perfect For
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-8 rounded-lg border border-blue-200 dark:border-blue-800 transition-colors duration-200">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl">🎓</span>
              </div>
              <h3 className="text-2xl font-semibold text-center mb-4 text-gray-900 dark:text-white transition-colors duration-200">
                Medical Students
              </h3>
              <ul className="space-y-3 text-gray-700 dark:text-gray-300 transition-colors duration-200">
                <li className="flex items-start">
                  <span className="text-blue-500 dark:text-blue-400 mr-2">✓</span>
                  Practice patient interactions before clinical rotations
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 dark:text-blue-400 mr-2">✓</span>
                  Develop clinical reasoning skills safely
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 dark:text-blue-400 mr-2">✓</span>
                  Prepare for exams with realistic case scenarios
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 dark:text-blue-400 mr-2">✓</span>
                  Get instant feedback on diagnostic approaches
                </li>
              </ul>
              <div className="text-center mt-6">
                <Link
                  to="/register"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Start Learning
                </Link>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-8 rounded-lg border border-green-200 dark:border-green-800 transition-colors duration-200">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl">👨‍🏫</span>
              </div>
              <h3 className="text-2xl font-semibold text-center mb-4 text-gray-900 dark:text-white transition-colors duration-200">
                Educators & Clinicians
              </h3>
              <ul className="space-y-3 text-gray-700 dark:text-gray-300 transition-colors duration-200">
                <li className="flex items-start">
                  <span className="text-green-500 dark:text-green-400 mr-2">✓</span>
                  Monitor student progress and performance
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 dark:text-green-400 mr-2">✓</span>
                  Access detailed analytics and reports
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 dark:text-green-400 mr-2">✓</span>
                  Supplement traditional teaching methods
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 dark:text-green-400 mr-2">✓</span>
                  Contribute new cases and scenarios
                </li>
              </ul>
              <div className="text-center mt-6">
                <Link
                  to="/login"
                  className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 py-16 transition-colors duration-200">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Transform Your Clinical Skills?
          </h2>
          <p className="text-xl text-blue-100 dark:text-blue-200 mb-8 transition-colors duration-200">
            Join thousands of medical students and professionals already learning with Simuatech
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-white dark:bg-gray-100 text-blue-600 dark:text-blue-700 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-200 transition-colors shadow-lg"
            >
              Get Started Free
            </Link>
            <Link
              to="/login"
              className="bg-transparent text-white px-8 py-4 rounded-lg text-lg font-semibold border-2 border-white hover:bg-white hover:text-blue-600 dark:hover:text-blue-700 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
