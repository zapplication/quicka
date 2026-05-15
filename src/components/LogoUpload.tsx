"use client";

import { useRef, useState } from "react";

interface Props {
  value: string | null; // data URL or null
  onChange: (url: string | null) => void;
}

/**
 * Single-image logo upload with inline preview. Like PhotoUpload, the file
 * is converted to a data URL and never leaves the browser. Swapped for a
 * real upload when Supabase Storage lands.
 */
export function LogoUpload({ value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = (file: File) => {
    setError(null);

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (PNG, JPG, SVG or WebP).");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("Logo file is too large. Please use one under 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === "string") {
        onChange(e.target.result);
      }
    };
    reader.onerror = () => setError("Couldn't read that file. Try another one.");
    reader.readAsDataURL(file);
  };

  if (value) {
    return (
      <div className="flex items-center gap-4 p-4 bg-white border-2 border-black/8 rounded-2xl">
        <div className="w-20 h-20 rounded-lg bg-brand-bg-alt p-2 flex items-center justify-center flex-shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Logo" className="max-w-full max-h-full object-contain" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-brand-ink">Logo uploaded</p>
          <button
            type="button"
            onClick={() => {
              onChange(null);
              setError(null);
            }}
            className="text-sm text-brand-muted hover:text-brand-ink underline mt-1 text-left"
          >
            Remove and use business name as text instead
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="w-full p-6 rounded-2xl border-2 border-dashed border-black/15 bg-white hover:border-brand-green hover:bg-brand-green/5 transition-colors text-left flex items-center gap-4"
      >
        <div className="w-16 h-16 rounded-xl bg-brand-bg-alt flex items-center justify-center text-2xl flex-shrink-0">
          📷
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-brand-ink">Upload your logo</div>
          <div className="text-sm text-brand-muted mt-0.5">
            PNG, JPG, SVG or WebP · up to 2MB
          </div>
        </div>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
      {error && (
        <p className="text-xs text-red-600 mt-2 text-center">{error}</p>
      )}
      <p className="text-xs text-brand-muted mt-3 text-center">
        No logo yet? Skip — we&apos;ll use your business name as text.
      </p>
    </div>
  );
}
