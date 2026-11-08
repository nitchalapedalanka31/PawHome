import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  PawPrint,
  Sparkles,
  UtensilsCrossed,
  Stethoscope,
  Scissors,
  CalendarDays,
  HeartPulse,
  UserCheck,
  ShieldCheck,
  X,
} from 'lucide-react';

interface SidebarProps {
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'My Pets', path: '/pets', icon: PawPrint },
    {
      name: 'Mood Scanner',
      path: '/mood-scanner',
      icon: Sparkles,
      badge: 'AI',
    },
    { name: 'Pet Food', path: '/food', icon: UtensilsCrossed },
    { name: 'Veterinary Care', path: '/veterinary', icon: Stethoscope },
    { name: 'Pet Salons & Spas', path: '/salon', icon: Scissors },
    { name: 'My Appointments', path: '/appointments', icon: CalendarDays },
    { name: 'Health & Reminders', path: '/health', icon: HeartPulse },
    { name: 'Profile & Settings', path: '/profile', icon: UserCheck },
  ];

  return (
    <aside className="w-64 bg-white border-r border-teal-100 flex flex-col h-full flex-shrink-0">
      {/* Brand Header */}
      <div className="h-20 flex items-center justify-between px-6 border-b border-teal-50">
        <NavLink to="/dashboard" className="flex items-center space-x-3 group" onClick={onClose}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white shadow-soft group-hover:scale-105 transition transform">
            <PawPrint className="w-6 h-6 fill-white" />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight text-pawText block leading-tight">
              Paw<span className="text-teal-500">Home</span>
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-teal-600 block">
              Team Dorado
            </span>
          </div>
        </NavLink>
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-teal-800/60">
          Main Menu
        </div>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                isActive
                  ? 'bg-teal-500 text-white shadow-soft font-bold'
                  : 'text-pawMuted hover:text-teal-600 hover:bg-teal-50/70'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="flex items-center space-x-3">
                  <item.icon
                    className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${
                      isActive ? 'text-white' : 'text-teal-600/70'
                    }`}
                  />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      isActive
                        ? 'bg-white text-teal-700'
                        : 'bg-teal-100 text-teal-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Team Dorado Branding Footer */}
      <div className="p-4 mx-4 mb-4 rounded-xl bg-teal-50/80 border border-teal-100 text-center">
        <div className="flex items-center justify-center space-x-1.5 text-teal-800 text-xs font-bold mb-1">
          <ShieldCheck className="w-4 h-4 text-teal-600" />
          <span>PawHome v1.0</span>
        </div>
        <p className="text-[11px] text-teal-700/80">
          Designed & Crafted by <br />
          <strong className="text-teal-900 font-extrabold">Team Dorado</strong>
        </p>
      </div>
    </aside>
  );
};
