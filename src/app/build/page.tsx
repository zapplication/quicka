"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { PayfastForm } from "@/components/PayfastForm";
import { PhotoUpload } from "@/components/PhotoUpload";
import { LogoUpload } from "@/components/LogoUpload";
import { COMPANY } from "@/lib/company";
import { generatePreviewHtml } from "@/lib/preview-template";
import {
  emptyBuildState,
  slugifyDomain,
  normalizeE164,
  type BuildState,
} from "@/lib/build-state";

/**
 * /build — Quicka's customer onboarding flow.
 *
 * 8 information-gathering steps → "Generating" screen → Live preview →
 * Decision (Make it live / Request changes) → Plan picker → PayFast checkout.
 *
 * Payment NEVER happens before the preview. The preview itself is a real,
 * styled HTML page assembled from the customer's actual inputs (name,
 * tagline, photos, WhatsApp number, etc.). Once the AI-generation PR lands,
 * the static template in `lib/preview-template.ts` is swapped for a Claude
 * Sonnet 4 generated page — the rest of this flow stays exactly the same.
 *
 * "DEMO MODE" banner stays at the top until the PayFast merchant upgrade is
 * approved AND real AI generation is shipping.
 */

type FlowStep =
  | "email"
  | "business_type"
  | "business_name"
  | "location"
  | "description"
  | "logo"
  | "photos"
  | "whatsapp"
  | "generating"
  | "preview"
  | "decision"
  | "plan"
  | "paying";

const COLLECTION_STEPS: FlowStep[] = [
  "email",
  "business_type",
  "business_name",
  "location",
  "description",
  "logo",
  "photos",
  "whatsapp",
];

const NEXT_STEP: Record<FlowStep, FlowStep | null> = {
  email: "business_type",
  business_type: "business_name",
  business_name: "location",
  location: "description",
  description: "logo",
  logo: "photos",
  photos: "whatsapp",
  whatsapp: "generating",
  generating: "preview",
  preview: "decision",
  decision: "plan",
  plan: "paying",
  paying: null,
};

const PREV_STEP: Record<FlowStep, FlowStep | null> = {
  email: null,
  business_type: "email",
  business_name: "business_type",
  location: "business_name",
  description: "location",
  logo: "description",
  photos: "logo",
  whatsapp: "photos",
  generating: null, // can't go back from generating
  preview: null,
  decision: "preview",
  plan: "decision",
  paying: "plan",
};

