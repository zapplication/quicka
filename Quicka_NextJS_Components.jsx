/**
 * Quicka — Shared UI Components
 * ================================
 * Save each component to: src/components/ui/
 *
 * Components:
 *  Button.tsx        — Primary button with variants
 *  Input.tsx         — Text input with label + error
 *  Textarea.tsx      — Multi-line input
 *  Toggle.tsx        — On/off toggle switch
 *  PhotoUpload.tsx   — Photo upload with preview
 *  ProgressBar.tsx   — Generation progress bar
 *  Badge.tsx         — Small label badge
 *  Card.tsx          — White panel card
 */

/* ════════════════════════════════════════════
   FILE 1 — src/components/ui/Button.tsx
════════════════════════════════════════════ */
export const BUTTON_COMPONENT = `
"use client";

import { type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:  "primary" | "green" | "ghost" | "danger" | "whatsapp";
  size?:     "sm" | "md" | "lg";
  loading?:  boolean;
  full?:     boolean;
}

export function Button({
  children, variant = "primary", size = "md",
  loading = false, full = false,
  className, disabled, ...props
}: ButtonProps) {
  const base = "inline-flex items-center justify-center gap-2 font-semibold rounded-full transition-all duration-150 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green";

  const variants = {
    primary:  "bg-brand-ink text-white hover:bg-zinc-800 active:bg-zinc-900",
    green:    "bg-brand-green text-white hover:bg-brand-greenDark active:bg-green-800",
    ghost:    "bg-transparent text-brand-ink border border-brand-ink/10 hover:bg-brand-warm",
    danger:   "bg-brand-ember text-white hover:bg-red-600",
    whatsapp: "bg-[#25D366] text-white hover:bg-green-500",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base",
  };

  return (
    <button
      disabled={disabled || loading}
      className={cn(base, variants[variant], sizes[size], full && "w-full", className)}
      {...props}
    >
      {loading ? (
        <>
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          Processing...
        </>
      ) : children}
    </button>
  );
}
`;

/* ════════════════════════════════════════════
   FILE 2 — src/components/ui/Input.tsx
════════════════════════════════════════════ */
export const INPUT_COMPONENT = `
"use client";

import { type InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?:  string;
  error?:  string;
  hint?:   string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, ...props }, ref) => (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-semibold text-brand-ink mb-1.5">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={cn(
          "w-full px-4 py-3 rounded-xl border bg-white text-brand-ink text-sm",
          "placeholder:text-brand-muted/60 outline-none transition-all duration-150",
          "focus:ring-2 focus:ring-brand-green focus:border-transparent",
          error
            ? "border-brand-ember ring-1 ring-brand-ember"
            : "border-black/8 hover:border-black/16",
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-brand-ember">{error}</p>}
      {hint && !error && <p className="mt-1 text-xs text-brand-muted">{hint}</p>}
    </div>
  )
);

Input.displayName = "Input";
`;

/* ════════════════════════════════════════════
   FILE 3 — src/components/ui/Textarea.tsx
════════════════════════════════════════════ */
export const TEXTAREA_COMPONENT = `
"use client";

import { type TextareaHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?:  string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, ...props }, ref) => (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-semibold text-brand-ink mb-1.5">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        className={cn(
          "w-full px-4 py-3 rounded-xl border bg-white text-brand-ink text-sm",
          "placeholder:text-brand-muted/60 outline-none transition-all duration-150 resize-y",
          "focus:ring-2 focus:ring-brand-green focus:border-transparent",
          error ? "border-brand-ember" : "border-black/8 hover:border-black/16",
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-brand-ember">{error}</p>}
      {hint && !error && <p className="mt-1 text-xs text-brand-muted">{hint}</p>}
    </div>
  )
);

Textarea.displayName = "Textarea";
`;

/* ════════════════════════════════════════════
   FILE 4 — src/components/ui/Toggle.tsx
════════════════════════════════════════════ */
export const TOGGLE_COMPONENT = `
"use client";

import { cn } from "@/lib/utils";

interface ToggleProps {
  label:     string;
  desc?:     string;
  value:     boolean;
  onChange:  (val: boolean) => void;
  className?: string;
}

export function Toggle({ label, desc, value, onChange, className }: ToggleProps) {
  return (
    <div
      role="switch"
      aria-checked={value}
      tabIndex={0}
      onClick={() => onChange(!value)}
      onKeyDown={e => (e.key === "Enter" || e.key === " ") && onChange(!value)}
      className={cn(
        "flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer",
        "transition-all duration-150 select-none",
        value
          ? "bg-brand-green/8 border-brand-green"
          : "bg-brand-bg border-black/8 hover:border-black/16",
        className
      )}
    >
      {/* Track */}
      <div className={cn(
        "relative flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-200 mt-0.5",
        value ? "bg-brand-green" : "bg-slate-300"
      )}>
        <div className={cn(
          "absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-200",
          value ? "left-6" : "left-1"
        )} />
      </div>
      {/* Label */}
      <div>
        <p className="text-sm font-semibold text-brand-ink">{label}</p>
        {desc && <p className="text-xs text-brand-muted mt-0.5 leading-relaxed">{desc}</p>}
      </div>
    </div>
  );
}
`;

