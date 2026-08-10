'use client';

import { useCallback, useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
  value?: string;
  onChange: (url: string | undefined) => void;
  onUpload?: (file: File) => Promise<{ url: string }>;
  folder?: string;
  alt?: string;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  /** Allow the user to enter a remote URL instead of uploading. */
  allowUrl?: boolean;
  /** Crop to a specific aspect ratio. `1` = square, `1.7777` = 16:9, etc. */
  aspectRatio?: number;
}

const MAX_SIZE_MB = 10;

export function ImageUploader({
  value,
  onChange,
  onUpload,
  folder,
  alt,
  disabled,
  className,
  placeholder = 'Drag an image here or click to browse',
  allowUrl = true,
  aspectRatio,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlDraft, setUrlDraft] = useState('');

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const file = files[0];
      setError(null);
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setError(`File too large. Maximum ${MAX_SIZE_MB}MB.`);
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError('Only image files are supported.');
        return;
      }
      if (!onUpload) {
        setError('Upload handler not configured.');
        return;
      }
      setUploading(true);
      try {
        const result = await onUpload(file);
        onChange(result.url);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed');
      } finally {
        setUploading(false);
      }
    },
    [onChange, onUpload],
  );

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragOver(false);
      if (disabled) return;
      void handleFiles(e.dataTransfer.files);
    },
    [handleFiles, disabled],
  );

  if (value) {
    return (
      <div className={cn('space-y-2', className)}>
        <div
          className="relative rounded-xl overflow-hidden border border-outline-variant bg-surface-container"
          style={aspectRatio ? { aspectRatio: String(aspectRatio) } : undefined}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt={alt || 'Preview'}
            className={cn(
              'w-full h-full',
              aspectRatio ? 'object-cover' : 'max-h-64 object-contain',
            )}
          />
          <button
            type="button"
            onClick={() => onChange(undefined)}
            disabled={disabled}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 disabled:opacity-50"
            title="Remove image"
          >
            <X className="w-4 h-4" />
          </button>
          {uploading && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            </div>
          )}
        </div>
        {error && <p className="text-xs text-error">{error}</p>}
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div
        onClick={() => !disabled && !uploading && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={cn(
          'rounded-xl border-2 border-dashed border-outline-variant bg-surface-container',
          'flex flex-col items-center justify-center gap-2 py-8 px-4 text-center',
          'transition-colors cursor-pointer',
          dragOver && !disabled && 'border-primary bg-primary/5',
          disabled && 'opacity-50 cursor-not-allowed',
          uploading && 'pointer-events-none',
        )}
      >
        {uploading ? (
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        ) : (
          <Upload className="w-6 h-6 text-on-surface-variant" />
        )}
        <p className="text-sm text-on-surface-variant">{uploading ? 'Uploading…' : placeholder}</p>
        <p className="text-xs text-on-surface-variant/60">PNG, JPG, WebP, GIF, SVG, AVIF · up to {MAX_SIZE_MB}MB</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          disabled={disabled || uploading}
          onChange={(e) => void handleFiles(e.target.files)}
        />
      </div>
      {error && <p className="text-xs text-error">{error}</p>}
      {allowUrl && (
        <div className="flex flex-col gap-1">
          {!showUrlInput ? (
            <button
              type="button"
              onClick={() => {
                setShowUrlInput(true);
                setUrlDraft('');
              }}
              disabled={disabled}
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline self-start"
            >
              <ImageIcon className="w-3 h-3" /> Or paste an image URL
            </button>
          ) : (
            <div className="flex gap-2">
              <input
                type="url"
                value={urlDraft}
                onChange={(e) => setUrlDraft(e.target.value)}
                placeholder="https://images.example.com/photo.jpg"
                className="flex-1 px-3 py-1.5 text-xs rounded-md border border-outline-variant bg-surface-container text-on-surface focus:ring-2 focus:ring-primary/50 outline-none"
                disabled={disabled}
              />
              <button
                type="button"
                onClick={() => {
                  if (urlDraft.trim()) {
                    onChange(urlDraft.trim());
                    setShowUrlInput(false);
                  }
                }}
                disabled={disabled || !urlDraft.trim()}
                className="px-3 py-1.5 text-xs rounded-md bg-primary text-on-primary hover:opacity-90 disabled:opacity-50"
              >
                Use
              </button>
              <button
                type="button"
                onClick={() => setShowUrlInput(false)}
                disabled={disabled}
                className="px-3 py-1.5 text-xs rounded-md border border-outline-variant hover:bg-surface-container-high"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
