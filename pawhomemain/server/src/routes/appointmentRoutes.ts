import { Router } from 'express';
import {
  createAppointment,
  getAppointments,
  getAppointmentById,
  cancelAppointment,
} from '../controllers/appointmentController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);

router.post('/', createAppointment);
router.get('/', getAppointments);
router.get('/:id', getAppointmentById);
router.put('/:id/cancel', cancelAppointment);

export default router;