/* ════════════════════════════════════════════
   FILE 5 — src/components/ui/PhotoUpload.tsx
════════════════════════════════════════════ */
export const PHOTO_UPLOAD_COMPONENT = `
"use client";

import { useRef } from "react";
import Image      from "next/image";
import { cn }     from "@/lib/utils";

interface PhotoUploadProps {
  label?:    string;
  value:     string | null;
  onChange:  (val: string | null) => void;
  className?: string;
}

export function PhotoUpload({ label, value, onChange, className }: PhotoUploadProps) {
  const ref = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      alert("File must be under 5MB");
      return;
    }
    if (!["image/png", "image/jpeg", "image/webp", "image/svg+xml"].includes(file.type)) {
      alert("Please upload a PNG, JPG, WebP or SVG file");
      return;
    }
    const reader = new FileReader();
    reader.onload = e => onChange(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className={cn("mb-3", className)}>
      {label && <p className="text-xs font-semibold text-brand-ink mb-1.5">{label}</p>}
      <div
        onClick={() => !value && ref.current?.click()}
        className={cn(
          "relative w-full rounded-xl overflow-hidden border-2 border-dashed",
          "transition-all duration-150",
          value
            ? "border-brand-green/30 h-24"
            : "border-black/10 h-24 flex items-center justify-center cursor-pointer hover:border-brand-green/40 hover:bg-brand-green/3 bg-brand-bg"
        )}
      >
        {value ? (
          <>
            <Image src={value} alt="upload" fill className="object-cover" />
            <button
              type="button"
              onClick={e => { e.stopPropagation(); onChange(null); }}
              className="absolute top-1.5 right-1.5 w-6 h-6 bg-brand-ember text-white rounded-full flex items-center justify-center text-xs font-bold hover:bg-red-600 z-10"
            >
              ✕
            </button>
          </>
        ) : (
          <div className="text-center text-brand-muted">
            <div className="text-2xl mb-1">📷</div>
            <p className="text-xs">Click to upload · max 5MB</p>
          </div>
        )}
      </div>
      <input
        ref={ref} type="file" accept="image/*" className="hidden"
        onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
    </div>
  );
}
`;

/* ════════════════════════════════════════════
   FILE 6 — src/components/ui/ProgressBar.tsx
   Generation progress bar with steps + timer
════════════════════════════════════════════ */
export const PROGRESS_BAR_COMPONENT = `
"use client";

import { useState, useEffect, useCallback } from "react";
import { PROGRESS_STEPS }                   from "@/lib/constants";
import { cn }                               from "@/lib/utils";

interface ProgressBarProps {
  onComplete: () => void;
}

export function GenerationProgress({ onComplete }: ProgressBarProps) {
  const [currentStep,  setCurrentStep]  = useState(0);
  const [stepProgress, setStepProgress] = useState(0);
  const [elapsed,      setElapsed]      = useState(0);

  // Elapsed timer
  useEffect(() => {
    const t = setInterval(() => setElapsed(s => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // Step progression
  useEffect(() => {
    if (currentStep >= PROGRESS_STEPS.length) {
      onComplete();
      return;
    }
    const step  = PROGRESS_STEPS[currentStep];
    const start = Date.now();

    const interval = setInterval(() => {
      const pct = Math.min(100, ((Date.now() - start) / step.duration) * 100);
      setStepProgress(pct);
      if (pct >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setCurrentStep(s => s + 1);
          setStepProgress(0);
        }, 200);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [currentStep, onComplete]);

  const totalProgress =
    (currentStep / PROGRESS_STEPS.length) * 100 +
    stepProgress / PROGRESS_STEPS.length;

  return (
    <div className="px-6 py-8 text-center">
      {/* Icon */}
      <div className="text-5xl mb-4 animate-float inline-block">⚡</div>

      <h3 className="font-serif text-2xl font-normal mb-1 text-brand-ink">
        Building your site...
      </h3>
      <p className="text-sm text-brand-muted mb-6">
        {elapsed}s elapsed &middot; AI is working its magic
      </p>

      {/* Overall progress */}
      <div className="h-2 bg-brand-warm rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-brand-green rounded-full transition-all duration-300"
          style={{ width: \`\${totalProgress}%\` }}
        />
      </div>

      {/* Step list */}
      <div className="flex flex-col gap-2.5 text-left">
        {PROGRESS_STEPS.map((step, i) => {
          const done   = i < currentStep;
          const active = i === currentStep;

          return (
            <div
              key={i}
              className={cn(
                "flex items-center gap-3 transition-opacity duration-300",
                i > currentStep ? "opacity-25" : "opacity-100"
              )}
            >
              {/* Step indicator */}
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold transition-all",
                done   && "bg-brand-green text-white",
                active && "bg-brand-green/10 border-2 border-brand-green",
                !done && !active && "bg-brand-warm"
              )}>
                {done ? "✓" : active ? (
                  <span className="w-3 h-3 border-2 border-brand-green border-t-transparent rounded-full animate-spin block" />
                ) : null}
              </div>

              {/* Label + sub-progress */}
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-sm truncate",
                  active ? "font-semibold text-brand-ink" : "text-brand-muted"
                )}>
                  {step.label}
                </p>
                {active && (
                  <div className="h-1 bg-brand-warm rounded-full mt-1 overflow-hidden">
                    <div
                      className="h-full bg-brand-green rounded-full transition-all duration-100"
                      style={{ width: \`\${stepProgress}%\` }}
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
`;

