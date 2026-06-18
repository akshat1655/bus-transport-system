import React, { useState, useEffect } from 'react';
import { Package, Search, MapPin, Scale, Plus, RefreshCw, CheckCircle2, QrCode } from 'lucide-react';
import api from '../services/api';

export default function CargoManagement() {
  const [parcels, setParcels] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [routesLoading, setRoutesLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Booking Form State
  const [routeId, setRouteId] = useState('');
  const [senderName, setSenderName] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [receiverName, setReceiverName] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  const [weightKg, setWeightKg] = useState(5);
  const [description, setDescription] = useState('');

  // Search/Filter State
  const [searchQuery, setSearchQuery] = useState('');

  const fetchParcels = () => {
    setLoading(true);
    api.get('/api/cargo')
      .then(res => {
        setParcels(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch cargo parcels inventory.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchParcels();

    // Fetch routes for dropdown select
    api.get('/api/routes')
      .then(res => {
        setRoutes(res.data);
        if (res.data.length > 0) {
          setRouteId(res.data[0].id);
        }
        setRoutesLoading(false);
      })
      .catch(() => {
        setError('Failed to load routes list.');
        setRoutesLoading(false);
      });
  }, []);

  const handleBookParcel = async (e) => {
    e.preventDefault();
    if (!routeId) {
      setError('Please select a valid shipping route.');
      return;
    }

    setError('');
    setSuccessMsg('');

    try {
      const response = await api.post('/api/cargo', {
        route: { id: parseInt(routeId) },
        senderName,
        senderPhone,
        receiverName,
        receiverPhone,
        weightKg: parseFloat(weightKg),
        description,
        status: 'BOOKED'
      });

      setSuccessMsg(`Parcel booked successfully! Tracking Barcode: ${response.data.barcode}`);
      
      // Clear form
      setSenderName('');
      setSenderPhone('');
      setReceiverName('');
      setReceiverPhone('');
      setWeightKg(5);
      setDescription('');

      // Refresh list
      fetchParcels();
    } catch (err) {
      setError(err.response?.data || 'Failed to dispatch parcel.');
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.put(`/api/cargo/${id}/status?status=${status}`);
      fetchParcels();
    } catch (err) {
      setError('Failed to update parcel status.');
    }
  };

  // Dynamic pricing calculation helper (matches backend pricing formula)
  const calculateEstimatedPrice = () => {
    return 150 + (weightKg * 25);
  };

  const filteredParcels = parcels.filter(p => 
    p.barcode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.senderName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.receiverName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 space-y-8 select-none">
      
      {/* 1. Header Banner */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white flex items-center gap-2">
          <Package className="w-8 h-8 text-brand-500" />
          <span>Cargo & Parcel Logistics</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Book intermediate shipment items, calculate freight weight metrics, and track parcel barcodes.</p>
      </div>

      {error && (
        <div className="p-4 text-sm text-rose-500 bg-rose-50 border border-rose-200 rounded-xl">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="p-4 text-sm text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Booking Form Layout */}
        <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border p-6 rounded-2xl shadow-sm h-fit">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
            <Plus className="w-5 h-5 text-brand-500" />
            <span>Book New Parcel</span>
          </h2>

          <form onSubmit={handleBookParcel} className="space-y-4">
            
            {/* Sender and receiver grid */}
            <div className="space-y-3">
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block border-b border-slate-100 dark:border-dark-border/40 pb-1">Sender Details</span>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Full Name"
                  value={senderName}
                  onChange={e => setSenderName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-dark-border rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 dark:text-white"
                />
                <input
                  type="text"
                  required
                  placeholder="Phone Number"
                  value={senderPhone}
                  onChange={e => setSenderPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-dark-border rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 dark:text-white"
                />
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block border-b border-slate-100 dark:border-dark-border/40 pb-1">Receiver Details</span>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Full Name"
                  value={receiverName}
                  onChange={e => setReceiverName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-dark-border rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 dark:text-white"
                />
                <input
                  type="text"
                  required
                  placeholder="Phone Number"
                  value={receiverPhone}
                  onChange={e => setReceiverPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-dark-border rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 dark:text-white"
                />
              </div>
            </div>

            {/* Route Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Shipping Route</label>
              <select
                value={routeId}
                onChange={e => setRouteId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-dark-border rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 dark:text-white"
              >
                {routesLoading ? (
                  <option>Loading routes...</option>
                ) : routes.length === 0 ? (
                  <option value="">No routes configured</option>
                ) : (
                  routes.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.source} &rarr; {r.destination} ({r.distanceKm} km)
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Description & Weight */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Parcel Weight (Kg)</label>
              <div className="flex gap-4 items-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-dark-border px-3.5 py-2 rounded-xl">
                <Scale className="w-5 h-5 text-slate-400" />
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={weightKg}
                  onChange={e => setWeightKg(parseInt(e.target.value))}
                  className="w-full accent-brand-600"
                />
                <span className="font-bold text-slate-700 dark:text-slate-200 text-sm w-12 text-right">{weightKg} Kg</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Parcel Description</label>
              <textarea
                required
                placeholder="Fragile items, electronics, documents, etc."
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-dark-border rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 dark:text-white h-20 resize-none"
              />
            </div>

            {/* Price Preview */}
            <div className="p-4 bg-brand-50/30 dark:bg-brand-950/10 border border-brand-100 dark:border-brand-900/40 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider">Estimated Freight Cost</span>
                <p className="text-xl font-black text-brand-700 dark:text-brand-300">Rs. {calculateEstimatedPrice().toFixed(2)}</p>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">150 Base + 25/Kg</span>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl shadow-md transition-colors text-xs"
            >
              Book & Dispatch Freight
            </button>
          </form>
        </div>

        {/* Cargo List Layout */}
        <div className="lg:col-span-2 space-y-4">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border p-4 rounded-2xl shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Active Cargo Consignments</h2>
            
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Barcode or customer..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-dark-border rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 dark:text-white"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12 text-slate-500">Loading cargo parcel list...</div>
          ) : filteredParcels.length === 0 ? (
            <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border p-12 text-center rounded-2xl text-slate-400">
              No parcel matching search query. Book a new parcel to populate.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredParcels.map(p => (
                <div
                  key={p.id}
                  className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border p-5 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between gap-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-0.5 rounded bg-brand-50 dark:bg-brand-950/30 text-brand-600 dark:text-brand-400 text-[10px] font-bold font-mono tracking-wider">
                        {p.barcode}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        p.status === 'DELIVERED'
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400'
                          : p.status === 'IN_TRANSIT'
                          ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400'
                          : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                      }`}>
                        {p.status}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-white text-sm">{p.description}</h4>
                      <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-300" />
                        <span>Route: {p.route?.source} &rarr; {p.route?.destination}</span>
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-xs pt-1 border-t border-slate-50 dark:border-dark-border/40">
                      <div>
                        <span className="text-slate-400 text-[10px]">Sender:</span>
                        <p className="font-semibold text-slate-700 dark:text-slate-300 mt-0.5">{p.senderName} ({p.senderPhone})</p>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px]">Recipient:</span>
                        <p className="font-semibold text-slate-700 dark:text-slate-300 mt-0.5">{p.receiverName} ({p.receiverPhone})</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row md:flex-col justify-between items-end shrink-0 pt-2 border-t md:border-t-0 border-slate-100 dark:border-dark-border">
                    <div className="text-right">
                      <span className="text-slate-400 text-[10px] block">Freight Charges</span>
                      <p className="text-lg font-black text-slate-800 dark:text-white">Rs. {p.price ? parseFloat(p.price).toFixed(2) : '0.00'}</p>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Weight: {p.weightKg} Kg</span>
                    </div>

                    {/* Operational controls for statuses */}
                    <div className="mt-3">
                      <select
                        value={p.status}
                        onChange={e => handleUpdateStatus(p.id, e.target.value)}
                        className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-dark-border rounded-lg text-[10px] font-bold text-slate-600 dark:text-slate-300 focus:outline-none"
                      >
                        <option value="BOOKED">BOOKED</option>
                        <option value="IN_TRANSIT">IN TRANSIT</option>
                        <option value="DELIVERED">DELIVERED</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
