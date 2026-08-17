import { useRef, useState } from 'react';
import { uploadToCloudinary } from '../../shared/api/uploads';

interface CoverImageUploadProps {
  url: string;
  publicId: string;
  alt: string;
  onChange: (data: { url: string; publicId: string; alt: string }) => void;
  disabled?: boolean;
}

export function CoverImageUpload({ url, publicId, alt, onChange, disabled }: CoverImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image must be 5MB or smaller');
      return;
    }

    setIsUploading(true);
    setUploadError('');

    try {
      const result = await uploadToCloudinary(file);
      onChange({ url: result.url, publicId: result.publicId, alt: alt || file.name });
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  function handleRemove() {
    onChange({ url: '', publicId: '', alt: '' });
    setUploadError('');
  }

  return (
    <div className="space-y-4">
      {url ? (
        <div className="relative inline-block">
          <img
            src={url}
            alt={alt || 'Cover preview'}
            className="max-h-48 rounded-md border border-gray-200 object-cover"
          />
          {!disabled && (
            <button
              type="button"
              onClick={handleRemove}
              className="absolute right-2 top-2 rounded-md bg-white/90 px-2 py-1 text-xs font-medium text-red-600 shadow hover:bg-white"
            >
              Remove
            </button>
          )}
        </div>
      ) : (
        <div className="flex h-32 items-center justify-center rounded-md border-2 border-dashed border-gray-300 bg-gray-50 text-sm text-gray-500">
          No cover image selected
        </div>
      )}

      <div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFileChange}
          disabled={disabled || isUploading}
          className="block w-full text-sm text-gray-600 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
        />
        {isUploading && <p className="mt-2 text-sm text-gray-500">Uploading image...</p>}
        {uploadError && <p className="mt-2 text-sm text-red-600">{uploadError}</p>}
        {publicId && !uploadError && (
          <p className="mt-1 text-xs text-gray-500">Uploaded to Cloudinary</p>
        )}
      </div>

      <div>
        <label htmlFor="coverImageAlt" className="mb-1.5 block text-sm font-medium text-gray-700">
          Alt text
        </label>
        <input
          id="coverImageAlt"
          type="text"
          value={alt}
          onChange={(e) => onChange({ url, publicId, alt: e.target.value })}
          placeholder="Describe the cover image"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          disabled={disabled || isUploading}
        />
      </div>
    </div>
  );
}
