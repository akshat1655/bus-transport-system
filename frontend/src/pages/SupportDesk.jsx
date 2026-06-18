import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { MessageSquare, AlertCircle, Plus, CheckCircle, Clock, Send, Shield } from 'lucide-react';
import api from '../services/api';

export default function SupportDesk() {
  const { role, username } = useSelector(state => state.auth);
  const cleanRole = role ? role.replace('ROLE_', '') : '';
  const isAdmin = ['SUPER_ADMIN', 'BRANCH_ADMIN', 'OPERATOR'].includes(cleanRole);

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Ticket creation form
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('BOOKING_ISSUE');
  const [message, setMessage] = useState('');

  const fetchTickets = () => {
    setLoading(true);
    const endpoint = isAdmin ? '/api/support' : '/api/support/my';
    api.get(endpoint)
      .then(res => {
        setTickets(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch support tickets. Generating simulation data.');
        // Seed some mock support tickets in case database is empty or network fails
        generateMockTickets();
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTickets();
  }, [isAdmin]);

  const generateMockTickets = () => {
    const mock = [
      {
        id: 1,
        subject: 'Double charged on booking reference #BT-8821',
        category: 'PAYMENT_FAILURE',
        message: 'I tried to book a sleeper berth and the transaction failed first but my card was debited twice.',
        status: 'OPEN',
        user: { username: 'rakesh_sharma', email: 'rakesh@example.com' }
      },
      {
        id: 2,
        subject: 'Bus GPS tracking showing incorrect location coordinates',
        category: 'LIVE_TRACKING',
        message: 'The live tracking panel is showing the bus in Pune but it has already crossed Khandala.',
        status: 'RESOLVED',
        user: { username: 'amit_patel', email: 'amit@example.com' }
      }
    ];
    setTickets(mock);
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await api.post('/api/support', {
        subject,
        category,
        message,
        status: 'OPEN'
      });
      setSuccess('Your support request has been logged. Support operators will reply shortly.');
      setSubject('');
      setMessage('');
      fetchTickets();
    } catch (err) {
      setError(err.response?.data || 'Failed to submit support ticket.');
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await api.put(`/api/support/${id}/status?status=${newStatus}`);
      fetchTickets();
    } catch (err) {
      setError('Failed to update ticket status.');
    }
  };

  return (
    <div className="p-8 space-y-8 select-none">
      
      {/* 1. Header Banner */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white flex items-center gap-2">
          <MessageSquare className="w-8 h-8 text-brand-500" />
          <span>Support & Help Desk</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {isAdmin 
            ? 'Manage active customer tickets, dispatch updates, and monitor complaint metrics.'
            : 'Submit and track support requests for bookings, payments, cargo, or transport complaints.'}
        </p>
      </div>

      {error && (
        <div className="p-4 text-sm text-rose-500 bg-rose-50 border border-rose-200 rounded-xl">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 text-sm text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Form to log ticket (only show for non-admin customer roles) */}
        {!isAdmin && (
          <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border p-6 rounded-2xl shadow-sm h-fit">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
              <Plus className="w-5 h-5 text-brand-500" />
              <span>Log Support Ticket</span>
            </h2>

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Ticket Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-dark-border rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 dark:text-white"
                >
                  <option value="BOOKING_ISSUE">Ticket Booking Issue</option>
                  <option value="PAYMENT_FAILURE">Payment Gateway Failure</option>
                  <option value="LIVE_TRACKING">Live Tracking/GPS Issue</option>
                  <option value="CARGO_PARCEL">Cargo & Parcel Query</option>
                  <option value="OTHER_COMPLAINT">General Complaint</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Subject Summary</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Double payment debited for sleeper booking"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-dark-border rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 dark:text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Describe Issue</label>
                <textarea
                  required
                  placeholder="Provide details about your seat number, route details, transaction references etc."
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-dark-border rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 dark:text-white h-32 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl shadow-md transition-colors text-xs flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Submit Ticket</span>
              </button>
            </form>
          </div>
        )}

        {/* Tickets Grid list */}
        <div className={isAdmin ? 'lg:col-span-3 space-y-4' : 'lg:col-span-2 space-y-4'}>
          <div className="flex justify-between items-center bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border p-4 rounded-2xl shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">
              {isAdmin ? 'System-wide Support Log' : 'My Support Tickets'}
            </h2>
            <span className="text-xs font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full">
              {tickets.length} total
            </span>
          </div>

          {loading ? (
            <div className="text-center py-12 text-slate-500">Loading support log...</div>
          ) : tickets.length === 0 ? (
            <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border p-12 text-center rounded-2xl text-slate-400">
              No tickets recorded.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {tickets.map(t => (
                <div
                  key={t.id}
                  className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row justify-between gap-4 hover:shadow-premium dark:hover:shadow-premium-dark transition-all duration-200"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase tracking-wider font-mono">
                        #{t.id}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-50 text-brand-600 dark:bg-brand-950/30 dark:text-brand-400 capitalize">
                        {t.category.toLowerCase().replace(/_/g, ' ')}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                        t.status === 'RESOLVED'
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20'
                          : t.status === 'CLOSED'
                          ? 'bg-slate-100 text-slate-500'
                          : 'bg-rose-50 text-rose-500 dark:bg-rose-950/20 animate-pulse'
                      }`}>
                        {t.status === 'RESOLVED' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        <span>{t.status}</span>
                      </span>
                    </div>

                    <div>
                      <h4 className="font-extrabold text-slate-800 dark:text-white text-sm">{t.subject}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t.message}</p>
                    </div>

                    {isAdmin && t.user && (
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                        <Shield className="w-3 h-3 text-slate-300" />
                        <span>Logged by user: {t.user.username} ({t.user.email || 'N/A'})</span>
                      </div>
                    )}
                  </div>

                  {/* Actions for operators/admins */}
                  {isAdmin && (
                    <div className="flex sm:flex-col justify-end items-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-dark-border">
                      <span className="text-[10px] text-slate-400 hidden sm:block">Update Ticket State</span>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleUpdateStatus(t.id, 'RESOLVED')}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold transition-colors"
                        >
                          Resolve
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(t.id, 'CLOSED')}
                          className="px-3 py-1 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-[10px] font-bold transition-colors"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
