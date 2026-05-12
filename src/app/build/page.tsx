"use client";

/**
 * /build — the 8-question configurator for v1 alpha.
 *
 * Customer journey (PR #5a — this PR):
 *   1. Industry        (one of: salon, plumber, electrician, photographer,
 *                       food truck, other-with-text)
 *   2. Business name   (free text, 2+ chars)
 *   3. Domain          (live availability check via /api/domains/check,
 *                       suggestion chips when taken)
 *   4. Services        (3–8 service names, builder UI)
 *   5. Location        (suburb + SA city dropdown)
 *   6. Photos          (up to 5 image uploads, optional with skip)
 *   7. Contact         (WhatsApp number + business hours)
 *   8. Email           (LAST — audit P0 #14 fix)
 *
 * After step 8 the form posts to a placeholder success state. PR #5c will
 * wire this to /api/generate; PR #5d adds industry photo fallback; PR #5e
 * adds the actual /preview/[id] render and Cloudflare Pages deploy.
 *
 * For PR #5a, the submit handler just logs to console (for now) and clears
 * localStorage so the customer doesn't see stale data on next visit.
 *
 * State persistence: localStorage on every change, restored on mount.
 *   - Transient fields (domainAvailable, domainSuggestions) are NOT persisted
 *     because they're recomputed on every step-3 visit anyway.
 *   - File objects (photos) can't be JSON-serialised so they're held in
 *     component state only — refreshing the page loses photos. UX shows the
 *     "skip" option so this isn't catastrophic.
 *
 * Plan selection is REMOVED for v1 alpha. Basic R99/month is the only tier
 * available; Growth + Business are Coming Soon on the homepage waitlist
 * (PR #8). Plan selection comes back when Growth ships in v1.1 GA.
 *
 * The old PayFast checkout step at the end is REMOVED from this file.
 * Subscription billing will live on a separate /preview/[id]/checkout
 * page once the preview render exists.
 */

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

// ─────────────────────────────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────────────────────────────

const INDUSTRIES = [
  { id: "salon", label: "Hair Salon", icon: "✂️" },
  { id: "plumber", label: "Plumber", icon: "🔧" },
  { id: "electrician", label: "Electrician", icon: "⚡" },
  { id: "photographer", label: "Photographer", icon: "📷" },
  { id: "food_truck", label: "Food Truck", icon: "🚚" },
  { id: "other", label: "Other", icon: "🏢" },
] as const;

const CITIES = [
  "Johannesburg",
  "Cape Town",
  "Durban",
  "Pretoria",
  "Port Elizabeth",
  "East London",
  "Bloemfontein",
  "Polokwane",
  "Nelspruit",
  "Other",
] as const;

const TOTAL_STEPS = 8;
const STORAGE_KEY = "quicka_build_state_v1";
const MIN_SERVICES = 3;
const MAX_SERVICES = 8;
const MAX_PHOTOS = 5;
const MAX_PHOTO_MB = 10;

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────

type BuildFormData = {
  industry: string;
  industryOther: string;
  bizName: string;
  domain: string;
  domainAvailable: boolean | null;
  domainSuggestions: string[];
  services: string[];
  locationSuburb: string;
  locationCity: string;
  whatsapp: string;
  hours: string;
  email: string;
};

const INITIAL: BuildFormData = {
  industry: "",
  industryOther: "",
  bizName: "",
  domain: "",
  domainAvailable: null,
  domainSuggestions: [],
  services: [],
  locationSuburb: "",
  locationCity: "",
  whatsapp: "",
  hours: "",
  email: "",
};

// Slugify a business name into a domain-safe SLD.
function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
}

// ═════════════════════════════════════════════════════════════════
// Main component
// ═════════════════════════════════════════════════════════════════

