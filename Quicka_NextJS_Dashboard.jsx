/**
 * Quicka — Onboarding Flow (Next.js)
 * =====================================
 * File: Quicka_NextJS_Onboarding.jsx
 *
 * Files in this module:
 *
 *  src/app/build/page.tsx                       ← Onboarding page route
 *  src/components/onboarding/OnboardingModal.tsx ← Modal shell + step router
 *  src/components/onboarding/OnboardingContext.tsx ← Shared state
 *  src/components/onboarding/steps/
 *    Step01_Email.tsx        ← Email + email upsell
 *    Step02_OTP.tsx          ← OTP verification
 *    Step03_Plan.tsx         ← Plan picker
 *    Step04_BizType.tsx      ← Service or Product
 *    Step05_Items.tsx        ← Up to 5/8/12 items
 *    Step06_BizName.tsx      ← Business name
 *    Step07_BizDesc.tsx      ← Business description
 *    Step08_Location.tsx     ← City + WhatsApp
 *    Step09_Socials.tsx      ← Facebook/Instagram/TikTok
 *    Step10_Photos.tsx       ← Photo upload + industry toggle
 *    Step11_Colours.tsx      ← Brand colour picker
 *    Step12_Logo.tsx         ← Logo upload + AI logo upsell
 *    Step13_Generate.tsx     ← Summary + generation + progress bar
 *  src/components/onboarding/SitePreview.tsx     ← 60-min preview
 */

/* ════════════════════════════════════════════
   FILE 1 — src/app/build/page.tsx
   Route: quicka.website/build
════════════════════════════════════════════ */
export const BUILD_PAGE = `
import type { Metadata } from "next";
import { OnboardingWrapper } from "@/components/onboarding/OnboardingWrapper";

export const metadata: Metadata = {
  title:  "Build Your Website — Quicka",
  description: "Answer 8 questions and get your AI-built website in 60 seconds.",
  robots: { index: false }, // Don't index the build flow
};

export default function BuildPage() {
  return <OnboardingWrapper />;
}
`;

/* ════════════════════════════════════════════
   FILE 2 — src/components/onboarding/OnboardingContext.tsx
   Shared state across all 13 steps
════════════════════════════════════════════ */
export const ONBOARDING_CONTEXT = `
"use client";

import {
  createContext, useContext, useState,
  type ReactNode, type Dispatch, type SetStateAction,
} from "react";
import { PLANS, BRAND_COLOURS, type PlanName } from "@/lib/constants";
import type { OnboardingData, ServiceItem }     from "@/types";

// Default empty state
const DEFAULT_ITEMS: ServiceItem[] = Array(12).fill(null).map(() => ({
  name: "", description: "", price: "", photo: null,
}));

const DEFAULT_DATA: OnboardingData = {
  email:              "",
  emailUpsell:        false,
  otp:                "",
  plan:               "Growth",
  bizType:            "Service",
  items:              DEFAULT_ITEMS,
  bizName:            "",
  bizDesc:            "",
  city:               "",
  whatsapp:           "",
  facebook:           "",
  instagram:          "",
  tiktok:             "",
  photos:             Array(5).fill(null),
  useIndustryPhotos:  true,
  brandColourIndex:   0,
  customColour:       false,
  customHex:          "#00C853",
  logo:               null,
  logoUpsell:         false,
};

interface OnboardingContextType {
  data:    OnboardingData;
  setData: Dispatch<SetStateAction<OnboardingData>>;
  set:     (key: keyof OnboardingData, value: unknown) => void;
  setItem: (index: number, key: keyof ServiceItem, value: string | null) => void;
  setPhoto:(index: number, value: string | null) => void;
  maxItems: number;
}

const OnboardingContext = createContext<OnboardingContextType | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<OnboardingData>(DEFAULT_DATA);

  const set = (key: keyof OnboardingData, value: unknown) =>
    setData(d => ({ ...d, [key]: value }));

  const setItem = (i: number, key: keyof ServiceItem, value: string | null) =>
    setData(d => {
      const items = [...d.items];
      items[i] = { ...items[i], [key]: value ?? "" };
      return { ...d, items };
    });

  const setPhoto = (i: number, value: string | null) =>
    setData(d => {
      const photos = [...d.photos];
      photos[i] = value;
      return { ...d, photos };
    });

  const maxItems = PLANS[data.plan].items;

  return (
    <OnboardingContext.Provider value={{ data, setData, set, setItem, setPhoto, maxItems }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error("useOnboarding must be used inside OnboardingProvider");
  return ctx;
}
`;

/* ════════════════════════════════════════════
   FILE 3 — src/components/onboarding/OnboardingWrapper.tsx
   Wraps the modal in the provider, listens for open event
════════════════════════════════════════════ */
export const ONBOARDING_WRAPPER = `
"use client";

import { useState, useEffect }    from "react";
import { OnboardingProvider }     from "./OnboardingContext";
import { OnboardingModal }        from "./OnboardingModal";
import { SitePreview }            from "./SitePreview";
import type { OnboardingData }    from "@/types";

export function OnboardingWrapper() {
  const [open,        setOpen]        = useState(false);
  const [previewData, setPreviewData] = useState<OnboardingData | null>(null);

  // Listen for event from Nav / Hero CTAs
  useEffect(() => {
    const handler = () => setOpen(true);
    document.addEventListener("quicka:open-onboarding", handler);
    return () => document.removeEventListener("quicka:open-onboarding", handler);
  }, []);

  return (
    <OnboardingProvider>
      {open && !previewData && (
        <OnboardingModal
          onClose={() => setOpen(false)}
          onComplete={data => { setOpen(false); setPreviewData(data); }}
        />
      )}
      {previewData && (
        <SitePreview
          data={previewData}
          onClose={() => setPreviewData(null)}
          onRebuild={() => { setPreviewData(null); setOpen(true); }}
        />
      )}
    </OnboardingProvider>
  );
}
`;

