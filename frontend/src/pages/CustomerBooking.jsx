import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Search, MapPin, Calendar, Users, Armchair, CheckCircle2, Ticket, Printer, Wallet, Phone, Mail } from 'lucide-react';
import api from '../services/api';

const fleetImages = [
  {
    url: '/bus1.jpg',
    title: 'Rajni Sleeper Coach',
    desc: 'Premium Volvo SLX 2+1 sleeper service with spacious layout.'
  },
  {
    url: '/bus2.jpg',
    title: 'Luxury Fleet',
    desc: 'High-end Volvo multi-axle buses engineered for absolute safety.'
  },
  {
    url: '/bus3.jpg',
    title: 'Premium Cabin Interior',
    desc: 'Ergonomic berths and seating with personal entertainment screens.'
  },
  {
    url: '/bus4.jpg',
    title: 'Modern Amenities',
    desc: 'Equipped with climate control, USB chargers, and clean restrooms.'
  }
];

export default function CustomerBooking() {
  const { isAuthenticated, role } = useSelector(state => state.auth);
  
  // Search parameters
  const [source, setSource] = useState('Bangalore');
  const [destination, setDestination] = useState('Mumbai');
  const [date, setDate] = useState('2026-05-22');
  
  // Results & details
  const [trips, setTrips] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [seatBookings, setSeatBookings] = useState({});
  
  // Seat layout configuration
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [passengers, setPassengers] = useState([]);
  
  // Pickup and drop location selection
  const [selectedPickup, setSelectedPickup] = useState(null);
  const [selectedDrop, setSelectedDrop] = useState(null);
  
  // Booking status & checkout
  const [paymentMethod, setPaymentMethod] = useState('WALLET');
  const [bookingSuccess, setBookingSuccess] = useState(null); // holds ticket details
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    setSearching(true);
    setError('');
    setSelectedTrip(null);
    setSelectedSeats([]);
    setSeatBookings({});
    setPassengers([]);
    
    try {
      const res = await api.get('/api/trips/search', {
        params: {
          source: source.trim(),
          destination: destination.trim(),
          date
        }
      });
      setTrips(res.data);
    } catch (err) {
      setError('Could not find trips for selected endpoints.');
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, []);

  const handleSelectTrip = (trip) => {
    setSelectedTrip(trip);
    setBookedSeats(trip.bookedSeats || []);
    setSeatBookings(trip.seatBookings || {});
    setSelectedSeats([]);
    setPassengers([]);
    
    if (trip) {
      const initialPickup = {
        name: trip.route.source,
        time: new Date(trip.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
        sequence: 0
      };
      setSelectedPickup(initialPickup);
      
      const initialDrop = {
        name: trip.route.destination,
        time: new Date(trip.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
        sequence: 9999
      };
      setSelectedDrop(initialDrop);
    } else {
      setSelectedPickup(null);
      setSelectedDrop(null);
    }
  };

  // Helper to calculate stop arrival/departure times based on base time and offset in minutes
  const getOffsetTime = (baseTimeStr, offsetMinutes) => {
    if (!baseTimeStr) return '';
    try {
      const cleanTimeStr = baseTimeStr.replace(' ', 'T');
      const baseDate = new Date(cleanTimeStr);
      const offsetDate = new Date(baseDate.getTime() + offsetMinutes * 60000);
      return offsetDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch (e) {
      return '';
    }
  };

  // Helper to calculate seat price with dynamic markup based on trip capacity and booking counts
  const getSeatPrice = (trip) => {
    if (!trip) return 0;
    const baseFare = trip.baseFare || 0;
    const capacity = trip.bus?.capacity || 40;
    const bookedCount = trip.bookedSeats?.length || 0;
    const occupancy = bookedCount / capacity;
    let multiplier = 1.0;
    if (occupancy > 0.8) {
      multiplier = 1.4;
    } else if (occupancy > 0.5) {
      multiplier = 1.2;
    }
    return Math.round(baseFare * multiplier);
  };

  // Generate 2-deck sleeper layout matching the user's provided layout design
  const getSeatLayout = () => {
    const seats = [];
    
    // Lower Deck: 3 rows, 6 columns = 18 sleeper berths
    for (let r = 1; r <= 3; r++) {
      for (let c = 1; c <= 6; c++) {
        const rowChar = String.fromCharCode(64 + r); // A, B, C
        seats.push({
          id: `L${c}${rowChar}`,
          row: r,
          col: c,
          type: 'SLEEPER',
          tier: 'LOWER'
        });
      }
    }

    // Upper Deck: 3 rows, 6 columns = 18 sleeper berths
    for (let r = 1; r <= 3; r++) {
      for (let c = 1; c <= 6; c++) {
        const rowChar = String.fromCharCode(64 + r); // A, B, C
        seats.push({
          id: `U${c}${rowChar}`,
          row: r,
          col: c,
          type: 'SLEEPER',
          tier: 'UPPER'
        });
      }
    }
    
    return seats;
  };

  const getBoardingPoints = () => {
    if (!selectedTrip) return [];
    const points = [
      {
        name: selectedTrip.route.source,
        time: new Date(selectedTrip.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
        sequence: 0
      }
    ];
    
    const stops = selectedTrip.route.stops || [];
    const sortedStops = [...stops].sort((a, b) => a.stopSequence - b.stopSequence);
    
    sortedStops.forEach(stop => {
      points.push({
        name: stop.stopName,
        time: getOffsetTime(selectedTrip.departureTime, stop.arrivalTimeOffset),
        sequence: stop.stopSequence
      });
    });
    
    return points;
  };

  const getDroppingPoints = () => {
    if (!selectedTrip) return [];
    const points = [];
    
    const stops = selectedTrip.route.stops || [];
    const sortedStops = [...stops].sort((a, b) => a.stopSequence - b.stopSequence);
    
    sortedStops.forEach(stop => {
      points.push({
        name: stop.stopName,
        time: getOffsetTime(selectedTrip.departureTime, stop.arrivalTimeOffset),
        sequence: stop.stopSequence
      });
    });
    
    points.push({
      name: selectedTrip.route.destination,
      time: new Date(selectedTrip.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
      sequence: 9999
    });
    
    const minSeq = selectedPickup ? selectedPickup.sequence : -1;
    return points.filter(dp => dp.sequence > minSeq);
  };

  const handleSelectPickup = (pickup) => {
    setSelectedPickup(pickup);
    
    const stops = selectedTrip?.route.stops || [];
    const sortedStops = [...stops].sort((a, b) => a.stopSequence - b.stopSequence);
    
    const points = [];
    sortedStops.forEach(stop => {
      points.push({
        name: stop.stopName,
        time: getOffsetTime(selectedTrip.departureTime, stop.arrivalTimeOffset),
        sequence: stop.stopSequence
      });
    });
    points.push({
      name: selectedTrip?.route.destination,
      time: new Date(selectedTrip?.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
      sequence: 9999
    });
    
    const validDrops = points.filter(dp => dp.sequence > pickup.sequence);
    
    if (!selectedDrop || selectedDrop.sequence <= pickup.sequence) {
      setSelectedDrop(validDrops[validDrops.length - 1]);
    }
  };

  const renderSeat = (seat) => {
    const isOccupied = bookedSeats.includes(seat.id) || !!seatBookings[seat.id];
    const isSelected = selectedSeats.includes(seat.id);
    const price = getSeatPrice(selectedTrip);
    const gender = seatBookings[seat.id] || (bookedSeats.includes(seat.id) ? 'MALE' : null);
    
    let buttonColorClass = '';
    let labelColorClass = '';
    let pillColorClass = '';
    
    if (isOccupied) {
      if (gender === 'FEMALE') {
        buttonColorClass = 'bg-rose-50 border-rose-200 text-rose-500 cursor-not-allowed dark:bg-rose-950/20 dark:border-rose-900/40 dark:text-rose-400';
        labelColorClass = 'text-rose-400 dark:text-rose-500';
        pillColorClass = 'bg-rose-300 dark:bg-rose-700';
      } else {
        buttonColorClass = 'bg-sky-50 border-sky-200 text-sky-500 cursor-not-allowed dark:bg-sky-950/20 dark:border-sky-900/40 dark:text-sky-400';
        labelColorClass = 'text-sky-400 dark:text-sky-500';
        pillColorClass = 'bg-sky-300 dark:bg-sky-700';
      }
    } else if (isSelected) {
      buttonColorClass = 'bg-emerald-500 border-emerald-600 text-white shadow-md shadow-emerald-500/20';
      labelColorClass = 'text-emerald-200';
      pillColorClass = 'bg-emerald-200';
    } else {
      buttonColorClass = 'bg-white border-slate-200 text-slate-700 hover:border-brand-500 dark:bg-slate-900 dark:border-dark-border dark:text-slate-300 dark:hover:border-brand-500';
      labelColorClass = 'text-slate-400 dark:text-slate-500';
      pillColorClass = 'bg-slate-200 dark:bg-slate-700';
    }
    
    return (
      <button
        key={seat.id}
        onClick={() => handleSelectSeat(seat.id)}
        disabled={isOccupied}
        title={`Seat ${seat.id} - ₹${price}${isOccupied ? ` (Booked - ${gender})` : ''}`}
        className={`flex-1 min-w-[52px] max-w-[75px] h-10 rounded-lg border flex items-center justify-between pl-2 pr-1 text-[10px] font-extrabold transition-all relative ${buttonColorClass}`}
      >
        <div className="flex flex-col items-start leading-none gap-0.5">
          <span className={`text-[7px] font-semibold uppercase ${labelColorClass}`}>
            {seat.id}
          </span>
          <span className="text-[10px]">₹{price}</span>
        </div>
        
        <div
          className={`w-1.5 h-6 rounded-sm shrink-0 ${pillColorClass}`}
        />
      </button>
    );
  };

  const renderDeck = (tierName, seats) => {
    const rowA = seats.filter(s => s.row === 1).sort((a, b) => a.col - b.col);
    const rowB = seats.filter(s => s.row === 2).sort((a, b) => a.col - b.col);
    const rowC = seats.filter(s => s.row === 3).sort((a, b) => a.col - b.col);
    
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between px-2">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{tierName} Deck</span>
          <span className="text-[10px] text-slate-400">2+1 Layout</span>
        </div>
        <div className="relative bg-slate-50 dark:bg-slate-900/60 p-4 rounded-3xl border border-slate-200 dark:border-dark-border flex items-stretch gap-4 shadow-sm">
          {/* Driver/Front Cabin area */}
          <div className="w-12 border-r border-dashed border-slate-300 dark:border-slate-800 flex flex-col items-center justify-center shrink-0 pr-3">
            <div className="w-8 h-8 rounded-full border border-slate-300 dark:border-slate-700 flex items-center justify-center bg-white dark:bg-slate-800 shadow-sm">
              <svg className="w-5 h-5 text-slate-400 dark:text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="3" />
                <path d="M12 2v7M12 15v7M2 12h7M15 12h7" />
              </svg>
            </div>
            <span className="text-[8px] text-slate-400 font-bold uppercase mt-2 tracking-widest leading-none select-none block" style={{ writingMode: 'vertical-lr', textOrientation: 'mixed' }}>
              FRONT
            </span>
          </div>
          
          {/* Sleeper Seats Rows */}
          <div className="flex-1 flex flex-col gap-2.5">
            {/* Row A (Window side) */}
            <div className="flex justify-between gap-2.5">
              {rowA.map(seat => renderSeat(seat))}
            </div>
            {/* Row B (Aisle side - top) */}
            <div className="flex justify-between gap-2.5">
              {rowB.map(seat => renderSeat(seat))}
            </div>
            
            {/* Aisle Spacer Corridor */}
            <div className="h-3 flex items-center justify-center">
              <div className="w-full h-[1px] border-b border-dashed border-slate-200 dark:border-slate-800/80" />
            </div>
            
            {/* Row C (Single Window side - bottom) */}
            <div className="flex justify-between gap-2.5">
              {rowC.map(seat => renderSeat(seat))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleSelectSeat = (seatId) => {
    if (bookedSeats.includes(seatId) || seatBookings[seatId]) return; // Occupied

    let updatedSeats = [...selectedSeats];
    if (updatedSeats.includes(seatId)) {
      updatedSeats = updatedSeats.filter(s => s !== seatId);
      // Remove passenger details row
      setPassengers(passengers.filter(p => p.seatNumber !== seatId));
    } else {
      updatedSeats.push(seatId);
      // Add passenger details row
      setPassengers([...passengers, { seatNumber: seatId, passengerName: '', age: '', gender: 'MALE' }]);
    }
    setSelectedSeats(updatedSeats);
  };

  const handlePassengerChange = (index, field, value) => {
    const updated = [...passengers];
    updated[index][field] = value;
    setPassengers(updated);
  };

  const handleBookTicket = async () => {
    // Form checks
    for (let p of passengers) {
      if (!p.passengerName || !p.age) {
        setError('Please complete all passenger information fields.');
        return;
      }
    }

    if (!isAuthenticated) {
      setError('Please login first to confirm tickets.');
      return;
    }

    setError('');
    setBookingLoading(true);

    try {
      const response = await api.post('/api/bookings', {
        tripId: selectedTrip.id,
        passengers,
        paymentMethod,
        pickupLocation: selectedPickup?.name,
        pickupTime: selectedPickup?.time,
        dropLocation: selectedDrop?.name,
        dropTime: selectedDrop?.time
      });
      setBookingSuccess(response.data);
    } catch (err) {
      setError(err.response?.data || 'Failed to complete booking.');
    } finally {
      setBookingLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 select-none">
      
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden mb-8 p-8 rounded-3xl bg-gradient-to-tr from-slate-900 via-slate-800 to-brand-900 border border-slate-800 text-white">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-3xl font-extrabold tracking-tight">Search & Book Tickets</h1>
          <p className="text-slate-300 mt-2 text-sm md:text-base">
            Instantly reserve sleeper seats and bus berths with dynamic fare pricing calculations.
          </p>
        </div>
        <div className="absolute right-0 top-0 w-80 h-80 bg-brand-500/10 rounded-full blur-3xl" />
      </div>

      {/* 2. Search Panel */}
      <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border p-6 rounded-2xl shadow-sm mb-8">
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">From</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input
                type="text"
                required
                value={source}
                onChange={e => setSource(e.target.value)}
                placeholder="Source city"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-dark-border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 dark:text-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">To</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input
                type="text"
                required
                value={destination}
                onChange={e => setDestination(e.target.value)}
                placeholder="Destination city"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-dark-border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 dark:text-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Journey Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-dark-border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 dark:text-white"
              />
            </div>
          </div>
          <div>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl shadow-md transition-colors"
            >
              <Search className="w-5 h-5" />
              <span>Search Buses</span>
            </button>
          </div>
        </form>
      </div>

      {/* 2.5. Slow Scrolling Fleet Showcase */}
      <div className="mb-8 overflow-hidden bg-slate-100/50 dark:bg-slate-900/30 rounded-3xl p-6 border border-slate-200/60 dark:border-dark-border/50">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">Our Premium Fleet & Sleeper Comforts</h2>
          <p className="text-xs text-slate-500 mt-0.5">Explore our state-of-the-art Volvo SLX luxury buses designed for a premium travel experience.</p>
        </div>
        
        <div className="relative w-full overflow-hidden rounded-2xl bg-white dark:bg-dark-card border border-slate-200/50 dark:border-dark-border/50 p-4">
          {/* Gradient shadows at the edges */}
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-white dark:from-dark-card to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white dark:from-dark-card to-transparent z-10 pointer-events-none" />
          
          <div className="animate-marquee gap-6">
            {[...fleetImages, ...fleetImages].map((item, index) => (
              <div 
                key={index} 
                className="w-72 md:w-80 shrink-0 bg-slate-50 dark:bg-slate-900/50 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-shadow group"
              >
                <div className="h-44 md:h-48 overflow-hidden relative">
                  <img 
                    src={item.url} 
                    alt={item.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-85" />
                  <div className="absolute bottom-3 left-4 right-4">
                    <span className="text-xs font-bold text-white px-2 py-0.5 bg-brand-600/90 rounded uppercase tracking-wider">
                      {item.title}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 mb-6 text-sm text-rose-500 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded-xl">
          {error}
        </div>
      )}

      {/* 3. Main content body */}
      {!bookingSuccess ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Matches column */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <span>Available Schedules</span>
              <span className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full font-medium">
                {trips.length} matches
              </span>
            </h2>

            {searching ? (
              <div className="text-center py-12 text-slate-500">Searching coordinates...</div>
            ) : trips.length === 0 ? (
              <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border p-12 text-center rounded-2xl text-slate-500">
                No active routes found. Modify destinations or add trips in the Admin Panel to populate.
              </div>
            ) : (
              trips.map(trip => (
                <div
                  key={trip.id}
                  onClick={() => handleSelectTrip(trip)}
                  className={`p-6 bg-white dark:bg-dark-card border rounded-2xl shadow-sm hover:shadow-md cursor-pointer transition-all ${
                    selectedTrip?.id === trip.id ? 'border-brand-500 ring-1 ring-brand-500' : 'border-slate-200 dark:border-dark-border'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div>
                      <span className="px-2 py-0.5 text-xs font-semibold bg-brand-50 text-brand-600 rounded dark:bg-brand-950/30 dark:text-brand-400 capitalize">
                        {trip.bus?.busType.toLowerCase().replace(/_/g, ' ')}
                      </span>
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white mt-1">{trip.bus?.busNumber}</h3>
                      <div className="mt-4 flex items-center gap-6 text-sm text-slate-500">
                        <div>
                          <p className="text-xs text-slate-400 uppercase tracking-wider">Departs</p>
                          <p className="font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
                            {new Date(trip.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <div className="w-12 h-px bg-slate-300 dark:bg-dark-border relative">
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-slate-400" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 uppercase tracking-wider">Arrives</p>
                          <p className="font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
                            {new Date(trip.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="text-right flex flex-col justify-between items-end">
                      <div>
                        <p className="text-xs text-slate-400">Base Fare</p>
                        <p className="text-2xl font-black text-slate-800 dark:text-white mt-0.5">Rs. {trip.baseFare}</p>
                      </div>
                      <span className="text-xs text-brand-500 font-semibold mt-2">
                        {trip.bus?.capacity - trip.bookedSeats.length} seats available
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Seat details column */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Seat Selection</h2>

            {selectedTrip ? (
              <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border p-6 rounded-2xl shadow-sm space-y-6">
                <div className="text-center pb-4 border-b border-slate-100 dark:border-dark-border">
                  <span className="text-xs text-slate-400 uppercase font-semibold">Seat Configuration</span>
                  <div className="flex flex-wrap gap-4 justify-center mt-3 text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3.5 h-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-dark-border rounded" />
                      <span>Available</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3.5 h-3.5 bg-emerald-500 rounded" />
                      <span>Selected</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3.5 h-3.5 bg-sky-50 border border-sky-200 rounded dark:bg-sky-950/20 dark:border-sky-900/40" />
                      <span>Booked (Male)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3.5 h-3.5 bg-rose-50 border border-rose-200 rounded dark:bg-rose-950/20 dark:border-rose-900/40" />
                      <span>Booked (Female)</span>
                    </div>
                  </div>
                </div>

                {/* Seat Map Layout grid */}
                <div className="space-y-6 overflow-x-auto">
                  {renderDeck('Lower', getSeatLayout().filter(s => s.tier === 'LOWER'))}
                  {renderDeck('Upper', getSeatLayout().filter(s => s.tier === 'UPPER'))}
                </div>

                {/* Passenger checkout section */}
                {selectedSeats.length > 0 && (
                  <div className="border-t border-slate-100 dark:border-dark-border pt-4 space-y-4">
                    {/* Boarding & Dropping Points Selectors */}
                    <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-200/50 dark:border-dark-border/40">
                      <h3 className="font-bold text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wider">Boarding & Dropping Points</h3>
                      
                      <div className="space-y-2">
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Boarding (Pickup) Point</label>
                          <select
                            value={selectedPickup ? JSON.stringify(selectedPickup) : ''}
                            onChange={(e) => {
                              if (e.target.value) {
                                handleSelectPickup(JSON.parse(e.target.value));
                              }
                            }}
                            className="w-full px-3 py-2 bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-dark-border rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 dark:text-white"
                          >
                            {getBoardingPoints().map((pt, i) => (
                              <option key={i} value={JSON.stringify(pt)}>
                                {pt.name} ({pt.time})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Dropping Point</label>
                          <select
                            value={selectedDrop ? JSON.stringify(selectedDrop) : ''}
                            onChange={(e) => {
                              if (e.target.value) {
                                setSelectedDrop(JSON.parse(e.target.value));
                              }
                            }}
                            className="w-full px-3 py-2 bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-dark-border rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 dark:text-white"
                          >
                            {getDroppingPoints().map((pt, i) => (
                              <option key={i} value={JSON.stringify(pt)}>
                                {pt.name} ({pt.time})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    <h3 className="font-bold text-sm text-slate-700 dark:text-slate-300">Passenger Details</h3>
                    {passengers.map((p, idx) => (
                      <div key={p.seatNumber} className="space-y-3 p-3 bg-slate-50 dark:bg-slate-900/20 rounded-xl border border-slate-200/50 dark:border-dark-border/40">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-brand-600 bg-brand-50 dark:bg-brand-900/30 px-2 py-0.5 rounded">Seat {p.seatNumber}</span>
                        </div>
                        <input
                          type="text"
                          required
                          placeholder="Passenger Name"
                          value={p.passengerName}
                          onChange={e => handlePassengerChange(idx, 'passengerName', e.target.value)}
                          className="w-full px-3 py-1.5 bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-dark-border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 dark:text-white"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="number"
                            required
                            placeholder="Age"
                            value={p.age}
                            onChange={e => handlePassengerChange(idx, 'age', parseInt(e.target.value) || '')}
                            className="w-full px-3 py-1.5 bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-dark-border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 dark:text-white"
                          />
                          <select
                            value={p.gender}
                            onChange={e => handlePassengerChange(idx, 'gender', e.target.value)}
                            className="w-full px-3 py-1.5 bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-dark-border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 dark:text-white"
                          >
                            <option value="MALE">Male</option>
                            <option value="FEMALE">Female</option>
                            <option value="OTHER">Other</option>
                          </select>
                        </div>
                      </div>
                    ))}

                    {/* Checkout methods */}
                    <div className="pt-2 border-t border-slate-100 dark:border-dark-border">
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Payment Option</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('WALLET')}
                          className={`py-2 px-3 border rounded-xl flex items-center justify-center gap-1.5 text-xs font-semibold transition-all ${
                            paymentMethod === 'WALLET'
                              ? 'border-brand-500 text-brand-600 bg-brand-50/20'
                              : 'border-slate-200 dark:border-dark-border text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          <Wallet className="w-3.5 h-3.5" />
                          <span>Wallet Balance</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('RAZORPAY_UPI')}
                          className={`py-2 px-3 border rounded-xl flex items-center justify-center gap-1.5 text-xs font-semibold transition-all ${
                            paymentMethod === 'RAZORPAY_UPI'
                              ? 'border-brand-500 text-brand-600 bg-brand-50/20'
                              : 'border-slate-200 dark:border-dark-border text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          <span>Razorpay / Cards</span>
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={handleBookTicket}
                      disabled={bookingLoading}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-brand-600 hover:bg-brand-500 disabled:bg-brand-800 text-white font-semibold rounded-xl shadow-lg transition-colors text-sm"
                    >
                      {bookingLoading ? 'Processing Ticket...' : 'Confirm & Pay'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-slate-100 dark:bg-dark-card/40 border border-dashed border-slate-300 dark:border-dark-border p-8 text-center rounded-2xl text-slate-500">
                Please select a scheduled trip to view layout configuration.
              </div>
            )}
          </div>

        </div>
      ) : (
        
        // 4. Ticket confirmation print view
        <div className="max-w-2xl mx-auto bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border p-8 rounded-3xl shadow-premium">
          <div className="flex justify-between items-start border-b border-slate-100 dark:border-dark-border pb-6">
            <div>
              <div className="flex items-center gap-2 text-emerald-500 font-bold mb-1">
                <CheckCircle2 className="w-5 h-5" />
                <span>Ticket Booked Successfully</span>
              </div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">Booking Ref: {bookingSuccess.bookingReference}</h2>
              <p className="text-xs text-slate-400 mt-0.5">Date: {new Date(bookingSuccess.bookingDate).toLocaleString()}</p>
            </div>
            
            {/* Mock QR code layout */}
            <div className="flex flex-col items-center p-2 bg-white border border-slate-200 rounded-xl">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=${encodeURIComponent(bookingSuccess.qrCodeData)}`}
                alt="Ticket QR Code"
                className="w-20 h-20"
              />
              <span className="text-[9px] text-slate-400 mt-1 font-mono uppercase">Ticket Scan</span>
            </div>
          </div>

          <div className="py-6 space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-slate-400">Route</span>
                <p className="font-semibold text-slate-700 dark:text-slate-300 mt-0.5">{source} to {destination}</p>
              </div>
              <div>
                <span className="text-xs text-slate-400">Bus Number</span>
                <p className="font-semibold text-slate-700 dark:text-slate-300 mt-0.5">{selectedTrip.bus?.busNumber}</p>
              </div>
              <div>
                <span className="text-xs text-slate-400">Boarding Point</span>
                <p className="font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
                  {bookingSuccess.pickupLocation || selectedPickup?.name} ({bookingSuccess.pickupTime || selectedPickup?.time})
                </p>
              </div>
              <div>
                <span className="text-xs text-slate-400">Dropping Point</span>
                <p className="font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
                  {bookingSuccess.dropLocation || selectedDrop?.name} ({bookingSuccess.dropTime || selectedDrop?.time})
                </p>
              </div>
              <div>
                <span className="text-xs text-slate-400">Seats Reserved</span>
                <p className="font-semibold text-slate-700 dark:text-slate-300 mt-0.5">{bookingSuccess.seatNumbers.join(', ')}</p>
              </div>
              <div>
                <span className="text-xs text-slate-400">Total Settlement</span>
                <p className="font-bold text-slate-800 dark:text-white mt-0.5">Rs. {bookingSuccess.totalFare.toFixed(2)}</p>
              </div>
            </div>

            {/* Passenger table list */}
            <div className="border-t border-slate-100 dark:border-dark-border pt-4 mt-6">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Passenger Boarding List</span>
              <table className="w-full mt-2 text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-dark-border text-slate-400">
                    <th className="py-2">Seat</th>
                    <th className="py-2">Name</th>
                    <th className="py-2">Age</th>
                    <th className="py-2">Gender</th>
                  </tr>
                </thead>
                <tbody>
                  {passengers.map(p => (
                    <tr key={p.seatNumber} className="border-b border-slate-50 dark:border-dark-border/50 text-slate-700 dark:text-slate-300">
                      <td className="py-2 font-bold">{p.seatNumber}</td>
                      <td className="py-2">{p.passengerName}</td>
                      <td className="py-2">{p.age}</td>
                      <td className="py-2 capitalize">{p.gender.toLowerCase()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-dark-border pt-6 flex gap-3 justify-end">
            <button
              onClick={() => {
                setBookingSuccess(null);
                setSelectedTrip(null);
                setSelectedSeats([]);
                setSeatBookings({});
                setPassengers([]);
                handleSearch();
              }}
              className="py-2 px-4 border border-slate-200 dark:border-dark-border hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 transition-colors"
            >
              Book Another Ticket
            </button>
            <button
              onClick={handlePrint}
              className="py-2 px-4 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-md transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print E-Ticket</span>
            </button>
          </div>
        </div>
      )}

      {/* 5. Contact Information Banner */}
      <div className="mt-12 p-6 md:p-8 rounded-3xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-md">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Rajni Bus Service Support</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Have questions or need assistance with your booking? Reach out to our 24/7 help desk.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 w-full lg:w-auto">
            <div className="flex items-center gap-3.5 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-dark-border min-w-[210px]">
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 dark:bg-brand-500/20 flex items-center justify-center text-brand-600 dark:text-brand-400 shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">Call Us</p>
                <a href="tel:+917987761655" className="text-sm font-bold text-slate-800 dark:text-white hover:text-brand-600 transition-colors mt-0.5 block whitespace-nowrap">
                  +91 7987761655
                </a>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-dark-border min-w-[230px]">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 dark:bg-violet-500/20 flex items-center justify-center text-violet-600 dark:text-violet-400 shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">Email Us</p>
                <a href="mailto:akshatjain1655@gmail.com" className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white hover:text-brand-500 transition-colors mt-0.5 block whitespace-nowrap">
                  akshatjain1655@gmail.com
                </a>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-dark-border min-w-[210px] sm:col-span-2 xl:col-span-1">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">Head Office</p>
                <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white mt-0.5 leading-snug whitespace-nowrap">
                  Fortune Ambience, Indore
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
