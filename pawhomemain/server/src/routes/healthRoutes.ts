import { Router } from 'express';
import {
  getHealthRecordsByPet,
  createHealthRecord,
  updateHealthRecord,
  deleteHealthRecord,
} from '../controllers/healthController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);

router.get('/:petId', getHealthRecordsByPet);
router.post('/', createHealthRecord);
router.put('/:id', updateHealthRecord);
router.delete('/:id', deleteHealthRecord);

export default router;