/* ════════════════════════════════════════════
   FILE 7 — src/components/ui/Badge.tsx
════════════════════════════════════════════ */
export const BADGE_COMPONENT = `
import { cn } from "@/lib/utils";

interface BadgeProps {
  children:  React.ReactNode;
  variant?:  "green" | "amber" | "red" | "blue" | "muted";
  className?: string;
}

export function Badge({ children, variant = "green", className }: BadgeProps) {
  const variants = {
    green: "bg-brand-green/10 text-brand-green",
    amber: "bg-brand-amber/10 text-brand-amber",
    red:   "bg-brand-ember/10 text-brand-ember",
    blue:  "bg-blue-50 text-blue-600",
    muted: "bg-brand-warm text-brand-muted",
  };

  return (
    <span className={cn(
      "inline-flex items-center px-3 py-1 rounded-full text-xs font-bold",
      variants[variant], className
    )}>
      {children}
    </span>
  );
}
`;

/* ════════════════════════════════════════════
   FILE 8 — src/components/ui/Card.tsx
════════════════════════════════════════════ */
export const CARD_COMPONENT = `
import { cn } from "@/lib/utils";

interface CardProps {
  children:   React.ReactNode;
  className?: string;
  padding?:   "sm" | "md" | "lg";
}

export function Card({ children, className, padding = "md" }: CardProps) {
  const paddings = { sm: "p-4", md: "p-5", lg: "p-6" };

  return (
    <div className={cn(
      "bg-white rounded-2xl border border-black/8",
      paddings[padding],
      className
    )}>
      {children}
    </div>
  );
}
`;

/* ════════════════════════════════════════════
   FILE 9 — src/lib/utils.ts
   Utility functions
════════════════════════════════════════════ */
export const UTILS_FILE = `
import { type ClassValue, clsx } from "clsx";
import { twMerge }               from "tailwindcss-merge";

// Tailwind class merging utility
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format price
export function formatPrice(amount: number, currency = "R"): string {
  return \`\${currency}\${amount.toLocaleString("en-ZA")}\`;
}

// Slugify business name for domain suggestion
export function slugifyDomain(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\\s-]/g, "")
    .replace(/\\s+/g, "")
    .slice(0, 63);
}

// Validate email
export function isValidEmail(email: string): boolean {
  return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email);
}

// Validate SA phone
export function isValidSAPhone(phone: string): boolean {
  const digits = phone.replace(/\\D/g, "");
  return /^(0|27)\\d{9}$/.test(digits);
}

// Format phone for WhatsApp link
export function formatWhatsApp(phone: string): string {
  const digits = phone.replace(/\\D/g, "");
  return digits.startsWith("0") ? "27" + digits.slice(1) : digits;
}

// Sanitise text for AI prompt (prevent prompt injection)
export function sanitiseForAI(text: string): string {
  return text
    .trim()
    .slice(0, 500)
    .replace(/<[^>]*>/g, "")
    .replace(/ignore previous instructions/gi, "")
    .replace(/system prompt/gi, "")
    .replace(/[<>'";\`\\\\]/g, "");
}
`;