/* ════════════════════════════════════════════
   FILE 4 — src/components/onboarding/OnboardingModal.tsx
   Modal shell — handles step navigation
════════════════════════════════════════════ */
export const ONBOARDING_MODAL = `
"use client";

import { useState }              from "react";
import { useOnboarding }         from "./OnboardingContext";
import type { OnboardingData }   from "@/types";

// Steps
import { Step01Email }    from "./steps/Step01_Email";
import { Step02OTP }      from "./steps/Step02_OTP";
import { Step03Plan }     from "./steps/Step03_Plan";
import { Step04BizType }  from "./steps/Step04_BizType";
import { Step05Items }    from "./steps/Step05_Items";
import { Step06BizName }  from "./steps/Step06_BizName";
import { Step07BizDesc }  from "./steps/Step07_BizDesc";
import { Step08Location } from "./steps/Step08_Location";
import { Step09Socials }  from "./steps/Step09_Socials";
import { Step10Photos }   from "./steps/Step10_Photos";
import { Step11Colours }  from "./steps/Step11_Colours";
import { Step12Logo }     from "./steps/Step12_Logo";
import { Step13Generate } from "./steps/Step13_Generate";

const TOTAL_STEPS = 13;

interface OnboardingModalProps {
  onClose:    () => void;
  onComplete: (data: OnboardingData) => void;
}

export function OnboardingModal({ onClose, onComplete }: OnboardingModalProps) {
  const [step,       setStep]       = useState(1);
  const [generating, setGenerating] = useState(false);
  const { data }                    = useOnboarding();

  const next  = () => setStep(s => Math.min(s + 1, TOTAL_STEPS));
  const prev  = () => setStep(s => Math.max(s - 1, 1));
  const goTo  = (n: number) => setStep(n);

  const progress = ((step - 1) / (TOTAL_STEPS - 1)) * 100;

  const stepProps = { next, prev, goTo };

  const STEPS: Record<number, React.ReactNode> = {
    1:  <Step01Email    {...stepProps} />,
    2:  <Step02OTP      {...stepProps} />,
    3:  <Step03Plan     {...stepProps} />,
    4:  <Step04BizType  {...stepProps} />,
    5:  <Step05Items    {...stepProps} />,
    6:  <Step06BizName  {...stepProps} />,
    7:  <Step07BizDesc  {...stepProps} />,
    8:  <Step08Location {...stepProps} />,
    9:  <Step09Socials  {...stepProps} />,
    10: <Step10Photos   {...stepProps} />,
    11: <Step11Colours  {...stepProps} />,
    12: <Step12Logo     {...stepProps} />,
    13: <Step13Generate {...stepProps} onComplete={onComplete} generating={generating} setGenerating={setGenerating} />,
  };

  return (
    // Backdrop
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4
      bg-black/55 backdrop-blur-sm">

      {/* Modal */}
      <div className="bg-white rounded-3xl w-full max-w-md max-h-[92vh]
        overflow-y-auto shadow-2xl flex flex-col">

        {/* Header */}
        <div className="sticky top-0 z-10 bg-white rounded-t-3xl border-b border-black/8
          px-6 py-4 flex items-center justify-between">
          <div className="font-serif text-xl text-brand-ink">Quicka</div>

          {!generating && (
            <div className="flex items-center gap-3">
              <span className="text-xs text-brand-muted">
                Step {step} of {TOTAL_STEPS}
              </span>
              <button
                onClick={onClose}
                aria-label="Close"
                className="text-brand-muted hover:text-brand-ink transition-colors
                  text-xl leading-none bg-transparent border-none cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Progress bar */}
        {!generating && (
          <div className="h-1 bg-brand-warm">
            <div
              className="h-full bg-brand-green transition-all duration-300 ease-out"
              style={{ width: \`\${progress}%\` }}
            />
          </div>
        )}

        {/* Step content */}
        <div className="px-6 py-6 flex-1">
          {STEPS[step]}

          {/* Back button */}
          {step > 1 && !generating && (
            <button
              onClick={prev}
              className="w-full text-center text-sm text-brand-muted mt-3
                bg-transparent border-none cursor-pointer hover:text-brand-ink
                transition-colors py-2"
            >
              ← Back
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
`;

/* ════════════════════════════════════════════
   FILE 5 — steps/Step01_Email.tsx
════════════════════════════════════════════ */
export const STEP01 = `
"use client";

import { useOnboarding } from "../OnboardingContext";
import { Input }         from "@/components/ui/Input";
import { Button }        from "@/components/ui/Button";
import { isValidEmail }  from "@/lib/utils";
import { EMAIL_UPSELL_PRICE } from "@/lib/constants";

export function Step01Email({ next }: { next: () => void }) {
  const { data, set } = useOnboarding();

  const handleNext = async () => {
    if (!isValidEmail(data.email)) return;
    // In production: call /api/otp to send OTP via Resend
    // await fetch("/api/otp", { method: "POST", body: JSON.stringify({ email: data.email }) });
    next();
  };

  return (
    <div className="animate-fadeUp">
      <h2 className="font-serif text-2xl font-normal mb-1">
        Let's build your website.
      </h2>
      <p className="text-brand-muted text-sm mb-6">Start with your email address.</p>

      <Input
        label="Email address"
        type="email"
        value={data.email}
        onChange={e => set("email", e.target.value)}
        placeholder="hello@yourbusiness.co.za"
        onKeyDown={e => e.key === "Enter" && handleNext()}
      />

      {/* Email upsell card */}
      <div
        onClick={() => set("emailUpsell", !data.emailUpsell)}
        className={\`mb-6 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-150
          \${data.emailUpsell
            ? "border-brand-green bg-brand-green/8"
            : "border-black/8 bg-brand-bg hover:border-black/16"
          }\`}
      >
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span>📧</span>
            <span className="font-bold text-sm">Add a professional email</span>
          </div>
          <div className={\`w-5 h-5 rounded-full flex items-center justify-center text-xs
            font-bold transition-colors
            \${data.emailUpsell ? "bg-brand-green text-white" : "bg-slate-200"}\`}>
            {data.emailUpsell && "✓"}
          </div>
        </div>
        <p className="text-xs text-brand-muted ml-6">
          Get <strong className="text-brand-ink">hello@yourbusiness.co.za</strong>
          {" "}· Only <strong className="text-brand-green">+R{EMAIL_UPSELL_PRICE}/mo</strong>
        </p>
      </div>

      <Button
        variant="green"
        full
        onClick={handleNext}
        disabled={!isValidEmail(data.email)}
      >
        Continue →
      </Button>
    </div>
  );
}
`;

