import { api } from './client';
import type { Category } from '../types/article';

export async function getCategories(): Promise<Category[]> {
  const data = await api.get<{ categories: Category[] }>('/admin/categories');
  return data.categories;
}

export async function createCategory(name: string, description?: string): Promise<Category> {
  const data = await api.post<{ category: Category }>('/admin/categories', {
    name,
    description,
  });
  return data.category;
}
