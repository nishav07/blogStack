import { Router } from 'express';
import {
  getStats,
  getArticles,
  getArticle,
  postArticle,
  putArticle,
  removeArticle,
  patchPublish,
  patchUnpublish,
} from '../../controllers/articleController.js';
import { authMiddleware, adminMiddleware } from '../../middleware/auth.js';
import { validateBody } from '../../middleware/validate.js';
import { createArticleSchema, updateArticleSchema } from '../../validators/articleValidators.js';

const router = Router();

router.use(authMiddleware, adminMiddleware);

router.get('/stats', getStats);
router.get('/', getArticles);
router.post('/', validateBody(createArticleSchema), postArticle);
router.get('/:id', getArticle);
router.put('/:id', validateBody(updateArticleSchema), putArticle);
router.delete('/:id', removeArticle);
router.patch('/:id/publish', patchPublish);
router.patch('/:id/unpublish', patchUnpublish);

export default router;