export default function BuildPage() {
  const [step, setStep] = useState<FlowStep>("email");
  const [data, setData] = useState<BuildState>(emptyBuildState());
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const previewRef = useRef<HTMLIFrameElement | null>(null);

  const update = <K extends keyof BuildState>(key: K, value: BuildState[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  // Derived
  const stepIdx = COLLECTION_STEPS.indexOf(step);
  const inCollection = stepIdx >= 0;
  const totalCollection = COLLECTION_STEPS.length;
  const slug = useMemo(() => slugifyDomain(data.businessName), [data.businessName]);
  const previewHtml = useMemo(() => generatePreviewHtml(data), [data]);
  const previewSubdomain = slug ? `${slug}.quicka.website` : "yourbusiness.quicka.website";

  const canAdvance = useMemo(() => {
    switch (step) {
      case "email":
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email);
      case "business_type":
        return data.businessType !== null;
      case "business_name":
        return data.businessName.trim().length >= 2;
      case "location":
        return data.city.trim().length >= 2;
      case "description":
        return data.tagline.trim().length >= 5 && data.description.trim().length >= 20;
      case "logo":
      case "photos":
        return true; // skippable
      case "whatsapp":
        return normalizeE164(data.whatsappRaw) !== null;
      case "plan":
        return data.selectedPlan !== null;
      default:
        return false;
    }
  }, [step, data]);

  const advance = () => {
    if (!canAdvance) return;
    if (step === "whatsapp") {
      update("whatsappE164", normalizeE164(data.whatsappRaw));
    }
    const next = NEXT_STEP[step];
    if (next) setStep(next);
  };

  const goBack = () => {
    const prev = PREV_STEP[step];
    if (prev) setStep(prev);
  };

  // "Generating" screen auto-advances after 8 seconds, also assigns siteId.
  useEffect(() => {
    if (step !== "generating") return;
    if (!data.siteId) {
      const newSiteId =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `site_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      update("siteId", newSiteId);
    }
    const t = setTimeout(() => setStep("preview"), 8000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // Enter advances on most steps. Skip if multi-line input is focused.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Enter") return;
      const target = e.target as HTMLElement | null;
      if (target?.tagName === "TEXTAREA") return;
      if (step === "description" || step === "decision" || step === "paying") return;
      advance();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, data]);

  // ──────────────────────────────────────────────────────────────────────
  // RENDER
  // ──────────────────────────────────────────────────────────────────────

  return (
    <main className="min-h-screen bg-brand-bg flex flex-col">
      {/* DEMO MODE banner — explains the page is the live merchant-review demo */}
      <div className="bg-brand-ink/95 text-white text-xs px-4 py-2 text-center border-b border-brand-green/40">
        <span className="font-semibold tracking-wide text-brand-green">DEMO MODE</span>
        <span className="opacity-70 ml-2">
          Site preview is a styled mockup while AI generation is being finalised.
        </span>
      </div>

      {/* Header */}
      <header className="bg-brand-ink px-6 py-4 flex items-center justify-between flex-shrink-0">
        <Link href="/" className="font-serif italic text-xl text-white no-underline">
          Quick<span className="text-brand-green">a</span>
        </Link>
        {inCollection && (
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              {Array.from({ length: totalCollection }, (_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i <= stepIdx ? "bg-brand-green" : "bg-white/20"
                  }`}
                />
              ))}
            </div>
            <span className="text-white/50 text-xs">
              {stepIdx + 1} of {totalCollection}
            </span>
          </div>
        )}
      </header>

      {/* Progress bar */}
      <div className="h-1 bg-brand-bg-alt flex-shrink-0">
        <div
          className="h-full bg-brand-green transition-all duration-300"
          style={{
            width: inCollection
              ? `${((stepIdx + 1) / totalCollection) * 100}%`
              : "100%",
          }}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-xl">
          {/* ────── STEP 1 — EMAIL ────── */}
          {step === "email" && (
            <div className="space-y-6">
              <div>
                <h1 className="font-serif text-3xl text-brand-ink mb-2">
                  Let&apos;s build your website.
                </h1>
                <p className="text-brand-muted">
                  Start with your email — we&apos;ll send your preview link here.
                </p>
              </div>
              <input
                type="email"
                value={data.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="hello@yourbusiness.co.za"
                autoFocus
                className="w-full px-5 py-4 rounded-2xl border-2 border-black/8 bg-white text-brand-ink text-lg outline-none focus:border-brand-green transition-colors"
              />
              <button
                onClick={advance}
                disabled={!canAdvance}
                className="w-full bg-brand-green text-white py-4 rounded-2xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-green-dark transition-colors"
              >
                Continue →
              </button>
              <p className="text-xs text-center text-brand-muted">
                No credit card · 60-min free preview
              </p>
            </div>
          )}

          {/* ────── STEP 2 — BUSINESS TYPE ────── */}
          {step === "business_type" && (
            <div className="space-y-6">
              <div>
                <h1 className="font-serif text-3xl text-brand-ink mb-2">
                  What do you offer?
                </h1>
                <p className="text-brand-muted">This helps us shape your website.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => update("businessType", "Service")}
                  className={`p-6 rounded-2xl border-2 text-left transition-all ${
                    data.businessType === "Service"
                      ? "border-brand-green bg-brand-green/5"
                      : "border-black/8 bg-white hover:border-black/16"
                  }`}
                >
                  <div className="text-4xl mb-3">🛠️</div>
                  <div className="font-bold text-brand-ink">Service Business</div>
                  <p className="text-sm text-brand-muted mt-1">
                    Hair salon, plumber, tutor, cleaner…
                  </p>
                </button>
                <button
                  onClick={() => update("businessType", "Product")}
                  className={`p-6 rounded-2xl border-2 text-left transition-all ${
                    data.businessType === "Product"
                      ? "border-brand-green bg-brand-green/5"
                      : "border-black/8 bg-white hover:border-black/16"
                  }`}
                >
                  <div className="text-4xl mb-3">🛍️</div>
                  <div className="font-bold text-brand-ink">Product Business</div>
                  <p className="text-sm text-brand-muted mt-1">
                    Online store, clothing, food…
                  </p>
                </button>
              </div>
              <button
                onClick={advance}
                disabled={!canAdvance}
                className="w-full bg-brand-green text-white py-4 rounded-2xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-green-dark transition-colors"
              >
                Continue →
              </button>
            </div>
          )}

          {/* ────── STEP 3 — BUSINESS NAME ────── */}
          {step === "business_name" && (
            <div className="space-y-6">
              <div>
                <h1 className="font-serif text-3xl text-brand-ink mb-2">
                  What&apos;s your business called?
                </h1>
                <p className="text-brand-muted">
                  This appears on your website and becomes your domain.
                </p>
              </div>
              <input
                type="text"
                value={data.businessName}
                onChange={(e) => update("businessName", e.target.value)}
                placeholder="e.g. Sarah's Hair Studio"
                autoFocus
                maxLength={60}
                className="w-full px-5 py-4 rounded-2xl border-2 border-black/8 bg-white text-brand-ink text-lg outline-none focus:border-brand-green transition-colors"
              />
              {slug && (
                <div className="p-4 bg-brand-green/10 border border-brand-green/20 rounded-xl">
                  <p className="text-xs text-brand-muted mb-1">Your domain will be</p>
                  <p className="text-brand-green-dark font-bold font-mono">{slug}.co.za</p>
                </div>
              )}
              <button
                onClick={advance}
                disabled={!canAdvance}
                className="w-full bg-brand-green text-white py-4 rounded-2xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-green-dark transition-colors"
              >
                Continue →
              </button>
            </div>
          )}

          {/* ────── STEP 4 — LOCATION ────── */}
          {step === "location" && (
            <div className="space-y-6">
              <div>
                <h1 className="font-serif text-3xl text-brand-ink mb-2">
                  Where do you operate?
                </h1>
                <p className="text-brand-muted">
                  Helps locals find you on Google.
                </p>
              </div>
              <div className="space-y-3">
                <input
                  type="text"
                  value={data.city}
                  onChange={(e) => update("city", e.target.value)}
                  placeholder="City or suburb (e.g. Sandton)"
                  autoFocus
                  className="w-full px-5 py-4 rounded-2xl border-2 border-black/8 bg-white text-brand-ink text-lg outline-none focus:border-brand-green transition-colors"
                />
                <select
                  value={data.province}
                  onChange={(e) => update("province", e.target.value)}
                  className="w-full px-5 py-4 rounded-2xl border-2 border-black/8 bg-white text-brand-ink text-lg outline-none focus:border-brand-green transition-colors appearance-none"
                  style={{
                    backgroundImage:
                      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%237A756E'%3E%3Cpath fill-rule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clip-rule='evenodd'/%3E%3C/svg%3E\")",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 16px center",
                    backgroundSize: "20px",
                  }}
                >
                  <option value="">Province (optional)</option>
                  <option value="Gauteng">Gauteng</option>
                  <option value="Western Cape">Western Cape</option>
                  <option value="KwaZulu-Natal">KwaZulu-Natal</option>
                  <option value="Eastern Cape">Eastern Cape</option>
                  <option value="Free State">Free State</option>
                  <option value="Limpopo">Limpopo</option>
                  <option value="Mpumalanga">Mpumalanga</option>
                  <option value="North West">North West</option>
                  <option value="Northern Cape">Northern Cape</option>
                </select>
              </div>
              <button
                onClick={advance}
                disabled={!canAdvance}
                className="w-full bg-brand-green text-white py-4 rounded-2xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-green-dark transition-colors"
              >
                Continue →
              </button>
            </div>
          )}

          {/* ────── STEP 5 — DESCRIPTION ────── */}
          {step === "description" && (
            <div className="space-y-6">
              <div>
                <h1 className="font-serif text-3xl text-brand-ink mb-2">
                  Tell us about your business.
                </h1>
                <p className="text-brand-muted">
                  This becomes the headline and main copy on your site.
                </p>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold tracking-wide uppercase text-brand-muted block mb-2">
                    One-line tagline
                  </label>
                  <input
                    type="text"
                    value={data.tagline}
                    onChange={(e) => update("tagline", e.target.value)}
                    placeholder="e.g. Friendly family salon in Sandton"
                    autoFocus
                    maxLength={80}
                    className="w-full px-5 py-3.5 rounded-2xl border-2 border-black/8 bg-white text-brand-ink outline-none focus:border-brand-green transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold tracking-wide uppercase text-brand-muted block mb-2">
                    About you (2–3 sentences)
                  </label>
                  <textarea
                    value={data.description}
                    onChange={(e) => update("description", e.target.value)}
                    placeholder="What you do, who you serve, what makes you different. e.g. 'We&apos;ve been cutting hair in Sandton since 2008. Family-run, walk-ins welcome, parking out front.'"
                    rows={5}
                    maxLength={500}
                    className="w-full px-5 py-3.5 rounded-2xl border-2 border-black/8 bg-white text-brand-ink outline-none focus:border-brand-green transition-colors resize-none"
                  />
                  <p className="text-xs text-brand-muted mt-1.5 text-right">
                    {data.description.length}/500
                  </p>
                </div>
              </div>
              <button
                onClick={advance}
                disabled={!canAdvance}
                className="w-full bg-brand-green text-white py-4 rounded-2xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-green-dark transition-colors"
              >
                Continue →
              </button>
            </div>
          )}

          {/* ────── STEP 6 — LOGO ────── */}
          {step === "logo" && (
            <div className="space-y-6">
              <div>
                <h1 className="font-serif text-3xl text-brand-ink mb-2">
                  Your logo.
                </h1>
                <p className="text-brand-muted">
                  Got a logo? Upload it. No logo? Skip — we&apos;ll use your business name beautifully.
                </p>
              </div>
              <LogoUpload
                value={data.logoDataUrl}
                onChange={(url) => update("logoDataUrl", url)}
              />
              <button
                onClick={advance}
                className="w-full bg-brand-green text-white py-4 rounded-2xl font-semibold text-lg hover:bg-brand-green-dark transition-colors"
              >
                {data.logoDataUrl ? "Continue →" : "Skip logo for now →"}
              </button>
            </div>
          )}

          {/* ────── STEP 7 — PHOTOS ────── */}
          {step === "photos" && (
            <div className="space-y-6">
              <div>
                <h1 className="font-serif text-3xl text-brand-ink mb-2">
                  Your photos.
                </h1>
                <p className="text-brand-muted">
                  Upload up to 5 photos of your work, products, or space.
                </p>
              </div>
              <PhotoUpload
                value={data.photoDataUrls}
                onChange={(urls) => update("photoDataUrls", urls)}
                max={5}
              />
              <label className="flex items-center gap-3 p-4 bg-white border border-black/8 rounded-xl cursor-pointer hover:border-black/16 transition-colors">
                <input
                  type="checkbox"
                  checked={data.useIndustryPhotos}
                  onChange={(e) =>
                    update("useIndustryPhotos", e.target.checked)
                  }
                  className="w-5 h-5 accent-brand-green flex-shrink-0"
                />
                <div className="text-sm">
                  <div className="font-semibold text-brand-ink">
                    Fill gaps with industry photos
                  </div>
                  <div className="text-xs text-brand-muted">
                    If your upload doesn&apos;t fill the page, we&apos;ll add tasteful stock photos from your industry.
                  </div>
                </div>
              </label>
              <button
                onClick={advance}
                className="w-full bg-brand-green text-white py-4 rounded-2xl font-semibold text-lg hover:bg-brand-green-dark transition-colors"
              >
                {data.photoDataUrls.length > 0
                  ? "Continue →"
                  : "Skip photos for now →"}
              </button>
            </div>
          )}

          {/* ────── STEP 8 — WHATSAPP ────── */}
          {step === "whatsapp" && (
            <div className="space-y-6">
              <div>
                <h1 className="font-serif text-3xl text-brand-ink mb-2">
                  How can customers reach you?
                </h1>
                <p className="text-brand-muted">
                  Your WhatsApp becomes the primary &ldquo;Contact us&rdquo; button on the site.
                </p>
              </div>
              <div>
                <label className="text-xs font-semibold tracking-wide uppercase text-brand-muted block mb-2">
                  WhatsApp number
                </label>
                <input
                  type="tel"
                  value={data.whatsappRaw}
                  onChange={(e) => update("whatsappRaw", e.target.value)}
                  placeholder="082 123 4567 or +27 82 123 4567"
                  autoFocus
                  className="w-full px-5 py-4 rounded-2xl border-2 border-black/8 bg-white text-brand-ink text-lg outline-none focus:border-brand-green transition-colors"
                />
                {data.whatsappRaw.length > 0 && (
                  <p
                    className={`text-xs mt-2 ${
                      canAdvance ? "text-brand-green-dark" : "text-brand-muted"
                    }`}
                  >
                    {canAdvance
                      ? `✓ We'll save this as ${normalizeE164(data.whatsappRaw)}`
                      : "Enter a valid South African mobile number"}
                  </p>
                )}
              </div>
              <button
                onClick={advance}
                disabled={!canAdvance}
                className="w-full bg-brand-green text-white py-4 rounded-2xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-green-dark transition-colors"
              >
                Build my preview ⚡
              </button>
            </div>
          )}

          {/* ────── GENERATING ────── */}
          {step === "generating" && (
            <div className="space-y-6 text-center py-8">
              <div className="text-6xl animate-bounce">⚡</div>
              <div>
                <h2 className="font-serif text-3xl text-brand-ink mb-2">
                  Building your site…
                </h2>
                <p className="text-brand-muted">
                  Laying out pages, placing your photos, writing copy.
                  <br />
                  About 60 seconds.
                </p>
              </div>
              <div className="max-w-sm mx-auto space-y-2">
                <GeneratingTick delay={200} label="Setting up your domain" />
                <GeneratingTick delay={1500} label="Crafting your copy" />
                <GeneratingTick delay={3500} label="Placing your photos" />
                <GeneratingTick delay={5500} label="Wiring up your WhatsApp button" />
                <GeneratingTick delay={7000} label="Polishing the design" />
              </div>
            </div>
          )}

          {/* ────── PREVIEW + DECISION ────── */}
          {(step === "preview" || step === "decision") && (
            <PreviewAndDecision
              previewHtml={previewHtml}
              previewSubdomain={previewSubdomain}
              onMakeItLive={() => setStep("plan")}
              onRequestChanges={() => setStep("decision")}
              isDecision={step === "decision"}
            />
          )}

          {/* ────── PLAN PICKER ────── */}
          {step === "plan" && (
            <PlanPicker
              selectedPlan={data.selectedPlan}
              onSelect={(plan) => update("selectedPlan", plan)}
              onContinue={advance}
              canAdvance={canAdvance}
            />
          )}

          {/* ────── PAYFAST CHECKOUT ────── */}
          {step === "paying" && data.siteId && data.selectedPlan && (
            <div className="space-y-4 text-center py-8">
              <div className="text-5xl">🔒</div>
              <h2 className="font-serif text-2xl text-brand-ink">
                Redirecting to PayFast…
              </h2>
              <p className="text-brand-muted text-sm">
                You&apos;ll be back on Quicka the moment your payment completes.
              </p>
              {paymentError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm mt-4 text-left">
                  {paymentError}
                </div>
              )}
              <PayfastForm
                plan={data.selectedPlan}
                email={data.email}
                bizName={data.businessName}
                siteId={data.siteId}
                onError={(msg) => {
                  setStep("plan");
                  setPaymentError(msg);
                }}
              />
            </div>
          )}

          {/* ────── BACK BUTTON ────── */}
          {PREV_STEP[step] && step !== "paying" && (
            <button
              onClick={goBack}
              className="w-full text-center text-brand-muted py-3 mt-4 hover:text-brand-ink transition-colors text-sm"
            >
              ← Back
            </button>
          )}
        </div>
      </div>
    </main>
  );
}

