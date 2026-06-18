import React, { useState, useEffect } from 'react';
import { Bus, Plus, Edit2, Trash2, ShieldAlert, CheckCircle, Sliders } from 'lucide-react';
import api from '../services/api';

export default function BusManagement() {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [editingBus, setEditingBus] = useState(null);
  const [busNumber, setBusNumber] = useState('');
  const [busType, setBusType] = useState('AC_SLEEPER');
  const [capacity, setCapacity] = useState(30);
  const [amenities, setAmenities] = useState('WiFi,Charging Port,Water Bottle,Blanket');
  const [status, setStatus] = useState('ACTIVE');
  const [showDesigner, setShowDesigner] = useState(false);
  const [designedSeats, setDesignedSeats] = useState([]); // Layout editor matrix

  const fetchBuses = async () => {
    try {
      const res = await api.get('/api/buses');
      setBuses(res.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch buses.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuses();
  }, []);

  const handleEdit = (bus) => {
    setEditingBus(bus);
    setBusNumber(bus.busNumber);
    setBusType(bus.busType);
    setCapacity(bus.capacity);
    setAmenities(bus.amenities);
    setStatus(bus.status);
    
    // Set seat layout
    if (bus.seatLayoutJson) {
      try {
        setDesignedSeats(JSON.parse(bus.seatLayoutJson));
      } catch (e) {
        setDesignedSeats([]);
      }
    } else {
      setDesignedSeats([]);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const payload = {
      busNumber,
      busType,
      capacity,
      amenities,
      status,
      seatLayoutJson: designedSeats.length > 0 ? JSON.stringify(designedSeats) : null
    };

    try {
      if (editingBus) {
        await api.put(`/api/buses/${editingBus.id}`, payload);
        setSuccess('Bus updated successfully!');
      } else {
        await api.post('/api/buses', payload);
        setSuccess('New bus added to fleet!');
      }
      clearForm();
      fetchBuses();
    } catch (err) {
      setError(err.response?.data || 'Failed to save bus record.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this bus from logs?')) return;
    try {
      await api.delete(`/api/buses/${id}`);
      setSuccess('Bus deleted successfully!');
      fetchBuses();
    } catch (err) {
      setError('Could not delete bus. It might be assigned to scheduled trips.');
    }
  };

  const clearForm = () => {
    setEditingBus(null);
    setBusNumber('');
    setBusType('AC_SLEEPER');
    setCapacity(30);
    setAmenities('WiFi,Charging Port,Water Bottle,Blanket');
    setStatus('ACTIVE');
    setDesignedSeats([]);
    setShowDesigner(false);
  };

  // Seat Layout Designer logic (generates 6x5 matrix grid layout coordinates)
  const openLayoutDesigner = () => {
    if (designedSeats.length === 0) {
      const generated = [];
      for (let r = 1; r <= 6; r++) {
        for (let c = 1; c <= 5; c++) {
          if (c === 3) continue; // aisle corridor
          generated.push({
            id: `${r}${String.fromCharCode(64 + c)}`,
            row: r,
            col: c,
            type: busType.includes('SLEEPER') ? 'SLEEPER' : 'SEATER',
            tier: 'LOWER',
            status: 'AVAILABLE'
          });
        }
      }
      setDesignedSeats(generated);
    }
    setShowDesigner(true);
  };

  const toggleSeatType = (index) => {
    const updated = [...designedSeats];
    updated[index].type = updated[index].type === 'SEATER' ? 'SLEEPER' : 'SEATER';
    setDesignedSeats(updated);
  };

  return (
    <div className="p-8 space-y-8 select-none">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white">Bus Fleet Management</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Configure vehicle inventory, capacities, amenities, and seating matrices</p>
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
        
        {/* Editor Form */}
        <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border p-6 rounded-2xl shadow-sm h-fit">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-6">
            {editingBus ? 'Edit Vehicle details' : 'Add New Bus'}
          </h2>
          <form onSubmit={handleSave} className="space-y-4 text-sm">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Bus Number</label>
              <input
                type="text"
                required
                value={busNumber}
                onChange={e => setBusNumber(e.target.value)}
                placeholder="e.g. KA-01-F-1234"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-dark-border rounded-xl text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Bus Type</label>
                <select
                  value={busType}
                  onChange={e => setBusType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-dark-border rounded-xl text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                >
                  <option value="AC_SLEEPER">AC Sleeper</option>
                  <option value="AC_SEATER">AC Seater</option>
                  <option value="NON_AC_SLEEPER">Non-AC Sleeper</option>
                  <option value="NON_AC_SEATER">Non-AC Seater</option>
                  <option value="VOLVO_CLASSIC">Volvo Classic</option>
                  <option value="SEMI_SLEEPER">Semi Sleeper</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Total Capacity</label>
                <input
                  type="number"
                  required
                  value={capacity}
                  onChange={e => setCapacity(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-dark-border rounded-xl text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Amenities</label>
              <input
                type="text"
                value={amenities}
                onChange={e => setAmenities(e.target.value)}
                placeholder="WiFi, Charging, Blankets, GPS"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-dark-border rounded-xl text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Service Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-dark-border rounded-xl text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="ACTIVE">Active (In Service)</option>
                <option value="MAINTENANCE">Maintenance</option>
                <option value="IN_SERVICE">Out of Service</option>
              </select>
            </div>

            {/* Layout designer triggers */}
            <div className="pt-2">
              <button
                type="button"
                onClick={openLayoutDesigner}
                className="w-full flex items-center justify-center gap-1.5 py-2 border border-brand-500 text-brand-600 dark:text-brand-400 font-semibold rounded-xl hover:bg-brand-50/10 transition-colors"
              >
                <Sliders className="w-4 h-4" />
                <span>Configure Seat Matrix</span>
              </button>
            </div>

            {/* Submit keys */}
            <div className="pt-4 flex gap-3">
              {editingBus && (
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
                  editingBus ? 'w-1/2' : 'w-full'
                }`}
              >
                Save Vehicle
              </button>
            </div>
          </form>
        </div>

        {/* Fleet table list / Seat designer layout */}
        <div className="lg:col-span-2 space-y-6">
          
          {showDesigner ? (
            // Interactive Seat Designer
            <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border p-6 rounded-2xl shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-slate-800 dark:text-white">Seat Layout Designer</h2>
                <button
                  onClick={() => setShowDesigner(false)}
                  className="text-xs text-brand-500 font-semibold"
                >
                  Back to Fleet List
                </button>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                Click on any seat to toggle its category between Seater (grey chair) and Sleeper (purple berth). Aisle corridor remains unallocated.
              </p>
              
              <div className="flex justify-center p-6 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-200/50">
                <div className="grid grid-cols-5 gap-3">
                  {designedSeats.map((seat, index) => (
                    <button
                      key={seat.id}
                      onClick={() => toggleSeatType(index)}
                      className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-bold text-[10px] transition-all border ${
                        seat.type === 'SLEEPER'
                          ? 'bg-brand-600 border-brand-700 text-white shadow-md'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-dark-border text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      <span>{seat.id}</span>
                      <span className="text-[7px] uppercase mt-0.5 opacity-80">{seat.type.toLowerCase()}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowDesigner(false)}
                  className="py-2 px-4 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl text-xs"
                >
                  Save Layout Config
                </button>
              </div>
            </div>
          ) : (
            // Fleet table List
            <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 dark:border-dark-border">
                <h2 className="text-lg font-bold text-slate-800 dark:text-white">Fleet Inventory</h2>
              </div>
              
              {loading ? (
                <div className="p-8 text-center text-slate-500">Loading buses...</div>
              ) : buses.length === 0 ? (
                <div className="p-12 text-center text-slate-500">No buses found in active database registries. Add one.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-900/30 text-slate-400 border-b border-slate-100 dark:border-dark-border">
                        <th className="px-6 py-3 font-semibold uppercase tracking-wider">Bus Number</th>
                        <th className="px-6 py-3 font-semibold uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 font-semibold uppercase tracking-wider">Seats</th>
                        <th className="px-6 py-3 font-semibold uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-dark-border/50">
                      {buses.map(bus => (
                        <tr key={bus.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 text-slate-700 dark:text-slate-300">
                          <td className="px-6 py-4 font-bold text-slate-800 dark:text-white">{bus.busNumber}</td>
                          <td className="px-6 py-4 capitalize">{bus.busType.toLowerCase().replace(/_/g, ' ')}</td>
                          <td className="px-6 py-4">{bus.capacity} seats</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              bus.status === 'ACTIVE'
                                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400'
                                : 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400'
                            }`}>
                              {bus.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right flex justify-end gap-2.5">
                            <button
                              onClick={() => handleEdit(bus)}
                              className="p-1.5 text-slate-400 hover:text-brand-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(bus.id)}
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
          )}

        </div>
      </div>
    </div>
  );
}
