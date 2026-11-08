import api from './api';
import { User } from '../types';

export const authService = {
  async register(data: {
    fullName: string;
    email: string;
    phone?: string;
    password: string;
    confirmPassword: string;
  }) {
    const res = await api.post('/auth/register', data);
    return res.data;
  },

  async login(credentials: { email: string; password: string; rememberMe?: boolean }) {
    const res = await api.post('/auth/login', credentials);
    return res.data;
  },

  async getMe(): Promise<{ success: boolean; user: User }> {
    const res = await api.get('/auth/me');
    return res.data;
  },

  async updateProfile(data: { fullName?: string; phone?: string; avatarUrl?: string }) {
    const res = await api.put('/auth/profile', data);
    return res.data;
  },

  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
  }) {
    const res = await api.put('/auth/change-password', data);
    return res.data;
  },
};
