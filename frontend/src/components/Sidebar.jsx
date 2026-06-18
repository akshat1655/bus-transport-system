import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  LayoutDashboard,
  Bus,
  Map,
  Calendar,
  Package,
  Navigation,
  MessageSquare,
  BarChart3,
  Settings,
  Ticket
} from 'lucide-react';

export default function Sidebar() {
  const { role } = useSelector((state) => state.auth);

  // Define sidebar links based on authorization permissions
  const menuItems = [
    {
      title: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      roles: ['SUPER_ADMIN', 'BRANCH_ADMIN', 'OPERATOR']
    },
    {
      title: 'Bus Fleet Management',
      path: '/dashboard/buses',
      icon: Bus,
      roles: ['SUPER_ADMIN', 'OPERATOR']
    },
    {
      title: 'Route Planning',
      path: '/dashboard/routes',
      icon: Map,
      roles: ['SUPER_ADMIN', 'OPERATOR']
    },
    {
      title: 'Trip Scheduling',
      path: '/dashboard/trips',
      icon: Calendar,
      roles: ['SUPER_ADMIN', 'OPERATOR']
    },
    {
      title: 'Online Ticket Booking',
      path: '/',
      icon: Ticket,
      roles: ['SUPER_ADMIN', 'BRANCH_ADMIN', 'OPERATOR', 'AGENT', 'CUSTOMER']
    },
    {
      title: 'Cargo & Parcels',
      path: '/dashboard/cargo',
      icon: Package,
      roles: ['SUPER_ADMIN', 'BRANCH_ADMIN', 'OPERATOR']
    },
    {
      title: 'Live GPS Tracking',
      path: '/dashboard/tracking',
      icon: Navigation,
      roles: ['SUPER_ADMIN', 'BRANCH_ADMIN', 'OPERATOR', 'AGENT', 'CUSTOMER']
    },
    {
      title: 'Support Tickets',
      path: '/dashboard/support',
      icon: MessageSquare,
      roles: ['SUPER_ADMIN', 'BRANCH_ADMIN', 'OPERATOR']
    },
    {
      title: 'Reports & Analytics',
      path: '/dashboard/reports',
      icon: BarChart3,
      roles: ['SUPER_ADMIN', 'BRANCH_ADMIN']
    },
    {
      title: 'System Settings',
      path: '/dashboard/settings',
      icon: Settings,
      roles: ['SUPER_ADMIN']
    }
  ];

  // Map backend ROLE_SUPER_ADMIN -> SUPER_ADMIN
  const cleanRole = role ? role.replace('ROLE_', '') : '';

  const filteredItems = menuItems.filter(item => item.roles.includes(cleanRole));

  return (
    <aside className="w-64 bg-slate-900 text-slate-400 flex flex-col h-[calc(100vh-4rem)] select-none border-r border-slate-800 shrink-0">
      <div className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
        {filteredItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={index}
              to={item.path}
              end={item.path === '/dashboard' || item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-150 ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-900/30'
                    : 'hover:bg-slate-800 hover:text-slate-100'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span>{item.title}</span>
            </NavLink>
          );
        })}
      </div>
      
      {/* Footer footer */}
      <div className="p-4 border-t border-slate-800 text-center text-xs text-slate-600">
        <p>&copy; 2026 Rajni Bus Service</p>
        <p className="mt-0.5">v1.0.0 Stable</p>
      </div>
    </aside>
  );
}
