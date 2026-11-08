import { Router } from 'express';
import {
  getSalons,
  getSalonById,
  getSalonServices,
  getSalonSlots,
} from '../controllers/salonController';

const router = Router();

router.get('/', getSalons);
router.get('/:id', getSalonById);
router.get('/:id/services', getSalonServices);
router.get('/:id/slots', getSalonSlots);

export default router;
