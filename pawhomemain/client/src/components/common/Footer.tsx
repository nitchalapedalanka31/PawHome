import React from 'react';
import { PawPrint, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-teal-100 py-6 px-4 md:px-8 text-center text-xs text-pawMuted">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-lg bg-teal-500 flex items-center justify-center text-white">
            <PawPrint className="w-3.5 h-3.5 fill-white" />
          </div>
          <span className="font-bold text-pawText">PawHome — Your Pet's Second Home</span>
        </div>

        <div className="flex items-center space-x-1 text-xs">
          <span>Crafted with</span>
          <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 mx-0.5 inline" />
          <span>by <strong className="text-teal-700">Team Dorado</strong></span>
        </div>

        <p className="text-[11px] text-gray-400">
          © {new Date().getFullYear()} PawHome Platform. All rights reserved.
        </p>
      </div>
    </footer>
  );
};
