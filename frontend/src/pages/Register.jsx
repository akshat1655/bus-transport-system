import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, User, Phone, Briefcase } from 'lucide-react';
import api from '../services/api';

export default function Register() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('CUSTOMER');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await api.post('/api/auth/register', {
        username,
        email,
        phone,
        password,
        role
      });
      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-6 bg-slate-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(139,92,246,0.18),rgba(255,255,255,0))]">
      <div className="w-full max-w-md p-8 bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-premium-dark">
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-white">Create your account</h1>
          <p className="text-sm text-slate-400 mt-1">Start booking and managing trips today</p>
        </div>

        {/* Error notification */}
        {error && (
          <div className="flex items-center gap-3 p-4 mb-6 text-sm text-rose-400 bg-rose-950/20 border border-rose-900/50 rounded-2xl">
            <span>{error}</span>
          </div>
        )}

        {/* Success notification */}
        {success && (
          <div className="flex items-center gap-3 p-4 mb-6 text-sm text-emerald-400 bg-emerald-950/20 border border-emerald-900/50 rounded-2xl">
            <ShieldCheck className="w-5 h-5 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Username</label>
            <div className="relative">
              <User className="absolute left-4 top-3 w-5 h-5 text-slate-500" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose username"
                className="w-full pl-12 pr-4 py-2.5 bg-slate-950/50 border border-slate-800 focus:border-brand-500 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3 w-5 h-5 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                className="w-full pl-12 pr-4 py-2.5 bg-slate-950/50 border border-slate-800 focus:border-brand-500 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-4 top-3 w-5 h-5 text-slate-500" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter phone number"
                className="w-full pl-12 pr-4 py-2.5 bg-slate-950/50 border border-slate-800 focus:border-brand-500 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Role Type</label>
            <div className="relative">
              <Briefcase className="absolute left-4 top-3 w-5 h-5 text-slate-500" />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full pl-12 pr-4 py-2.5 bg-slate-950/50 border border-slate-800 focus:border-brand-500 rounded-2xl text-white focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all text-sm appearance-none"
              >
                <option value="CUSTOMER" className="bg-slate-900 text-white">Customer</option>
                <option value="AGENT" className="bg-slate-900 text-white">Agent Travels</option>
                <option value="DRIVER" className="bg-slate-900 text-white">Driver</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3 w-5 h-5 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create secure password"
                className="w-full pl-12 pr-4 py-2.5 bg-slate-950/50 border border-slate-800 focus:border-brand-500 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-4 bg-brand-600 hover:bg-brand-500 disabled:bg-brand-800 text-white font-semibold rounded-2xl shadow-lg transition-colors"
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">Sign In</Link>
        </div>
      </div>
    </div>
  );
}
