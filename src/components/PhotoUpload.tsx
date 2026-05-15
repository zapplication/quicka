"use client";

import { useRef, useState } from "react";

interface Props {
  value: string[]; // array of data URLs
  onChange: (urls: string[]) => void;
  max?: number;
}

/**
 * Multi-photo upload with inline previews. Files are converted to data
 * URLs and stored in component state — they never leave the browser in
 * this version. When Supabase Storage is wired in a later PR, the
 * `onChange` consumer will swap to uploading instead.
 */
export function PhotoUpload({ value, onChange, max = 5 }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    setError(null);

    const remaining = max - value.length;
    if (remaining <= 0) {
      setError(`Maximum of ${max} photos.`);
      return;
    }
    const candidates = Array.from(files).slice(0, remaining);
    const newPhotos: string[] = [];
    let processed = 0;
    let hadInvalid = false;

    candidates.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        hadInvalid = true;
        processed++;
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        hadInvalid = true;
        processed++;
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        if (typeof e.target?.result === "string") newPhotos.push(e.target.result);
        processed++;
        if (processed === candidates.length) {
          onChange([...value, ...newPhotos]);
          if (hadInvalid) {
            setError("Some files were skipped (only images under 5MB are accepted).");
          }
        }
      };
      reader.onerror = () => {
        processed++;
        hadInvalid = true;
        if (processed === candidates.length) {
          onChange([...value, ...newPhotos]);
          setError("Some files couldn't be read.");
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
    setError(null);
  };

  return (
    <div>
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
        {value.map((url, i) => (
          <div
            key={i}
            className="relative aspect-square rounded-xl overflow-hidden bg-brand-bg-alt border border-black/8"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => removePhoto(i)}
              className="absolute top-1.5 right-1.5 w-7 h-7 bg-black/70 text-white rounded-full text-sm flex items-center justify-center hover:bg-black transition-colors"
              aria-label="Remove photo"
            >
              ×
            </button>
          </div>
        ))}
        {value.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="aspect-square rounded-xl border-2 border-dashed border-black/15 bg-white hover:border-brand-green hover:bg-brand-green/5 transition-colors flex flex-col items-center justify-center text-brand-muted gap-1"
          >
            <span className="text-3xl leading-none">+</span>
            <span className="text-xs font-medium">Add photo</span>
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <p className="text-xs text-brand-muted mt-3">
        {value.length} of {max} photos · JPG, PNG, WebP · up to 5MB each
      </p>
      {error && (
        <p className="text-xs text-red-600 mt-1.5">{error}</p>
      )}
    </div>
  );
}
