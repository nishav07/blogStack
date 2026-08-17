import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { CategorySelect } from '../components/CategorySelect';
import { TagsInput } from '../components/TagsInput';
import { ArticleEditor } from '../components/ArticleEditor';
import { CoverImageUpload } from '../components/CoverImageUpload';
import {
  createArticle,
  getArticle,
  publishArticle,
  unpublishArticle,
  updateArticle,
} from '../../shared/api/articles';
import type { ApiErrorResponse, ArticleFormData } from '../../shared/types/article';
import { slugify } from '../../shared/utils/slugify';
import { isContentEmpty } from '../../shared/utils/content';
import { useToast } from '../../shared/context/ToastContext';

const emptyForm: ArticleFormData = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  coverImageUrl: '',
  coverImagePublicId: '',
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
  const { showToast } = useToast();

  const [form, setForm] = useState<ArticleFormData>(emptyForm);
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [publishedAt, setPublishedAt] = useState<string | null>(null);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const isPublished = status === 'published';

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
          coverImagePublicId: article.coverImage?.publicId ?? '',
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
        showToast(err.error ?? 'Failed to load article', 'error');
      })
      .finally(() => setIsLoading(false));
  }, [id, showToast]);

  function updateField<K extends keyof ArticleFormData>(key: K, value: ArticleFormData[K]) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'title' && !slugManuallyEdited && !isPublished) {
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
      showToast('Please fix the validation errors', 'error');
    } else {
      showToast(err.error ?? 'Request failed', 'error');
    }
  }

  function validateDraft(): boolean {
    const errors: Record<string, string> = {};
    if (!form.title.trim()) errors.title = 'Title is required';
    if (!form.slug.trim()) errors.slug = 'Slug is required';
    if (!form.categoryId) errors.categoryId = 'Category is required';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function validatePublish(): boolean {
    const errors: Record<string, string> = {};
    if (!form.title.trim()) errors.title = 'Title is required';
    if (!form.slug.trim()) errors.slug = 'Slug is required';
    if (isContentEmpty(form.content)) errors.content = 'Content is required to publish';
    if (!form.categoryId) errors.categoryId = 'Category is required';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function persistArticle(): Promise<string | null> {
    if (isEdit && id) {
      const article = await updateArticle(id, form);
      return article.id;
    }
    const article = await createArticle(form);
    return article.id;
  }

  async function handleSaveDraft(e: FormEvent) {
    e.preventDefault();
    if (!validateDraft()) return;

    setIsSubmitting(true);
    setFieldErrors({});

    try {
      const articleId = await persistArticle();
      if (!articleId) return;

      showToast(isEdit ? 'Draft updated successfully' : 'Draft saved successfully');
      if (!isEdit) {
        navigate(`/admin/articles/${articleId}/edit`, { replace: true });
      } else {
        navigate('/admin');
      }
    } catch (err) {
      applyApiErrors(err as ApiErrorResponse);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handlePublish() {
    if (!validatePublish()) return;

    setIsSubmitting(true);
    setFieldErrors({});

    try {
      let articleId = id;

      if (isEdit && id) {
        await updateArticle(id, form);
        articleId = id;
      } else {
        const created = await createArticle(form);
        articleId = created.id;
      }

      if (!articleId) return;

      await publishArticle(articleId);
      showToast('Article published successfully');
      navigate('/admin');
    } catch (err) {
      applyApiErrors(err as ApiErrorResponse);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleUpdate() {
    if (!validatePublish()) return;
    if (!id) return;

    setIsSubmitting(true);
    setFieldErrors({});

    try {
      await updateArticle(id, form);
      showToast('Article updated successfully');
      navigate('/admin');
    } catch (err) {
      applyApiErrors(err as ApiErrorResponse);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleUnpublish() {
    if (!id) return;

    setIsSubmitting(true);

    try {
      await unpublishArticle(id);
      showToast('Article unpublished successfully');
      navigate('/admin');
    } catch (err) {
      applyApiErrors(err as ApiErrorResponse);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return <p className="text-sm text-gray-500">Loading article...</p>;
  }

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
                  isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
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
        <Link to="/admin" className="text-sm font-medium text-gray-600 hover:text-gray-900">
          ← Back to dashboard
        </Link>
      </div>

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
              disabled={isSubmitting}
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
              readOnly={isPublished}
              className={`w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 ${
                fieldErrors.slug ? 'border-red-400' : 'border-gray-300'
              } ${isPublished ? 'bg-gray-100 text-gray-600' : ''}`}
              disabled={isSubmitting}
            />
            {fieldErrors.slug && <p className="mt-1 text-sm text-red-600">{fieldErrors.slug}</p>}
            <p className="mt-1 text-xs text-gray-500">
              {isPublished
                ? 'Slug is locked after publishing to preserve URL stability.'
                : 'Auto-generated from title. You can edit it while the article is a draft.'}
            </p>
            {form.slug && (
              <p className="mt-1 text-xs text-gray-600">
                Public URL: <code className="rounded bg-gray-100 px-1">/post/{form.slug}</code>
              </p>
            )}
          </div>

          <div>
            <label htmlFor="excerpt" className="mb-1.5 block text-sm font-medium text-gray-700">
              Article Preview
            </label>
            <textarea
              id="excerpt"
              rows={3}
              value={form.excerpt}
              onChange={(e) => updateField('excerpt', e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Content</label>
            <ArticleEditor
              value={form.content}
              onChange={(html) => updateField('content', html)}
              disabled={isSubmitting}
              error={fieldErrors.content}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Category</label>
            <CategorySelect
              value={form.categoryId}
              onChange={(categoryId) => updateField('categoryId', categoryId)}
              error={fieldErrors.categoryId}
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Tags</label>
            <TagsInput
              value={form.tags}
              onChange={(tags) => updateField('tags', tags)}
              error={fieldErrors.tags}
              disabled={isSubmitting}
            />
          </div>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-6 space-y-5">
          <h2 className="text-lg font-medium text-gray-900">Cover image</h2>
          <CoverImageUpload
            url={form.coverImageUrl}
            publicId={form.coverImagePublicId}
            alt={form.coverImageAlt}
            onChange={({ url, publicId, alt }) => {
              setForm((prev) => ({
                ...prev,
                coverImageUrl: url,
                coverImagePublicId: publicId,
                coverImageAlt: alt,
              }));
            }}
            disabled={isSubmitting}
          />
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
              disabled={isSubmitting}
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
              disabled={isSubmitting}
            />
          </div>
        </section>

        <div className="flex flex-wrap items-center gap-3">
          {!isPublished && (
            <>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? 'Saving...' : isEdit ? 'Save Draft' : 'Save Draft'}
              </button>
              <button
                type="button"
                onClick={handlePublish}
                disabled={isSubmitting}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? 'Publishing...' : 'Publish'}
              </button>
            </>
          )}

          {isPublished && isEdit && (
            <>
              <button
                type="button"
                onClick={handleUpdate}
                disabled={isSubmitting}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? 'Updating...' : 'Update'}
              </button>
              <button
                type="button"
                onClick={handleUnpublish}
                disabled={isSubmitting}
                className="rounded-md border border-yellow-400 bg-yellow-50 px-4 py-2 text-sm font-medium text-yellow-800 hover:bg-yellow-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? 'Unpublishing...' : 'Unpublish'}
              </button>
            </>
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
