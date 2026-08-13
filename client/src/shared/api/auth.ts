import { api } from './client';
import type { User } from '../types/auth';

export async function login(email: string, password: string): Promise<User> {
  const data = await api.post<{ user: User }>('/admin/auth/login', { email, password });
  return data.user;
}

export async function logout(): Promise<void> {
  await api.post('/admin/auth/logout');
}

export async function getCurrentUser(): Promise<User> {
  const data = await api.get<{ user: User }>('/admin/auth/me');
  return data.user;
}
