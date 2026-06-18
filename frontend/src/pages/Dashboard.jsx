import React, { useState, useEffect } from 'react';
import { Ticket, CreditCard, Users, Bus, AlertCircle } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import api from '../services/api';

export default function Dashboard() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/api/dashboard/metrics')
      .then(res => {
        setMetrics(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch dashboard metrics. Please check connection to APIs.');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading enterprise metrics...</div>;
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="flex items-center gap-3 p-4 text-sm text-rose-500 bg-rose-50 border border-rose-200 rounded-xl">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b'];

  return (
    <div className="p-8 space-y-8 select-none">
      
      {/* 1. Header Row */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white">Enterprise Dashboard</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Real-time revenue, seat bookings, and fleet logistics monitoring</p>
      </div>

      {/* 2. Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Bookings */}
        <div className="p-6 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl shadow-sm hover:shadow-premium dark:hover:shadow-premium-dark transition-all duration-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Bookings</span>
            <p className="text-3xl font-black text-slate-800 dark:text-white mt-1">{metrics.totalBookings}</p>
            <span className="text-[11px] text-emerald-500 font-bold mt-1 block">+12% vs last month</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center">
            <Ticket className="w-6 h-6" />
          </div>
        </div>

        {/* Revenue */}
        <div className="p-6 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl shadow-sm hover:shadow-premium dark:hover:shadow-premium-dark transition-all duration-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Revenue</span>
            <p className="text-3xl font-black text-slate-800 dark:text-white mt-1">Rs. {metrics.totalRevenue.toFixed(2)}</p>
            <span className="text-[11px] text-emerald-500 font-bold mt-1 block">+8.5% growth rate</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>

        {/* Occupancy */}
        <div className="p-6 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl shadow-sm hover:shadow-premium dark:hover:shadow-premium-dark transition-all duration-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Seat Occupancy</span>
            <p className="text-3xl font-black text-slate-800 dark:text-white mt-1">{metrics.seatOccupancyRate.toFixed(1)}%</p>
            <span className="text-[11px] text-blue-500 font-bold mt-1 block">Optimal load factor</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Active Buses */}
        <div className="p-6 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl shadow-sm hover:shadow-premium dark:hover:shadow-premium-dark transition-all duration-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Active Fleet</span>
            <p className="text-3xl font-black text-slate-800 dark:text-white mt-1">{metrics.activeBuses}</p>
            <span className="text-[11px] text-slate-500 font-bold mt-1 block">Buses in service</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Bus className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* 3. Recharts Graphics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Area chart - Monthly revenue */}
        <div className="lg:col-span-2 p-6 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Revenue Analysis & Booking Trends</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics.monthlyRevenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie / Donut Chart - booking categories */}
        <div className="p-6 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Distribution by Bus Class</h2>
          <div className="h-60 flex justify-center items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metrics.bookingDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="category"
                >
                  {metrics.bookingDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Custom legend */}
          <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
            {metrics.bookingDistributionData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded-md" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <span className="font-medium text-slate-600 dark:text-slate-400">{item.category} ({item.count})</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
