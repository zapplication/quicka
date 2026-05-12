"use client";

import { useState, FormEvent } from "react";

/**
 * Inline waitlist email capture for tiers marked Coming Soon.
 * POSTs to /api/waitlist which logs to Vercel logs for now.
 * When PR #6 (Resend wiring) lands, the same route also emails Andre
 * — no changes needed here.
 */
type Status = "idle" | "submitting" | "success" | "error";

export function WaitlistForm({ tier }: { tier: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) {
      setStatus("error");
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    setStatus("submitting");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, tier }),
      });
      if (!res.ok) {
        throw new Error("Submission failed");
      }
      setStatus("success");
    } catch {
      setStatus("error");
      setErrorMsg("Something went wrong. Please try again or WhatsApp us.");
    }
  }

  if (status === "success") {
    return (
      <div className="block w-full py-4 px-3 rounded-2xl bg-[#00C853]/10 border border-[#00C853]/30 text-center">
        <p className="text-sm font-semibold text-[#0A0A0A]">
          ✓ You&apos;re on the list
        </p>
        <p className="text-xs text-[#7A756E] mt-1">
          We&apos;ll email you the moment {tier} opens.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <label className="block text-xs font-medium text-[#7A756E]">
        Get notified when {tier} opens
      </label>
      <input
        type="email"
        required
        placeholder="you@business.co.za"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (status === "error") setStatus("idle");
        }}
        disabled={status === "submitting"}
        className="block w-full px-4 py-3 rounded-full border border-black/15 text-sm text-[#0A0A0A] placeholder:text-[#7A756E]/60 focus:outline-none focus:border-[#00C853] disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={status === "submitting"}
        className="block w-full py-3 rounded-full font-semibold text-sm bg-[#0A0A0A] text-white hover:bg-[#1f1f1f] transition-colors disabled:opacity-60"
      >
        {status === "submitting" ? "Submitting…" : "Notify me"}
      </button>
      {status === "error" && (
        <p className="text-xs text-red-600 text-center">{errorMsg}</p>
      )}
    </form>
  );
}
