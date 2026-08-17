import { Router } from 'express';
import {
  getArticles,
  getArticle,
  getCategories,
  getCategoryArticles,
} from '../../controllers/publicArticleController.js';

const router = Router();

router.get('/articles', getArticles);
router.get('/articles/:slug', getArticle);
router.get('/categories', getCategories);
router.get('/categories/:slug/articles', getCategoryArticles);

export default router;
