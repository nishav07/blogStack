import { Types } from 'mongoose';
import { Category, ICategory } from '../models/Category.js';
import { Article, IArticle } from '../models/Article.js';
import { slugify } from '../utils/slugify.js';
import { isContentEmpty } from '../utils/content.js';
import { AppError } from '../middleware/errorHandler.js';
import {
  CreateArticleInput,
  UpdateArticleInput,
  CreateCategoryInput,
} from '../validators/articleValidators.js';

export interface SafeCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SafeArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: { url?: string; publicId?: string; alt?: string } | null;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  tags: string[];
  status: 'draft' | 'published';
  seo: { title?: string; description?: string };
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ArticleStats {
  total: number;
  published: number;
  draft: number;
}

function toSafeCategory(category: ICategory): SafeCategory {
  return {
    id: category._id.toString(),
    name: category.name,
    slug: category.slug,
    description: category.description,
    createdAt: category.createdAt.toISOString(),
    updatedAt: category.updatedAt.toISOString(),
  };
}

export function toSafeArticle(article: IArticle): SafeArticle {
  return {
    id: article._id.toString(),
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt ?? '',
    content: article.content,
    coverImage: article.coverImage ?? null,
    categoryId: article.categoryId.toString(),
    categoryName: article.categoryName,
    categorySlug: article.categorySlug,
    tags: article.tags,
    status: article.status,
    seo: {
      title: article.seo?.title,
      description: article.seo?.description,
    },
    publishedAt: article.publishedAt ? article.publishedAt.toISOString() : null,
    createdAt: article.createdAt.toISOString(),
    updatedAt: article.updatedAt.toISOString(),
  };
}

async function resolveCategory(categoryId: string): Promise<ICategory> {
  if (!Types.ObjectId.isValid(categoryId)) {
    throw new AppError('Invalid category ID', 400);
  }

  const category = await Category.findById(categoryId);
  if (!category) {
    throw new AppError('Category not found', 404);
  }

  return category;
}

