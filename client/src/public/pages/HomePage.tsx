import { useEffect, useState } from 'react';
import { getPublicArticles } from '../../shared/api/public';
import type { Article } from '../../shared/types/article';
import { ArticleCard } from '../components/ArticleCard';
import { SEOHead, getSiteUrl } from '../components/SEOHead';

export function HomePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getPublicArticles()
      .then((data) => setArticles(data.articles))
      .catch((err: { error?: string }) => setError(err.error ?? 'Failed to load articles'))
      .finally(() => setIsLoading(false));
  }, []);

  const siteUrl = getSiteUrl();

  return (
    <>
      <SEOHead
        title="BlogStack"
        description="Latest articles and guides"
        canonical={siteUrl || undefined}
      />

      <div>
        <h1 className="text-3xl font-bold text-gray-900">Latest Articles</h1>
        <p className="mt-2 text-gray-600">Browse our published content</p>

        {isLoading && <p className="mt-8 text-gray-500">Loading articles...</p>}
        {error && <p className="mt-8 text-red-600">{error}</p>}

        {!isLoading && !error && articles.length === 0 && (
          <p className="mt-8 text-gray-500">No published articles yet.</p>
        )}

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </div>
    </>
  );
}