/* ════════════════════════════════════════════
   FILE 6 — steps/Step02_OTP.tsx
════════════════════════════════════════════ */
export const STEP02 = `
"use client";

import { useOnboarding } from "../OnboardingContext";
import { Input }         from "@/components/ui/Input";
import { Button }        from "@/components/ui/Button";

export function Step02OTP({ next, prev }: { next: () => void; prev: () => void }) {
  const { data, set } = useOnboarding();
  const valid = data.otp.length === 6 && /^\\d{6}$/.test(data.otp);

  return (
    <div className="animate-fadeUp">
      <h2 className="font-serif text-2xl font-normal mb-1">Check your email.</h2>
      <p className="text-brand-muted text-sm mb-6">
        We sent a 6-digit code to{" "}
        <strong className="text-brand-ink">{data.email}</strong>
      </p>

      <Input
        label="Verification code"
        type="text"
        inputMode="numeric"
        maxLength={6}
        value={data.otp}
        onChange={e => set("otp", e.target.value.replace(/\\D/g, ""))}
        placeholder="123456"
        hint="Demo: use 123456"
        onKeyDown={e => e.key === "Enter" && valid && next()}
      />

      <Button variant="green" full onClick={next} disabled={!valid}>
        Verify →
      </Button>

      <button
        onClick={prev}
        className="w-full text-center text-sm text-brand-muted mt-3
          bg-transparent border-none cursor-pointer hover:text-brand-ink py-1"
      >
        ← Change email
      </button>
    </div>
  );
}
`;

/* ════════════════════════════════════════════
   FILE 7 — steps/Step03_Plan.tsx
════════════════════════════════════════════ */
export const STEP03 = `
"use client";

import { PLANS, type PlanName } from "@/lib/constants";
import { useOnboarding }        from "../OnboardingContext";
import { Button }               from "@/components/ui/Button";
import { cn }                   from "@/lib/utils";

export function Step03Plan({ next }: { next: () => void }) {
  const { data, set } = useOnboarding();

  return (
    <div className="animate-fadeUp">
      <h2 className="font-serif text-2xl font-normal mb-1">Choose your plan.</h2>
      <p className="text-brand-muted text-sm mb-5">You can upgrade anytime.</p>

      <div className="flex flex-col gap-3 mb-6">
        {(Object.keys(PLANS) as PlanName[]).map(name => {
          const plan     = PLANS[name];
          const selected = data.plan === name;
          return (
            <button
              key={name}
              onClick={() => set("plan", name)}
              className={cn(
                "w-full text-left p-4 rounded-2xl border-2 transition-all duration-150",
                selected
                  ? "border-brand-green bg-brand-green/8"
                  : "border-black/8 bg-white hover:border-black/16"
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={cn("font-bold text-sm", selected && "text-brand-green")}>
                  {name}
                </span>
                <span className="font-serif text-2xl text-brand-ink">
                  R{plan.price}
                  <span className="text-xs font-sans text-brand-muted">/mo</span>
                </span>
              </div>
              <p className="text-xs text-brand-muted">
                {plan.pages === 1 ? "1 page" : \`\${plan.pages} pages\`}
                {" · "}{plan.items} items
                {" · "}{plan.changes} changes/mo
                {plan.blog > 0 && \` · \${plan.blog} blog posts\`}
                {plan.store && " · Online store"}
              </p>
            </button>
          );
        })}
      </div>

      <Button variant="green" full onClick={next}>
        Continue with {data.plan} →
      </Button>
    </div>
  );
}
`;

/* ════════════════════════════════════════════
   FILE 8 — steps/Step04_BizType.tsx
════════════════════════════════════════════ */
export const STEP04 = `
"use client";

import { useOnboarding } from "../OnboardingContext";
import { Button }        from "@/components/ui/Button";
import { cn }            from "@/lib/utils";

const TYPES = [
  { value: "Service", icon: "🛠️", label: "Service Business", desc: "Hair salon, plumber, tutor, cleaner, consultant..." },
  { value: "Product", icon: "🛍️", label: "Product Business",  desc: "Online store, clothing, food, crafts, electronics..." },
] as const;

export function Step04BizType({ next }: { next: () => void }) {
  const { data, set } = useOnboarding();

  return (
    <div className="animate-fadeUp">
      <h2 className="font-serif text-2xl font-normal mb-1">What do you offer?</h2>
      <p className="text-brand-muted text-sm mb-5">This shapes how your site is built.</p>

      <div className="flex flex-col gap-3 mb-6">
        {TYPES.map(t => (
          <button
            key={t.value}
            onClick={() => set("bizType", t.value)}
            className={cn(
              "w-full text-left p-5 rounded-2xl border-2 transition-all duration-150",
              data.bizType === t.value
                ? "border-brand-green bg-brand-green/8"
                : "border-black/8 bg-white hover:border-black/16"
            )}
          >
            <div className={cn(
              "font-bold text-sm mb-1",
              data.bizType === t.value ? "text-brand-green" : "text-brand-ink"
            )}>
              {t.icon} {t.label}
            </div>
            <p className="text-xs text-brand-muted">{t.desc}</p>
          </button>
        ))}
      </div>

      <Button variant="green" full onClick={next}>Continue →</Button>
    </div>
  );
}
`;

