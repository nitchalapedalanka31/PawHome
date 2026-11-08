import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  User as UserIcon,
  Mail,
  Phone,
  Lock,
  PawPrint,
  Heart,
  CalendarDays,
  ShieldCheck,
  LogOut,
  Save,
  CheckCircle,
  KeyRound,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authService } from '../services/authService';
import { petService } from '../services/petService';
import { foodService } from '../services/foodService';
import { bookingService } from '../services/bookingService';
import { Pet, FoodProduct, Appointment } from '../types';
import { Button } from '../components/common/Button';
import { Loader } from '../components/common/Loader';

export const ProfilePage: React.FC = () => {
  const { user, updateUser, logout } = useAuth();
  const { success, error, info } = useToast();
  const navigate = useNavigate();

  // Personal Info form
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Password change form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  // Activity summaries
  const [pets, setPets] = useState<Pet[]>([]);
  const [favorites, setFavorites] = useState<FoodProduct[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingSummaries, setLoadingSummaries] = useState(true);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName);
      setPhone(user.phone || '');
      setAvatarUrl(user.avatarUrl || '');
    }
    loadSummaries();
  }, [user]);

  const loadSummaries = async () => {
    try {
      setLoadingSummaries(true);
      const [petsRes, favRes, apptRes] = await Promise.all([
        petService.getPets(),
        foodService.getFavorites(),
        bookingService.getAppointments(),
      ]);

      if (petsRes.success) setPets(petsRes.pets);
      if (favRes.success) setFavorites(favRes.foods);
      if (apptRes.success) setAppointments(apptRes.appointments);
    } catch (err) {
      console.warn('Failed to load profile summaries', err);
    } finally {
      setLoadingSummaries(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      error('Full Name is required.');
      return;
    }

    setSavingProfile(true);
    try {
      const res = await authService.updateProfile({
        fullName,
        phone,
        avatarUrl,
      });

      if (res.success && res.user) {
        updateUser(res.user);
        success('Profile updated successfully!');
      }
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      error('All password fields are required.');
      return;
    }

    if (newPassword.length < 6) {
      error('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      error('New passwords do not match.');
      return;
    }

    setSavingPassword(true);
    try {
      const res = await authService.changePassword({
        currentPassword,
        newPassword,
        confirmNewPassword,
      });

      if (res.success) {
        success('Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      }
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleLogout = () => {
    logout();
    info('Logged out.');
    navigate('/login');
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header Profile Banner */}
      <div className="rounded-3xl bg-white p-6 md:p-8 shadow-sm border border-teal-100 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center space-x-5">
          <img
            src={
              avatarUrl ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'
            }
            alt={fullName}
            className="w-20 h-20 rounded-2xl object-cover ring-4 ring-teal-500/20 shadow-md"
          />
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-2xl font-black text-pawText">{user?.fullName}</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                Verified Parent
              </span>
            </div>
            <p className="text-xs text-pawMuted mt-0.5">{user?.email}</p>
            <p className="text-[11px] text-teal-700 font-semibold mt-1">
              Member of PawHome family • Powered by Team Dorado
            </p>
          </div>
        </div>

        <div>
          <Button
            variant="ghost"
            onClick={handleLogout}
            icon={<LogOut className="w-4 h-4 text-red-500" />}
            className="text-red-600 hover:bg-red-50 border border-red-200"
          >
            Sign Out
          </Button>
        </div>
      </div>

      {/* Account Overview Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Link
          to="/pets"
          className="bg-white p-4 rounded-2xl border border-teal-100 text-center hover:shadow-soft transition"
        >
          <PawPrint className="w-5 h-5 text-teal-600 mx-auto mb-1" />
          <span className="text-2xl font-black text-pawText">{pets.length}</span>
          <span className="text-xs text-pawMuted block font-medium">Registered Pets</span>
        </Link>

        <Link
          to="/food"
          className="bg-white p-4 rounded-2xl border border-teal-100 text-center hover:shadow-soft transition"
        >
          <Heart className="w-5 h-5 text-rose-500 mx-auto mb-1" />
          <span className="text-2xl font-black text-pawText">{favorites.length}</span>
          <span className="text-xs text-pawMuted block font-medium">Favorite Foods</span>
        </Link>

        <Link
          to="/appointments"
          className="bg-white p-4 rounded-2xl border border-teal-100 text-center hover:shadow-soft transition"
        >
          <CalendarDays className="w-5 h-5 text-teal-600 mx-auto mb-1" />
          <span className="text-2xl font-black text-pawText">{appointments.length}</span>
          <span className="text-xs text-pawMuted block font-medium">Total Bookings</span>
        </Link>
      </div>

      {/* Forms Grid: Personal Information (Left) & Password Change (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Edit Personal Information */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-teal-100 space-y-4">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="text-base font-black text-pawText">Personal Information</h3>
            <p className="text-xs text-pawMuted">Update your contact profile and display photo</p>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-pawText uppercase tracking-wider mb-1">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-gray-200 focus:border-teal-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-pawText uppercase tracking-wider mb-1">
                Email Address (Read-only)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-gray-200 bg-gray-50 text-gray-500 outline-none cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-pawText uppercase tracking-wider mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-gray-200 focus:border-teal-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-pawText uppercase tracking-wider mb-1">
                Avatar Image URL
              </label>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:border-teal-500 outline-none"
              />
            </div>

            <div className="pt-2">
              <Button type="submit" isLoading={savingProfile} icon={<Save className="w-4 h-4" />}>
                Save Profile Changes
              </Button>
            </div>
          </form>
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-teal-100 space-y-4">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="text-base font-black text-pawText">Security & Password</h3>
            <p className="text-xs text-pawMuted">Update your account password with bcrypt hashing</p>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-pawText uppercase tracking-wider mb-1">
                Current Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-gray-200 focus:border-teal-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-pawText uppercase tracking-wider mb-1">
                New Password (Min 6 chars)
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-gray-200 focus:border-teal-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-pawText uppercase tracking-wider mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-gray-200 focus:border-teal-500 outline-none"
                />
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="secondary"
                isLoading={savingPassword}
                icon={<Lock className="w-4 h-4" />}
              >
                Update Password
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
