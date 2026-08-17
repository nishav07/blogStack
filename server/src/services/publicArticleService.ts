import { Category } from '../models/Category.js';
import { Article } from '../models/Article.js';
import { toSafeArticle, SafeArticle, toSafeCategory, SafeCategory } from './articleService.js';
import { AppError } from '../middleware/errorHandler.js';

const DEFAULT_PAGE_SIZE = 12;

export interface PaginatedArticles {
  articles: SafeArticle[];
  total: number;
  page: number;
  totalPages: number;
}

export async function listPublicArticles(page = 1, limit = DEFAULT_PAGE_SIZE): Promise<PaginatedArticles> {
  const skip = (page - 1) * limit;

  const [articles, total] = await Promise.all([
    Article.find({ status: 'published' })
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit),
    Article.countDocuments({ status: 'published' }),
  ]);

  return {
    articles: articles.map(toSafeArticle),
    total,
    page,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

export async function getPublicArticleBySlug(slug: string): Promise<SafeArticle> {
  const article = await Article.findOne({ slug: slug.toLowerCase(), status: 'published' });
  if (!article) {
    throw new AppError('Article not found', 404);
  }
  return toSafeArticle(article);
}

export async function listPublicCategories(): Promise<SafeCategory[]> {
  const categories = await Category.find().sort({ name: 1 });
  return categories.map(toSafeCategory);
}

export async function listPublicArticlesByCategory(
  categorySlug: string,
  page = 1,
  limit = DEFAULT_PAGE_SIZE
): Promise<PaginatedArticles & { category: SafeCategory }> {
  const category = await Category.findOne({ slug: categorySlug.toLowerCase() });
  if (!category) {
    throw new AppError('Category not found', 404);
  }

  const skip = (page - 1) * limit;

  const [articles, total] = await Promise.all([
    Article.find({ status: 'published', categoryId: category._id })
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit),
    Article.countDocuments({ status: 'published', categoryId: category._id }),
  ]);

  return {
    category: toSafeCategory(category),
    articles: articles.map(toSafeArticle),
    total,
    page,
    totalPages: Math.ceil(total / limit) || 1,
  };
}