// ──────────────────────────────────────────────────────────────────────
// Sub-components
// ──────────────────────────────────────────────────────────────────────

function GeneratingTick({ delay, label }: { delay: number; label: string }) {
  const [done, setDone] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setDone(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return (
    <div className="flex items-center gap-3 text-sm text-left">
      <span
        className={`w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 transition-colors ${
          done ? "bg-brand-green text-white" : "bg-brand-bg-alt text-brand-muted"
        }`}
      >
        {done ? "✓" : "·"}
      </span>
      <span className={done ? "text-brand-ink" : "text-brand-muted"}>{label}</span>
    </div>
  );
}

function PreviewAndDecision({
  previewHtml,
  previewSubdomain,
  onMakeItLive,
  onRequestChanges,
  isDecision,
}: {
  previewHtml: string;
  previewSubdomain: string;
  onMakeItLive: () => void;
  onRequestChanges: () => void;
  isDecision: boolean;
}) {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <p className="text-xs font-bold tracking-widest uppercase text-brand-green-dark mb-2">
          Your preview is ready
        </p>
        <h2 className="font-serif text-3xl text-brand-ink mb-2">
          Here&apos;s how your site looks.
        </h2>
        <p className="text-brand-muted text-sm">
          Preview URL: <span className="font-mono">{previewSubdomain}</span>
          {" · Free for 60 minutes."}
        </p>
      </div>

      {/* Iframe preview */}
      <div className="rounded-2xl border-2 border-black/8 bg-white overflow-hidden shadow-lg">
        <div className="bg-brand-bg-alt px-4 py-2 flex items-center gap-2 border-b border-black/8">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
          </div>
          <div className="flex-1 text-center text-xs font-mono text-brand-muted">
            {previewSubdomain}
          </div>
        </div>
        <iframe
          srcDoc={previewHtml}
          title="Site preview"
          className="w-full"
          style={{ height: "640px" }}
          sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin"
        />
      </div>

      {isDecision ? (
        <RequestChangesUpsell onContinue={onMakeItLive} />
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          <button
            onClick={onMakeItLive}
            className="bg-brand-green text-white py-4 px-6 rounded-2xl font-semibold text-lg hover:bg-brand-green-dark transition-colors"
          >
            Make it live →
          </button>
          <button
            onClick={onRequestChanges}
            className="bg-white text-brand-ink py-4 px-6 rounded-2xl font-semibold border-2 border-black/8 hover:border-black/16 transition-colors"
          >
            Request changes
          </button>
        </div>
      )}
    </div>
  );
}

