import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export const getFoodProducts = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { animalType, ageCategory, foodType, search } = req.query;
    const userId = req.user?.id;

    const whereClause: any = {};

    if (animalType && animalType !== 'All') {
      whereClause.OR = [
        { animalType: { equals: String(animalType) } },
        { animalType: { equals: 'Both' } },
      ];
    }

    if (ageCategory && ageCategory !== 'All') {
      whereClause.ageCategory = { in: [String(ageCategory), 'All Stages'] };
    }

    if (foodType && foodType !== 'All') {
      whereClause.foodType = String(foodType);
    }

    if (search && String(search).trim() !== '') {
      const q = String(search).trim();
      whereClause.AND = [
        ...(whereClause.AND || []),
        {
          OR: [
            { name: { contains: q } },
            { brand: { contains: q } },
            { description: { contains: q } },
            { keyIngredients: { contains: q } },
          ],
        },
      ];
    }

    const foods = await prisma.foodProduct.findMany({
      where: whereClause,
      include: {
        favorites: userId ? { where: { userId } } : false,
      },
      orderBy: { rating: 'desc' },
    });

    const formattedFoods = foods.map((f: any) => ({
      ...f,
      isFavorite: userId ? (f.favorites && f.favorites.length > 0) : false,
      favorites: undefined,
    }));

    res.status(200).json({ success: true, count: formattedFoods.length, foods: formattedFoods });
  } catch (error: any) {
    console.error('getFoodProducts error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve food products.' });
  }
};

export const getFoodById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const food = await prisma.foodProduct.findUnique({
      where: { id },
    });

    if (!food) {
      res.status(404).json({ success: false, message: 'Food product not found.' });
      return;
    }

    res.status(200).json({ success: true, food });
  } catch (error: any) {
    console.error('getFoodById error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve food product.' });
  }
};

export const getFavorites = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    const favorites = await prisma.favoriteFood.findMany({
      where: { userId },
      include: {
        food: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const foods = favorites.map((fav) => ({
      ...fav.food,
      isFavorite: true,
      favoritedAt: fav.createdAt,
    }));

    res.status(200).json({ success: true, foods });
  } catch (error: any) {
    console.error('getFavorites error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve favorites.' });
  }
};

export const toggleFavorite = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { foodId } = req.body;

    if (!foodId) {
      res.status(400).json({ success: false, message: 'foodId is required.' });
      return;
    }

    const existing = await prisma.favoriteFood.findUnique({
      where: {
        userId_foodId: {
          userId,
          foodId,
        },
      },
    });

    if (existing) {
      await prisma.favoriteFood.delete({
        where: { id: existing.id },
      });
      res.status(200).json({ success: true, isFavorite: false, message: 'Removed from favorites.' });
    } else {
      await prisma.favoriteFood.create({
        data: {
          userId,
          foodId,
        },
      });
      res.status(200).json({ success: true, isFavorite: true, message: 'Added to favorites.' });
    }
  } catch (error: any) {
    console.error('toggleFavorite error:', error);
    res.status(500).json({ success: false, message: 'Failed to update favorite status.' });
  }
};
