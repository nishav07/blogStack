import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { login, logout, me } from '../../controllers/authController.js';
import { authMiddleware, adminMiddleware } from '../../middleware/auth.js';
import { validateBody } from '../../middleware/validate.js';
import { loginSchema } from '../../validators/authValidators.js';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please try again later.' },
});

const router = Router();

router.post('/login', loginLimiter, validateBody(loginSchema), login);
router.post('/logout', authMiddleware, logout);
router.get('/me', authMiddleware, adminMiddleware, me);

export default router;
