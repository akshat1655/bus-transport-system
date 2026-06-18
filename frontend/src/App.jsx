import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Layout Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Page Views
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import CustomerBooking from './pages/CustomerBooking';
import Dashboard from './pages/Dashboard';
import BusManagement from './pages/BusManagement';
import RouteManagement from './pages/RouteManagement';
import TripManagement from './pages/TripManagement';
import CargoManagement from './pages/CargoManagement';
import LiveTracking from './pages/LiveTracking';
import SupportDesk from './pages/SupportDesk';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

// Layout Shell for Authenticated/Dashboard pages
function DashboardLayout() {
  const { isAuthenticated } = useSelector((state) => state.auth);

  // Guard: Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-dark-bg transition-colors duration-200">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

// Layout Shell for general/guest pages (Navbar but no Sidebar)
function PublicLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-dark-bg transition-colors duration-200">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  const { isAuthenticated, role } = useSelector((state) => state.auth);
  
  // Clean role name from spring format ROLE_SUPER_ADMIN -> SUPER_ADMIN
  const cleanRole = role ? role.replace('ROLE_', '') : '';
  const isAdmin = ['SUPER_ADMIN', 'BRANCH_ADMIN', 'OPERATOR'].includes(cleanRole);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Auth Pages */}
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to={isAdmin ? "/dashboard" : "/"} replace /> : <Login />}
        />
        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to="/" replace /> : <Register />}
        />
        <Route
          path="/forgot-password"
          element={isAuthenticated ? <Navigate to="/" replace /> : <ForgotPassword />}
        />

        {/* Public Booking Portal (has Navbar but Sidebar is hidden for guests) */}
        <Route element={isAuthenticated ? <DashboardLayout /> : <PublicLayout />}>
          <Route path="/" element={<CustomerBooking />} />
        </Route>

        {/* Authenticated ERP Dashboard Shell (strictly guarded) */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="buses" element={<BusManagement />} />
          <Route path="routes" element={<RouteManagement />} />
          <Route path="trips" element={<TripManagement />} />
          <Route path="cargo" element={<CargoManagement />} />
          <Route path="tracking" element={<LiveTracking />} />
          <Route path="support" element={<SupportDesk />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Fallback Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