/* ════════════════════════════════════════════
   FILE 10 — src/components/ui/index.ts
   Barrel export for all UI components
════════════════════════════════════════════ */
export const UI_INDEX = `
export { Button }             from "./Button";
export { Input }              from "./Input";
export { Textarea }           from "./Textarea";
export { Toggle }             from "./Toggle";
export { PhotoUpload }        from "./PhotoUpload";
export { GenerationProgress } from "./ProgressBar";
export { Badge }              from "./Badge";
export { Card }               from "./Card";
`;

// Extra package needed for cn utility
export const EXTRA_PACKAGES = `
# Install these additional packages
npm install clsx tailwindcss-merge
`;

// Demo showing all components
export default function UIComponentsDemo() {
  const [toggleVal,   setToggleVal]   = import_useState(false);
  const [inputVal,    setInputVal]    = import_useState("");
  const [photoVal,    setPhotoVal]    = import_useState(null);
  const [showProgress, setShowProgress] = import_useState(false);

  function import_useState(initial) {
    const { useState } = require("react");
    return useState(initial);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F5F2ED", fontFamily: "Arial, sans-serif" }}>
      {/* Header */}
      <div style={{ background: "#0A0A0A", padding: "0.85rem 1.5rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <div style={{ fontStyle: "italic", fontSize: "1.2rem", color: "#fff" }}>Quick<span style={{ color: "#00C853" }}>a</span></div>
        <div style={{ width: 1, height: 18, background: "rgba(255,255,255,0.15)" }} />
        <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.35)", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase" }}>UI Components — TypeScript + Tailwind</span>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "2rem 1.5rem" }}>
        <h1 style={{ fontStyle: "italic", fontSize: "2rem", marginBottom: "0.5rem" }}>Shared UI Components</h1>
        <p style={{ color: "#7A756E", marginBottom: "2rem", fontSize: "0.9rem" }}>10 files — save to src/components/ui/ and src/lib/</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "1.25rem" }}>

          {/* Files list */}
          {[
            { file: "src/components/ui/Button.tsx",      const: "BUTTON_COMPONENT",      desc: "Primary, green, ghost, danger, WhatsApp variants" },
            { file: "src/components/ui/Input.tsx",        const: "INPUT_COMPONENT",        desc: "Text input with label, error and hint" },
            { file: "src/components/ui/Textarea.tsx",     const: "TEXTAREA_COMPONENT",     desc: "Multi-line input with label and error" },
            { file: "src/components/ui/Toggle.tsx",       const: "TOGGLE_COMPONENT",       desc: "Accessible on/off toggle" },
            { file: "src/components/ui/PhotoUpload.tsx",  const: "PHOTO_UPLOAD_COMPONENT", desc: "Upload with preview, remove button, file validation" },
            { file: "src/components/ui/ProgressBar.tsx",  const: "PROGRESS_BAR_COMPONENT", desc: "Generation progress with steps + live timer" },
            { file: "src/components/ui/Badge.tsx",        const: "BADGE_COMPONENT",        desc: "Green, amber, red, blue, muted variants" },
            { file: "src/components/ui/Card.tsx",         const: "CARD_COMPONENT",         desc: "White panel with border and padding variants" },
            { file: "src/components/ui/index.ts",         const: "UI_INDEX",               desc: "Barrel export — import all from @/components/ui" },
            { file: "src/lib/utils.ts",                   const: "UTILS_FILE",             desc: "cn(), formatPrice(), slugifyDomain(), sanitiseForAI()" },
          ].map((item, i) => (
            <div key={i} style={{ background: "#fff", borderRadius: "16px", padding: "1.25rem", border: "1px solid rgba(0,0,0,0.08)" }}>
              <code style={{ fontSize: "0.75rem", color: "#2563EB", background: "#EFF6FF", padding: "0.2rem 0.5rem", borderRadius: "6px", display: "block", marginBottom: "0.6rem" }}>{item.file}</code>
              <p style={{ fontSize: "0.82rem", color: "#6B7280", lineHeight: 1.5 }}>{item.desc}</p>
              <code style={{ fontSize: "0.7rem", color: "#00C853", marginTop: "0.5rem", display: "block" }}>export const {item.const}</code>
            </div>
          ))}
        </div>

        <div style={{ marginTop: "2rem", background: "#0A0A0A", borderRadius: "14px", padding: "1.25rem" }}>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "0.75rem" }}>Install extra packages</p>
          <code style={{ color: "#00C853", fontSize: "0.85rem" }}>npm install clsx tailwindcss-merge</code>
        </div>
      </div>
    </div>
  );
}
