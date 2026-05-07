"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PayfastForm } from "@/components/PayfastForm";
import { COMPANY } from "@/lib/company";

export default function BuildPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [bizName, setBizName] = useState("");
  const [plan, setPlan] = useState<"Basic" | "Growth" | "Business">("Growth");
  const [bizType, setBizType] = useState<"Service" | "Product">("Service");

  // PayFast checkout state
  const [siteId, setSiteId] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalSteps = 5;

  const handleNext = () => {
    if (step === 1 && !email.includes("@")) return;
    if (step === 3 && !bizName.trim()) return;
    if (step < totalSteps) setStep((s) => s + 1);
  };

  const startCheckout = () => {
    setError(null);
    // Generate a stable client-side ID. Once Supabase is wired, replace this
    // with the row id returned from inserting a `sites` row.
    const newSiteId = (typeof crypto !== "undefined" && "randomUUID" in crypto)
      ? crypto.randomUUID()
      : `site_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    setSiteId(newSiteId);
    setPaying(true);
  };

  // Allow Enter to advance steps (but not while paying / generating)
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !paying) handleNext();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, email, bizName, paying]);

  const planData = COMPANY.plans[plan];

  return (
    <main className="min-h-screen bg-brand-bg flex flex-col">
      {/* Demo-mode banner — visible while PayFast review is in progress and AI
          generation isn't fully wired yet. Remove this banner the moment the
          merchant upgrade is approved AND /api/generate is shipping real sites. */}
      <div className="bg-brand-ink/90 text-white text-xs px-4 py-2 text-center border-b border-brand-green/40">
        <span className="font-semibold tracking-wide text-brand-green">DEMO MODE</span>
        <span className="opacity-70 ml-2">
          This flow demonstrates the PayFast integration end-to-end. AI site generation goes live once our merchant upgrade is approved.
        </span>
      </div>

      {/* Header with progress indicator */}
      <header className="bg-brand-ink px-6 py-4 flex items-center justify-between flex-shrink-0">
        <Link href="/" className="font-serif italic text-xl text-white no-underline">
          Quick<span className="text-brand-green">a</span>
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i <= step ? "bg-brand-green" : "bg-white/20"
                }`}
              />
            ))}
          </div>
          <span className="text-white/50 text-xs">Step {step} of {totalSteps}</span>
        </div>
      </header>

      {/* Progress bar */}
      <div className="h-1 bg-brand-bg-alt">
        <div
          className="h-full bg-brand-green transition-all"
          style={{ width: `${(step / totalSteps) * 100}%` }}
        />
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-xl">
          {/* Step 1 — Email */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h1 className="font-serif text-3xl text-brand-ink mb-2">
                  Let&apos;s build your website.
                </h1>
                <p className="text-brand-muted">Start with your email address.</p>
              </div>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hello@yourbusiness.co.za"
                autoFocus
                className="w-full px-5 py-4 rounded-2xl border-2 border-black/8 bg-white text-brand-ink text-lg outline-none focus:border-brand-green transition-colors"
              />

              <button
                onClick={handleNext}
                disabled={!email.includes("@")}
                className="w-full bg-brand-green text-white py-4 rounded-2xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-green-dark transition-colors"
              >
                Continue →
              </button>
            </div>
          )}

          {/* Step 2 — Business type */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h1 className="font-serif text-3xl text-brand-ink mb-2">
                  What do you offer?
                </h1>
                <p className="text-brand-muted">This helps us shape your website.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setBizType("Service")}
                  className={`p-6 rounded-2xl border-2 text-left transition-all ${
                    bizType === "Service"
                      ? "border-brand-green bg-brand-green/5"
                      : "border-black/8 bg-white hover:border-black/16"
                  }`}
                >
                  <div className="text-4xl mb-3">🛠️</div>
                  <div className="font-bold text-brand-ink">Service Business</div>
                  <p className="text-sm text-brand-muted mt-1">
                    Hair salon, plumber, tutor, cleaner...
                  </p>
                </button>
                <button
                  onClick={() => setBizType("Product")}
                  className={`p-6 rounded-2xl border-2 text-left transition-all ${
                    bizType === "Product"
                      ? "border-brand-green bg-brand-green/5"
                      : "border-black/8 bg-white hover:border-black/16"
                  }`}
                >
                  <div className="text-4xl mb-3">🛍️</div>
                  <div className="font-bold text-brand-ink">Product Business</div>
                  <p className="text-sm text-brand-muted mt-1">
                    Online store, clothing, food...
                  </p>
                </button>
              </div>

              <button
                onClick={handleNext}
                className="w-full bg-brand-green text-white py-4 rounded-2xl font-semibold text-lg hover:bg-brand-green-dark transition-colors"
              >
                Continue →
              </button>
            </div>
          )}

          {/* Step 3 — Business name */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h1 className="font-serif text-3xl text-brand-ink mb-2">
                  What&apos;s your business called?
                </h1>
                <p className="text-brand-muted">This appears on your website and domain.</p>
              </div>

              <input
                type="text"
                value={bizName}
                onChange={(e) => setBizName(e.target.value)}
                placeholder="e.g. Sarah's Hair Studio"
                autoFocus
                className="w-full px-5 py-4 rounded-2xl border-2 border-black/8 bg-white text-brand-ink text-lg outline-none focus:border-brand-green transition-colors"
              />

              {bizName && (
                <div className="p-4 bg-brand-green/10 border border-brand-green/20 rounded-xl">
                  <p className="text-xs text-brand-muted mb-1">Your domain will be</p>
                  <p className="text-brand-green-dark font-bold font-mono">
                    {bizName.toLowerCase().replace(/\s+/g, "")}.co.za
                  </p>
                </div>
              )}

              <button
                onClick={handleNext}
                disabled={!bizName.trim()}
                className="w-full bg-brand-green text-white py-4 rounded-2xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-green-dark transition-colors"
              >
                Continue →
              </button>
            </div>
          )}

          {/* Step 4 — Plan */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h1 className="font-serif text-3xl text-brand-ink mb-2">
                  Choose your plan.
                </h1>
                <p className="text-brand-muted">You can upgrade anytime.</p>
              </div>

              <div className="space-y-3">
                {(Object.keys(COMPANY.plans) as Array<"Basic" | "Growth" | "Business">).map(
                  (name) => {
                    const p = COMPANY.plans[name];
                    return (
                      <button
                        key={name}
                        onClick={() => setPlan(name)}
                        className={`w-full p-5 rounded-2xl border-2 text-left flex items-center justify-between transition-all ${
                          plan === name
                            ? "border-brand-green bg-brand-green/5"
                            : "border-black/8 bg-white hover:border-black/16"
                        }`}
                      >
                        <div>
                          <span
                            className={`font-bold ${
                              plan === name ? "text-brand-green-dark" : "text-brand-ink"
                            }`}
                          >
                            {name}
                          </span>
                          <span className="text-brand-muted text-sm ml-3">
                            {p.items} items · {name === "Basic" ? "1 page" : "5 pages"}
                          </span>
                        </div>
                        <div className="font-serif text-2xl text-brand-ink">
                          R{p.priceZar}
                          <span className="text-sm text-brand-muted">/mo</span>
                        </div>
                      </button>
                    );
                  }
                )}
              </div>

              <button
                onClick={handleNext}
                className="w-full bg-brand-green text-white py-4 rounded-2xl font-semibold text-lg hover:bg-brand-green-dark transition-colors"
              >
                Continue →
              </button>
            </div>
          )}

          {/* Step 5 — Confirm and pay */}
          {step === 5 && (
            <div className="space-y-6 text-center">
              {paying && siteId ? (
                /* Auto-submitting form to PayFast */
                <PayfastForm
                  plan={plan}
                  email={email}
                  bizName={bizName}
                  siteId={siteId}
                  onError={(msg) => {
                    setPaying(false);
                    setError(msg);
                  }}
                />
              ) : (
                <>
                  <div className="text-6xl mb-4">🚀</div>
                  <h1 className="font-serif text-3xl text-brand-ink mb-2">
                    Ready to go.
                  </h1>
                  <p className="text-brand-muted mb-8">
                    You&apos;ll be redirected to PayFast to complete your subscription.
                    Cancel anytime; first 7 days are money-back guaranteed.
                  </p>

                  <div className="bg-white rounded-2xl p-6 text-left border border-black/8 mb-6">
                    <div className="flex justify-between py-3 border-b border-black/8">
                      <span className="text-brand-muted">Email</span>
                      <span className="font-semibold text-brand-ink">{email}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-black/8">
                      <span className="text-brand-muted">Business</span>
                      <span className="font-semibold text-brand-ink">{bizName}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-black/8">
                      <span className="text-brand-muted">Type</span>
                      <span className="font-semibold text-brand-ink">{bizType}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-black/8">
                      <span className="text-brand-muted">Plan</span>
                      <span className="font-bold text-brand-green-dark">
                        {plan} · R{planData.priceZar}/mo
                      </span>
                    </div>
                    <div className="flex justify-between py-3">
                      <span className="text-brand-muted">First charge</span>
                      <span className="font-bold text-brand-ink">
                        R{planData.priceZar.toFixed(2)} (incl VAT)
                      </span>
                    </div>
                  </div>

                  {error ? (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm mb-4">
                      {error}
                    </div>
                  ) : null}

                  <button
                    onClick={startCheckout}
                    className="w-full bg-brand-green text-white py-4 rounded-2xl font-semibold text-lg hover:bg-brand-green-dark transition-colors"
                  >
                    Continue to PayFast →
                  </button>
                  <p className="text-xs text-brand-muted mt-3">
                    By continuing you agree to our{" "}
                    <Link href={COMPANY.links.terms} className="underline hover:text-brand-ink">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href={COMPANY.links.privacy} className="underline hover:text-brand-ink">
                      Privacy Policy
                    </Link>
                    .
                  </p>
                </>
              )}
            </div>
          )}

          {/* Back button */}
          {step > 1 && step < 5 && !paying && (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="w-full text-center text-brand-muted py-3 mt-4 hover:text-brand-ink transition-colors"
            >
              ← Back
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