export default function BuildPage() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<BuildFormData>(INITIAL);
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [newService, setNewService] = useState("");

  // ── Restore from localStorage on mount ──
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return;
      const parsed = JSON.parse(saved) as { data?: BuildFormData; step?: number };
      if (parsed.data) setData({ ...INITIAL, ...parsed.data, domainAvailable: null, domainSuggestions: [] });
      if (typeof parsed.step === "number" && parsed.step >= 1 && parsed.step <= TOTAL_STEPS) {
        setStep(parsed.step);
      }
    } catch {
      // Corrupt storage — ignore and start fresh
    }
  }, []);

  // ── Persist on every change ──
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      // Strip transient fields before persisting
      const persistable = { ...data, domainAvailable: null, domainSuggestions: [] };
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ data: persistable, step }));
    } catch {
      // Quota or disabled — ignore
    }
  }, [data, step]);

  // ── Single update helper ──
  const update = <K extends keyof BuildFormData>(key: K, value: BuildFormData[K]) => {
    setData(d => ({ ...d, [key]: value }));
  };

  // ── Computed: candidate domain for availability lookup ──
  // Use whatever the customer has typed (already sanitised to [a-z0-9-] on
  // input). If they clear the field on step 3 the availability check will
  // pause and the Continue button stays disabled — forcing them to enter
  // something we can actually check.
  const computedDomain = data.domain.trim();

  // ── Domain availability check (debounced, only when on step 3) ──
  useEffect(() => {
    if (step !== 3) return;
    if (computedDomain.length < 2) {
      setData(d => ({ ...d, domainAvailable: null, domainSuggestions: [] }));
      return;
    }
    let cancelled = false;
    const handle = setTimeout(async () => {
      try {
        const res = await fetch("/api/domains/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: computedDomain }),
        });
        if (!res.ok) return;
        const json = await res.json();
        if (cancelled) return;
        setData(d => ({
          ...d,
          domainAvailable: typeof json.available === "boolean" ? json.available : null,
          domainSuggestions: Array.isArray(json.suggestions) ? json.suggestions : [],
        }));
      } catch {
        // Network error — leave state as unknown
      }
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [step, computedDomain]);

  // ── Photo handling ──
  const handlePhotoSelect = (files: FileList | null) => {
    if (!files) return;
    const remaining = MAX_PHOTOS - photos.length;
    if (remaining <= 0) return;
    const incoming = Array.from(files).slice(0, remaining);
    const filtered = incoming.filter(
      f => f.type.startsWith("image/") && f.size <= MAX_PHOTO_MB * 1024 * 1024,
    );
    if (filtered.length === 0) return;
    setPhotos(prev => [...prev, ...filtered].slice(0, MAX_PHOTOS));
    const newPreviews = filtered.map(URL.createObjectURL);
    setPhotoPreviews(prev => [...prev, ...newPreviews].slice(0, MAX_PHOTOS));
  };

  const removePhoto = (idx: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== idx));
    setPhotoPreviews(prev => {
      const url = prev[idx];
      if (url) URL.revokeObjectURL(url);
      return prev.filter((_, i) => i !== idx);
    });
  };

  // Cleanup preview URLs on unmount to avoid blob leaks
  useEffect(() => {
    return () => {
      photoPreviews.forEach(URL.revokeObjectURL);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Services list management ──
  const addService = () => {
    const t = newService.trim();
    if (!t) return;
    if (data.services.length >= MAX_SERVICES) return;
    if (data.services.some(s => s.toLowerCase() === t.toLowerCase())) {
      setNewService("");
      return;
    }
    setData(d => ({ ...d, services: [...d.services, t] }));
    setNewService("");
  };

  const removeService = (idx: number) => {
    setData(d => ({ ...d, services: d.services.filter((_, i) => i !== idx) }));
  };

  // ── Step validation ──
  const canAdvance = useCallback((): boolean => {
    switch (step) {
      case 1:
        return !!data.industry && (data.industry !== "other" || data.industryOther.trim().length >= 2);
      case 2:
        return data.bizName.trim().length >= 2;
      case 3:
        return data.domainAvailable === true;
      case 4:
        return data.services.length >= MIN_SERVICES && data.services.length <= MAX_SERVICES;
      case 5:
        return data.locationSuburb.trim().length >= 2 && data.locationCity.length > 0;
      case 6:
        return true; // photos optional
      case 7:
        return /^27\d{9}$/.test(data.whatsapp.replace(/\s+/g, "")) && data.hours.trim().length > 0;
      case 8:
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email);
      default:
        return false;
    }
  }, [step, data]);

  // ── Navigation ──
  const next = () => {
    if (!canAdvance()) return;
    // When entering the domain step for the first time, pre-fill the domain
    // input from the business name so the customer can see what we'd suggest.
    // They can edit it freely from there.
    if (step === 2 && !data.domain.trim()) {
      setData(d => ({ ...d, domain: slugify(d.bizName) }));
    }
    if (step < TOTAL_STEPS) {
      setStep(s => s + 1);
    } else {
      void handleSubmit();
    }
  };

  const back = () => {
    if (step > 1) setStep(s => s - 1);
  };

  // ── Submit (PR #5a placeholder — PR #5c will wire /api/generate) ──
  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // TODO PR #5c: POST to /api/generate with full payload + photos
      const payload = {
        industry: data.industry === "other" ? data.industryOther.trim() : data.industry,
        bizName: data.bizName.trim(),
        domain: `${slugify(data.domain.trim() || data.bizName)}.co.za`,
        services: data.services,
        location: { suburb: data.locationSuburb.trim(), city: data.locationCity },
        whatsapp: data.whatsapp.replace(/\s+/g, ""),
        hours: data.hours.trim(),
        email: data.email.trim().toLowerCase(),
        photoCount: photos.length,
      };
      // eslint-disable-next-line no-console
      console.log("[/build] submit:", payload);
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore
      }
      setSubmitted(true);
    } catch {
      // TODO: show error UI — for now log + stay on step
      // eslint-disable-next-line no-console
      console.error("[/build] submit failed");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Enter to advance (only on single-input steps) ──
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Enter") return;
      if (submitting || submitted) return;
      // Don't auto-advance on multi-input or builder steps
      if (step === 4 || step === 6) return;
      const target = e.target as HTMLElement | null;
      if (target?.tagName === "TEXTAREA") return;
      if (canAdvance()) next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, canAdvance, submitting, submitted]);

  // ── Render ──
  return (
    <main className="min-h-screen bg-brand-bg flex flex-col">
      {/* Pre-launch banner — audit P1 #15 fix: plain SA SMB language */}
      <div className="bg-brand-ink text-white text-xs px-4 py-2 text-center border-b border-brand-green/40">
        <span className="font-semibold tracking-wide text-brand-green">Pre-launch</span>
        <span className="opacity-80 ml-2">
          Build your free preview now. AI website generation goes live in a few weeks — early signups get notified first.
        </span>
      </div>

      {/* Header with progress */}
      <header className="bg-brand-ink px-6 py-4 flex items-center justify-between flex-shrink-0">
        <Link href="/" className="font-serif italic text-xl text-white no-underline">
          Quick<span className="text-brand-green">a</span>
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i + 1 <= step ? "bg-brand-green" : "bg-white/20"
                }`}
                aria-hidden="true"
              />
            ))}
          </div>
          <span className="text-white/50 text-xs hidden sm:inline">
            Step {step} of {TOTAL_STEPS}
          </span>
        </div>
      </header>

      {/* Linear progress bar */}
      <div className="h-1 bg-brand-bg-alt">
        <div
          className="h-full bg-brand-green transition-all"
          style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
        />
      </div>

      {/* Body */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-xl">
          {submitted ? (
            <SuccessState email={data.email} />
          ) : (
            <>
              {step === 1 && <Step1Industry data={data} update={update} onNext={next} />}
              {step === 2 && <Step2BusinessName data={data} update={update} onNext={next} />}
              {step === 3 && (
                <Step3Domain
                  data={data}
                  update={update}
                  computedDomain={computedDomain}
                  onNext={next}
                />
              )}
              {step === 4 && (
                <Step4Services
                  data={data}
                  newService={newService}
                  setNewService={setNewService}
                  addService={addService}
                  removeService={removeService}
                  onNext={next}
                />
              )}
              {step === 5 && <Step5Location data={data} update={update} onNext={next} />}
              {step === 6 && (
                <Step6Photos
                  photoPreviews={photoPreviews}
                  onSelect={handlePhotoSelect}
                  onRemove={removePhoto}
                  onNext={next}
                />
              )}
              {step === 7 && <Step7Contact data={data} update={update} onNext={next} />}
              {step === 8 && (
                <Step8Email
                  data={data}
                  update={update}
                  onSubmit={next}
                  submitting={submitting}
                  canAdvance={canAdvance()}
                />
              )}

              {step > 1 && !submitting && (
                <button
                  type="button"
                  onClick={back}
                  className="w-full text-center text-brand-muted py-3 mt-4 hover:text-brand-ink transition-colors"
                >
                  ← Back
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}

// ═════════════════════════════════════════════════════════════════
// Step components
// ═════════════════════════════════════════════════════════════════

type StepProps = {
  data: BuildFormData;
  update: <K extends keyof BuildFormData>(k: K, v: BuildFormData[K]) => void;
  onNext: () => void;
};

// ─── Step 1: Industry ────────────────────────────────────────────
function Step1Industry({ data, update, onNext }: StepProps) {
  const can =
    !!data.industry && (data.industry !== "other" || data.industryOther.trim().length >= 2);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-brand-ink mb-2">What kind of business?</h1>
        <p className="text-brand-muted">This helps us shape your website to look right.</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {INDUSTRIES.map(ind => (
          <button
            key={ind.id}
            type="button"
            onClick={() => update("industry", ind.id)}
            className={`p-5 rounded-2xl border-2 text-center transition-all ${
              data.industry === ind.id
                ? "border-brand-green bg-brand-green/5"
                : "border-black/8 bg-white hover:border-black/16"
            }`}
          >
            <div className="text-3xl mb-2" aria-hidden="true">
              {ind.icon}
            </div>
            <div className="font-bold text-brand-ink text-sm">{ind.label}</div>
          </button>
        ))}
      </div>
      {data.industry === "other" && (
        <div>
          <label className="block text-sm font-medium text-brand-ink mb-2">
            What kind of business is it?
          </label>
          <input
            type="text"
            value={data.industryOther}
            onChange={e => update("industryOther", e.target.value)}
            placeholder="e.g. Mobile car wash, tailor, baker..."
            autoFocus
            className="w-full px-5 py-4 rounded-2xl border-2 border-black/8 bg-white text-brand-ink text-lg outline-none focus:border-brand-green transition-colors"
          />
        </div>
      )}
      <button
        type="button"
        onClick={onNext}
        disabled={!can}
        className="w-full bg-brand-green text-white py-4 rounded-2xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-green-dark transition-colors"
      >
        Continue →
      </button>
    </div>
  );
}

// ─── Step 2: Business name ──────────────────────────────────────
function Step2BusinessName({ data, update, onNext }: StepProps) {
  const can = data.bizName.trim().length >= 2;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-brand-ink mb-2">What&apos;s your business called?</h1>
        <p className="text-brand-muted">This appears at the top of your website.</p>
      </div>
      <input
        type="text"
        value={data.bizName}
        onChange={e => update("bizName", e.target.value)}
        placeholder="e.g. Sarah's Hair Studio"
        autoFocus
        maxLength={80}
        className="w-full px-5 py-4 rounded-2xl border-2 border-black/8 bg-white text-brand-ink text-lg outline-none focus:border-brand-green transition-colors"
      />
      <button
        type="button"
        onClick={onNext}
        disabled={!can}
        className="w-full bg-brand-green text-white py-4 rounded-2xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-green-dark transition-colors"
      >
        Continue →
      </button>
    </div>
  );
}

// ─── Step 3: Domain (live check + suggestions) ──────────────────
function Step3Domain({
  data,
  update,
  computedDomain,
  onNext,
}: StepProps & { computedDomain: string }) {
  const checking = data.domainAvailable === null && computedDomain.length >= 2;
  const isAvailable = data.domainAvailable === true;
  const isTaken = data.domainAvailable === false;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-brand-ink mb-2">Pick your domain.</h1>
        <p className="text-brand-muted">
          Free <code className="text-brand-ink">.co.za</code> domain included with every plan.
        </p>
      </div>

      <div className="space-y-3">
        <label className="block text-xs font-bold tracking-widest uppercase text-brand-muted">
          Your domain
        </label>
        <div className="flex items-center gap-0 rounded-2xl border-2 border-black/8 bg-white focus-within:border-brand-green transition-colors overflow-hidden">
          <input
            type="text"
            value={data.domain}
            onChange={e => {
              const cleaned = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
              update("domain", cleaned);
            }}
            autoFocus
            placeholder="yourbusiness"
            className="flex-1 px-5 py-4 text-brand-ink text-lg outline-none bg-transparent"
          />
          <span className="px-4 py-4 text-brand-muted text-lg select-none">.co.za</span>
        </div>

        {checking && (
          <p className="text-sm text-brand-muted">Checking availability…</p>
        )}
        {isAvailable && (
          <p className="text-sm font-semibold text-brand-green-dark flex items-center gap-1">
            <span aria-hidden="true">✓</span>
            <span>{computedDomain}.co.za is available</span>
          </p>
        )}
        {isTaken && (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-red-700 flex items-center gap-1">
              <span aria-hidden="true">✗</span>
              <span>{computedDomain}.co.za is taken</span>
            </p>
            {data.domainSuggestions.length > 0 && (
              <div>
                <p className="text-xs text-brand-muted mb-2">Try one of these instead:</p>
                <div className="flex flex-wrap gap-2">
                  {data.domainSuggestions.map(s => {
                    const sld = s.replace(/\.co\.za$/, "");
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => update("domain", sld)}
                        className="px-3 py-1.5 rounded-full bg-brand-bg-alt border border-black/8 text-sm text-brand-ink hover:border-brand-green hover:bg-brand-green/5 transition-colors"
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onNext}
        disabled={!isAvailable}
        className="w-full bg-brand-green text-white py-4 rounded-2xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-green-dark transition-colors"
      >
        Continue →
      </button>
    </div>
  );
}

// ─── Step 4: Services ───────────────────────────────────────────
function Step4Services({
  data,
  newService,
  setNewService,
  addService,
  removeService,
  onNext,
}: {
  data: BuildFormData;
  newService: string;
  setNewService: (s: string) => void;
  addService: () => void;
  removeService: (idx: number) => void;
  onNext: () => void;
}) {
  const can = data.services.length >= MIN_SERVICES && data.services.length <= MAX_SERVICES;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-brand-ink mb-2">What services do you offer?</h1>
        <p className="text-brand-muted">
          Add {MIN_SERVICES}–{MAX_SERVICES} services. These appear on your website.
        </p>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={newService}
          onChange={e => setNewService(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter") {
              e.preventDefault();
              addService();
            }
          }}
          placeholder="e.g. Haircuts"
          maxLength={60}
          autoFocus
          className="flex-1 px-5 py-3 rounded-2xl border-2 border-black/8 bg-white text-brand-ink outline-none focus:border-brand-green transition-colors"
        />
        <button
          type="button"
          onClick={addService}
          disabled={!newService.trim() || data.services.length >= MAX_SERVICES}
          className="px-5 py-3 rounded-2xl bg-brand-ink text-white font-semibold disabled:opacity-50"
        >
          Add
        </button>
      </div>

      <div className="space-y-2">
        {data.services.map((service, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-white border border-black/8"
          >
            <span className="text-brand-ink flex-1">{service}</span>
            <button
              type="button"
              onClick={() => removeService(idx)}
              className="text-brand-muted hover:text-red-600 transition-colors"
              aria-label={`Remove ${service}`}
            >
              ✕
            </button>
          </div>
        ))}
        {data.services.length === 0 && (
          <p className="text-sm text-brand-muted italic">No services added yet</p>
        )}
      </div>

      <p className="text-xs text-brand-muted">
        {data.services.length} / {MAX_SERVICES} services
      </p>

      <button
        type="button"
        onClick={onNext}
        disabled={!can}
        className="w-full bg-brand-green text-white py-4 rounded-2xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-green-dark transition-colors"
      >
        Continue →
      </button>
    </div>
  );
}

// ─── Step 5: Location ───────────────────────────────────────────
function Step5Location({ data, update, onNext }: StepProps) {
  const can = data.locationSuburb.trim().length >= 2 && data.locationCity.length > 0;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-brand-ink mb-2">Where are you based?</h1>
        <p className="text-brand-muted">
          Helps your customers find you and improves your local search ranking.
        </p>
      </div>

      <div className="space-y-3">
        <label className="block text-xs font-bold tracking-widest uppercase text-brand-muted">
          Suburb or area
        </label>
        <input
          type="text"
          value={data.locationSuburb}
          onChange={e => update("locationSuburb", e.target.value)}
          placeholder="e.g. Randburg, Sea Point, Umhlanga"
          autoFocus
          className="w-full px-5 py-3 rounded-2xl border-2 border-black/8 bg-white text-brand-ink outline-none focus:border-brand-green transition-colors"
        />
      </div>

      <div className="space-y-3">
        <label className="block text-xs font-bold tracking-widest uppercase text-brand-muted">
          City
        </label>
        <select
          value={data.locationCity}
          onChange={e => update("locationCity", e.target.value)}
          className="w-full px-5 py-3 rounded-2xl border-2 border-black/8 bg-white text-brand-ink outline-none focus:border-brand-green transition-colors"
        >
          <option value="">Select a city…</option>
          {CITIES.map(city => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </div>

      <button
        type="button"
        onClick={onNext}
        disabled={!can}
        className="w-full bg-brand-green text-white py-4 rounded-2xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-green-dark transition-colors"
      >
        Continue →
      </button>
    </div>
  );
}

// ─── Step 6: Photos ─────────────────────────────────────────────
function Step6Photos({
  photoPreviews,
  onSelect,
  onRemove,
  onNext,
}: {
  photoPreviews: string[];
  onSelect: (files: FileList | null) => void;
  onRemove: (idx: number) => void;
  onNext: () => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-brand-ink mb-2">Add a few photos.</h1>
        <p className="text-brand-muted">
          Optional. If you skip this, we&apos;ll use professional stock photos that match your industry.
          Up to {MAX_PHOTOS} photos, {MAX_PHOTO_MB}MB each.
        </p>
      </div>

      <label
        htmlFor="photo-upload"
        className="block border-2 border-dashed border-black/16 rounded-2xl p-8 text-center cursor-pointer hover:border-brand-green hover:bg-brand-green/5 transition-colors"
      >
        <div className="text-4xl mb-2" aria-hidden="true">
          📷
        </div>
        <p className="font-semibold text-brand-ink mb-1">Click to upload photos</p>
        <p className="text-sm text-brand-muted">JPG, PNG or WEBP · max {MAX_PHOTO_MB}MB each</p>
        <input
          id="photo-upload"
          type="file"
          accept="image/*"
          multiple
          onChange={e => onSelect(e.target.files)}
          className="hidden"
        />
      </label>

      {photoPreviews.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {photoPreviews.map((url, idx) => (
            <div key={url} className="relative aspect-square rounded-xl overflow-hidden bg-brand-bg-alt">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => onRemove(idx)}
                className="absolute top-1 right-1 w-7 h-7 rounded-full bg-black/70 text-white text-sm hover:bg-black"
                aria-label={`Remove photo ${idx + 1}`}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={onNext}
        className="w-full bg-brand-green text-white py-4 rounded-2xl font-semibold text-lg hover:bg-brand-green-dark transition-colors"
      >
        {photoPreviews.length > 0 ? "Continue →" : "Skip for now →"}
      </button>
    </div>
  );
}

// ─── Step 7: Contact ────────────────────────────────────────────
function Step7Contact({ data, update, onNext }: StepProps) {
  const phoneClean = data.whatsapp.replace(/\s+/g, "");
  const phoneValid = /^27\d{9}$/.test(phoneClean);
  const hoursValid = data.hours.trim().length > 0;
  const can = phoneValid && hoursValid;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-brand-ink mb-2">How can customers reach you?</h1>
        <p className="text-brand-muted">
          Your WhatsApp button and contact details will appear on every page of your site.
        </p>
      </div>

      <div className="space-y-3">
        <label className="block text-xs font-bold tracking-widest uppercase text-brand-muted">
          WhatsApp number
        </label>
        <input
          type="tel"
          value={data.whatsapp}
          onChange={e => update("whatsapp", e.target.value.replace(/[^\d\s]/g, ""))}
          placeholder="27821234567"
          autoFocus
          maxLength={20}
          className="w-full px-5 py-3 rounded-2xl border-2 border-black/8 bg-white text-brand-ink outline-none focus:border-brand-green transition-colors"
        />
        <p className="text-xs text-brand-muted">
          South African format: <span className="font-mono">27</span> + your number without the leading 0
          (e.g. <span className="font-mono">27821234567</span>)
        </p>
      </div>

      <div className="space-y-3">
        <label className="block text-xs font-bold tracking-widest uppercase text-brand-muted">
          Business hours
        </label>
        <input
          type="text"
          value={data.hours}
          onChange={e => update("hours", e.target.value)}
          placeholder="Mon–Fri 8am–5pm, Sat 9am–1pm"
          maxLength={120}
          className="w-full px-5 py-3 rounded-2xl border-2 border-black/8 bg-white text-brand-ink outline-none focus:border-brand-green transition-colors"
        />
      </div>

      <button
        type="button"
        onClick={onNext}
        disabled={!can}
        className="w-full bg-brand-green text-white py-4 rounded-2xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-green-dark transition-colors"
      >
        Continue →
      </button>
    </div>
  );
}

// ─── Step 8: Email (LAST — audit P0 #14 fix) ────────────────────
function Step8Email({
  data,
  update,
  onSubmit,
  submitting,
  canAdvance,
}: {
  data: BuildFormData;
  update: <K extends keyof BuildFormData>(k: K, v: BuildFormData[K]) => void;
  onSubmit: () => void;
  submitting: boolean;
  canAdvance: boolean;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-brand-ink mb-2">Where should we send your preview?</h1>
        <p className="text-brand-muted">
          We&apos;ll email you a link to your generated site. No payment yet — preview is free.
        </p>
      </div>

      <input
        type="email"
        value={data.email}
        onChange={e => update("email", e.target.value)}
        placeholder="you@yourbusiness.co.za"
        autoFocus
        autoComplete="email"
        className="w-full px-5 py-4 rounded-2xl border-2 border-black/8 bg-white text-brand-ink text-lg outline-none focus:border-brand-green transition-colors"
      />

      <button
        type="button"
        onClick={onSubmit}
        disabled={!canAdvance || submitting}
        className="w-full bg-brand-green text-white py-4 rounded-2xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-green-dark transition-colors"
      >
        {submitting ? "Sending…" : "Build my free preview →"}
      </button>

      <p className="text-xs text-brand-muted text-center">
        No credit card required. We&apos;ll never spam you.
      </p>
    </div>
  );
}

// ─── Success state ──────────────────────────────────────────────
function SuccessState({ email }: { email: string }) {
  return (
    <div className="text-center space-y-6">
      <div className="text-6xl" aria-hidden="true">
        🚀
      </div>
      <div>
        <h1 className="font-serif text-3xl text-brand-ink mb-3">Thanks! We&apos;re on it.</h1>
        <p className="text-brand-muted leading-relaxed">
          We&apos;ve got everything we need to build your preview. We&apos;ll email{" "}
          <strong className="text-brand-ink">{email}</strong> within a few minutes once AI generation
          is live (currently in final testing).
        </p>
      </div>
      <div className="bg-white border border-black/8 rounded-2xl p-6 text-left">
        <p className="text-xs font-bold tracking-widest uppercase text-brand-muted mb-2">
          What happens next
        </p>
        <ul className="space-y-2 text-sm text-brand-ink">
          <li className="flex items-start gap-2">
            <span className="text-brand-green flex-shrink-0">1.</span>
            <span>You&apos;ll get an email with a preview link to your new website.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-brand-green flex-shrink-0">2.</span>
            <span>You have 60 minutes to review before the preview expires.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-brand-green flex-shrink-0">3.</span>
            <span>If you love it, subscribe for R99/month and your site goes live the same day.</span>
          </li>
        </ul>
      </div>
      <Link
        href="/"
        className="inline-block text-brand-muted hover:text-brand-ink transition-colors text-sm"
      >
        ← Back to homepage
      </Link>
    </div>
  );
}