function RequestChangesUpsell({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="bg-brand-ink text-white rounded-2xl p-8 space-y-5">
      <p className="text-xs font-bold tracking-widest uppercase text-brand-green">
        Want changes?
      </p>
      <h3 className="font-serif text-2xl">
        Changes are included in your monthly plan.
      </h3>
      <p className="text-white/75 leading-relaxed">
        Once your site is live, you can request changes through your dashboard.
        Every plan includes a monthly allowance:
      </p>
      <ul className="space-y-2 text-sm">
        <li className="flex items-center gap-3">
          <span className="bg-brand-green/20 text-brand-green w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
            5
          </span>
          <span>
            <strong className="text-white">Basic</strong>
            <span className="text-white/55"> — R99/mo, 5 changes per month</span>
          </span>
        </li>
        <li className="flex items-center gap-3">
          <span className="bg-brand-green/20 text-brand-green w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
            8
          </span>
          <span>
            <strong className="text-white">Growth</strong>
            <span className="text-white/55"> — R149/mo, 8 changes per month</span>
          </span>
        </li>
      </ul>
      <button
        onClick={onContinue}
        className="w-full bg-brand-green text-white py-4 rounded-2xl font-semibold text-lg hover:bg-brand-green-dark transition-colors"
      >
        Make my site live →
      </button>
      <p className="text-xs text-white/40 text-center">
        First 7 days are money-back guaranteed. Cancel any time.
      </p>
    </div>
  );
}

