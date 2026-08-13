import { useEffect, useState } from 'react';
import { getCategories, createCategory } from '../../shared/api/categories';
import type { Category } from '../../shared/types/article';

interface CategorySelectProps {
  value: string;
  onChange: (categoryId: string) => void;
  error?: string;
  disabled?: boolean;
}

export function CategorySelect({ value, onChange, error, disabled }: CategorySelectProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [createError, setCreateError] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setCategories([]))
      .finally(() => setIsLoading(false));
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) {
      setCreateError('Category name is required');
      return;
    }

    setIsCreating(true);
    setCreateError('');

    try {
      const category = await createCategory(newName.trim());
      setCategories((prev) => [...prev, category].sort((a, b) => a.name.localeCompare(b.name)));
      onChange(category.id);
      setNewName('');
      setShowCreate(false);
    } catch (err) {
      const error = err as { error?: string };
      setCreateError(error.error ?? 'Failed to create category');
    } finally {
      setIsCreating(false);
    }
  }

  if (isLoading) {
    return <p className="text-sm text-gray-500">Loading categories...</p>;
  }

  return (
    <div className="space-y-3">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? 'border-red-400' : 'border-gray-300'
        }`}
      >
        <option value="">Select a category</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {!showCreate ? (
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          + Create new category
        </button>
      ) : (
        <form onSubmit={handleCreate} className="rounded-md border border-gray-200 bg-gray-50 p-3 space-y-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Category name"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            disabled={isCreating}
          />
          {createError && <p className="text-sm text-red-600">{createError}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isCreating}
              className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {isCreating ? 'Creating...' : 'Add category'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCreate(false);
                setNewName('');
                setCreateError('');
              }}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
