import { Router } from 'express';
import { analyzeMood, getMoodHistory } from '../controllers/moodController';
import { authenticateToken } from '../middleware/authMiddleware';
import { upload } from '../middleware/uploadMiddleware';

const router = Router();

router.use(authenticateToken);

router.post('/analyze', upload.single('image'), analyzeMood);
router.get('/history/:petId', getMoodHistory);

export default router;
