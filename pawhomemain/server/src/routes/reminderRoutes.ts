import { Router } from 'express';
import {
  getReminders,
  createReminder,
  updateReminder,
  deleteReminder,
} from '../controllers/reminderController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);

router.get('/', getReminders);
router.post('/', createReminder);
router.put('/:id', updateReminder);
router.delete('/:id', deleteReminder);

export default router;
