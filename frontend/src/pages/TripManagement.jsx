import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Edit2, Trash2, CheckCircle, ShieldAlert } from 'lucide-react';
import api from '../services/api';

export default function TripManagement() {
  const [trips, setTrips] = useState([]);
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [editingTrip, setEditingTrip] = useState(null);
  const [busId, setBusId] = useState('');
  const [routeId, setRouteId] = useState('');
  const [driverId, setDriverId] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [arrivalTime, setArrivalTime] = useState('');
  const [baseFare, setBaseFare] = useState(500.00);
  const [status, setStatus] = useState('SCHEDULED');
  const [recurringDays, setRecurringDays] = useState('MON,WED,FRI');
  const [newDriverName, setNewDriverName] = useState('');
  const [addingDriver, setAddingDriver] = useState(false);

  const getDriverDisplayName = (driver) => {
    if (!driver) return 'Unassigned';
    if (driver.name) return driver.name;
    const username = driver.username;
    if (!username) return 'Driver';
    
    let clean = username;
    if (username.startsWith('driver_')) {
      clean = username.substring(7);
    }
    return clean
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleAddDriver = async (e) => {
    e.preventDefault();
    if (!newDriverName.trim()) return;
    setAddingDriver(true);
    setError('');
    setSuccess('');

    try {
      const res = await api.post(`/api/auth/drivers?name=${encodeURIComponent(newDriverName.trim())}`);
      setSuccess(`Driver "${newDriverName.trim()}" registered successfully!`);
      setNewDriverName('');
      
      const driversRes = await api.get('/api/auth/drivers');
      setDrivers(driversRes.data);
      setDriverId(res.data.id.toString());
    } catch (err) {
      setError(err.response?.data || 'Failed to register new driver.');
    } finally {
      setAddingDriver(false);
    }
  };

  const fetchData = async () => {
    try {
      const [tripsRes, busesRes, routesRes, driversRes] = await Promise.all([
        api.get('/api/trips'),
        api.get('/api/buses'),
        api.get('/api/routes'),
        api.get('/api/auth/drivers')
      ]);

      setTrips(tripsRes.data);
      setBuses(busesRes.data.filter(b => b.status === 'ACTIVE'));
      setRoutes(routesRes.data.filter(r => r.active));
      setDrivers(driversRes.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch scheduling data parameters.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = (trip) => {
    setEditingTrip(trip);
    setBusId(trip.bus?.id || '');
    setRouteId(trip.route?.id || '');
    setDriverId(trip.driver?.id || '');
    setDepartureTime(trip.departureTime.substring(0, 16));
    setArrivalTime(trip.arrivalTime.substring(0, 16));
    setBaseFare(trip.baseFare);
    setStatus(trip.tripStatus);
    setRecurringDays(trip.recurringDays || 'MON,WED,FRI');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const payload = {
      bus: busId ? { id: parseInt(busId) } : null,
      route: { id: parseInt(routeId) },
      driver: driverId ? { id: parseInt(driverId) } : null,
      departureTime,
      arrivalTime,
      baseFare: parseFloat(baseFare) || 0.00,
      tripStatus: status,
      recurringDays
    };

    try {
      if (editingTrip) {
        await api.put(`/api/trips/${editingTrip.id}`, payload);
        setSuccess('Trip schedule updated successfully!');
      } else {
        await api.post('/api/trips', payload);
        setSuccess('New trip scheduled successfully!');
      }
      clearForm();
      fetchData();
    } catch (err) {
      setError(err.response?.data || 'Failed to save trip schedule details.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Cancel and delete this trip?')) return;
    try {
      await api.delete(`/api/trips/${id}`);
      setSuccess('Trip schedule deleted successfully!');
      fetchData();
    } catch (err) {
      setError('Could not delete trip schedule details.');
    }
  };

  const clearForm = () => {
    setEditingTrip(null);
    setBusId('');
    setRouteId('');
    setDriverId('');
    setDepartureTime('');
    setArrivalTime('');
    setBaseFare(500.00);
    setStatus('SCHEDULED');
    setRecurringDays('MON,WED,FRI');
  };

  return (
    <div className="p-8 space-y-8 select-none">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white">Trip Scheduling</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Deploy vehicles, drivers, and fare schedules onto registered route schedules</p>
      </div>

      {success && (
        <div className="p-4 text-sm text-emerald-500 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 text-sm text-rose-500 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2">
          <ShieldAlert className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Trip form editor */}
        <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border p-6 rounded-2xl shadow-sm h-fit">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-6">
            {editingTrip ? 'Modify Trip details' : 'Schedule Trip'}
          </h2>
          <form onSubmit={handleSave} className="space-y-4 text-sm">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Select Route</label>
              <select
                required
                value={routeId}
                onChange={e => setRouteId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-dark-border rounded-xl text-slate-800 dark:text-white focus:outline-none"
              >
                <option value="">-- Choose Route Map --</option>
                {routes.map(r => (
                  <option key={r.id} value={r.id}>{r.source} &rarr; {r.destination}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Assign Bus</label>
                <select
                  required
                  value={busId}
                  onChange={e => setBusId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-dark-border rounded-xl text-slate-800 dark:text-white focus:outline-none"
                >
                  <option value="">-- Choose Bus --</option>
                  {buses.map(b => (
                    <option key={b.id} value={b.id}>{b.busNumber} ({b.busType})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Assign Driver</label>
                <select
                  required
                  value={driverId}
                  onChange={e => setDriverId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-dark-border rounded-xl text-slate-800 dark:text-white focus:outline-none"
                >
                  <option value="">-- Choose Driver --</option>
                  {drivers.map(d => (
                    <option key={d.id} value={d.id}>{getDriverDisplayName(d)}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick add custom driver name */}
            <div className="p-3 bg-slate-50 dark:bg-slate-900/30 border border-slate-200/50 dark:border-dark-border rounded-2xl space-y-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Or Register New Driver</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Driver Full Name (e.g. Harish Yadav)"
                  value={newDriverName}
                  onChange={e => setNewDriverName(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-dark-border rounded-lg text-xs focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddDriver}
                  disabled={addingDriver}
                  className="px-3 py-1.5 bg-brand-50 hover:bg-brand-100 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 font-bold rounded-lg text-xs whitespace-nowrap transition-colors"
                >
                  {addingDriver ? 'Adding...' : '+ Add'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Departure</label>
                <input
                  type="datetime-local"
                  required
                  value={departureTime}
                  onChange={e => setDepartureTime(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-dark-border rounded-xl text-slate-800 dark:text-white focus:outline-none text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Arrival</label>
                <input
                  type="datetime-local"
                  required
                  value={arrivalTime}
                  onChange={e => setArrivalTime(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-dark-border rounded-xl text-slate-800 dark:text-white focus:outline-none text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Base Ticket Fare</label>
                <input
                  type="number"
                  required
                  value={baseFare}
                  onChange={e => setBaseFare(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-dark-border rounded-xl text-slate-800 dark:text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Status</label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-dark-border rounded-xl text-slate-800 dark:text-white focus:outline-none"
                >
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="RUNNING">Running</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="DELAYED">Delayed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Recurring Days</label>
              <input
                type="text"
                value={recurringDays}
                onChange={e => setRecurringDays(e.target.value)}
                placeholder="MON,TUE,WED,THU,FRI,SAT,SUN"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-dark-border rounded-xl text-slate-800 dark:text-white focus:outline-none"
              />
            </div>

            <div className="pt-4 flex gap-3">
              {editingTrip && (
                <button
                  type="button"
                  onClick={clearForm}
                  className="w-1/2 py-2.5 border border-slate-200 dark:border-dark-border rounded-xl text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className={`py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl shadow-md transition-colors ${
                  editingTrip ? 'w-1/2' : 'w-full'
                }`}
              >
                Confirm Schedule
              </button>
            </div>
          </form>
        </div>

        {/* Trips scheduled */}
        <div className="lg:col-span-2 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl shadow-sm overflow-hidden h-fit">
          <div className="px-6 py-5 border-b border-slate-100 dark:border-dark-border">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Active Runs Schedule</h2>
          </div>
          
          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading schedulers...</div>
          ) : trips.length === 0 ? (
            <div className="p-12 text-center text-slate-500">No active scheduled trips. Add one.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/30 text-slate-400 border-b border-slate-100 dark:border-dark-border">
                    <th className="px-6 py-3 font-semibold uppercase tracking-wider">Bus & Route Path</th>
                    <th className="px-6 py-3 font-semibold uppercase tracking-wider">Departure</th>
                    <th className="px-6 py-3 font-semibold uppercase tracking-wider">Fare</th>
                    <th className="px-6 py-3 font-semibold uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-dark-border/50">
                  {trips.map(trip => (
                    <tr key={trip.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 text-slate-700 dark:text-slate-300">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-white">
                          <span>{trip.bus?.busNumber}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-0.5">{trip.route?.source} &rarr; {trip.route?.destination}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span>{new Date(trip.departureTime).toLocaleDateString()}</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">{new Date(trip.departureTime).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-800 dark:text-white">Rs. {trip.baseFare}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          trip.tripStatus === 'SCHEDULED'
                            ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400'
                            : trip.tripStatus === 'RUNNING'
                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400'
                            : 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400'
                        }`}>
                          {trip.tripStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2.5">
                        <button
                          onClick={() => handleEdit(trip)}
                          className="p-1.5 text-slate-400 hover:text-brand-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(trip.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
