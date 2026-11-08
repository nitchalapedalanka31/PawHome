import { Router } from 'express';
import {
  getFoodProducts,
  getFoodById,
  getFavorites,
  toggleFavorite,
} from '../controllers/foodController';
import { authenticateToken, optionalAuth } from '../middleware/authMiddleware';

const router = Router();

router.get('/', optionalAuth, getFoodProducts);
router.get('/favorites', authenticateToken, getFavorites);
router.post('/favorites', authenticateToken, toggleFavorite);
router.get('/:id', getFoodById);

export default router;
