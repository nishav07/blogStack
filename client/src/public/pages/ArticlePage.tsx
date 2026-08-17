import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getPublicArticle } from '../../shared/api/public';
import type { Article } from '../../shared/types/article';
import { SEOHead, getSiteUrl } from '../components/SEOHead';

export function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;

    getPublicArticle(slug)
      .then(setArticle)
      .catch((err: { status?: number }) => {
        if (err.status === 404) setNotFound(true);
      })
      .finally(() => setIsLoading(false));
  }, [slug]);

  if (isLoading) {
    return <p className="text-gray-500">Loading article...</p>;
  }

  if (notFound || !article) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-semibold text-gray-900">Article not found</h1>
        <p className="mt-2 text-gray-600">This article may be unpublished or does not exist.</p>
        <Link to="/" className="mt-4 inline-block text-blue-600 hover:text-blue-700">
          ← Back to home
        </Link>
      </div>
    );
  }

  const siteUrl = getSiteUrl();
  const canonical = `${siteUrl}/post/${article.slug}`;
  const seoTitle = article.seo.title || article.title;
  const seoDescription = article.seo.description || article.excerpt || undefined;
  const ogImage = article.coverImage?.url;

  return (
    <>
      <SEOHead
        title={seoTitle}
        description={seoDescription}
        canonical={canonical}
        ogImage={ogImage}
        ogType="article"
      />

      <article>
        <nav className="mb-4 text-sm text-gray-500">
          <Link to="/" className="hover:text-gray-900">Home</Link>
          <span className="mx-2">/</span>
          <Link to={`/category/${article.categorySlug}`} className="hover:text-gray-900">
            {article.categoryName}
          </Link>
        </nav>

        <header className="mb-8">
          <div className="mb-3 flex flex-wrap items-center gap-2 text-sm text-gray-500">
            <Link
              to={`/category/${article.categorySlug}`}
              className="font-medium text-blue-600 hover:text-blue-700"
            >
              {article.categoryName}
            </Link>
            {article.publishedAt && (
              <>
                <span>·</span>
                <time dateTime={article.publishedAt}>
                  {new Date(article.publishedAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>
              </>
            )}
          </div>
          <h1 className="text-4xl font-bold text-gray-900">{article.title}</h1>
          {article.excerpt && (
            <p className="mt-4 text-xl text-gray-600">{article.excerpt}</p>
          )}
        </header>

        {article.coverImage?.url && (
          <img
            src={article.coverImage.url}
            alt={article.coverImage.alt || article.title}
            className="mb-8 w-full rounded-lg object-cover max-h-[480px]"
          />
        )}

        <div
          className="prose prose-lg max-w-none prose-headings:font-semibold prose-a:text-blue-600"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {article.tags.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </article>
    </>
  );
}
