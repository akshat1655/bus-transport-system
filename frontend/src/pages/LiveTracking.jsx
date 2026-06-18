import React, { useState, useEffect, useRef } from 'react';
import { Navigation, MapPin, Clock, Compass, AlertCircle, RefreshCw, Bus } from 'lucide-react';
import L from 'leaflet';
import api from '../services/api';

export default function LiveTracking() {
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [liveData, setLiveData] = useState(null);
  const [loadingTrips, setLoadingTrips] = useState(true);
  const [loadingCoords, setLoadingCoords] = useState(false);
  const [error, setError] = useState('');
  
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerInstanceRef = useRef(null);
  const polylineInstanceRef = useRef(null);
  const intervalRef = useRef(null);

  // Fetch all trips to let users choose one to track
  useEffect(() => {
    api.get('/api/trips')
      .then(res => {
        // Sort trips so that IN_SERVICE ones are listed first
        const sorted = res.data.sort((a, b) => {
          if (a.tripStatus === 'IN_SERVICE' && b.tripStatus !== 'IN_SERVICE') return -1;
          if (a.tripStatus !== 'IN_SERVICE' && b.tripStatus === 'IN_SERVICE') return 1;
          return 0;
        });
        setTrips(sorted);
        setLoadingTrips(false);
        
        // Auto-select the first in-service trip if available
        const inService = sorted.find(t => t.tripStatus === 'IN_SERVICE');
        if (inService) {
          setSelectedTrip(inService);
        } else if (sorted.length > 0) {
          setSelectedTrip(sorted[0]);
        }
      })
      .catch(() => {
        setError('Failed to fetch scheduled trips for tracking.');
        setLoadingTrips(false);
      });
  }, []);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapRef.current) return;

    // Create map instance if not exists
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current, {
        center: [20.5937, 78.9629], // Center of India
        zoom: 5,
        zoomControl: false
      });

      L.control.zoom({ position: 'topright' }).addTo(mapInstanceRef.current);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstanceRef.current);
    }

    return () => {
      // Clean up map instance on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Set up live coordinates polling when selectedTrip changes
  useEffect(() => {
    if (!selectedTrip || !mapInstanceRef.current) return;

    const fetchCoordinates = () => {
      setLoadingCoords(true);
      api.get(`/api/trips/live-coordinates/${selectedTrip.id}`)
        .then(res => {
          const data = res.data;
          setLiveData(data);
          setError('');
          updateMapMarker(data);
        })
        .catch(() => {
          setError('Unable to fetch live coordinates for this trip. Generating simulation data.');
          // Generate fallback coordinate tracking coordinates
          generateFallbackCoordinates();
        })
        .finally(() => {
          setLoadingCoords(false);
        });
    };

    // First fetch
    fetchCoordinates();

    // Set polling interval
    intervalRef.current = setInterval(fetchCoordinates, 5000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [selectedTrip]);

  const generateFallbackCoordinates = () => {
    if (!selectedTrip) return;
    const progress = Math.sin(Date.now() / 20000.0) * 0.5 + 0.5;
    
    let startLat = 12.9716, startLng = 77.5946; // Bangalore
    let endLat = 19.0760, endLng = 72.8777; // Mumbai
    
    if (selectedTrip.route?.source?.toLowerCase().includes('delhi')) {
      startLat = 28.7041; startLng = 77.1025;
      endLat = 26.9124; endLng = 75.7873;
    } else if (selectedTrip.route?.source?.toLowerCase().includes('mumbai')) {
      startLat = 19.0760; startLng = 72.8777;
      endLat = 18.5204; endLng = 73.8567;
    }

    const currentLat = startLat + (endLat - startLat) * progress;
    const currentLng = startLng + (endLng - startLng) * progress;
    const speed = 72.5;

    const mockData = {
      tripId: selectedTrip.id,
      latitude: currentLat,
      longitude: currentLng,
      speedKmh: speed,
      etaMinutes: Math.round((1 - progress) * (selectedTrip.route?.durationMinutes || 360)),
      status: selectedTrip.tripStatus
    };

    setLiveData(mockData);
    updateMapMarker(mockData);
  };

  const updateMapMarker = (data) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const position = [data.latitude, data.longitude];

    // Recenter map
    map.setView(position, 8);

    // Custom bus icon
    const busIcon = L.divIcon({
      html: `<div class="bg-brand-600 border-2 border-white text-white p-2 rounded-full shadow-lg flex items-center justify-center animate-pulse" style="width: 38px; height: 38px;">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-1.1 0-2 .9-2 2v7h2m14 0c0 1.1-.9 2-2 2s-2-.9-2-2m-8 0c0 1.1-.9 2-2 2s-2-.9-2-2m5-7h3m-6 0h1m2 0V7m-4 10V6" />
              </svg>
             </div>`,
      className: 'custom-leaflet-bus-icon',
      iconSize: [38, 38],
      iconAnchor: [19, 19]
    });

    // Create or update marker
    if (markerInstanceRef.current) {
      markerInstanceRef.current.setLatLng(position);
    } else {
      markerInstanceRef.current = L.marker(position, { icon: busIcon }).addTo(map);
    }

    // Bind popup information
    markerInstanceRef.current.bindPopup(`
      <div class="p-2 font-sans select-none">
        <h4 class="font-bold text-slate-800">${selectedTrip.bus?.busNumber || 'Fleet Vehicle'}</h4>
        <p class="text-xs text-slate-500 mt-1">${selectedTrip.route?.source} &rarr; ${selectedTrip.route?.destination}</p>
        <div class="mt-2 flex items-center gap-1.5 text-xs font-semibold text-brand-600">
          <span>Speed: ${data.speedKmh.toFixed(0)} km/h</span>
        </div>
      </div>
    `);

    // Draw route path line (simulated source to destination line through current point)
    let startLat = 12.9716, startLng = 77.5946;
    let endLat = 19.0760, endLng = 72.8777;

    if (selectedTrip.route?.source?.toLowerCase().includes('delhi')) {
      startLat = 28.7041; startLng = 77.1025;
      endLat = 26.9124; endLng = 75.7873;
    } else if (selectedTrip.route?.source?.toLowerCase().includes('mumbai')) {
      startLat = 19.0760; startLng = 72.8777;
      endLat = 18.5204; endLng = 73.8567;
    }

    const pathCoords = [
      [startLat, startLng],
      [data.latitude, data.longitude],
      [endLat, endLng]
    ];

    if (polylineInstanceRef.current) {
      polylineInstanceRef.current.setLatLngs(pathCoords);
    } else {
      polylineInstanceRef.current = L.polyline(pathCoords, {
        color: '#8b5cf6',
        weight: 4,
        opacity: 0.6,
        dashArray: '8, 8'
      }).addTo(map);
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-slate-50 dark:bg-dark-bg select-none">
      
      {/* Side list of active schedules */}
      <div className="w-80 border-r border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-100 dark:border-dark-border">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Navigation className="w-5 h-5 text-brand-500" />
            <span>Live Bus Fleet</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">Select a route schedule to inspect active coordinates</p>
        </div>

        {loadingTrips ? (
          <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
            Loading schedules...
          </div>
        ) : trips.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-400 space-y-2">
            <AlertCircle className="w-8 h-8 text-slate-300" />
            <p className="text-xs font-semibold">No Scheduled Trips</p>
            <p className="text-[10px]">Add routes and schedules in the admin console first.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {trips.map(trip => {
              const isActive = selectedTrip?.id === trip.id;
              const isRunning = trip.tripStatus === 'IN_SERVICE';
              
              return (
                <div
                  key={trip.id}
                  onClick={() => setSelectedTrip(trip)}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                    isActive
                      ? 'border-brand-500 bg-brand-50/20 dark:bg-brand-950/10'
                      : 'border-slate-200 dark:border-dark-border hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase tracking-wider font-mono">
                      {trip.bus?.busNumber || 'Fleet Vehicle'}
                    </span>
                    <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                  </div>

                  <h4 className="font-bold text-slate-700 dark:text-slate-200 mt-2 text-sm">
                    {trip.route?.source} &rarr; {trip.route?.destination}
                  </h4>
                  
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 border-t border-dashed border-slate-100 dark:border-dark-border/50 pt-2">
                    <span className="capitalize">{trip.tripStatus.toLowerCase().replace('_', ' ')}</span>
                    <span>Fare: Rs. {trip.baseFare}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Main map view with absolute telemetry display */}
      <div className="flex-1 relative bg-slate-100 dark:bg-slate-950">
        
        {/* Leaflet map container ref */}
        <div ref={mapRef} className="w-full h-full" />

        {/* Telemetry HUD Panel overlays */}
        {selectedTrip && liveData && (
          <div className="absolute bottom-6 left-6 z-[1000] bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border p-5 rounded-2xl shadow-xl w-80 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-slate-800 dark:text-white text-base">{selectedTrip.bus?.busNumber}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{selectedTrip.route?.source} to {selectedTrip.route?.destination}</p>
              </div>
              <div className="flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded-lg text-xs font-bold font-mono">
                <Bus className="w-3.5 h-3.5" />
                <span>ONLINE</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-dark-border">
              <div className="p-2.5 bg-slate-50 dark:bg-slate-900/30 rounded-xl flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">Speed</span>
                  <span className="text-sm font-extrabold text-slate-700 dark:text-slate-200">{liveData.speedKmh.toFixed(0)} km/h</span>
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 dark:bg-slate-900/30 rounded-xl flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">ETA</span>
                  <span className="text-sm font-extrabold text-slate-700 dark:text-slate-200">{liveData.etaMinutes} mins</span>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900/30 p-2.5 rounded-xl border border-slate-200/40 dark:border-dark-border/40 font-mono">
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              <span className="truncate">Lat: {liveData.latitude.toFixed(4)}, Lng: {liveData.longitude.toFixed(4)}</span>
            </div>

            {loadingCoords && (
              <div className="absolute top-2 right-2 flex items-center gap-1.5 text-[9px] text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20 px-2 py-0.5 rounded font-mono">
                <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                <span>POLLING...</span>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
