import React from 'react';
import { Heart } from 'lucide-react';

interface LoaderProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Loader: React.FC<LoaderProps> = ({
  message = 'Loading PawHome...',
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <div className="relative">
        <div
          className={`${sizeClasses[size]} border-4 border-teal-100 border-t-teal-500 rounded-full animate-spin`}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <Heart className="w-4 h-4 text-teal-500 fill-teal-500 animate-pulse" />
        </div>
      </div>
      {message && <p className="text-sm font-medium text-pawMuted animate-pulse">{message}</p>}
    </div>
  );
};
