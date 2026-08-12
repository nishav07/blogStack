import { FormEvent, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../shared/context/AuthContext';
import type { ApiError } from '../../shared/types/auth';

export function LoginPage() {
  const { user, isLoading, login } = useAuth();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [authError, setAuthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isLoading && user) {
    return <Navigate to={from} replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFieldErrors({});
    setAuthError('');
    setIsSubmitting(true);

    const errors: Record<string, string> = {};
    if (!email.trim()) errors.email = 'Email is required';
    if (!password) errors.password = 'Password is required';

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setIsSubmitting(false);
      return;
    }

    try {
      await login(email.trim(), password);
    } catch (err) {
      const error = err as ApiError & { status?: number; details?: { field: string; message: string }[] };

      if (error.details?.length) {
        const mapped: Record<string, string> = {};
        for (const detail of error.details) {
          mapped[detail.field] = detail.message;
        }
        setFieldErrors(mapped);
      } else if (error.status === 401) {
        setAuthError('Invalid email or password');
      } else if (error.status === 429) {
        setAuthError('Too many login attempts. Please try again later.');
      } else {
        setAuthError(error.error ?? 'Login failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-semibold text-gray-900">BlogStack Admin</h1>
            <p className="mt-2 text-sm text-gray-600">Sign in to manage your content</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {authError && (
              <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
                {authError}
              </div>
            )}

            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 ${
                  fieldErrors.email ? 'border-red-400' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
              />
              {fieldErrors.email && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 ${
                  fieldErrors.password ? 'border-red-400' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
              />
              {fieldErrors.password && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
