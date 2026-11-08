import { Router, Response } from 'express';
import { upload } from '../middleware/uploadMiddleware';
import { authenticateToken, AuthenticatedRequest } from '../middleware/authMiddleware';

const router = Router();

router.post('/', authenticateToken, upload.single('file'), (req: AuthenticatedRequest, res: Response) => {
  if (!req.file) {
    res.status(400).json({ success: false, message: 'No file uploaded.' });
    return;
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  res.status(200).json({
    success: true,
    message: 'File uploaded successfully.',
    url: fileUrl,
    filename: req.file.filename,
    mimetype: req.file.mimetype,
    size: req.file.size,
  });
});

export default router;
