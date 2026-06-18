import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Calendar, ArrowUpRight, DollarSign, Download, Table } from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import api from '../services/api';

export default function Reports() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('MONTHLY');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/api/dashboard/metrics')
      .then(res => {
        setMetrics(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load transaction analytics metrics.');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Compiling financial ledgers...</div>;
  }

  const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b'];

  // Mock transactional ledger details
  const mockTransactions = [
    { txId: 'TXN-9021A', route: 'Bangalore to Mumbai', bus: 'KA-01-F-7733', seats: 2, amount: 2400.00, status: 'SETTLED', date: '2026-05-22' },
    { txId: 'TXN-8812B', route: 'Delhi to Jaipur', bus: 'DL-02-C-1299', seats: 1, amount: 650.00, status: 'SETTLED', date: '2026-05-22' },
    { txId: 'TXN-7619X', route: 'Mumbai to Pune', bus: 'MH-12-G-4455', seats: 4, amount: 1800.00, status: 'REFUNDED', date: '2026-05-21' },
    { txId: 'TXN-5510Z', route: 'Bangalore to Goa', bus: 'KA-03-M-2244', seats: 3, amount: 3600.00, status: 'SETTLED', date: '2026-05-21' }
  ];

  return (
    <div className="p-8 space-y-8 select-none">
      
      {/* 1. Header Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-8 h-8 text-brand-500" />
            <span>Reports & Financials</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Audit billing settlements, monthly load factors, and dynamic pricing yields.</p>
        </div>

        {/* Time filters */}
        <div className="flex items-center gap-2 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border p-1 rounded-xl shadow-sm">
          <button
            onClick={() => setTimeframe('WEEKLY')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${timeframe === 'WEEKLY' ? 'bg-brand-600 text-white' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
          >
            Weekly
          </button>
          <button
            onClick={() => setTimeframe('MONTHLY')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${timeframe === 'MONTHLY' ? 'bg-brand-600 text-white' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
          >
            Monthly
          </button>
          <button
            onClick={() => setTimeframe('YEARLY')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${timeframe === 'YEARLY' ? 'bg-brand-600 text-white' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
          >
            Yearly
          </button>
        </div>
      </div>

      {/* 2. Stat row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border p-5 rounded-2xl shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Gross Turnover</span>
          <div className="flex items-baseline gap-2 mt-1.5">
            <span className="text-2xl font-black text-slate-800 dark:text-white">Rs. {metrics?.totalRevenue.toFixed(2)}</span>
            <span className="text-xs text-emerald-500 font-bold flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" /> +14.2%
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border p-5 rounded-2xl shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Booked Seats</span>
          <div className="flex items-baseline gap-2 mt-1.5">
            <span className="text-2xl font-black text-slate-800 dark:text-white">{metrics?.totalBookings || 0}</span>
            <span className="text-xs text-emerald-500 font-bold flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" /> +8.5%
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border p-5 rounded-2xl shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Average Ticket Yield</span>
          <div className="flex items-baseline gap-2 mt-1.5">
            <span className="text-2xl font-black text-slate-800 dark:text-white">
              Rs. {metrics && metrics.totalBookings > 0 ? (metrics.totalRevenue / metrics.totalBookings).toFixed(2) : '550.00'}
            </span>
            <span className="text-xs text-brand-500 font-bold">Stable yield</span>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border p-5 rounded-2xl shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Seat Occupancy Factor</span>
          <div className="flex items-baseline gap-2 mt-1.5">
            <span className="text-2xl font-black text-slate-800 dark:text-white">{metrics?.seatOccupancyRate.toFixed(1)}%</span>
            <span className="text-xs text-blue-500 font-semibold">Optimal capacity</span>
          </div>
        </div>

      </div>

      {/* 3. Recharts graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Composed Chart: Revenue Area + Bookings Bar */}
        <div className="lg:col-span-2 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border p-6 rounded-2xl shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-base font-bold text-slate-800 dark:text-white">Revenue & Bookings Trend</h2>
            <button className="flex items-center gap-1 text-[11px] font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 px-2.5 py-1.5 rounded-lg">
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={metrics?.monthlyRevenueData} margin={{ top: 10, right: -5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                <Area type="monotone" name="Turnover (Rs)" dataKey="revenue" fill="#8b5cf6" fillOpacity={0.1} stroke="#8b5cf6" strokeWidth={3} />
                <Bar name="Bookings Count" dataKey="bookings" barSize={16} fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category distribution */}
        <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border p-6 rounded-2xl shadow-sm flex flex-col">
          <h2 className="text-base font-bold text-slate-800 dark:text-white mb-6">Revenue Share by Bus Class</h2>
          
          <div className="flex-1 h-60 flex justify-center items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metrics?.bookingDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={6}
                  dataKey="count"
                  nameKey="category"
                >
                  {metrics?.bookingDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 text-xs">
            {metrics?.bookingDistributionData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span className="font-medium text-slate-600 dark:text-slate-400">{item.category}</span>
                </div>
                <span className="font-bold text-slate-800 dark:text-white">{item.count} tickets</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 4. Ledger details table */}
      <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-dark-border flex justify-between items-center">
          <h2 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Table className="w-5 h-5 text-brand-500" />
            <span>Settled Bookings Log</span>
          </h2>
          <span className="text-xs text-slate-400 font-mono">Audit Trails</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-dark-border text-slate-400 font-semibold uppercase tracking-wider">
                <th className="p-4">Tx ID</th>
                <th className="p-4">Date</th>
                <th className="p-4">Route</th>
                <th className="p-4">Assigned Bus</th>
                <th className="p-4 text-center">Seats</th>
                <th className="p-4 text-right">Settled Amount</th>
                <th className="p-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {mockTransactions.map((tx, idx) => (
                <tr key={idx} className="border-b border-slate-100 dark:border-dark-border hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 font-bold text-slate-700 dark:text-slate-300 font-mono">{tx.txId}</td>
                  <td className="p-4 text-slate-500">{tx.date}</td>
                  <td className="p-4 font-semibold text-slate-800 dark:text-white">{tx.route}</td>
                  <td className="p-4 text-slate-600 dark:text-slate-400">{tx.bus}</td>
                  <td className="p-4 text-center font-bold">{tx.seats}</td>
                  <td className="p-4 text-right font-bold text-slate-800 dark:text-white">Rs. {tx.amount.toFixed(2)}</td>
                  <td className="p-4 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      tx.status === 'SETTLED'
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400'
                        : 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400'
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
