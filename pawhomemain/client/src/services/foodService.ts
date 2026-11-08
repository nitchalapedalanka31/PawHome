import api from './api';
import { FoodProduct } from '../types';

export const foodService = {
  async getFoodProducts(filters?: {
    animalType?: string;
    ageCategory?: string;
    foodType?: string;
    search?: string;
  }): Promise<{ success: boolean; count: number; foods: FoodProduct[] }> {
    const res = await api.get('/food', { params: filters });
    return res.data;
  },

  async getFoodById(id: string): Promise<{ success: boolean; food: FoodProduct }> {
    const res = await api.get(`/food/${id}`);
    return res.data;
  },

  async getFavorites(): Promise<{ success: boolean; foods: FoodProduct[] }> {
    const res = await api.get('/food/favorites');
    return res.data;
  },

  async toggleFavorite(foodId: string): Promise<{ success: boolean; isFavorite: boolean; message: string }> {
    const res = await api.post('/food/favorites', { foodId });
    return res.data;
  },
};
