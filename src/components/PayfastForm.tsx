"use client";

/**
 * PayfastForm — client-side auto-submitting form.
 *
 * Fetches a signed checkout payload from /api/checkout, then immediately
 * POSTs it to PayFast (sandbox or production).
 *
 * Usage:
 *   <PayfastForm
 *     plan="Growth"
 *     email={user.email}
 *     bizName={site.biz_name}
 *     siteId={site.id}
 *     onError={(msg) => setError(msg)}
 *   />
 *
 * The form will auto-submit on mount. To trigger from a button instead, wrap
 * this in a parent that conditionally renders it after click.
 */

import { useEffect, useRef, useState } from "react";

interface Props {
  plan: "Basic" | "Growth" | "Business";
  email: string;
  bizName: string;
  siteId: string;
  emailUpsell?: boolean;
  logoUpsell?: boolean;
  onError?: (message: string) => void;
}

export function PayfastForm({
  plan,
  email,
  bizName,
  siteId,
  emailUpsell,
  logoUpsell,
  onError,
}: Props) {
  const [payload, setPayload] = useState<{
    url: string;
    fields: Record<string, string>;
  } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            plan,
            email,
            bizName,
            siteId,
            emailUpsell,
            logoUpsell,
          }),
        });
        if (!res.ok) {
          const errorBody = await res.json().catch(() => ({}));
          throw new Error(errorBody.error ?? `Checkout failed: ${res.status}`);
        }
        const data = (await res.json()) as {
          url: string;
          fields: Record<string, string>;
        };
        if (!cancelled) setPayload(data);
      } catch (e) {
        if (!cancelled) onError?.((e as Error).message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [plan, email, bizName, siteId, emailUpsell, logoUpsell, onError]);

  // Auto-submit as soon as fields land.
  useEffect(() => {
    if (payload && formRef.current) {
      formRef.current.submit();
    }
  }, [payload]);

  if (!payload) {
    return (
      <div className="flex items-center justify-center p-12 text-[#7A756E]">
        <span className="animate-pulse">Redirecting to PayFast…</span>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      action={payload.url}
      method="POST"
      style={{ display: "none" }}
    >
      {Object.entries(payload.fields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <noscript>
        <button type="submit">Continue to PayFast</button>
      </noscript>
    </form>
  );
}