export async function generateUniqueSlug(baseTitle: string, excludeId?: string): Promise<string> {
  const baseSlug = slugify(baseTitle);

  if (!baseSlug) {
    throw new AppError('Unable to generate slug from title', 400);
  }

  let slug = baseSlug;
  let counter = 2;

  while (true) {
    const query: Record<string, unknown> = { slug };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    const existing = await Article.findOne(query).select('_id');
    if (!existing) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

async function ensureSlugAvailable(slug: string, excludeId?: string): Promise<void> {
  const query: Record<string, unknown> = { slug };
  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  const existing = await Article.findOne(query).select('_id');
  if (existing) {
    throw new AppError('An article with this slug already exists', 409);
  }
}

function normalizeCoverImage(
  coverImage?: CreateArticleInput['coverImage']
): { url?: string; publicId?: string; alt?: string } | null {
  if (!coverImage) return null;
  if (!coverImage.url && !coverImage.publicId && !coverImage.alt) return null;
  return {
    url: coverImage.url || undefined,
    publicId: coverImage.publicId || undefined,
    alt: coverImage.alt || undefined,
  };
}

export { toSafeCategory };

export async function listCategories(): Promise<SafeCategory[]> {
  const categories = await Category.find().sort({ name: 1 });
  return categories.map(toSafeCategory);
}

export async function createCategory(input: CreateCategoryInput): Promise<SafeCategory> {
  const slug = slugify(input.name);

  if (!slug) {
    throw new AppError('Unable to generate category slug from name', 400);
  }

  const existing = await Category.findOne({ slug });
  if (existing) {
    throw new AppError('A category with this name already exists', 409);
  }

  const category = await Category.create({
    name: input.name,
    slug,
    description: input.description,
  });

  return toSafeCategory(category);
}

export async function getArticleStats(): Promise<ArticleStats> {
  const [total, published, draft] = await Promise.all([
    Article.countDocuments(),
    Article.countDocuments({ status: 'published' }),
    Article.countDocuments({ status: 'draft' }),
  ]);

  return { total, published, draft };
}

export async function listArticles(): Promise<SafeArticle[]> {
  const articles = await Article.find().sort({ updatedAt: -1 });
  return articles.map(toSafeArticle);
}

export async function getArticleById(id: string): Promise<SafeArticle> {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid article ID', 400);
  }

  const article = await Article.findById(id);
  if (!article) {
    throw new AppError('Article not found', 404);
  }

  return toSafeArticle(article);
}

export async function createArticle(input: CreateArticleInput): Promise<SafeArticle> {
  const category = await resolveCategory(input.categoryId);

  const slug = input.slug
    ? input.slug.toLowerCase()
    : await generateUniqueSlug(input.title);

  if (input.slug) {
    await ensureSlugAvailable(slug);
  }

  const article = await Article.create({
    title: input.title,
    slug,
    excerpt: input.excerpt ?? '',
    content: input.content ?? '',
    coverImage: normalizeCoverImage(input.coverImage),
    categoryId: category._id,
    categoryName: category.name,
    categorySlug: category.slug,
    tags: input.tags ?? [],
    status: 'draft',
    seo: input.seo ?? {},
    publishedAt: null,
  });

  return toSafeArticle(article);
}

export async function updateArticle(id: string, input: UpdateArticleInput): Promise<SafeArticle> {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid article ID', 400);
  }

  const article = await Article.findById(id);
  if (!article) {
    throw new AppError('Article not found', 404);
  }

  if (input.title !== undefined) {
    article.title = input.title;
  }

  if (input.slug !== undefined) {
    if (article.status === 'published') {
      // Preserve slug stability for published articles
      if (input.slug !== article.slug) {
        throw new AppError('Slug cannot be changed after an article is published', 400);
      }
    } else {
      const slug = input.slug.toLowerCase();
      await ensureSlugAvailable(slug, id);
      article.slug = slug;
    }
  }

  if (input.excerpt !== undefined) {
    article.excerpt = input.excerpt;
  }

  if (input.content !== undefined) {
    article.content = input.content;
  }

  if (input.coverImage !== undefined) {
    article.coverImage = normalizeCoverImage(input.coverImage);
  }

  if (input.categoryId !== undefined) {
    const category = await resolveCategory(input.categoryId);
    article.categoryId = category._id;
    article.categoryName = category.name;
    article.categorySlug = category.slug;
  }

  if (input.tags !== undefined) {
    article.tags = input.tags;
  }

  if (input.seo !== undefined) {
    article.seo = {
      title: input.seo.title,
      description: input.seo.description,
    };
  }

  await article.save();
  return toSafeArticle(article);
}

export async function deleteArticle(id: string): Promise<void> {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid article ID', 400);
  }

  const article = await Article.findByIdAndDelete(id);
  if (!article) {
    throw new AppError('Article not found', 404);
  }
}

export async function publishArticle(id: string): Promise<SafeArticle> {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid article ID', 400);
  }

  const article = await Article.findById(id);
  if (!article) {
    throw new AppError('Article not found', 404);
  }

  const errors: string[] = [];

  if (!article.title?.trim()) errors.push('Title is required to publish');
  if (!article.slug?.trim()) errors.push('Slug is required to publish');
  if (!article.content?.trim() || isContentEmpty(article.content)) errors.push('Content is required to publish');
  if (!article.categoryId) errors.push('Category is required to publish');

  if (errors.length > 0) {
    throw new AppError(`Cannot publish article: ${errors.join('; ')}`, 400);
  }

  article.status = 'published';
  article.publishedAt = new Date();
  await article.save();

  return toSafeArticle(article);
}

export async function unpublishArticle(id: string): Promise<SafeArticle> {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid article ID', 400);
  }

  const article = await Article.findById(id);
  if (!article) {
    throw new AppError('Article not found', 404);
  }

  article.status = 'draft';
  article.publishedAt = null;
  await article.save();

  return toSafeArticle(article);
}
