import api from './api';
import { PetHealthRecord, Reminder } from '../types';

export const healthService = {
  // Health records
  async getHealthRecords(petId: string): Promise<{ success: boolean; records: PetHealthRecord[] }> {
    const res = await api.get(`/health/${petId}`);
    return res.data;
  },

  async createHealthRecord(data: Partial<PetHealthRecord>) {
    const res = await api.post('/health', data);
    return res.data;
  },

  async updateHealthRecord(id: string, data: Partial<PetHealthRecord>) {
    const res = await api.put(`/health/${id}`, data);
    return res.data;
  },

  async deleteHealthRecord(id: string) {
    const res = await api.delete(`/health/${id}`);
    return res.data;
  },

  // Reminders
  async getReminders(params?: { petId?: string; completed?: boolean }): Promise<{ success: boolean; reminders: Reminder[] }> {
    const res = await api.get('/reminders', { params });
    return res.data;
  },

  async createReminder(data: Partial<Reminder>) {
    const res = await api.post('/reminders', data);
    return res.data;
  },

  async updateReminder(id: string, data: Partial<Reminder>) {
    const res = await api.put(`/reminders/${id}`, data);
    return res.data;
  },

  async deleteReminder(id: string) {
    const res = await api.delete(`/reminders/${id}`);
    return res.data;
  },
};
