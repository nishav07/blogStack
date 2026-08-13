import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../shared/context/AuthContext';

export function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/admin/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-6">
            <Link to="/admin" className="text-lg font-semibold text-gray-900">
              BlogStack Admin
            </Link>
            <nav className="hidden sm:flex items-center gap-4 text-sm">
              <Link to="/admin" className="text-gray-600 hover:text-gray-900">
                Dashboard
              </Link>
              <Link to="/admin/articles/new" className="text-gray-600 hover:text-gray-900">
                New Article
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.name}</span>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
