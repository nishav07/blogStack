export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CoverImage {
  url?: string;
  alt?: string;
}

export interface ArticleSeo {
  title?: string;
  description?: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: CoverImage | null;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  tags: string[];
  status: 'draft' | 'published';
  seo: ArticleSeo;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ArticleStats {
  total: number;
  published: number;
  draft: number;
}

export interface ArticleFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImageUrl: string;
  coverImageAlt: string;
  categoryId: string;
  tags: string[];
  seoTitle: string;
  seoDescription: string;
}

export interface ValidationDetail {
  field: string;
  message: string;
}

export interface ApiErrorResponse {
  status?: number;
  error: string;
  details?: ValidationDetail[];
}
