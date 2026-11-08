import api from './api';
import { VeterinaryDoctor, Salon, SalonService, Appointment } from '../types';

export const bookingService = {
  // Vets
  async getVets(params?: { specialization?: string; search?: string }): Promise<{ success: boolean; vets: VeterinaryDoctor[] }> {
    const res = await api.get('/vets', { params });
    return res.data;
  },

  async getVetById(id: string): Promise<{ success: boolean; vet: VeterinaryDoctor }> {
    const res = await api.get(`/vets/${id}`);
    return res.data;
  },

  async getVetSlots(id: string, date: string): Promise<{ success: boolean; slots: { slot: string; isAvailable: boolean }[] }> {
    const res = await api.get(`/vets/${id}/slots`, { params: { date } });
    return res.data;
  },

  // Salons
  async getSalons(params?: { search?: string }): Promise<{ success: boolean; salons: Salon[] }> {
    const res = await api.get('/salons', { params });
    return res.data;
  },

  async getSalonById(id: string): Promise<{ success: boolean; salon: Salon }> {
    const res = await api.get(`/salons/${id}`);
    return res.data;
  },

  async getSalonServices(id: string): Promise<{ success: boolean; services: SalonService[] }> {
    const res = await api.get(`/salons/${id}/services`);
    return res.data;
  },

  async getSalonSlots(id: string, date: string): Promise<{ success: boolean; slots: { slot: string; isAvailable: boolean }[] }> {
    const res = await api.get(`/salons/${id}/slots`, { params: { date } });
    return res.data;
  },

  // Appointments
  async createAppointment(data: {
    petId: string;
    type: 'VETERINARY' | 'SALON';
    vetId?: string;
    salonId?: string;
    serviceId?: string;
    date: string;
    timeSlot: string;
    reason?: string;
    notes?: string;
  }): Promise<{ success: boolean; message: string; appointment: Appointment }> {
    const res = await api.post('/appointments', data);
    return res.data;
  },

  async getAppointments(filters?: { status?: string; type?: string }): Promise<{ success: boolean; appointments: Appointment[] }> {
    const res = await api.get('/appointments', { params: filters });
    return res.data;
  },

  async getAppointmentById(id: string): Promise<{ success: boolean; appointment: Appointment }> {
    const res = await api.get(`/appointments/${id}`);
    return res.data;
  },

  async cancelAppointment(id: string): Promise<{ success: boolean; message: string; appointment: Appointment }> {
    const res = await api.put(`/appointments/${id}/cancel`);
    return res.data;
  },
};
