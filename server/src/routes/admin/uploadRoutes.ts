import { Router } from 'express';
import { getUploadSignature } from '../../controllers/uploadController.js';
import { authMiddleware, adminMiddleware } from '../../middleware/auth.js';

const router = Router();

router.use(authMiddleware, adminMiddleware);
router.post('/sign', getUploadSignature);

export default router;
