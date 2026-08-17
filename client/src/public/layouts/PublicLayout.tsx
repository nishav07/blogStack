import { Link, Outlet } from 'react-router-dom';

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <Link to="/" className="text-xl font-semibold text-gray-900">
            BlogStack
          </Link>
          <Link
            to="/admin"
            className="text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            Admin
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-8">
        <Outlet />
      </main>
      <footer className="border-t border-gray-200 mt-12">
        <div className="mx-auto max-w-4xl px-4 py-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} BlogStack
        </div>
      </footer>
    </div>
  );
}