function PlanPicker({
  selectedPlan,
  onSelect,
  onContinue,
  canAdvance,
}: {
  selectedPlan: "Basic" | "Growth" | null;
  onSelect: (plan: "Basic" | "Growth") => void;
  onContinue: () => void;
  canAdvance: boolean;
}) {
  const plans = COMPANY.plans;
  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-xs font-bold tracking-widest uppercase text-brand-green-dark mb-2">
          Pick a plan
        </p>
        <h2 className="font-serif text-3xl text-brand-ink mb-2">
          Make your site live.
        </h2>
        <p className="text-brand-muted">
          Every plan includes your <code className="font-mono text-sm bg-brand-bg-alt px-1 rounded">.co.za</code>{" "}
          domain, hosting, SSL and WhatsApp button.
        </p>
      </div>

      <div className="space-y-3">
        {/* Basic */}
        <button
          onClick={() => onSelect("Basic")}
          className={`w-full p-5 rounded-2xl border-2 text-left transition-all ${
            selectedPlan === "Basic"
              ? "border-brand-green bg-brand-green/5"
              : "border-black/8 bg-white hover:border-black/16"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span
              className={`font-bold text-lg ${
                selectedPlan === "Basic" ? "text-brand-green-dark" : "text-brand-ink"
              }`}
            >
              {plans.Basic.name}
            </span>
            <span className="font-serif text-2xl text-brand-ink">
              R{plans.Basic.priceZar}
              <span className="text-sm text-brand-muted">/mo</span>
            </span>
          </div>
          <p className="text-sm text-brand-muted">
            1 page · {plans.Basic.changesPerMonth} changes/month included
          </p>
        </button>

        {/* Growth */}
        <button
          onClick={() => onSelect("Growth")}
          className={`w-full p-5 rounded-2xl border-2 text-left transition-all ${
            selectedPlan === "Growth"
              ? "border-brand-green bg-brand-green/5"
              : "border-black/8 bg-white hover:border-black/16"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span
              className={`font-bold text-lg ${
                selectedPlan === "Growth" ? "text-brand-green-dark" : "text-brand-ink"
              }`}
            >
              {plans.Growth.name}
            </span>
            <span className="font-serif text-2xl text-brand-ink">
              R{plans.Growth.priceZar}
              <span className="text-sm text-brand-muted">/mo</span>
            </span>
          </div>
          <p className="text-sm text-brand-muted">
            5 pages + blog · {plans.Growth.changesPerMonth} changes/month + AI content
          </p>
        </button>

        {/* Business — Coming Soon */}
        <div
          className="w-full p-5 rounded-2xl border-2 border-dashed border-black/12 bg-brand-bg-alt/50 text-left opacity-75"
          aria-disabled="true"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2.5">
              <span className="font-bold text-lg text-brand-ink/70">
                {plans.Business.name}
              </span>
              <span className="bg-brand-ink/10 text-brand-ink/60 text-xs font-bold tracking-wider uppercase px-2 py-0.5 rounded">
                Coming soon
              </span>
            </div>
            <span className="font-serif text-2xl text-brand-ink/50">
              R{plans.Business.priceZar}
              <span className="text-sm text-brand-muted">/mo</span>
            </span>
          </div>
          <p className="text-sm text-brand-muted">
            Everything in Growth + online store + photo gallery · 10 changes/month
          </p>
        </div>
      </div>

      <button
        onClick={onContinue}
        disabled={!canAdvance}
        className="w-full bg-brand-green text-white py-4 rounded-2xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-green-dark transition-colors"
      >
        Continue to PayFast →
      </button>

      <p className="text-xs text-center text-brand-muted">
        By continuing, you agree to our{" "}
        <Link href={COMPANY.links.terms} className="underline hover:text-brand-ink">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href={COMPANY.links.privacy} className="underline hover:text-brand-ink">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}
