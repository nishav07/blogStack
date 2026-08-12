import type { ApiError, User } from '../types/auth';

const API_BASE = '/api';

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = data as ApiError;
    throw { status: response.status, ...error };
  }

  return data as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),
};

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
