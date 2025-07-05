import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, ApiError } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const RegistrationScreen: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username || !email || !password) {
      setError('All fields are required.');
      return;
    }

    // Basic email validation
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Invalid email format.');
      return;
    }

    try {
      const response = await api.post('/auth/register', { username, email, password });
      const { token, user } = response;

      login(token, user);

      navigate('/');
    } catch (err: any) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Registration failed. Please try again.');
      }
      console.error('Registration error:', err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <form onSubmit={handleRegister}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Register
            </button>
            <a
              href="/login"
              onClick={(e) => { e.preventDefault(); navigate('/login'); }}
              className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
            >
              Already have an account?
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegistrationScreen;