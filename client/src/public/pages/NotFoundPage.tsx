import { Link } from 'react-router-dom';
import { SEOHead } from '../components/SEOHead';

export function NotFoundPage() {
  return (
    <>
      <SEOHead title="Page Not Found" noindex />
      <div className="text-center py-12">
        <h1 className="text-2xl font-semibold text-gray-900">404 — Page Not Found</h1>
        <p className="mt-2 text-gray-600">The page you are looking for does not exist.</p>
        <Link to="/" className="mt-4 inline-block text-blue-600 hover:text-blue-700">
          ← Back to home
        </Link>
      </div>
    </>
  );
}
