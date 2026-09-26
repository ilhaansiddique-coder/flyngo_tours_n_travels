'use client';

import { useCallback, useRef, useState } from 'react';
import { Upload, X, Loader2, Plus, ArrowLeft, ArrowRight, Link as LinkIcon, Image as ImageIcon, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface MultiImageUploaderProps {
  values: string[];
  onChange: (urls: string[]) => void;
  onUpload?: (file: File) => Promise<{ url: string }>;
  onSetCover?: (url: string) => void;
  disabled?: boolean;
  className?: string;
  folder?: string;
  maxFiles?: number;
}

const MAX_SIZE_MB = 10;

export function MultiImageUploader({
  values = [],
  onChange,
  onUpload,
  onSetCover,
  disabled,
  className,
  maxFiles = 20,
}: MultiImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [urlDraft, setUrlDraft] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);

  const handleFiles = useCallback(
    async (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return;
      if (!onUpload) {
        setError('Upload handler not configured.');
        return;
      }

      setError(null);
      const files = Array.from(fileList);

      // Validate files
      for (const file of files) {
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
          setError(`"${file.name}" is too large. Maximum ${MAX_SIZE_MB}MB per file.`);
          return;
        }
        if (!file.type.startsWith('image/')) {
          setError(`"${file.name}" is not an image file.`);
          return;
        }
      }

      if (values.length + files.length > maxFiles) {
        setError(`You can upload at most ${maxFiles} images.`);
        return;
      }

      setUploading(true);
      const uploadedUrls: string[] = [];

      try {
        for (let i = 0; i < files.length; i++) {
          setUploadProgress(`Uploading ${i + 1} of ${files.length}…`);
          const result = await onUpload(files[i]);
          if (result?.url) {
            uploadedUrls.push(result.url);
          }
        }
        onChange([...values, ...uploadedUrls]);
      } catch (err: any) {
        setError(err instanceof Error ? err.message : 'One or more uploads failed');
      } finally {
        setUploading(false);
        setUploadProgress(null);
        if (inputRef.current) inputRef.current.value = '';
      }
    },
    [onUpload, values, maxFiles, onChange],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragOver(false);
      if (disabled || uploading) return;
      void handleFiles(e.dataTransfer.files);
    },
    [handleFiles, disabled, uploading],
  );

  const handleAddUrl = () => {
    const trimmed = urlDraft.trim();
    if (!trimmed) return;
    if (values.includes(trimmed)) {
      setError('This image URL is already added.');
      return;
    }
    setError(null);
    onChange([...values, trimmed]);
    setUrlDraft('');
    setShowUrlInput(false);
  };

  const handleRemove = (index: number) => {
    const next = values.filter((_, i) => i !== index);
    onChange(next);
  };

  const handleMove = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= values.length) return;
    const next = [...values];
    const [moved] = next.splice(index, 1);
    next.splice(targetIndex, 0, moved);
    onChange(next);
  };

  return (
    <div className={cn('space-y-3', className)}>
      {/* Upload Dropzone */}
      <div
        onClick={() => !disabled && !uploading && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          'rounded-xl border-2 border-dashed border-outline-variant bg-surface-container',
          'flex flex-col items-center justify-center gap-2 py-6 px-4 text-center',
          'transition-all cursor-pointer select-none',
          dragOver && !disabled && 'border-primary bg-primary/5',
          disabled && 'opacity-50 cursor-not-allowed',
          uploading && 'pointer-events-none',
        )}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-1.5">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
            <p className="text-sm font-medium text-primary">{uploadProgress || 'Uploading…'}</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-on-surface">
                Click to browse or drag &amp; drop multiple photos
              </p>
              <p className="text-xs text-on-surface-variant/70 mt-0.5">
                Add room photos, amenities, views · JPG, PNG, WebP · Up to {MAX_SIZE_MB}MB each
              </p>
            </div>
          </>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          disabled={disabled || uploading}
          onChange={(e) => void handleFiles(e.target.files)}
        />
      </div>

      {/* Action Buttons: Add via URL or Clear all */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          {!showUrlInput ? (
            <button
              type="button"
              onClick={() => setShowUrlInput(true)}
              disabled={disabled || uploading}
              className="inline-flex items-center gap-1 text-primary hover:underline font-medium"
            >
              <LinkIcon className="w-3.5 h-3.5" />
              Add by URL
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <input
                type="url"
                value={urlDraft}
                onChange={(e) => setUrlDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddUrl();
                  }
                }}
                placeholder="https://example.com/room.jpg"
                className="px-2.5 py-1 text-xs border border-outline-variant rounded-lg bg-surface text-on-surface w-56 outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={handleAddUrl}
                disabled={!urlDraft.trim()}
                className="px-2.5 py-1 bg-primary text-on-primary rounded-lg font-medium hover:opacity-90 disabled:opacity-50"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowUrlInput(false);
                  setUrlDraft('');
                }}
                className="text-on-surface-variant hover:text-on-surface p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {values.length > 0 && (
          <div className="flex items-center gap-3 text-on-surface-variant">
            <span>{values.length} {values.length === 1 ? 'photo' : 'photos'} added</span>
            <button
              type="button"
              onClick={() => onChange([])}
              className="text-error hover:underline"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="p-2.5 bg-error-container border border-error/30 rounded-lg text-on-error-container text-xs">
          {error}
        </div>
      )}

      {/* Grid of uploaded images */}
      {values.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-1">
          {values.map((url, idx) => (
            <div
              key={`${url}-${idx}`}
              className="group relative rounded-xl overflow-hidden border border-outline-variant bg-surface-container-low aspect-[4/3] flex flex-col justify-between shadow-xs hover:border-primary/50 transition-all"
            >
              {/* Image Preview */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`Room / Hotel image ${idx + 1}`}
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
              />

              {/* Top overlay: Badge + Delete button */}
              <div className="relative z-10 p-1.5 flex items-center justify-between bg-gradient-to-b from-black/60 via-black/20 to-transparent">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-black/60 text-white backdrop-blur-xs">
                  #{idx + 1}
                </span>

                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  className="p-1 rounded-full bg-black/60 text-white/90 hover:bg-error hover:text-white transition-colors"
                  title="Remove image"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Bottom overlay: Reorder controls + Set as cover */}
              <div className="relative z-10 p-1.5 flex items-center justify-between bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-90 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMove(idx, 'left')}
                    className="p-1 rounded bg-black/50 text-white disabled:opacity-30 hover:bg-black/80"
                    title="Move left"
                  >
                    <ArrowLeft className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === values.length - 1}
                    onClick={() => handleMove(idx, 'right')}
                    className="p-1 rounded bg-black/50 text-white disabled:opacity-30 hover:bg-black/80"
                    title="Move right"
                  >
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {onSetCover && (
                  <button
                    type="button"
                    onClick={() => onSetCover(url)}
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/50 hover:bg-accent text-[10px] text-white font-medium transition-colors"
                    title="Make this the cover photo"
                  >
                    <Star className="w-2.5 h-2.5 fill-current" />
                    Cover
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
