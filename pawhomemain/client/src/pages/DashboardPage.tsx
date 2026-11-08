import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PawPrint,
  CalendarDays,
  CheckCircle2,
  BellRing,
  Sparkles,
  UtensilsCrossed,
  Stethoscope,
  Scissors,
  Plus,
  ArrowRight,
  Clock,
  Heart,
  TrendingUp,
  ShieldAlert,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { petService } from '../services/petService';
import { bookingService } from '../services/bookingService';
import { healthService } from '../services/healthService';
import { Pet, Appointment, Reminder } from '../types';
import { Button } from '../components/common/Button';
import { Loader } from '../components/common/Loader';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [pets, setPets] = useState<Pet[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [petsRes, apptRes, remRes] = await Promise.all([
        petService.getPets(),
        bookingService.getAppointments(),
        healthService.getReminders({ completed: false }),
      ]);

      if (petsRes.success) setPets(petsRes.pets);
      if (apptRes.success) setAppointments(apptRes.appointments);
      if (remRes.success) setReminders(remRes.reminders);
    } catch (err: any) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleReminder = async (reminder: Reminder) => {
    try {
      await healthService.updateReminder(reminder.id, {
        isCompleted: !reminder.isCompleted,
      });
      success(`Updated: "${reminder.title}"`);
      // Refresh reminders
      const remRes = await healthService.getReminders({ completed: false });
      if (remRes.success) setReminders(remRes.reminders);
    } catch (err) {
      error('Failed to update reminder.');
    }
  };

  const upcomingAppts = appointments.filter((a) => a.status === 'UPCOMING');
  const completedAppts = appointments.filter((a) => a.status === 'COMPLETED');

  // Chart data: Pet care and wellness activity
  const activityData = [
    { month: 'Jun', Checkups: 1, Grooming: 1 },
    { month: 'Jul', Checkups: 2, Grooming: 1 },
    { month: 'Aug', Checkups: 1, Grooming: 2 },
    { month: 'Sep', Checkups: 2, Grooming: 1 },
    { month: 'Oct', Checkups: 3, Grooming: 2 },
    { month: 'Nov', Checkups: 2, Grooming: 2 },
  ];

  if (loading) {
    return <Loader message="Assembling your PawHome dashboard..." />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Welcome Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-teal-700 via-teal-600 to-teal-800 p-6 md:p-8 text-white shadow-card overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none flex items-center justify-center">
          <PawPrint className="w-64 h-64 text-white" />
        </div>

        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/40 text-teal-100 text-xs font-bold tracking-wide">
            <Heart className="w-3.5 h-3.5 fill-teal-200 text-teal-200" />
            <span>Welcome to PawHome • Team Dorado Platform</span>
          </div>

          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Hello, {user?.fullName || 'Pet Parent'}! 🐾
          </h2>

          <p className="text-teal-100/90 text-sm leading-relaxed">
            Everything your pets need is organized right here. You have{' '}
            <strong className="text-white font-bold">{upcomingAppts.length} upcoming appointment(s)</strong>{' '}
            and <strong className="text-white font-bold">{reminders.length} pending reminder(s)</strong>.
          </p>
        </div>
      </div>

      {/* 2. Stat Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Total Pets */}
        <Link
          to="/pets"
          className="bg-white rounded-2xl p-5 shadow-sm border border-teal-100/70 hover:shadow-soft hover:border-teal-200 transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-pawMuted">
              Registered Pets
            </span>
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-110 transition">
              <PawPrint className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-pawText">{pets.length}</span>
            <span className="text-xs text-teal-600 font-semibold ml-2">Family Members</span>
          </div>
        </Link>

        {/* Upcoming Appointments */}
        <Link
          to="/appointments"
          className="bg-white rounded-2xl p-5 shadow-sm border border-teal-100/70 hover:shadow-soft hover:border-teal-200 transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-pawMuted">
              Upcoming Visits
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition">
              <CalendarDays className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-pawText">{upcomingAppts.length}</span>
            <span className="text-xs text-blue-600 font-semibold ml-2">Scheduled</span>
          </div>
        </Link>

        {/* Completed Appointments */}
        <Link
          to="/appointments"
          className="bg-white rounded-2xl p-5 shadow-sm border border-teal-100/70 hover:shadow-soft hover:border-teal-200 transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-pawMuted">
              Completed Visits
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-pawText">{completedAppts.length}</span>
            <span className="text-xs text-emerald-600 font-semibold ml-2">Past Records</span>
          </div>
        </Link>

        {/* Health Reminders */}
        <Link
          to="/health"
          className="bg-white rounded-2xl p-5 shadow-sm border border-teal-100/70 hover:shadow-soft hover:border-teal-200 transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-pawMuted">
              Pending Reminders
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition">
              <BellRing className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-pawText">{reminders.length}</span>
            <span className="text-xs text-amber-600 font-semibold ml-2">Due Soon</span>
          </div>
        </Link>
      </div>

      {/* 3. Quick Action Buttons */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-teal-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-extrabold text-pawText">Quick Actions</h3>
            <p className="text-xs text-pawMuted">Instant access to core pet care services</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          <Link
            to="/pets"
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-teal-50/60 hover:bg-teal-100/70 border border-teal-100 transition group text-center"
          >
            <div className="w-11 h-11 rounded-xl bg-teal-500 text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition mb-2">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-pawText">Add New Pet</span>
            <span className="text-[10px] text-pawMuted">Create Profile</span>
          </Link>

          <Link
            to="/mood-scanner"
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-teal-50/60 hover:bg-teal-100/70 border border-teal-100 transition group text-center relative overflow-hidden"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition mb-2">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-pawText">Scan Pet Mood</span>
            <span className="text-[10px] text-teal-600 font-bold">AI Scanner</span>
          </Link>

          <Link
            to="/food"
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-teal-50/60 hover:bg-teal-100/70 border border-teal-100 transition group text-center"
          >
            <div className="w-11 h-11 rounded-xl bg-teal-500 text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition mb-2">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-pawText">Find Pet Food</span>
            <span className="text-[10px] text-pawMuted">Nutrition Matches</span>
          </Link>

          <Link
            to="/veterinary"
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-teal-50/60 hover:bg-teal-100/70 border border-teal-100 transition group text-center"
          >
            <div className="w-11 h-11 rounded-xl bg-teal-500 text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition mb-2">
              <Stethoscope className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-pawText">Book Veterinary</span>
            <span className="text-[10px] text-pawMuted">Certified Doctors</span>
          </Link>

          <Link
            to="/salon"
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-teal-50/60 hover:bg-teal-100/70 border border-teal-100 transition group text-center col-span-2 sm:col-span-1"
          >
            <div className="w-11 h-11 rounded-xl bg-teal-500 text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition mb-2">
              <Scissors className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-pawText">Book Salon</span>
            <span className="text-[10px] text-pawMuted">Grooming & Spas</span>
          </Link>
        </div>
      </div>

      {/* 4. Pet Profiles Showcase */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-black text-pawText">My Furry Family</h3>
            <p className="text-xs text-pawMuted">Manage, monitor, and care for your pets</p>
          </div>
          <Link to="/pets" className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center">
            <span>View All ({pets.length})</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        {pets.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-dashed border-teal-200">
            <PawPrint className="w-12 h-12 text-teal-300 mx-auto mb-3" />
            <h4 className="font-bold text-pawText">No pets registered yet</h4>
            <p className="text-xs text-pawMuted max-w-sm mx-auto mt-1 mb-4">
              Add your first dog, cat, or companion animal to unlock customized nutrition, health tracking, and the AI Mood Scanner!
            </p>
            <Link to="/pets">
              <Button size="sm" icon={<Plus className="w-4 h-4" />}>
                Add Your Pet
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pets.map((pet) => (
              <div
                key={pet.id}
                className="bg-white rounded-3xl p-5 shadow-sm border border-teal-100 hover:shadow-soft transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center space-x-4">
                    <img
                      src={
                        pet.imageUrl ||
                        (pet.animalType === 'Cat'
                          ? 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=200'
                          : 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=200')
                      }
                      alt={pet.name}
                      className="w-16 h-16 rounded-2xl object-cover ring-2 ring-teal-500/20 shadow-sm"
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-extrabold text-base text-pawText">{pet.name}</h4>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                          {pet.animalType}
                        </span>
                      </div>
                      <p className="text-xs text-pawMuted">{pet.breed}</p>
                      <p className="text-[11px] text-teal-600 font-medium mt-0.5">
                        {pet.age ? `${pet.age} yrs old` : 'Age not set'} • {pet.gender} • {pet.weight ? `${pet.weight} kg` : 'Weight unset'}
                      </p>
                    </div>
                  </div>

                  {pet.specialNotes && (
                    <div className="mt-3 p-2.5 rounded-xl bg-teal-50/50 text-[11px] text-pawMuted line-clamp-2">
                      “{pet.specialNotes}”
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <Link
                    to={`/mood-scanner?petId=${pet.id}`}
                    className="inline-flex items-center space-x-1 text-xs font-bold text-teal-600 hover:text-teal-700"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Scan Mood</span>
                  </Link>

                  <Link
                    to={`/pets/${pet.id}`}
                    className="inline-flex items-center space-x-1 text-xs font-bold text-pawMuted hover:text-pawText"
                  >
                    <span>View Profile</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. Health Reminders & Upcoming Appointments Split Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Appointments */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-teal-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <CalendarDays className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-extrabold text-pawText">Upcoming Appointments</h3>
              </div>
              <Link to="/appointments" className="text-xs font-bold text-teal-600 hover:underline">
                View All
              </Link>
            </div>

            {upcomingAppts.length === 0 ? (
              <div className="text-center py-8 text-pawMuted">
                <Clock className="w-8 h-8 mx-auto mb-2 text-teal-200" />
                <p className="text-xs">No upcoming visits booked yet.</p>
                <div className="mt-3 flex justify-center space-x-2">
                  <Link to="/veterinary">
                    <Button size="sm" variant="secondary">Book Vet</Button>
                  </Link>
                  <Link to="/salon">
                    <Button size="sm" variant="outline">Book Salon</Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingAppts.slice(0, 3).map((appt) => (
                  <div
                    key={appt.id}
                    className="p-3.5 rounded-2xl bg-teal-50/40 border border-teal-100 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-xl bg-teal-500 text-white flex items-center justify-center">
                        {appt.type === 'VETERINARY' ? (
                          <Stethoscope className="w-4 h-4" />
                        ) : (
                          <Scissors className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-pawText">
                            {appt.pet?.name} ({appt.type === 'VETERINARY' ? 'Vet' : 'Salon'})
                          </span>
                          <span className="text-[10px] font-mono bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded">
                            {appt.id}
                          </span>
                        </div>
                        <p className="text-[11px] text-pawMuted">
                          {appt.vet?.name || appt.salon?.name || 'Care Provider'} • {appt.timeSlot}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-teal-700 block">{appt.date}</span>
                      <span className="text-[10px] uppercase font-bold text-emerald-600">
                        {appt.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Health Reminders */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-teal-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <BellRing className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-extrabold text-pawText">Pet Health Reminders</h3>
              </div>
              <Link to="/health" className="text-xs font-bold text-teal-600 hover:underline">
                Manage
              </Link>
            </div>

            {reminders.length === 0 ? (
              <div className="text-center py-8 text-pawMuted">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-300" />
                <p className="text-xs">All caught up! No active reminders.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {reminders.slice(0, 4).map((rem) => (
                  <div
                    key={rem.id}
                    className="p-3 rounded-2xl border border-gray-100 hover:border-amber-200 bg-white flex items-center justify-between transition"
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={rem.isCompleted}
                        onChange={() => handleToggleReminder(rem)}
                        className="w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500 cursor-pointer"
                      />
                      <div>
                        <p className="text-xs font-bold text-pawText">{rem.title}</p>
                        <p className="text-[11px] text-pawMuted">
                          Due: {new Date(rem.dueDate).toLocaleDateString()} • {rem.category}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      Pending
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 6. Activity & Wellness Chart (Recharts) */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-teal-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-teal-600" />
            <div>
              <h3 className="text-base font-extrabold text-pawText">Monthly Pet Wellness Care Trends</h3>
              <p className="text-xs text-pawMuted">Veterinary wellness examinations & grooming visits</p>
            </div>
          </div>
          <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-100">
            Past 6 Months
          </span>
        </div>

        <div className="h-64 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#586E6E' }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#586E6E' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.1)',
                  border: '1px solid #D9F3EF',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="Checkups" fill="#008F8C" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Grooming" fill="#7CD4C7" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
