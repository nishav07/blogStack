import { api } from './client';
import type { Article, Category } from '../types/article';

export interface PaginatedArticles {
  articles: Article[];
  total: number;
  page: number;
  totalPages: number;
}

export async function getPublicArticles(page = 1): Promise<PaginatedArticles> {
  return api.get<PaginatedArticles>(`/public/articles?page=${page}`);
}

export async function getPublicArticle(slug: string): Promise<Article> {
  const data = await api.get<{ article: Article }>(`/public/articles/${slug}`);
  return data.article;
}

export async function getPublicCategories(): Promise<Category[]> {
  const data = await api.get<{ categories: Category[] }>('/public/categories');
  return data.categories;
}

export async function getPublicCategoryArticles(
  slug: string,
  page = 1
): Promise<PaginatedArticles & { category: Category }> {
  return api.get<PaginatedArticles & { category: Category }>(
    `/public/categories/${slug}/articles?page=${page}`
  );
}
