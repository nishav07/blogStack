import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import {
  createArticle,
  createCategory,
  deleteArticle,
  getArticleById,
  getArticleStats,
  listArticles,
  listCategories,
  publishArticle,
  unpublishArticle,
  updateArticle,
} from '../services/articleService.js';
import {
  CreateArticleInput,
  CreateCategoryInput,
  UpdateArticleInput,
} from '../validators/articleValidators.js';

export async function getStats(_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const stats = await getArticleStats();
    res.json({ stats });
  } catch (err) {
    next(err);
  }
}

export async function getArticles(_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const articles = await listArticles();
    res.json({ articles });
  } catch (err) {
    next(err);
  }
}

export async function getArticle(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const article = await getArticleById(String(req.params.id));
    res.json({ article });
  } catch (err) {
    next(err);
  }
}

export async function postArticle(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const article = await createArticle(req.body as CreateArticleInput);
    res.status(201).json({ article });
  } catch (err) {
    next(err);
  }
}

export async function putArticle(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const article = await updateArticle(String(req.params.id), req.body as UpdateArticleInput);
    res.json({ article });
  } catch (err) {
    next(err);
  }
}

export async function removeArticle(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    await deleteArticle(String(req.params.id));
    res.json({ message: 'Article deleted successfully' });
  } catch (err) {
    next(err);
  }
}

export async function patchPublish(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const article = await publishArticle(String(req.params.id));
    res.json({ article });
  } catch (err) {
    next(err);
  }
}

export async function patchUnpublish(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const article = await unpublishArticle(String(req.params.id));
    res.json({ article });
  } catch (err) {
    next(err);
  }
}

export async function getCategories(_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const categories = await listCategories();
    res.json({ categories });
  } catch (err) {
    next(err);
  }
}

export async function postCategory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const category = await createCategory(req.body as CreateCategoryInput);
    res.status(201).json({ category });
  } catch (err) {
    next(err);
  }
}
