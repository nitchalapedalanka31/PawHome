import api from './api';
import { MoodAnalysis } from '../types';

export const moodService = {
  async analyzeMood(params: {
    petId: string;
    imageFile?: File;
    imageBase64?: string;
  }): Promise<{ success: boolean; data: MoodAnalysis }> {
    if (params.imageFile) {
      const formData = new FormData();
      formData.append('petId', params.petId);
      formData.append('image', params.imageFile);
      const res = await api.post('/mood/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    } else {
      const res = await api.post('/mood/analyze', {
        petId: params.petId,
        imageBase64: params.imageBase64,
      });
      return res.data;
    }
  },

  async getMoodHistory(petId: string): Promise<{ success: boolean; history: MoodAnalysis[] }> {
    const res = await api.get(`/mood/history/${petId}`);
    return res.data;
  },
};
