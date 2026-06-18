import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, ShieldCheck, Lock, Key } from 'lucide-react';
import api from '../services/api';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1); // 1 = Request OTP, 2 = Verify OTP & Reset
  const [simulatedOtp, setSimulatedOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post(`/api/auth/forgot-password?email=${email}`);
      setSimulatedOtp(response.data.otp);
      setSuccess('OTP code sent successfully (Simulated below)');
      setStep(2);
    } catch (err) {
      setError(err.response?.data || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await api.post(`/api/auth/verify-otp?email=${email}&otp=${otp}&newPassword=${newPassword}`);
      setSuccess('Password updated successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data || 'Reset failed. Invalid OTP code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-6 bg-slate-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(139,92,246,0.18),rgba(255,255,255,0))]">
      <div className="w-full max-w-md p-8 bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-premium-dark">
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-white">Reset Password</h1>
          <p className="text-sm text-slate-400 mt-1">Recover access to your operator terminal</p>
        </div>

        {error && (
          <div className="flex items-center gap-3 p-4 mb-6 text-sm text-rose-400 bg-rose-950/20 border border-rose-900/50 rounded-2xl">
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-3 p-4 mb-6 text-sm text-emerald-400 bg-emerald-950/20 border border-emerald-900/50 rounded-2xl">
            <ShieldCheck className="w-5 h-5 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleRequestOtp} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Registered Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email (e.g. admin@rajnibus.com)"
                  className="w-full pl-12 pr-4 py-3 bg-slate-950/50 border border-slate-800 focus:border-brand-500 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-brand-600 hover:bg-brand-500 disabled:bg-brand-800 text-white font-semibold rounded-2xl shadow-lg transition-colors"
            >
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-5">
            {/* Simulation banner */}
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-xs text-amber-300 flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Simulated SMS/Twilio OTP code: <strong className="text-white font-bold">{simulatedOtp}</strong></span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Enter OTP</label>
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="6-digit verification code"
                className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 focus:border-brand-500 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all text-sm text-center font-bold tracking-widest"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">New Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full pl-12 pr-4 py-3 bg-slate-950/50 border border-slate-800 focus:border-brand-500 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-brand-600 hover:bg-brand-500 disabled:bg-brand-800 text-white font-semibold rounded-2xl shadow-lg transition-colors"
            >
              {loading ? 'Resetting Password...' : 'Reset Password'}
            </button>
          </form>
        )}

        <div className="mt-8 text-center text-sm text-slate-500">
          Remember your password?{' '}
          <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">Sign In</Link>
        </div>
      </div>
    </div>
  );
}
