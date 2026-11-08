import { Router } from 'express';
import { getVets, getVetById, getVetSlots } from '../controllers/vetController';

const router = Router();

router.get('/', getVets);
router.get('/:id', getVetById);
router.get('/:id/slots', getVetSlots);

export default router;
