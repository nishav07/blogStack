import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { CategorySelect } from '../components/CategorySelect';
import { TagsInput } from '../components/TagsInput';
import {
  createArticle,
  getArticle,
  publishArticle,
  unpublishArticle,
  updateArticle,
} from '../../shared/api/articles';
import type { ApiErrorResponse, ArticleFormData } from '../../shared/types/article';
import { slugify } from '../../shared/utils/slugify';

const emptyForm: ArticleFormData = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  coverImageUrl: '',
  coverImageAlt: '',
  categoryId: '',
  tags: [],
  seoTitle: '',
  seoDescription: '',
};

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString();
}

export function ArticleFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState<ArticleFormData>(emptyForm);
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [publishedAt, setPublishedAt] = useState<string | null>(null);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSaving, setIsSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (!id) return;

    getArticle(id)
      .then((article) => {
        setForm({
          title: article.title,
          slug: article.slug,
          excerpt: article.excerpt,
          content: article.content,
          coverImageUrl: article.coverImage?.url ?? '',
          coverImageAlt: article.coverImage?.alt ?? '',
          categoryId: article.categoryId,
          tags: article.tags,
          seoTitle: article.seo.title ?? '',
          seoDescription: article.seo.description ?? '',
        });
        setStatus(article.status);
        setPublishedAt(article.publishedAt);
        setSlugManuallyEdited(true);
      })
      .catch((err: ApiErrorResponse) => {
        setFormError(err.error ?? 'Failed to load article');
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  function updateField<K extends keyof ArticleFormData>(key: K, value: ArticleFormData[K]) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };

      if (key === 'title' && !slugManuallyEdited && status === 'draft') {
        next.slug = slugify(String(value));
      }

      return next;
    });
  }

  function handleSlugChange(value: string) {
    setSlugManuallyEdited(true);
    setForm((prev) => ({ ...prev, slug: value }));
  }

  function applyApiErrors(err: ApiErrorResponse) {
    if (err.details?.length) {
      const mapped: Record<string, string> = {};
      for (const detail of err.details) {
        mapped[detail.field] = detail.message;
      }
      setFieldErrors(mapped);
    } else {
      setFormError(err.error ?? 'Request failed');
    }
  }

  function validateClient(): boolean {
    const errors: Record<string, string> = {};
    if (!form.title.trim()) errors.title = 'Title is required';
    if (!form.slug.trim()) errors.slug = 'Slug is required';
    if (!form.categoryId) errors.categoryId = 'Category is required';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function saveDraft(): Promise<string | null> {
    if (!validateClient()) return null;

    setIsSaving(true);
    setFormError('');
    setFieldErrors({});

    try {
      if (isEdit && id) {
        const article = await updateArticle(id, form);
        setStatus(article.status);
        setPublishedAt(article.publishedAt);
        return article.id;
      }

      const article = await createArticle(form);
      setStatus(article.status);
      setPublishedAt(article.publishedAt);
      return article.id;
    } catch (err) {
      applyApiErrors(err as ApiErrorResponse);
      return null;
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSaveDraft(e: FormEvent) {
    e.preventDefault();
    const articleId = await saveDraft();
    if (articleId && !isEdit) {
      navigate(`/admin/articles/${articleId}/edit`, { replace: true });
    }
  }

  async function handlePublish(e: FormEvent) {
    e.preventDefault();

    const errors: Record<string, string> = {};
    if (!form.title.trim()) errors.title = 'Title is required';
    if (!form.slug.trim()) errors.slug = 'Slug is required';
    if (!form.content.trim()) errors.content = 'Content is required to publish';
    if (!form.categoryId) errors.categoryId = 'Category is required';

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSaving(true);
    setFormError('');
    setFieldErrors({});

    try {
      let articleId = id;

      if (isEdit && id) {
        const updated = await updateArticle(id, form);
        if (updated.status === 'published') {
          setStatus(updated.status);
          setPublishedAt(updated.publishedAt);
          return;
        }
        articleId = id;
      } else {
        const created = await createArticle(form);
        articleId = created.id;
      }

      if (!articleId) return;

      const published = await publishArticle(articleId);
      setStatus(published.status);
      setPublishedAt(published.publishedAt);

      if (!isEdit) {
        navigate(`/admin/articles/${articleId}/edit`, { replace: true });
      }
    } catch (err) {
      applyApiErrors(err as ApiErrorResponse);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleUnpublish() {
    if (!id) return;

    setIsSaving(true);
    setFormError('');

    try {
      const article = await unpublishArticle(id);
      setStatus(article.status);
      setPublishedAt(article.publishedAt);
    } catch (err) {
      applyApiErrors(err as ApiErrorResponse);
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <p className="text-sm text-gray-500">Loading article...</p>;
  }

  const slugLocked = status === 'published';

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {isEdit ? 'Edit Article' : 'New Article'}
          </h1>
          {isEdit && (
            <p className="mt-1 text-sm text-gray-600">
              Status:{' '}
              <span
                className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                  status === 'published'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {status}
              </span>
              {publishedAt && (
                <span className="ml-2 text-gray-500">Published {formatDate(publishedAt)}</span>
              )}
            </p>
          )}
        </div>
        <Link
          to="/admin"
          className="text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          ← Back to dashboard
        </Link>
      </div>

      {formError && (
        <div className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {formError}
        </div>
      )}

      <form onSubmit={handleSaveDraft} className="space-y-6">
        <section className="rounded-lg border border-gray-200 bg-white p-6 space-y-5">
          <h2 className="text-lg font-medium text-gray-900">Article details</h2>

          <div>
            <label htmlFor="title" className="mb-1.5 block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              id="title"
              type="text"
              value={form.title}
              onChange={(e) => updateField('title', e.target.value)}
              className={`w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 ${
                fieldErrors.title ? 'border-red-400' : 'border-gray-300'
              }`}
              disabled={isSaving}
            />
            {fieldErrors.title && <p className="mt-1 text-sm text-red-600">{fieldErrors.title}</p>}
          </div>

          <div>
            <label htmlFor="slug" className="mb-1.5 block text-sm font-medium text-gray-700">
              Slug
            </label>
            <input
              id="slug"
              type="text"
              value={form.slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              readOnly={slugLocked}
              className={`w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 ${
                fieldErrors.slug ? 'border-red-400' : 'border-gray-300'
              } ${slugLocked ? 'bg-gray-100 text-gray-600' : ''}`}
              disabled={isSaving}
            />
            {fieldErrors.slug && <p className="mt-1 text-sm text-red-600">{fieldErrors.slug}</p>}
            <p className="mt-1 text-xs text-gray-500">
              {slugLocked
                ? 'Slug is locked after publishing to preserve URL stability.'
                : 'Auto-generated from title. You can edit it while the article is a draft.'}
            </p>
            {form.slug && (
              <p className="mt-1 text-xs text-gray-600">
                Future URL: <code className="rounded bg-gray-100 px-1">/post/{form.slug}</code>
              </p>
            )}
          </div>

          <div>
            <label htmlFor="excerpt" className="mb-1.5 block text-sm font-medium text-gray-700">
              Excerpt
            </label>
            <textarea
              id="excerpt"
              rows={3}
              value={form.excerpt}
              onChange={(e) => updateField('excerpt', e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSaving}
            />
          </div>

          <div>
            <label htmlFor="content" className="mb-1.5 block text-sm font-medium text-gray-700">
              Content
            </label>
            <textarea
              id="content"
              rows={12}
              value={form.content}
              onChange={(e) => updateField('content', e.target.value)}
              className={`w-full rounded-md border px-3 py-2 font-mono text-sm outline-none focus:ring-2 focus:ring-blue-500 ${
                fieldErrors.content ? 'border-red-400' : 'border-gray-300'
              }`}
              disabled={isSaving}
            />
            {fieldErrors.content && <p className="mt-1 text-sm text-red-600">{fieldErrors.content}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Category</label>
            <CategorySelect
              value={form.categoryId}
              onChange={(categoryId) => updateField('categoryId', categoryId)}
              error={fieldErrors.categoryId}
              disabled={isSaving}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Tags</label>
            <TagsInput
              value={form.tags}
              onChange={(tags) => updateField('tags', tags)}
              error={fieldErrors.tags}
              disabled={isSaving}
            />
          </div>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-6 space-y-5">
          <h2 className="text-lg font-medium text-gray-900">Cover image (optional)</h2>
          <p className="text-sm text-gray-500">Image upload will be available in a later phase. URL only for now.</p>

          <div>
            <label htmlFor="coverImageUrl" className="mb-1.5 block text-sm font-medium text-gray-700">
              Image URL
            </label>
            <input
              id="coverImageUrl"
              type="url"
              value={form.coverImageUrl}
              onChange={(e) => updateField('coverImageUrl', e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSaving}
            />
          </div>

          <div>
            <label htmlFor="coverImageAlt" className="mb-1.5 block text-sm font-medium text-gray-700">
              Alt text
            </label>
            <input
              id="coverImageAlt"
              type="text"
              value={form.coverImageAlt}
              onChange={(e) => updateField('coverImageAlt', e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSaving}
            />
          </div>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-6 space-y-5">
          <h2 className="text-lg font-medium text-gray-900">SEO</h2>

          <div>
            <label htmlFor="seoTitle" className="mb-1.5 block text-sm font-medium text-gray-700">
              SEO title
            </label>
            <input
              id="seoTitle"
              type="text"
              value={form.seoTitle}
              onChange={(e) => updateField('seoTitle', e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSaving}
            />
          </div>

          <div>
            <label htmlFor="seoDescription" className="mb-1.5 block text-sm font-medium text-gray-700">
              SEO description
            </label>
            <textarea
              id="seoDescription"
              rows={3}
              value={form.seoDescription}
              onChange={(e) => updateField('seoDescription', e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSaving}
            />
          </div>
        </section>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-60"
          >
            {isSaving ? 'Saving...' : 'Save Draft'}
          </button>

          <button
            type="button"
            onClick={handlePublish}
            disabled={isSaving}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {isSaving ? 'Publishing...' : status === 'published' ? 'Update & Keep Published' : 'Publish'}
          </button>

          {status === 'published' && isEdit && (
            <button
              type="button"
              onClick={handleUnpublish}
              disabled={isSaving}
              className="rounded-md border border-yellow-400 bg-yellow-50 px-4 py-2 text-sm font-medium text-yellow-800 hover:bg-yellow-100 disabled:opacity-60"
            >
              Unpublish
            </button>
          )}

          <Link
            to="/admin"
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