/* ════════════════════════════════════════════
   FILE 9 — steps/Step05_Items.tsx
════════════════════════════════════════════ */
export const STEP05 = `
"use client";

import { useOnboarding } from "../OnboardingContext";
import { Input }         from "@/components/ui/Input";
import { Textarea }      from "@/components/ui/Textarea";
import { PhotoUpload }   from "@/components/ui/PhotoUpload";
import { Button }        from "@/components/ui/Button";

export function Step05Items({ next }: { next: () => void }) {
  const { data, setItem, maxItems } = useOnboarding();
  const label = data.bizType === "Service" ? "service" : "product";
  const hasFirst = data.items[0].name.trim().length > 0;

  return (
    <div className="animate-fadeUp">
      <h2 className="font-serif text-2xl font-normal mb-1">
        Add your {label}s.
      </h2>
      <p className="text-brand-muted text-sm mb-4">
        Up to {maxItems} on your {data.plan} plan. Add at least 1.
      </p>

      <div className="flex flex-col gap-4 max-h-[52vh] overflow-y-auto pr-1 mb-5">
        {Array.from({ length: maxItems }, (_, i) => (
          <div key={i} className="bg-brand-bg rounded-2xl p-4 border border-black/8">
            <p className="text-xs font-bold text-brand-muted uppercase tracking-wider mb-3">
              {label.charAt(0).toUpperCase() + label.slice(1)} {i + 1}
              {i === 0 && <span className="ml-1 text-brand-ember">*required</span>}
            </p>

            <div className="grid grid-cols-2 gap-3">
              {/* Name — full width */}
              <div className="col-span-2">
                <Input
                  label="Name"
                  value={data.items[i].name}
                  onChange={e => setItem(i, "name", e.target.value)}
                  placeholder={
                    data.bizType === "Service"
                      ? "e.g. Full Head Braids"
                      : "e.g. Leather Handbag"
                  }
                />
              </div>

              {/* Description — full width */}
              <div className="col-span-2">
                <Textarea
                  label="Description"
                  value={data.items[i].description}
                  onChange={e => setItem(i, "description", e.target.value)}
                  placeholder="Brief description..."
                  rows={2}
                />
              </div>

              {/* Price */}
              <Input
                label="Price (R)"
                type="number"
                value={data.items[i].price}
                onChange={e => setItem(i, "price", e.target.value)}
                placeholder="e.g. 350"
              />

              {/* Photo */}
              <PhotoUpload
                label="Photo"
                value={data.items[i].photo}
                onChange={v => setItem(i, "photo", v)}
              />
            </div>
          </div>
        ))}
      </div>

      <Button variant="green" full disabled={!hasFirst} onClick={next}>
        Continue →
      </Button>
    </div>
  );
}
`;

/* ════════════════════════════════════════════
   FILE 10 — steps/Step06_BizName.tsx
════════════════════════════════════════════ */
export const STEP06 = `
"use client";

import { useOnboarding }    from "../OnboardingContext";
import { Input }            from "@/components/ui/Input";
import { Button }           from "@/components/ui/Button";
import { slugifyDomain }    from "@/lib/utils";

export function Step06BizName({ next }: { next: () => void }) {
  const { data, set } = useOnboarding();
  const domain = data.bizName ? \`\${slugifyDomain(data.bizName)}.co.za\` : "";

  return (
    <div className="animate-fadeUp">
      <h2 className="font-serif text-2xl font-normal mb-1">
        What's your business called?
      </h2>
      <p className="text-brand-muted text-sm mb-5">
        This appears on your website and domain.
      </p>

      <Input
        label="Business name"
        value={data.bizName}
        onChange={e => set("bizName", e.target.value)}
        placeholder="e.g. Sarah's Hair Studio"
        onKeyDown={e => e.key === "Enter" && data.bizName && next()}
      />

      {domain && (
        <div className="mb-5 p-3 bg-brand-green/8 border border-brand-green/20
          rounded-xl flex items-center gap-2">
          <span className="text-brand-green text-sm">🌐</span>
          <div>
            <p className="text-xs text-brand-muted">Your domain will be</p>
            <p className="text-sm font-bold text-brand-green">{domain}</p>
          </div>
        </div>
      )}

      <Button variant="green" full disabled={!data.bizName.trim()} onClick={next}>
        Continue →
      </Button>
    </div>
  );
}
`;

/* ════════════════════════════════════════════
   FILE 11 — steps/Step07_BizDesc.tsx
════════════════════════════════════════════ */
export const STEP07 = `
"use client";

import { useOnboarding }  from "../OnboardingContext";
import { Textarea }       from "@/components/ui/Textarea";
import { Button }         from "@/components/ui/Button";

const MIN_CHARS = 20;
const MAX_CHARS = 500;

export function Step07BizDesc({ next }: { next: () => void }) {
  const { data, set } = useOnboarding();
  const len   = data.bizDesc.length;
  const valid = len >= MIN_CHARS;

  return (
    <div className="animate-fadeUp">
      <h2 className="font-serif text-2xl font-normal mb-1">
        Tell us about your business.
      </h2>
      <p className="text-brand-muted text-sm mb-5">
        AI uses this to write your site content — the more detail, the better.
      </p>

      <Textarea
        label="Business description"
        value={data.bizDesc}
        onChange={e => set("bizDesc", e.target.value.slice(0, MAX_CHARS))}
        placeholder="What do you do, who do you help, what makes you special, where are you based..."
        rows={6}
      />

      <div className="flex justify-between items-center mb-5">
        <p className="text-xs text-brand-muted">
          {len < MIN_CHARS
            ? \`\${MIN_CHARS - len} more characters needed\`
            : "✓ Great description!"}
        </p>
        <p className="text-xs text-brand-muted">{len}/{MAX_CHARS}</p>
      </div>

      <Button variant="green" full disabled={!valid} onClick={next}>
        Continue →
      </Button>
    </div>
  );
}
`;

/* ════════════════════════════════════════════
   FILE 12 — steps/Step08_Location.tsx
════════════════════════════════════════════ */
export const STEP08 = `
"use client";

import { useOnboarding }    from "../OnboardingContext";
import { Input }            from "@/components/ui/Input";
import { Button }           from "@/components/ui/Button";
import { isValidSAPhone }   from "@/lib/utils";

export function Step08Location({ next }: { next: () => void }) {
  const { data, set }    = useOnboarding();
  const valid = data.city.trim() && isValidSAPhone(data.whatsapp);

  return (
    <div className="animate-fadeUp">
      <h2 className="font-serif text-2xl font-normal mb-1">Where are you based?</h2>
      <p className="text-brand-muted text-sm mb-5">Helps customers find and contact you.</p>

      <Input
        label="City / Area"
        value={data.city}
        onChange={e => set("city", e.target.value)}
        placeholder="e.g. Johannesburg, Soweto"
      />

      <Input
        label="WhatsApp number"
        type="tel"
        value={data.whatsapp}
        onChange={e => set("whatsapp", e.target.value)}
        placeholder="e.g. 0821234567"
        hint="This appears as the WhatsApp button on your site"
      />

      <Button variant="green" full disabled={!valid} onClick={next}>
        Continue →
      </Button>
    </div>
  );
}
`;

