import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { logout } from '../store/authSlice';
import { Sun, Moon, Bell, LogOut, User, Wallet, Shield, Map, Bus } from 'lucide-react';
import api from '../services/api';

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { username, role } = useSelector((state) => state.auth);
  const [wallet, setWallet] = useState(0.00);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    // Check dark mode state
    if (document.documentElement.classList.contains('dark')) {
      setDark(true);
    }

    // Fetch wallet balance
    api.get('/api/auth/me')
      .then(res => setWallet(res.data.walletBalance))
      .catch(() => {});
  }, []);

  const toggleDarkMode = () => {
    if (dark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setDark(true);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-40 flex items-center justify-between h-16 px-6 bg-white border-b border-slate-200 dark:bg-dark-card dark:border-dark-border transition-colors duration-200">
      {/* Brand logo & tagline */}
      <div className="flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-violet-500 shadow-md group-hover:scale-105 transition-transform duration-200">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-1.1 0-2 .9-2 2v7h2m14 0c0 1.1-.9 2-2 2s-2-.9-2-2m-8 0c0 1.1-.9 2-2 2s-2-.9-2-2m5-7h3m-6 0h1m2 0V7m-4 10V6" />
            </svg>
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">Rajni Bus Service</span>
            <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] font-semibold text-brand-600 bg-brand-50 rounded-full dark:bg-brand-900/30 dark:text-brand-500 uppercase">
              Enterprise ERP
            </span>
          </div>
        </Link>
      </div>

      {/* Right side items */}
      <div className="flex items-center gap-4">
        {/* Wallet Balance widget */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg dark:bg-slate-800 border border-slate-200 dark:border-dark-border text-sm">
          <Wallet className="w-4 h-4 text-emerald-500" />
          <span className="font-semibold text-slate-700 dark:text-slate-200">Rs. {wallet.toFixed(2)}</span>
        </div>

        {/* Route Planning & Bus Fleet Quick Access for authorized roles */}
        {role && ['SUPER_ADMIN', 'OPERATOR'].includes(role.replace('ROLE_', '')) && (
          <div className="flex items-center gap-2 mr-1">
            <Link
              to="/dashboard/routes"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-lg dark:bg-brand-900/30 dark:text-brand-400 dark:hover:bg-brand-900/50 transition-colors border border-brand-200/50 dark:border-brand-800/50"
              title="Route Planning"
            >
              <Map className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Route Planning</span>
            </Link>
            <Link
              to="/dashboard/buses"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors border border-slate-200/50 dark:border-slate-700"
              title="Bus Fleet Management"
            >
              <Bus className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Bus Fleet</span>
            </Link>
          </div>
        )}

        {/* Dark Mode toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 text-slate-500 hover:text-brand-500 hover:bg-slate-100 rounded-lg dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-brand-500 transition-colors"
          title="Toggle Dark Mode"
        >
          {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Notifications mock */}
        <button className="relative p-2 text-slate-500 hover:text-brand-500 hover:bg-slate-100 rounded-lg dark:text-slate-400 dark:hover:bg-slate-800 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-ping" />
        </button>

        <div className="w-px h-6 bg-slate-200 dark:bg-dark-border" />

        {/* Logged in User dropdown mockup */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{username || 'Admin User'}</span>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 capitalize">{role?.replace('ROLE_', '').toLowerCase()}</span>
          </div>
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-brand-100 dark:bg-brand-900/50 text-brand-600 dark:text-brand-400 font-bold border border-brand-200 dark:border-brand-900">
            {username ? username.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
          </div>

          <button
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors"
            title="Log Out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </nav>
  );
}
