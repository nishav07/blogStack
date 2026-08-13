import { useState } from 'react';

interface TagsInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  error?: string;
  disabled?: boolean;
}

export function TagsInput({ value, onChange, error, disabled }: TagsInputProps) {
  const [input, setInput] = useState('');

  function addTag(raw: string) {
    const tag = raw.trim().toLowerCase();
    if (!tag || value.includes(tag)) return;
    if (value.length >= 20) return;
    onChange([...value, tag]);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(input);
      setInput('');
    } else if (e.key === 'Backspace' && !input && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  function removeTag(tag: string) {
    onChange(value.filter((t) => t !== tag));
  }

  return (
    <div>
      <div
        className={`flex flex-wrap gap-2 rounded-md border px-3 py-2 ${
          error ? 'border-red-400' : 'border-gray-300'
        } ${disabled ? 'bg-gray-100' : 'bg-white'}`}
      >
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-sm text-blue-700"
          >
            {tag}
            {!disabled && (
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="text-blue-500 hover:text-blue-700"
                aria-label={`Remove ${tag}`}
              >
                ×
              </button>
            )}
          </span>
        ))}
        {!disabled && (
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => {
              if (input.trim()) {
                addTag(input);
                setInput('');
              }
            }}
            placeholder={value.length === 0 ? 'Type a tag and press Enter' : 'Add tag...'}
            className="min-w-[120px] flex-1 border-0 bg-transparent text-sm outline-none"
          />
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      <p className="mt-1 text-xs text-gray-500">Press Enter or comma to add a tag. Maximum 20 tags.</p>
    </div>
  );
}