/* ════════════════════════════════════════════
   FILE 13 — steps/Step09_Socials.tsx
════════════════════════════════════════════ */
export const STEP09 = `
"use client";

import { useOnboarding } from "../OnboardingContext";
import { Input }         from "@/components/ui/Input";
import { Button }        from "@/components/ui/Button";

export function Step09Socials({ next }: { next: () => void }) {
  const { data, set } = useOnboarding();

  return (
    <div className="animate-fadeUp">
      <h2 className="font-serif text-2xl font-normal mb-1">Add your social media.</h2>
      <p className="text-brand-muted text-sm mb-5">
        Optional — skip any you don't have.
      </p>

      <Input label="Facebook page URL"  value={data.facebook}  onChange={e => set("facebook",  e.target.value)} placeholder="facebook.com/yourbusiness" />
      <Input label="Instagram handle"   value={data.instagram} onChange={e => set("instagram", e.target.value)} placeholder="@yourbusiness" />
      <Input label="TikTok handle"      value={data.tiktok}    onChange={e => set("tiktok",    e.target.value)} placeholder="@yourbusiness" />

      <Button variant="green" full onClick={next}>Continue →</Button>

      <button
        onClick={next}
        className="w-full text-center text-sm text-brand-muted mt-2
          bg-transparent border-none cursor-pointer hover:text-brand-ink py-1"
      >
        Skip for now →
      </button>
    </div>
  );
}
`;

/* ════════════════════════════════════════════
   FILE 14 — steps/Step10_Photos.tsx
════════════════════════════════════════════ */
export const STEP10 = `
"use client";

import { useOnboarding } from "../OnboardingContext";
import { PhotoUpload }   from "@/components/ui/PhotoUpload";
import { Toggle }        from "@/components/ui/Toggle";
import { Button }        from "@/components/ui/Button";

export function Step10Photos({ next }: { next: () => void }) {
  const { data, set, setPhoto } = useOnboarding();
  const uploaded = data.photos.filter(Boolean).length;

  return (
    <div className="animate-fadeUp">
      <h2 className="font-serif text-2xl font-normal mb-1">Add photos to your site.</h2>
      <p className="text-brand-muted text-sm mb-4">
        Upload up to 5 photos — your work, team or premises.
        PNG, JPG or WebP · max 5MB each.
      </p>

      {/* Photo grid */}
      <div className="grid grid-cols-3 gap-2.5 mb-4">
        {data.photos.map((photo, i) => (
          <PhotoUpload
            key={i}
            label={\`Photo \${i + 1}\`}
            value={photo}
            onChange={v => setPhoto(i, v)}
          />
        ))}
      </div>

      {/* Industry photo toggle */}
      <Toggle
        label="Use industry-related photos"
        desc="If your uploaded photos don't fill the site, we'll add professionally sourced images from your industry."
        value={data.useIndustryPhotos}
        onChange={v => set("useIndustryPhotos", v)}
        className="mb-5"
      />

      {uploaded > 0 && (
        <p className="text-xs text-brand-green font-semibold mb-4">
          ✓ {uploaded} photo{uploaded !== 1 ? "s" : ""} uploaded
        </p>
      )}

      <Button variant="green" full onClick={next}>Continue →</Button>

      <button
        onClick={next}
        className="w-full text-center text-sm text-brand-muted mt-2
          bg-transparent border-none cursor-pointer hover:text-brand-ink py-1"
      >
        Skip photos →
      </button>
    </div>
  );
}
`;

/* ════════════════════════════════════════════
   FILE 15 — steps/Step11_Colours.tsx
════════════════════════════════════════════ */
export const STEP11 = `
"use client";

import { BRAND_COLOURS } from "@/lib/constants";
import { useOnboarding } from "../OnboardingContext";
import { Toggle }        from "@/components/ui/Toggle";
import { Button }        from "@/components/ui/Button";
import { cn }            from "@/lib/utils";

export function Step11Colours({ next }: { next: () => void }) {
  const { data, set } = useOnboarding();

  const selectedColour = data.customColour
    ? { primary: data.customHex, secondary: data.customHex + "33", accent: data.customHex + "99" }
    : BRAND_COLOURS[data.brandColourIndex];

  return (
    <div className="animate-fadeUp">
      <h2 className="font-serif text-2xl font-normal mb-1">Choose your brand colours.</h2>
      <p className="text-brand-muted text-sm mb-4">
        Select a preset or pick your own custom colour.
      </p>

      {/* Preset swatches */}
      <div className="flex flex-col gap-2.5 mb-4">
        {BRAND_COLOURS.map((colour, i) => {
          const selected = data.brandColourIndex === i && !data.customColour;
          return (
            <button
              key={i}
              onClick={() => { set("brandColourIndex", i); set("customColour", false); }}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-150 text-left w-full",
                selected
                  ? "border-brand-green bg-brand-green/5"
                  : "border-black/8 bg-white hover:border-black/16"
              )}
            >
              {/* Swatches */}
              <div className="flex gap-1.5">
                {[colour.primary, colour.accent, colour.secondary].map((c, j) => (
                  <div key={j}
                    style={{ background: c }}
                    className={cn(
                      "rounded-md border border-black/8",
                      j === 0 ? "w-7 h-7" : j === 1 ? "w-5 h-7" : "w-4 h-7"
                    )}
                  />
                ))}
              </div>
              <span className={cn("font-semibold text-sm", selected && "text-brand-green")}>
                {colour.name}
              </span>
              {selected && (
                <span className="ml-auto text-brand-green text-xs font-bold">✓ Selected</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Custom colour toggle */}
      <Toggle
        label="Use a custom colour"
        desc="Pick your exact brand colour."
        value={data.customColour}
        onChange={v => set("customColour", v)}
        className="mb-3"
      />

      {/* Custom colour picker */}
      {data.customColour && (
        <div className="flex items-center gap-4 p-3.5 bg-brand-bg rounded-xl
          border border-black/8 mb-4">
          <input
            type="color"
            value={data.customHex}
            onChange={e => set("customHex", e.target.value)}
            className="w-12 h-10 rounded-lg border-none cursor-pointer"
          />
          <div>
            <p className="font-semibold text-sm">Custom colour</p>
            <p className="text-xs text-brand-muted font-mono">{data.customHex}</p>
          </div>
          {/* Preview swatches */}
          <div className="flex gap-1.5 ml-auto">
            {[data.customHex, data.customHex + "99", data.customHex + "33"].map((c, j) => (
              <div key={j} style={{ background: c }}
                className={cn("rounded-md border border-black/8",
                  j === 0 ? "w-7 h-7" : j === 1 ? "w-5 h-7" : "w-4 h-7"
                )}
              />
            ))}
          </div>
        </div>
      )}

      <Button variant="green" full onClick={next}>Continue →</Button>
    </div>
  );
}
`;

