import { Link } from 'react-router-dom';
import type { Article } from '../../shared/types/article';

export function ArticleCard({ article }: { article: Article }) {
  return (
    <article className="group rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {article.coverImage?.url && (
        <Link to={`/post/${article.slug}`}>
          <img
            src={article.coverImage.url}
            alt={article.coverImage.alt || article.title}
            className="h-48 w-full object-cover"
            loading="lazy"
          />
        </Link>
      )}
      <div className="p-5">
        <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
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
        <h2 className="text-xl font-semibold text-gray-900 group-hover:text-blue-700">
          <Link to={`/post/${article.slug}`}>{article.title}</Link>
        </h2>
        {article.excerpt && (
          <p className="mt-2 text-gray-600 line-clamp-3">{article.excerpt}</p>
        )}
      </div>
    </article>
  );
}
