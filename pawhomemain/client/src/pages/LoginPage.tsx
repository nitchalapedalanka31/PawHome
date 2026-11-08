import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, LogIn, Sparkles, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { success, error, info } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      error('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password, rememberMe);
      success('Welcome back to PawHome!');
      navigate('/dashboard');
    } catch (err: any) {
      error(err.response?.data?.message || err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('demo@pawhome.com');
    setPassword('Password123!');
    info('Filled demo credentials! Click "Sign In" to proceed.');
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      error('Please enter your account email.');
      return;
    }
    setForgotModalOpen(false);
    success(`A secure password reset link has been dispatched to ${forgotEmail}.`);
    setForgotEmail('');
  };

  return (
    <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-xl border border-teal-100">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-black text-pawText">Sign In to PawHome</h2>
        <p className="text-sm text-pawMuted mt-1">
          Access your pets' records, bookings, and AI mood scanner.
        </p>

        {/* Quick Demo Credentials Pill */}
        <div className="mt-3 inline-block">
          <button
            type="button"
            onClick={handleFillDemo}
            className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-bold border border-teal-200 transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>Use Demo Account (Sarah Jenkins)</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div>
          <label className="block text-xs font-bold text-pawText uppercase tracking-wider mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. demo@pawhome.com"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-pawText uppercase tracking-wider">
              Password
            </label>
            <button
              type="button"
              onClick={() => setForgotModalOpen(true)}
              className="text-xs text-teal-600 hover:text-teal-700 font-semibold"
            >
              Forgot Password?
            </button>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-3 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Remember Me */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center space-x-2 text-xs font-medium text-pawMuted cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
            />
            <span>Remember me on this browser</span>
          </label>
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full shadow-md mt-2"
          isLoading={loading}
          icon={<LogIn className="w-4 h-4" />}
        >
          Sign In
        </Button>
      </form>

      <div className="mt-6 pt-6 border-t border-gray-100 text-center text-xs text-pawMuted">
        Don't have an account yet?{' '}
        <Link to="/register" className="font-bold text-teal-600 hover:text-teal-700 underline">
          Create Account
        </Link>
      </div>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={forgotModalOpen}
        onClose={() => setForgotModalOpen(false)}
        title="Reset Your Password"
        subtitle="Enter the email associated with your PawHome account."
      >
        <form onSubmit={handleForgotPassword} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-pawText uppercase tracking-wider mb-1">
              Account Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="your-account@email.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none"
              />
            </div>
          </div>
          <div className="flex items-center justify-end space-x-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setForgotModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" icon={<KeyRound className="w-4 h-4" />}>
              Send Reset Link
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
