import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { loginSuccess } from '../store/authSlice';
import { ShieldAlert, LogIn, Lock, User, Eye, EyeOff } from 'lucide-react';
import api from '../services/api';

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/api/auth/login', { username, password });
      dispatch(loginSuccess(response.data));
      
      // Redirect based on role
      const userRole = response.data.role;
      if (userRole === 'CUSTOMER') {
        navigate('/');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data || 'Failed to authenticate user.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-6 bg-slate-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(139,92,246,0.18),rgba(255,255,255,0))]">
      <div className="w-full max-w-md p-8 bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-premium-dark">
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-violet-500 shadow-lg mb-4">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-1.1 0-2 .9-2 2v7h2m14 0c0 1.1-.9 2-2 2s-2-.9-2-2m-8 0c0 1.1-.9 2-2 2s-2-.9-2-2m5-7h3m-6 0h1m2 0V7m-4 10V6" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Welcome back</h1>
          <p className="text-sm text-slate-400 mt-1">Sign in to manage your transport journey</p>
        </div>

        {/* Error notification */}
        {error && (
          <div className="flex items-center gap-3 p-4 mb-6 text-sm text-rose-400 bg-rose-950/20 border border-rose-900/50 rounded-2xl">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Username</label>
            <div className="relative">
              <User className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username (e.g. superadmin)"
                className="w-full pl-12 pr-4 py-3 bg-slate-950/50 border border-slate-800 focus:border-brand-500 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all text-sm"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Password</label>
              <Link to="/forgot-password" className="text-xs text-brand-400 hover:text-brand-300 transition-colors">Forgot Password?</Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password (e.g. admin123)"
                className="w-full pl-12 pr-12 py-3 bg-slate-950/50 border border-slate-800 focus:border-brand-500 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3.5 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-brand-600 hover:bg-brand-500 disabled:bg-brand-800 text-white font-semibold rounded-2xl shadow-lg transition-colors"
          >
            {loading ? 'Logging in...' : (
              <>
                <LogIn className="w-5 h-5" />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">Register</Link>
        </div>

        {/* Demo Account quick hint */}
        <div className="mt-6 p-3 bg-slate-950/20 border border-slate-800/40 rounded-xl text-xs text-slate-400 space-y-1">
          <p className="font-semibold text-slate-300 text-center">Demo Accounts:</p>
          <div className="grid grid-cols-2 gap-1 text-[11px]">
            <div>Admin: <code className="text-brand-400">superadmin</code> / <code className="text-brand-400">admin123</code></div>
            <div>User: <code className="text-brand-400">customer_amit</code> / <code className="text-brand-400">customer123</code></div>
          </div>
        </div>
      </div>
    </div>
  );
}
