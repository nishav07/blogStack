import { Router } from 'express';
import { getCategories, postCategory } from '../../controllers/articleController.js';
import { authMiddleware, adminMiddleware } from '../../middleware/auth.js';
import { validateBody } from '../../middleware/validate.js';
import { createCategorySchema } from '../../validators/articleValidators.js';

const router = Router();

router.use(authMiddleware, adminMiddleware);

router.get('/', getCategories);
router.post('/', validateBody(createCategorySchema), postCategory);

export default router;
