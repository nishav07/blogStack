import { api } from './client';
import type { Article, ArticleStats, ArticleFormData } from '../types/article';

function toPayload(data: ArticleFormData) {
  const coverImage =
    data.coverImageUrl.trim() || data.coverImagePublicId.trim() || data.coverImageAlt.trim()
      ? {
          url: data.coverImageUrl.trim() || undefined,
          publicId: data.coverImagePublicId.trim() || undefined,
          alt: data.coverImageAlt.trim() || undefined,
        }
      : null;

  return {
    title: data.title.trim(),
    slug: data.slug.trim() || undefined,
    excerpt: data.excerpt.trim(),
    content: data.content,
    coverImage,
    categoryId: data.categoryId,
    tags: data.tags,
    seo: {
      title: data.seoTitle.trim() || undefined,
      description: data.seoDescription.trim() || undefined,
    },
  };
}

export async function getArticleStats(): Promise<ArticleStats> {
  const data = await api.get<{ stats: ArticleStats }>('/admin/articles/stats');
  return data.stats;
}

export async function getArticles(): Promise<Article[]> {
  const data = await api.get<{ articles: Article[] }>('/admin/articles');
  return data.articles;
}

export async function getArticle(id: string): Promise<Article> {
  const data = await api.get<{ article: Article }>(`/admin/articles/${id}`);
  return data.article;
}

export async function createArticle(form: ArticleFormData): Promise<Article> {
  const data = await api.post<{ article: Article }>('/admin/articles', toPayload(form));
  return data.article;
}

export async function updateArticle(id: string, form: ArticleFormData): Promise<Article> {
  const data = await api.put<{ article: Article }>(`/admin/articles/${id}`, toPayload(form));
  return data.article;
}

export async function deleteArticle(id: string): Promise<void> {
  await api.delete(`/admin/articles/${id}`);
}

export async function publishArticle(id: string): Promise<Article> {
  const data = await api.patch<{ article: Article }>(`/admin/articles/${id}/publish`);
  return data.article;
}

export async function unpublishArticle(id: string): Promise<Article> {
  const data = await api.patch<{ article: Article }>(`/admin/articles/${id}/unpublish`);
  return data.article;
}
