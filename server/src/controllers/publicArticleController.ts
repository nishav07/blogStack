import { Request, Response, NextFunction } from 'express';
import {
  getPublicArticleBySlug,
  listPublicArticles,
  listPublicArticlesByCategory,
  listPublicCategories,
} from '../services/publicArticleService.js';

export async function getArticles(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = Math.max(1, parseInt(String(req.query.page ?? '1'), 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit ?? '12'), 10) || 12));
    const result = await listPublicArticles(page, limit);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getArticle(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const article = await getPublicArticleBySlug(String(req.params.slug));
    res.json({ article });
  } catch (err) {
    next(err);
  }
}

export async function getCategories(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const categories = await listPublicCategories();
    res.json({ categories });
  } catch (err) {
    next(err);
  }
}

export async function getCategoryArticles(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = Math.max(1, parseInt(String(req.query.page ?? '1'), 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit ?? '12'), 10) || 12));
    const result = await listPublicArticlesByCategory(String(req.params.slug), page, limit);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
