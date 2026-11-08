import React from 'react';
import { Link } from 'react-router-dom';
import {
  PawPrint,
  Sparkles,
  Stethoscope,
  UtensilsCrossed,
  ShieldCheck,
  CalendarCheck,
  ArrowRight,
} from 'lucide-react';
import { Button } from '../components/common/Button';

export const WelcomePage: React.FC = () => {
  return (
    <div className="w-full max-w-6xl mx-auto py-8 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Hero Copy & Actions */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-teal-100 text-teal-800 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-teal-600" />
            <span>Next-Generation Pet Care • Team Dorado</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-pawText tracking-tight leading-[1.1]">
            Your Pet's <span className="text-teal-500">Second Home</span>
          </h1>

          <p className="text-base sm:text-lg text-pawMuted leading-relaxed max-w-xl">
            Welcome to <strong>PawHome</strong>, the all-in-one platform built for modern pet parents. Manage your companions’ health, decode subtle emotional states with our AI Mood Scanner, get tailored food recommendations, and book verified veterinary doctors and grooming salons in seconds.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link to="/register">
              <Button size="lg" className="shadow-lg shadow-teal-500/20">
                <span>Create Free Account</span>
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>

            <Link to="/login">
              <Button variant="secondary" size="lg">
                Sign In to PawHome
              </Button>
            </Link>
          </div>

          {/* Quick value props */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-teal-100">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-pawText">AI Mood Scanner</p>
                <p className="text-pawMuted">Indicative facial analysis</p>
              </div>
            </div>

            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-pawText">Smart Pet Food</p>
                <p className="text-pawMuted">Nutritional matches</p>
              </div>
            </div>

            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-pawText">Vet & Salons</p>
                <p className="text-pawMuted">Instant appointment slots</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Visual Showcase with dog & cat high-res photos */}
        <div className="lg:col-span-5 relative">
          <div className="relative mx-auto max-w-md">
            {/* Main Pet Image Card */}
            <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-white">
              <img
                src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=800"
                alt="Happy running dog in grass"
                className="w-full h-80 object-cover"
              />
              <div className="p-5 bg-gradient-to-t from-white via-white to-transparent">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-extrabold text-pawText text-lg">Milo & Luna</h3>
                    <p className="text-xs text-pawMuted">Healthy, happy, and fully protected</p>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                    <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                    Up-to-Date
                  </span>
                </div>
              </div>
            </div>

            {/* Overlapping Cat Card */}
            <div className="absolute -bottom-6 -left-6 bg-white p-3 rounded-2xl shadow-xl border border-teal-100 flex items-center space-x-3 w-56 animate-bounce-slow">
              <img
                src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=200"
                alt="Cute calm cat"
                className="w-12 h-12 rounded-xl object-cover"
              />
              <div>
                <p className="text-xs font-bold text-pawText">Luna (Cat)</p>
                <p className="text-[11px] text-teal-600 font-semibold flex items-center">
                  <Sparkles className="w-3 h-3 mr-1" /> Mood: Relaxed
                </p>
              </div>
            </div>

            {/* Overlapping Appointment Badge */}
            <div className="absolute -top-4 -right-4 bg-teal-600 text-white p-3 rounded-2xl shadow-xl flex items-center space-x-2">
              <Stethoscope className="w-5 h-5 text-teal-200" />
              <div className="text-left text-xs">
                <p className="font-bold leading-tight">Vet Visit Ready</p>
                <p className="text-[10px] text-teal-100">Top-rated Clinics</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