/* ════════════════════════════════════════════
   FILE 16 — steps/Step12_Logo.tsx
════════════════════════════════════════════ */
export const STEP12 = `
"use client";

import { useOnboarding }    from "../OnboardingContext";
import { PhotoUpload }      from "@/components/ui/PhotoUpload";
import { Button }           from "@/components/ui/Button";
import { LOGO_UPSELL_PRICE } from "@/lib/constants";

export function Step12Logo({ next }: { next: () => void }) {
  const { data, set } = useOnboarding();

  return (
    <div className="animate-fadeUp">
      <h2 className="font-serif text-2xl font-normal mb-1">Upload your logo.</h2>
      <p className="text-brand-muted text-sm mb-4">
        PNG with transparent background works best · max 5MB · min 300×300px.
      </p>

      <PhotoUpload
        label="Your logo"
        value={data.logo}
        onChange={v => set("logo", v)}
        className="mb-4"
      />

      {/* AI logo upsell — only show if no logo uploaded */}
      {!data.logo && (
        <div
          onClick={() => set("logoUpsell", !data.logoUpsell)}
          className={\`mb-4 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-150
            \${data.logoUpsell
              ? "border-brand-green bg-brand-green/8"
              : "border-black/8 bg-brand-bg hover:border-black/16"
            }\`}
        >
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span>✨</span>
              <span className="font-bold text-sm">Create an AI logo for me</span>
            </div>
            <div className={\`w-5 h-5 rounded-full flex items-center justify-center
              text-xs font-bold transition-colors
              \${data.logoUpsell ? "bg-brand-green text-white" : "bg-slate-200"}\`}>
              {data.logoUpsell && "✓"}
            </div>
          </div>
          <p className="text-xs text-brand-muted ml-6">
            We'll design a custom AI logo · Once-off{" "}
            <strong className="text-brand-green">R{LOGO_UPSELL_PRICE}</strong>
          </p>
        </div>
      )}

      {!data.logo && !data.logoUpsell && (
        <p className="text-xs text-center text-brand-muted mb-4">
          No logo? No problem — your site will use your business name styled as text.
        </p>
      )}

      <Button variant="green" full onClick={next}>
        {data.logo
          ? "Continue →"
          : data.logoUpsell
            ? \`Continue — add AI logo (R\${LOGO_UPSELL_PRICE}) →\`
            : "Continue without logo →"}
      </Button>
    </div>
  );
}
`;

/* ════════════════════════════════════════════
   FILE 17 — steps/Step13_Generate.tsx
   Order summary + AI generation trigger
════════════════════════════════════════════ */
export const STEP13 = `
"use client";

import { useOnboarding }        from "../OnboardingContext";
import { GenerationProgress }   from "@/components/ui/ProgressBar";
import { Button }               from "@/components/ui/Button";
import { PLANS, LOGO_UPSELL_PRICE, EMAIL_UPSELL_PRICE } from "@/lib/constants";
import { slugifyDomain }        from "@/lib/utils";
import type { OnboardingData }  from "@/types";

interface Step13Props {
  next:           () => void;
  generating:     boolean;
  setGenerating:  (v: boolean) => void;
  onComplete:     (data: OnboardingData) => void;
}

export function Step13Generate({ generating, setGenerating, onComplete }: Step13Props) {
  const { data } = useOnboarding();
  const plan     = PLANS[data.plan];
  const domain   = slugifyDomain(data.bizName) + ".co.za";
  const monthly  = plan.price + (data.emailUpsell ? EMAIL_UPSELL_PRICE : 0);
  const once     = data.logoUpsell && !data.logo ? LOGO_UPSELL_PRICE : 0;

  const handleGenerate = async () => {
    setGenerating(true);
    // In production: save to Supabase, trigger AI generation, schedule reminder emails
    // await fetch("/api/generate", { method: "POST", body: JSON.stringify(data) });
  };

  if (generating) {
    return (
      <GenerationProgress
        onComplete={() => onComplete(data)}
      />
    );
  }

  const summaryRows = [
    { label: "Plan",    value: \`\${data.plan} — R\${plan.price}/mo\` },
    { label: "Domain",  value: domain },
    { label: "Pages",   value: plan.pages === 1 ? "1 page" : \`Up to \${plan.pages} pages\` },
    ...(data.emailUpsell ? [{ label: "Email",  value: \`hello@\${domain} +R\${EMAIL_UPSELL_PRICE}/mo\` }] : []),
    ...(once ? [{ label: "AI Logo", value: \`R\${once} once-off\` }] : []),
  ];

  return (
    <div className="animate-fadeUp text-center">
      <div className="text-5xl mb-4">🚀</div>
      <h2 className="font-serif text-2xl font-normal mb-2">
        Ready to build your site!
      </h2>
      <p className="text-brand-muted text-sm mb-6 leading-relaxed max-w-xs mx-auto">
        We'll generate your complete website in about 60 seconds.
        You'll get a free 60-minute preview before paying anything.
      </p>

      {/* Order summary */}
      <div className="bg-brand-bg rounded-2xl p-4 mb-6 text-left">
        <p className="text-xs font-bold text-brand-muted uppercase tracking-wider mb-3">
          Order Summary
        </p>
        {summaryRows.map(row => (
          <div key={row.label}
            className="flex justify-between py-2 border-b border-black/6 text-sm last:border-0">
            <span className="text-brand-muted">{row.label}</span>
            <span className="font-semibold">{row.value}</span>
          </div>
        ))}
        <div className="flex justify-between pt-3 text-base font-bold">
          <span>Total / month</span>
          <span className="text-brand-green">
            R{monthly}/mo{once ? \` + R\${once}\` : ""}
          </span>
        </div>
      </div>

      <Button variant="green" full size="lg" onClick={handleGenerate}>
        ⚡ Build my free preview now →
      </Button>
      <p className="text-xs text-brand-muted mt-3">
        No payment until you approve your site
      </p>
    </div>
  );
}
`;

