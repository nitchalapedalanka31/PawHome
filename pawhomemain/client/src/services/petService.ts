import api from './api';
import { Pet } from '../types';

export const petService = {
  async getPets(): Promise<{ success: boolean; pets: Pet[] }> {
    const res = await api.get('/pets');
    return res.data;
  },

  async getPetById(id: string): Promise<{ success: boolean; pet: Pet & any }> {
    const res = await api.get(`/pets/${id}`);
    return res.data;
  },

  async createPet(data: Partial<Pet>) {
    const res = await api.post('/pets', data);
    return res.data;
  },

  async updatePet(id: string, data: Partial<Pet>) {
    const res = await api.put(`/pets/${id}`, data);
    return res.data;
  },

  async deletePet(id: string) {
    const res = await api.delete(`/pets/${id}`);
    return res.data;
  },

  async uploadPhoto(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },
};
