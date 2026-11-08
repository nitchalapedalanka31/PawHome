import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Menu,
  Sparkles,
  Plus,
  LogOut,
  User as UserIcon,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface NavbarProps {
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const { info } = useToast();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    info('You have been logged out.');
    navigate('/login');
  };

  return (
    <header className="h-20 bg-white/95 backdrop-blur-md border-b border-teal-100 px-4 md:px-8 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center space-x-4">
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-2 rounded-xl text-gray-500 hover:text-teal-600 hover:bg-teal-50 transition"
          aria-label="Toggle menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="hidden sm:block">
          <h1 className="text-lg font-bold text-pawText">
            Welcome back, <span className="text-teal-600">{user?.fullName?.split(' ')[0] || 'Friend'}</span> 🐾
          </h1>
          <p className="text-xs text-pawMuted">Your Pet's Second Home — Powered by Team Dorado</p>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {/* Quick Shortcut Buttons */}
        <Link
          to="/mood-scanner"
          className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-teal-50 text-teal-700 hover:bg-teal-100 transition border border-teal-200"
        >
          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
          <span>Mood Scanner</span>
        </Link>

        <Link
          to="/pets"
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-teal-500 text-white hover:bg-teal-600 transition shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Add Pet</span>
        </Link>

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-2.5 p-1.5 rounded-xl hover:bg-gray-100 transition"
          >
            <img
              src={
                user?.avatarUrl ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'
              }
              alt={user?.fullName || 'User'}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-teal-500/30"
            />
            <span className="hidden md:block text-xs font-bold text-pawText text-left">
              {user?.fullName}
            </span>
            <ChevronDown className="w-4 h-4 text-gray-400 hidden md:block" />
          </button>

          {dropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-xl border border-teal-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-xs font-bold text-pawText truncate">{user?.fullName}</p>
                  <p className="text-[11px] text-gray-500 truncate">{user?.email}</p>
                </div>

                <Link
                  to="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center space-x-2.5 px-4 py-2 text-xs font-medium text-pawText hover:bg-teal-50 hover:text-teal-700 transition"
                >
                  <UserIcon className="w-4 h-4 text-teal-600" />
                  <span>Profile & Settings</span>
                </Link>

                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center space-x-2.5 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
