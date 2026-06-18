import React, { useState, useEffect } from 'react';
import { Map, Plus, Edit2, Trash2, CheckCircle, ShieldAlert, Navigation } from 'lucide-react';
import api from '../services/api';

export default function RouteManagement() {
  const [routes, setRoutes] = useState(() => {
    const local = localStorage.getItem('routes');
    return local ? JSON.parse(local) : [];
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [editingRoute, setEditingRoute] = useState(null);
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [distanceKm, setDistanceKm] = useState(250);
  const [durationMinutes, setDurationMinutes] = useState(300);
  const [active, setActive] = useState(true);
  
  // Stops editor states
  const [stops, setStops] = useState([]); // List of { stopName, stopSequence, arrivalTimeOffset, fareOffset }
  const [stopName, setStopName] = useState('');
  const [arrivalTimeOffset, setArrivalTimeOffset] = useState(60);
  const [fareOffset, setFareOffset] = useState(100.00);

  const fetchRoutes = async () => {
    try {
      const res = await api.get('/api/routes');
      setRoutes(res.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch routes.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  useEffect(() => {
    if (routes) {
      localStorage.setItem('routes', JSON.stringify(routes));
    }
  }, [routes]);

  const handleEdit = (route) => {
    setEditingRoute(route);
    setSource(route.source);
    setDestination(route.destination);
    setDistanceKm(route.distanceKm);
    setDurationMinutes(route.durationMinutes);
    setActive(route.active);
    setStops(route.stops || []);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Ensure sequences are clean
    const formattedStops = stops.map((s, idx) => ({
      ...s,
      stopSequence: idx + 1
    }));

    const payload = {
      source,
      destination,
      distanceKm,
      durationMinutes,
      active,
      stops: formattedStops
    };

    try {
      if (editingRoute) {
        const response = await api.put(`/api/routes/${editingRoute.id}`, payload);
        setSuccess('Route details updated successfully!');
        localStorage.setItem('last_saved_route', JSON.stringify(response.data));
      } else {
        const response = await api.post('/api/routes', payload);
        setSuccess('New route mapped to registry!');
        localStorage.setItem('last_saved_route', JSON.stringify(response.data));
      }
      clearForm();
      fetchRoutes();
    } catch (err) {
      setError(err.response?.data || 'Failed to save route layout.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this route map?')) return;
    try {
      await api.delete(`/api/routes/${id}`);
      setSuccess('Route deleted successfully!');
      fetchRoutes();
    } catch (err) {
      setError('Could not delete route. Check if scheduled trips depend on it.');
    }
  };

  const addStop = () => {
    if (!stopName) return;
    const newStop = {
      stopName,
      stopSequence: stops.length + 1,
      arrivalTimeOffset: parseInt(arrivalTimeOffset) || 0,
      fareOffset: parseFloat(fareOffset) || 0.00
    };
    setStops([...stops, newStop]);
    setStopName('');
    setArrivalTimeOffset(60);
    setFareOffset(100.00);
  };

  const removeStop = (index) => {
    setStops(stops.filter((_, idx) => idx !== index));
  };

  const clearForm = () => {
    setEditingRoute(null);
    setSource('');
    setDestination('');
    setDistanceKm(250);
    setDurationMinutes(300);
    setActive(true);
    setStops([]);
    setStopName('');
  };

  return (
    <div className="p-8 space-y-8 select-none">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white">Route Planning</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Configure sources, destinations, distances, and intermediate stop sequence intervals</p>
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
        
        {/* Route edit form */}
        <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border p-6 rounded-2xl shadow-sm h-fit space-y-6">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">
            {editingRoute ? 'Edit Route Map' : 'New Route Setup'}
          </h2>
          <form onSubmit={handleSave} className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Origin</label>
                <input
                  type="text"
                  required
                  value={source}
                  onChange={e => setSource(e.target.value)}
                  placeholder="e.g. Bangalore"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-dark-border rounded-xl text-slate-800 dark:text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Destination</label>
                <input
                  type="text"
                  required
                  value={destination}
                  onChange={e => setDestination(e.target.value)}
                  placeholder="e.g. Pune"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-dark-border rounded-xl text-slate-800 dark:text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Distance (KM)</label>
                <input
                  type="number"
                  required
                  value={distanceKm}
                  onChange={e => setDistanceKm(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-dark-border rounded-xl text-slate-800 dark:text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Duration (Min)</label>
                <input
                  type="number"
                  required
                  value={durationMinutes}
                  onChange={e => setDurationMinutes(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-dark-border rounded-xl text-slate-800 dark:text-white focus:outline-none"
                />
              </div>
            </div>

            {/* Stops list editor */}
            <div className="border-t border-slate-100 dark:border-dark-border pt-4 space-y-4">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Intermediate Boarding Stops</label>
              
              <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-900/30 rounded-2xl border border-slate-200/50 dark:border-dark-border/40">
                <input
                  type="text"
                  placeholder="Stop Name (e.g. Hubli)"
                  value={stopName}
                  onChange={e => setStopName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-dark-border rounded-lg text-xs focus:outline-none"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Offset Mins"
                    value={arrivalTimeOffset}
                    onChange={e => setArrivalTimeOffset(parseInt(e.target.value) || '')}
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-dark-border rounded-lg text-xs focus:outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Fare Offset"
                    value={fareOffset}
                    onChange={e => setFareOffset(parseFloat(e.target.value) || '')}
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-dark-border rounded-lg text-xs focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={addStop}
                  className="w-full flex items-center justify-center gap-1 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400 font-bold rounded-lg text-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Stop</span>
                </button>
              </div>

              {/* Display added stops */}
              {stops.length > 0 && (
                <div className="space-y-2">
                  {stops.map((s, idx) => (
                    <div key={idx} className="flex justify-between items-center px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-dark-border/40">
                      <div>
                        <span className="font-bold text-[10px] text-brand-600 mr-2">#{idx+1}</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{s.stopName}</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">+{s.arrivalTimeOffset} mins | +Rs. {s.fareOffset}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeStop(idx)}
                        className="text-rose-500 hover:text-rose-600 font-bold px-1"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 flex gap-3">
              {editingRoute && (
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
                  editingRoute ? 'w-1/2' : 'w-full'
                }`}
              >
                Save Route Details
              </button>
            </div>
          </form>
        </div>

        {/* Route lists */}
        <div className="lg:col-span-2 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl shadow-sm overflow-hidden h-fit">
          <div className="px-6 py-5 border-b border-slate-100 dark:border-dark-border">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Active Route Mappings</h2>
          </div>
          
          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading mapped pathways...</div>
          ) : routes.length === 0 ? (
            <div className="p-12 text-center text-slate-500">No routes registered. Set one up.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/30 text-slate-400 border-b border-slate-100 dark:border-dark-border">
                    <th className="px-6 py-3 font-semibold uppercase tracking-wider">Path (Origin - Terminus)</th>
                    <th className="px-6 py-3 font-semibold uppercase tracking-wider">Distance</th>
                    <th className="px-6 py-3 font-semibold uppercase tracking-wider">Stops</th>
                    <th className="px-6 py-3 font-semibold uppercase tracking-wider">Avg Time</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-dark-border/50">
                  {routes.map(route => (
                    <tr key={route.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 text-slate-700 dark:text-slate-300">
                      <td className="px-6 py-4 flex items-center gap-2">
                        <Navigation className="w-4 h-4 text-brand-500" />
                        <span className="font-bold text-slate-800 dark:text-white">{route.source} &rarr; {route.destination}</span>
                      </td>
                      <td className="px-6 py-4">{route.distanceKm} km</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full text-[10px] font-bold">
                          {route.stops ? route.stops.length : 0} stops
                        </span>
                      </td>
                      <td className="px-6 py-4">{(route.durationMinutes / 60).toFixed(1)} hrs</td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2.5">
                        <button
                          onClick={() => handleEdit(route)}
                          className="p-1.5 text-slate-400 hover:text-brand-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(route.id)}
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