/* ════════════════════════════════════════════
   FILE 18 — src/components/onboarding/SitePreview.tsx
   60-minute watermarked preview
════════════════════════════════════════════ */
export const SITE_PREVIEW = `
"use client";

import { useState, useEffect } from "react";
import Image                   from "next/image";
import { Button }              from "@/components/ui/Button";
import { PLANS, BRAND_COLOURS } from "@/lib/constants";
import { formatWhatsApp }      from "@/lib/utils";
import type { OnboardingData } from "@/types";

interface SitePreviewProps {
  data:      OnboardingData;
  onClose:   () => void;
  onRebuild: () => void;
}

const PREVIEW_MINUTES = 60;

export function SitePreview({ data, onClose, onRebuild }: SitePreviewProps) {
  const [mins, setMins] = useState(PREVIEW_MINUTES);
  const [secs, setSecs] = useState(0);

  const plan   = PLANS[data.plan];
  const colour = data.customColour
    ? data.customHex
    : BRAND_COLOURS[data.brandColourIndex].primary;

  const totalSeconds = PREVIEW_MINUTES * 60;
  const remaining    = mins * 60 + secs;
  const pct          = (remaining / totalSeconds) * 100;
  const urgent       = remaining < 5 * 60; // last 5 min

  useEffect(() => {
    const t = setInterval(() => {
      setSecs(s => {
        if (s === 0) {
          setMins(m => {
            if (m === 0) { clearInterval(t); return 0; }
            return m - 1;
          });
          return 59;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const goLive = () => {
    // Redirect to PayFast checkout
    window.location.href = \`/checkout?plan=\${data.plan}&email=\${encodeURIComponent(data.email)}\`;
  };

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-brand-bg">

      {/* Preview toolbar */}
      <div className="bg-brand-ink px-4 py-3 flex items-center justify-between
        flex-wrap gap-3 flex-shrink-0">
        <div className="font-serif text-lg text-white">Quicka</div>

        {/* Timer */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1.5">
            <span className={\`text-sm font-bold font-mono \${urgent ? "text-brand-ember" : "text-brand-amber"}\`}>
              {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
            </span>
            <span className="text-white/45 text-xs">preview left</span>
          </div>
          {/* Timer bar */}
          <div className="hidden sm:block w-24 h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div
              className={\`h-full rounded-full transition-all duration-1000
                \${urgent ? "bg-brand-ember" : "bg-brand-amber"}\`}
              style={{ width: \`\${pct}%\` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="green" size="sm" onClick={goLive}>
            🚀 Go Live Now →
          </Button>
          <button onClick={onClose}
            className="text-white/40 hover:text-white text-lg bg-transparent
              border-none cursor-pointer leading-none">
            ✕
          </button>
        </div>
      </div>

      {/* Watermark */}
      <div className="fixed inset-0 pointer-events-none select-none z-[201]
        flex items-center justify-center overflow-hidden">
        <p className="text-brand-ink/[0.04] font-black text-[8vw] whitespace-nowrap
          rotate-[-35deg] tracking-widest uppercase">
          QUICKA PREVIEW
        </p>
      </div>

      {/* Generated site */}
      <div className="flex-1 overflow-y-auto">

        {/* Site nav */}
        <nav style={{ background: colour }} className="px-6 py-4 flex items-center justify-between">
          <div className="font-serif text-xl text-white">
            {data.logo
              ? <Image src={data.logo} alt="logo" width={120} height={36} className="h-9 w-auto object-contain" />
              : data.bizName
            }
          </div>
          <div className="hidden sm:flex gap-5">
            {["Home", data.bizType === "Service" ? "Services" : "Products",
              ...(plan.blog > 0 ? ["Blog"] : []),
              "Contact"
            ].map(item => (
              <span key={item} className="text-white/80 text-sm font-medium">{item}</span>
            ))}
          </div>
        </nav>

        {/* Hero */}
        <div style={{ background: colour + "14" }} className="px-6 py-16 text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-normal text-brand-ink
            tracking-tight mb-4">
            Welcome to {data.bizName}
          </h1>
          <p className="text-brand-muted text-base max-w-xl mx-auto mb-8 leading-relaxed">
            {data.bizDesc}
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <button style={{ background: colour }}
              className="text-white border-none px-6 py-3 rounded-full font-semibold cursor-pointer">
              Contact Us
            </button>
            {data.whatsapp && (
              <a href={\`https://wa.me/\${formatWhatsApp(data.whatsapp)}\`}
                className="bg-[#25D366] text-white no-underline px-6 py-3 rounded-full font-semibold">
                💬 WhatsApp
              </a>
            )}
          </div>
        </div>

        {/* Services / Products */}
        {data.items.filter(i => i.name).length > 0 && (
          <div className="px-6 py-12 bg-white">
            <h2 className="font-serif text-3xl font-normal text-center mb-8">
              Our {data.bizType === "Service" ? "Services" : "Products"}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
              {data.items.filter(i => i.name).map((item, i) => (
                <div key={i} className="bg-brand-bg rounded-2xl overflow-hidden border border-black/8">
                  <div className="h-36 flex items-center justify-center overflow-hidden"
                    style={{ background: item.photo ? undefined : colour + "18" }}>
                    {item.photo
                      ? <Image src={item.photo} alt={item.name} width={200} height={144} className="w-full h-full object-cover" />
                      : <span className="text-4xl">{data.bizType === "Service" ? "🛠️" : "🛍️"}</span>
                    }
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-sm mb-1">{item.name}</h3>
                    {item.description && <p className="text-xs text-brand-muted mb-2 line-clamp-2">{item.description}</p>}
                    {item.price && (
                      <p className="font-bold text-sm" style={{ color: colour }}>R{item.price}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Photo gallery */}
        {data.photos.filter(Boolean).length > 0 && (
          <div className="px-6 py-12 bg-brand-warm">
            <h2 className="font-serif text-3xl font-normal text-center mb-8">Gallery</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {data.photos.filter(Boolean).map((photo, i) => (
                <Image key={i} src={photo!} alt={\`gallery-\${i}\`}
                  width={400} height={280}
                  className="w-full h-48 object-cover rounded-2xl" />
              ))}
            </div>
          </div>
        )}

        {/* Contact footer */}
        <div style={{ background: colour }} className="px-6 py-12 text-center">
          <h2 className="font-serif text-3xl font-normal text-white mb-2">Get in touch</h2>
          <p className="text-white/60 mb-6">{data.city}</p>
          <div className="flex gap-3 justify-center flex-wrap">
            {data.whatsapp && (
              <a href={\`https://wa.me/\${formatWhatsApp(data.whatsapp)}\`}
                className="bg-[#25D366] text-white no-underline px-6 py-3 rounded-full font-semibold">
                💬 WhatsApp Us
              </a>
            )}
            <button className="bg-white/20 text-white border border-white/30 px-6 py-3
              rounded-full font-semibold cursor-pointer">
              Send a message
            </button>
          </div>
          <p className="text-white/25 text-xs mt-8">Powered by Quicka · quicka.website</p>
        </div>
      </div>

      {/* Expired overlay */}
      {mins === 0 && secs === 0 && (
        <div className="absolute inset-0 z-[300] bg-brand-ink/80 backdrop-blur-sm
          flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
            <div className="text-4xl mb-4">⏰</div>
            <h3 className="font-serif text-2xl font-normal mb-2">Preview expired</h3>
            <p className="text-brand-muted text-sm mb-6 leading-relaxed">
              Your preview has ended. Your site details are saved —
              you can go live now or rebuild for free.
            </p>
            <div className="flex flex-col gap-3">
              <Button variant="green" full onClick={goLive}>🚀 Go Live Now →</Button>
              <Button variant="ghost" full onClick={onRebuild}>Rebuild for free →</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
`;

