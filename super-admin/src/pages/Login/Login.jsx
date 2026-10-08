import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
  const [username, setUsername] = useState('rifu9617');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Pointing to your local backend for authentication
      const response = await axios.post('http://localhost:5000/api/v1/users/auth/login', {
        username,
        password
      }, {
        withCredentials: true // ensures cookies are sent/saved
      });
      
      if (response.data.success) {
        // Save auth state locally so it persists
        localStorage.setItem('admin_auth', JSON.stringify(response.data.data));
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check credentials or backend status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0D14] text-white font-sans">
      <div className="max-w-md w-full bg-[#111827] rounded-2xl shadow-2xl p-8 border border-gray-800">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-600/20 text-blue-500 mb-4">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Admin Access</h2>
          <p className="text-gray-400 mt-2 text-sm">Secure login to OwnShop Admin Panel</p>
        </div>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg p-3 mb-6 text-sm text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Username</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-[#0A0D14] border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-white transition-all"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-[#0A0D14] border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-white transition-all"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-4 rounded-xl transition-all disabled:opacity-50 mt-4 shadow-[0_0_15px_rgba(37,99,235,0.3)]"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
