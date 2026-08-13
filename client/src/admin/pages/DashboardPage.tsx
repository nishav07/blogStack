import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../shared/context/AuthContext';
import { getArticles, getArticleStats, deleteArticle } from '../../shared/api/articles';
import type { Article, ArticleStats } from '../../shared/types/article';

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function StatusBadge({ status }: { status: Article['status'] }) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
        status === 'published'
          ? 'bg-green-100 text-green-800'
          : 'bg-yellow-100 text-yellow-800'
      }`}
    >
      {status}
    </span>
  );
}

export function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<ArticleStats | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function loadData() {
    setIsLoading(true);
    setError('');
    try {
      const [statsData, articlesData] = await Promise.all([getArticleStats(), getArticles()]);
      setStats(statsData);
      setArticles(articlesData);
    } catch (err) {
      const apiErr = err as { error?: string };
      setError(apiErr.error ?? 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleDelete(id: string, title: string) {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;

    setDeletingId(id);
    try {
      await deleteArticle(id);
      setArticles((prev) => prev.filter((a) => a.id !== id));
      if (stats) {
        const removed = articles.find((a) => a.id === id);
        if (removed) {
          setStats({
            total: stats.total - 1,
            published: stats.published - (removed.status === 'published' ? 1 : 0),
            draft: stats.draft - (removed.status === 'draft' ? 1 : 0),
          });
        }
      }
    } catch (err) {
      const apiErr = err as { error?: string };
      alert(apiErr.error ?? 'Failed to delete article');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-gray-600">
            Welcome back, {user?.name}.
          </p>
        </div>
        <Link
          to="/admin/articles/new"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          New Article
        </Link>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {isLoading ? (
        <p className="text-sm text-gray-500">Loading dashboard...</p>
      ) : (
        <>
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-gray-200 bg-white p-5">
              <p className="text-sm text-gray-500">Total articles</p>
              <p className="mt-1 text-3xl font-semibold text-gray-900">{stats?.total ?? 0}</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-5">
              <p className="text-sm text-gray-500">Published</p>
              <p className="mt-1 text-3xl font-semibold text-green-700">{stats?.published ?? 0}</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-5">
              <p className="text-sm text-gray-500">Drafts</p>
              <p className="mt-1 text-3xl font-semibold text-yellow-700">{stats?.draft ?? 0}</p>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-medium text-gray-900">Articles</h2>
            </div>

            {articles.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className="text-sm text-gray-500">No articles yet.</p>
                <Link
                  to="/admin/articles/new"
                  className="mt-3 inline-block text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  Create your first article
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left font-medium text-gray-500">Title</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-500">Status</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-500">Category</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-500">Created</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-500">Updated</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-500">Published</th>
                      <th className="px-6 py-3 text-right font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {articles.map((article) => (
                      <tr key={article.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">{article.title}</td>
                        <td className="px-6 py-4">
                          <StatusBadge status={article.status} />
                        </td>
                        <td className="px-6 py-4 text-gray-600">{article.categoryName}</td>
                        <td className="px-6 py-4 text-gray-600">{formatDate(article.createdAt)}</td>
                        <td className="px-6 py-4 text-gray-600">{formatDate(article.updatedAt)}</td>
                        <td className="px-6 py-4 text-gray-600">{formatDate(article.publishedAt)}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-3">
                            <Link
                              to={`/admin/articles/${article.id}/edit`}
                              className="font-medium text-blue-600 hover:text-blue-700"
                            >
                              Edit
                            </Link>
                            <button
                              type="button"
                              onClick={() => handleDelete(article.id, article.title)}
                              disabled={deletingId === article.id}
                              className="font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
                            >
                              {deletingId === article.id ? 'Deleting...' : 'Delete'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
