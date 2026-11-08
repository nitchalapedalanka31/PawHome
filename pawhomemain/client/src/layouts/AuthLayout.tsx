import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { PawPrint, ShieldCheck } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F7FAF9] flex flex-col justify-between selection:bg-teal-500 selection:text-white">
      {/* Auth Header */}
      <header className="px-6 py-6 max-w-7xl mx-auto w-full flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-3 group">
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
        </Link>

        <div className="flex items-center space-x-2 text-xs font-semibold text-pawMuted bg-teal-50 px-3 py-1.5 rounded-full border border-teal-100">
          <ShieldCheck className="w-4 h-4 text-teal-600" />
          <span>Secure Platform</span>
        </div>
      </header>

      {/* Main Outlet */}
      <main className="flex-1 flex items-center justify-center p-4">
        <Outlet />
      </main>

      {/* Auth Footer */}
      <footer className="py-6 text-center text-xs text-pawMuted">
        <p>PawHome — Your Pet's Second Home | Crafted with pride by <strong>Team Dorado</strong></p>
      </footer>
    </div>
  );
};