// Demo viewer
export default function OnboardingDemo() {
  const files = [
    { id: "build_page",  label: "📄 app/build/page.tsx",              content: BUILD_PAGE },
    { id: "context",     label: "🧠 OnboardingContext.tsx",            content: ONBOARDING_CONTEXT },
    { id: "wrapper",     label: "🔌 OnboardingWrapper.tsx",            content: ONBOARDING_WRAPPER },
    { id: "modal",       label: "🪟 OnboardingModal.tsx",              content: ONBOARDING_MODAL },
    { id: "step01",      label: "1️⃣ Step01_Email.tsx",                 content: STEP01 },
    { id: "step02",      label: "2️⃣ Step02_OTP.tsx",                   content: STEP02 },
    { id: "step03",      label: "3️⃣ Step03_Plan.tsx",                  content: STEP03 },
    { id: "step04",      label: "4️⃣ Step04_BizType.tsx",               content: STEP04 },
    { id: "step05",      label: "5️⃣ Step05_Items.tsx",                 content: STEP05 },
    { id: "step06",      label: "6️⃣ Step06_BizName.tsx",               content: STEP06 },
    { id: "step07",      label: "7️⃣ Step07_BizDesc.tsx",               content: STEP07 },
    { id: "step08",      label: "8️⃣ Step08_Location.tsx",              content: STEP08 },
    { id: "step09",      label: "9️⃣ Step09_Socials.tsx",               content: STEP09 },
    { id: "step10",      label: "🔟 Step10_Photos.tsx",                content: STEP10 },
    { id: "step11",      label: "1️⃣1️⃣ Step11_Colours.tsx",            content: STEP11 },
    { id: "step12",      label: "1️⃣2️⃣ Step12_Logo.tsx",               content: STEP12 },
    { id: "step13",      label: "1️⃣3️⃣ Step13_Generate.tsx",           content: STEP13 },
    { id: "preview",     label: "👀 SitePreview.tsx",                  content: SITE_PREVIEW },
  ];

  const { useState } = require("react");
  const [active, setActive] = useState("build_page");
  const current = files.find(f => f.id === active);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", fontFamily: "Arial, sans-serif", background: "#F5F2ED" }}>
      <div style={{ background: "#0A0A0A", padding: "0.85rem 1.5rem", display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
        <div style={{ fontStyle: "italic", fontSize: "1.2rem", color: "#fff" }}>Quick<span style={{ color: "#00C853" }}>a</span></div>
        <div style={{ width: 1, height: 18, background: "rgba(255,255,255,0.15)" }} />
        <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.35)", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase" }}>
          Onboarding Flow — {files.length} files — 13 steps
        </span>
        <div style={{ marginLeft: "auto", background: "rgba(0,200,83,0.15)", color: "#00C853", fontSize: "0.72rem", fontWeight: 700, padding: "0.25rem 0.65rem", borderRadius: "100px" }}>
          TypeScript + Tailwind
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <div style={{ width: 240, background: "#fff", borderRight: "1px solid rgba(0,0,0,0.08)", overflowY: "auto", flexShrink: 0 }}>
          <div style={{ padding: "0.85rem 1rem", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "#7A756E", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
            {files.length} Files
          </div>
          {files.map(f => (
            <button key={f.id} onClick={() => setActive(f.id)}
              style={{ width: "100%", padding: "0.6rem 1rem", background: active === f.id ? "rgba(0,200,83,0.08)" : "transparent", border: "none", borderLeft: `3px solid ${active === f.id ? "#00C853" : "transparent"}`, cursor: "pointer", textAlign: "left", fontSize: "0.8rem", fontWeight: active === f.id ? 700 : 400, color: active === f.id ? "#00C853" : "#0A0A0A", fontFamily: "Arial", transition: "all 0.12s" }}>
              {f.label}
            </button>
          ))}
        </div>

        <div style={{ flex: 1, overflow: "auto", background: "#1E1E1E", padding: "1.5rem" }}>
          <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: "8px 8px 0 0", padding: "0.5rem 1rem", fontSize: "0.7rem", color: "rgba(255,255,255,0.35)", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase" }}>
            {current?.label} · typescript
          </div>
          <pre style={{ background: "#1E1E1E", borderRadius: "0 0 8px 8px", padding: "1.25rem", fontSize: "0.76rem", color: "rgba(255,255,255,0.8)", lineHeight: 1.75, fontFamily: "Courier New, monospace", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
            {current?.content}
          </pre>
        </div>
      </div>
    </div>
  );
}
