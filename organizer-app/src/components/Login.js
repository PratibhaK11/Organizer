import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { subscribeUser } from '../utils/subscribe';

const Login = () => {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Clear cookies when the component mounts
    const clearCookies = async () => {
      try {
        await fetch('/api/clear-cookies', { method: 'POST', credentials: 'include' });
      } catch (err) {
        console.error('Error clearing cookies:', err);
      }
    };
    clearCookies();
  }, []);

  const validateForm = () => {
    if (!email || !password) {
      return 'Please enter both email and password';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      await subscribeUser();
      navigate('/tasks');
    } catch (err) {
      setError(err.response ? err.response.data : 'Login failed. Please try again.');
      console.error('Login error:', err.response ? err.response.data : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="max-w-sm w-full bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-3xl font-semibold text-gray-800 mb-8">Login</h2>
        {error && (
          <div className="bg-red-100 text-red-800 border border-red-300 rounded p-4 mb-6">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-gray-700 font-medium mb-2">Email</label>
            <input
              type="email"
              id="email"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-gray-700 font-medium mb-2">Password</label>
            <input
              type="password"
              id="password"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className={`w-full text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300 ease-in-out ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            style={{ backgroundColor: 'black' }}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

        </form>
        <p className="text-center text-gray-600 mt-6">
          Don't have an account?{' '}
          <a href="/register" className="text-blue-600 hover:underline">
            Register here
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
