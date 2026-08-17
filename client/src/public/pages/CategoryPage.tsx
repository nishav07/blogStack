import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getPublicCategoryArticles } from '../../shared/api/public';
import type { Article, Category } from '../../shared/types/article';
import { ArticleCard } from '../components/ArticleCard';
import { SEOHead, getSiteUrl } from '../components/SEOHead';

export function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;

    getPublicCategoryArticles(slug)
      .then((data) => {
        setCategory(data.category);
        setArticles(data.articles);
      })
      .catch((err: { status?: number }) => {
        if (err.status === 404) setNotFound(true);
      })
      .finally(() => setIsLoading(false));
  }, [slug]);

  if (isLoading) {
    return <p className="text-gray-500">Loading category...</p>;
  }

  if (notFound || !category) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-semibold text-gray-900">Category not found</h1>
        <Link to="/" className="mt-4 inline-block text-blue-600 hover:text-blue-700">
          ← Back to home
        </Link>
      </div>
    );
  }

  const siteUrl = getSiteUrl();
  const canonical = `${siteUrl}/category/${category.slug}`;

  return (
    <>
      <SEOHead
        title={category.name}
        description={category.description || `Articles in ${category.name}`}
        canonical={canonical}
      />

      <div>
        <nav className="mb-4 text-sm text-gray-500">
          <Link to="/" className="hover:text-gray-900">Home</Link>
          <span className="mx-2">/</span>
          <span>{category.name}</span>
        </nav>

        <h1 className="text-3xl font-bold text-gray-900">{category.name}</h1>
        {category.description && (
          <p className="mt-2 text-gray-600">{category.description}</p>
        )}

        {articles.length === 0 ? (
          <p className="mt-8 text-gray-500">No published articles in this category yet.</p>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
