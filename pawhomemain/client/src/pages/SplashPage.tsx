import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PawPrint, Sparkles, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const SplashPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    const timer = setTimeout(() => {
      if (isAuthenticated) {
        navigate('/dashboard');
      } else {
        navigate('/welcome');
      }
    }, 2400);

    return () => clearTimeout(timer);
  }, [isAuthenticated, isLoading, navigate]);

  const handleSkip = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/welcome');
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-teal-900 via-teal-800 to-teal-950 flex flex-col items-center justify-between p-8 text-white overflow-hidden select-none">
      {/* Decorative background blurs & patterns */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Team Dorado Branding */}
      <div className="pt-6 z-10 flex items-center space-x-2 text-teal-200/80 text-xs tracking-widest uppercase font-bold">
        <span>Team Dorado Presents</span>
      </div>

      {/* Center Logo & Tagline */}
      <div className="flex flex-col items-center text-center z-10 space-y-6 max-w-md">
        <div className="relative">
          <div className="w-24 h-24 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-2xl animate-pulse-subtle">
            <PawPrint className="w-14 h-14 text-teal-300 fill-teal-300" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-teal-400 text-teal-950 flex items-center justify-center shadow-lg">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>

        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Paw<span className="text-teal-400">Home</span>
          </h1>
          <p className="text-lg md:text-xl text-teal-100 font-medium mt-2">
            Your Pet's Second Home
          </p>
          <p className="text-xs text-teal-300/80 mt-1 max-w-xs mx-auto">
            Smart parenting, AI mood diagnostics, curated food nutrition, & seamless care bookings.
          </p>
        </div>

        {/* Loading Progress Bar */}
        <div className="w-48 h-1.5 bg-white/10 rounded-full overflow-hidden mt-4">
          <div className="h-full bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full animate-[progress_2.4s_ease-in-out_infinite]"
               style={{ width: '100%' }} />
        </div>

        <button
          onClick={handleSkip}
          className="text-xs text-teal-200/90 hover:text-white underline underline-offset-4 transition pt-2"
        >
          Click to enter directly →
        </button>
      </div>

      {/* Bottom Footer */}
      <div className="pb-4 z-10 text-center text-xs text-teal-300/70 flex items-center space-x-1">
        <span>Built with</span>
        <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400 inline" />
        <span>by Team Dorado</span>
      </div>
    </div>
  );
};
