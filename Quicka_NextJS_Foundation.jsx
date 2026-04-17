/**
 * Quicka — Customer Dashboard (Next.js)
 * ========================================
 * File: Quicka_NextJS_Dashboard.jsx
 *
 * Files in this module:
 *
 *  src/app/dashboard/layout.tsx              ← Auth guard + dashboard shell
 *  src/app/dashboard/page.tsx                ← Dashboard root (redirects to overview)
 *  src/app/dashboard/overview/page.tsx       ← Overview tab
 *  src/app/dashboard/my-site/page.tsx        ← My Site tab
 *  src/app/dashboard/leads/page.tsx          ← Leads tab (real-time)
 *  src/app/dashboard/changes/page.tsx        ← Request Changes tab
 *  src/app/dashboard/billing/page.tsx        ← Billing tab
 *  src/app/dashboard/settings/page.tsx       ← Settings tab
 *  src/components/dashboard/DashboardShell.tsx ← Sidebar nav + mobile nav
 *  src/components/dashboard/StatCard.tsx     ← Metric card
 *  src/components/dashboard/SuspendedBanner.tsx ← Payment failed warning
 *  src/lib/hooks/useSite.ts                  ← Site data hook
 *  src/lib/hooks/useLeads.ts                 ← Real-time leads hook
 *  src/lib/hooks/useChanges.ts               ← Changes hook
 */

/* ════════════════════════════════════════════
   FILE 1 — src/app/dashboard/layout.tsx
   Auth guard — redirects unauthenticated users
════════════════════════════════════════════ */
export const DASHBOARD_LAYOUT = `
import { redirect }        from "next/navigation";
import { createClient }    from "@/lib/supabase/server";
import { DashboardShell }  from "@/components/dashboard/DashboardShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Not logged in — redirect to home
  if (!user) redirect("/");

  // Fetch site data server-side (no loading flicker)
  const { data: site } = await supabase
    .from("sites")
    .select("*")
    .eq("owner_id", user.id)
    .single();

  // No site yet — redirect to build flow
  if (!site) redirect("/build");

  return (
    <DashboardShell site={site} user={user}>
      {children}
    </DashboardShell>
  );
}
`;

/* ════════════════════════════════════════════
   FILE 2 — src/app/dashboard/page.tsx
   Redirects /dashboard → /dashboard/overview
════════════════════════════════════════════ */
export const DASHBOARD_PAGE = `
import { redirect } from "next/navigation";

export default function DashboardPage() {
  redirect("/dashboard/overview");
}
`;

/* ════════════════════════════════════════════
   FILE 3 — src/components/dashboard/DashboardShell.tsx
   Sidebar navigation + mobile bottom nav
════════════════════════════════════════════ */
export const DASHBOARD_SHELL = `
"use client";

import Link              from "next/link";
import { usePathname }   from "next/navigation";
import { createClient }  from "@/lib/supabase/client";
import { useRouter }     from "next/navigation";
import { cn }            from "@/lib/utils";
import type { Site }     from "@/types";
import type { User }     from "@supabase/supabase-js";
import { SuspendedBanner } from "./SuspendedBanner";

const NAV_ITEMS = [
  { href: "/dashboard/overview",  icon: "📊", label: "Overview"        },
  { href: "/dashboard/my-site",   icon: "🌐", label: "My Site"         },
  { href: "/dashboard/leads",     icon: "🔔", label: "Leads"           },
  { href: "/dashboard/changes",   icon: "✏️", label: "Request Change"  },
  { href: "/dashboard/billing",   icon: "💳", label: "Billing"         },
  { href: "/dashboard/settings",  icon: "⚙️", label: "Settings"        },
];

interface ShellProps {
  children: React.ReactNode;
  site:     Site;
  user:     User;
}

export function DashboardShell({ children, site, user }: ShellProps) {
  const pathname = usePathname();
  const router   = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const suspended = site.status === "payment_failed" || site.status === "suspended";

  return (
    <div className="min-h-screen bg-brand-bg flex">

      {/* ── Sidebar (desktop) ── */}
      <aside className="hidden md:flex flex-col w-60 bg-brand-ink flex-shrink-0
        fixed top-0 bottom-0 left-0 z-30">

        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/8">
          <Link href="/" className="font-serif text-xl text-white no-underline">
            Quicka
          </Link>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {NAV_ITEMS.map(item => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link key={item.href} href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm",
                  "font-medium transition-all duration-150 no-underline",
                  active
                    ? "bg-brand-green text-white"
                    : "text-white/50 hover:text-white hover:bg-white/8"
                )}>
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User info + sign out */}
        <div className="px-4 py-4 border-t border-white/8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-brand-green/20 rounded-full flex items-center
              justify-center text-brand-green text-xs font-bold flex-shrink-0">
              {user.email?.[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-semibold truncate">{site.biz_name}</p>
              <p className="text-white/35 text-xs truncate">{user.email}</p>
            </div>
          </div>
          <button onClick={handleSignOut}
            className="w-full text-left text-xs text-white/35 hover:text-white/60
              bg-transparent border-none cursor-pointer transition-colors py-1">
            Sign out →
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 md:ml-60 flex flex-col min-h-screen">

        {/* Suspended banner */}
        {suspended && <SuspendedBanner site={site} />}

        {/* Mobile header */}
        <header className="md:hidden bg-white border-b border-black/8 px-4 py-3
          flex items-center justify-between sticky top-0 z-20">
          <Link href="/" className="font-serif text-lg text-brand-ink no-underline">
            Quicka
          </Link>
          <p className="text-xs text-brand-muted font-medium">{site.biz_name}</p>
        </header>

        {/* Page content */}
        <main className="flex-1 px-4 md:px-8 py-6 pb-24 md:pb-8">
          {children}
        </main>

        {/* Mobile bottom nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t
          border-black/8 flex z-20">
          {NAV_ITEMS.map(item => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}
                className={cn(
                  "flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5",
                  "no-underline transition-colors",
                  active ? "text-brand-green" : "text-brand-muted"
                )}>
                <span className="text-lg leading-none">{item.icon}</span>
                <span className="text-[10px] font-medium">{item.label.split(" ")[0]}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
`;

/* ════════════════════════════════════════════
   FILE 4 — src/components/dashboard/SuspendedBanner.tsx
════════════════════════════════════════════ */
export const SUSPENDED_BANNER = `
import Link      from "next/link";
import type { Site } from "@/types";

export function SuspendedBanner({ site }: { site: Site }) {
  const suspended = site.status === "suspended";

  return (
    <div className={\`px-4 py-3 flex items-center justify-between gap-3 flex-wrap
      \${suspended ? "bg-brand-ember" : "bg-brand-amber"}\`}>
      <div className="flex items-center gap-2">
        <span className="text-white text-lg">{suspended ? "❌" : "⚠️"}</span>
        <p className="text-white text-sm font-semibold">
          {suspended
            ? "Your site is suspended — visitors cannot see it."
            : \`Payment failed — your site goes offline in \${
                site.grace_period_ends
                  ? Math.max(0, Math.ceil((new Date(site.grace_period_ends).getTime() - Date.now()) / 86400000))
                  : 5
              } days.\`}
        </p>
      </div>
      <Link href="/dashboard/billing"
        className="bg-white text-brand-ink text-xs font-bold px-4 py-1.5
          rounded-full no-underline hover:bg-white/90 transition-colors flex-shrink-0">
        Fix now →
      </Link>
    </div>
  );
}
`;

/* ════════════════════════════════════════════
   FILE 5 — src/components/dashboard/StatCard.tsx
════════════════════════════════════════════ */
export const STAT_CARD = `
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon:     string;
  label:    string;
  value:    string | number;
  sub?:     string;
  accent?:  "green" | "amber" | "ember" | "blue";
  className?: string;
}

export function StatCard({ icon, label, value, sub, accent = "green", className }: StatCardProps) {
  const accents = {
    green: "text-brand-green",
    amber: "text-brand-amber",
    ember: "text-brand-ember",
    blue:  "text-blue-500",
  };

  return (
    <div className={cn("bg-white rounded-2xl p-5 border border-black/8", className)}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="text-xs text-brand-muted font-medium mb-1">{label}</p>
      <p className={cn("font-serif text-3xl tracking-tight", accents[accent])}>
        {value}
      </p>
      {sub && <p className="text-xs text-brand-muted mt-1">{sub}</p>}
    </div>
  );
}
`;

/* ════════════════════════════════════════════
   FILE 6 — src/lib/hooks/useSite.ts
════════════════════════════════════════════ */
export const USE_SITE_HOOK = `
"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient }                      from "@/lib/supabase/client";
import type { Site }                         from "@/types";

export function useSite(userId: string) {
  const [site,    setSite]    = useState<Site | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const supabase = createClient();

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("sites")
      .select("*")
      .eq("owner_id", userId)
      .single();

    if (error) setError(error.message);
    else setSite(data);
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetch(); }, [fetch]);

  // Real-time status updates
  useEffect(() => {
    const channel = supabase
      .channel("site-status")
      .on("postgres_changes", {
        event:  "*",
        schema: "public",
        table:  "sites",
        filter: \`owner_id=eq.\${userId}\`,
      }, payload => {
        setSite(payload.new as Site);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  return { site, loading, error, refresh: fetch };
}
`;

/* ════════════════════════════════════════════
   FILE 7 — src/lib/hooks/useLeads.ts
════════════════════════════════════════════ */
export const USE_LEADS_HOOK = `
"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient }                      from "@/lib/supabase/client";
import type { Lead }                         from "@/types";

export function useLeads(siteId: string) {
  const [leads,   setLeads]   = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [unread,  setUnread]  = useState(0);

  const supabase = createClient();

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("leads")
      .select("*")
      .eq("site_id", siteId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (data) {
      setLeads(data);
      setUnread(data.filter(l => !l.read).length);
    }
    setLoading(false);
  }, [siteId]);

  useEffect(() => { fetch(); }, [fetch]);

  // Real-time new leads
  useEffect(() => {
    const channel = supabase
      .channel("leads-realtime")
      .on("postgres_changes", {
        event:  "INSERT",
        schema: "public",
        table:  "leads",
        filter: \`site_id=eq.\${siteId}\`,
      }, payload => {
        setLeads(prev => [payload.new as Lead, ...prev]);
        setUnread(u => u + 1);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [siteId]);

  const markRead = async (leadId: string) => {
    await supabase.from("leads").update({ read: true }).eq("id", leadId);
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, read: true } : l));
    setUnread(u => Math.max(0, u - 1));
  };

  const markAllRead = async () => {
    await supabase.from("leads").update({ read: true }).eq("site_id", siteId);
    setLeads(prev => prev.map(l => ({ ...l, read: true })));
    setUnread(0);
  };

  return { leads, loading, unread, markRead, markAllRead, refresh: fetch };
}
`;

/* ════════════════════════════════════════════
   FILE 8 — src/lib/hooks/useChanges.ts
════════════════════════════════════════════ */
export const USE_CHANGES_HOOK = `
"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient }                      from "@/lib/supabase/client";
import { PLANS }                             from "@/lib/constants";
import type { ChangeRequest, Site }          from "@/types";

export function useChanges(site: Site) {
  const [changes,   setChanges]   = useState<ChangeRequest[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  const supabase  = createClient();
  const limit     = PLANS[site.plan].changes;
  const remaining = Math.max(0, limit - site.changes_used);
  const canSubmit = remaining > 0 && site.status === "active";

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("changes")
      .select("*")
      .eq("site_id", site.id)
      .order("created_at", { ascending: false })
      .limit(20);

    if (data) setChanges(data);
    setLoading(false);
  }, [site.id]);

  useEffect(() => { fetch(); }, [fetch]);

  const submit = async (description: string): Promise<boolean> => {
    if (!canSubmit || !description.trim()) return false;
    setSubmitting(true);
    setError(null);

    const { error: err } = await supabase.from("changes").insert({
      site_id:     site.id,
      description: description.trim(),
      status:      "pending",
    });

    if (err) {
      setError(err.message);
      setSubmitting(false);
      return false;
    }

    // Increment changes_used
    await supabase
      .from("sites")
      .update({ changes_used: site.changes_used + 1 })
      .eq("id", site.id);

    await fetch();
    setSubmitting(false);
    return true;
  };

  return { changes, loading, submitting, error, remaining, limit, canSubmit, submit, refresh: fetch };
}
`;

/* ════════════════════════════════════════════
   FILE 9 — src/app/dashboard/overview/page.tsx
════════════════════════════════════════════ */
export const OVERVIEW_PAGE = `
import { createClient } from "@/lib/supabase/server";
import { StatCard }     from "@/components/dashboard/StatCard";
import { Badge }        from "@/components/ui/Badge";
import { PLANS }        from "@/lib/constants";
import { formatPrice }  from "@/lib/utils";
import Link             from "next/link";

export default async function OverviewPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: site } = await supabase
    .from("sites")
    .select("*")
    .eq("owner_id", user!.id)
    .single();

  const { count: leadsCount } = await supabase
    .from("leads")
    .select("*", { count: "exact", head: true })
    .eq("site_id", site.id)
    .eq("read", false);

  const plan       = PLANS[site.plan];
  const remaining  = Math.max(0, plan.changes - site.changes_used);
  const resetDate  = new Date(site.changes_reset_date).toLocaleDateString("en-ZA", { day: "numeric", month: "short" });

  const statusConfig = {
    active:         { label: "Live",           variant: "green"  as const, icon: "🟢" },
    draft:          { label: "Draft",          variant: "muted"  as const, icon: "⚪" },
    preview:        { label: "Preview",        variant: "blue"   as const, icon: "🔵" },
    payment_failed: { label: "Payment Failed", variant: "amber"  as const, icon: "🟡" },
    suspended:      { label: "Suspended",      variant: "red"    as const, icon: "🔴" },
    cancelled:      { label: "Cancelled",      variant: "muted"  as const, icon: "⚫" },
  };
  const status = statusConfig[site.status as keyof typeof statusConfig] ?? statusConfig.draft;

  return (
    <div>
      {/* Page header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="font-serif text-2xl md:text-3xl font-normal text-brand-ink">
            {site.biz_name}
          </h1>
          <Badge variant={status.variant}>{status.icon} {status.label}</Badge>
        </div>
        <p className="text-brand-muted text-sm">
          {site.custom_domain || site.subdomain || "Domain pending"}
          {" · "}{site.plan} plan · {formatPrice(plan.price)}/mo
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon="🌐" label="Site status"     value={status.label}           accent={site.status === "active" ? "green" : "amber"} />
        <StatCard icon="🔔" label="Unread leads"    value={leadsCount ?? 0}        accent="blue" sub="New contact messages" />
        <StatCard icon="✏️" label="Changes left"    value={remaining}              accent={remaining === 0 ? "ember" : "green"} sub={\`Resets \${resetDate}\`} />
        <StatCard icon="💰" label="Monthly plan"    value={formatPrice(plan.price)} accent="green" sub={\`\${plan.plan || site.plan} plan\`} />
      </div>

      {/* Site details card */}
      <div className="bg-white rounded-2xl border border-black/8 p-5 mb-5">
        <h3 className="font-semibold text-sm mb-4">Your site details</h3>
        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          {[
            { label: "Domain",       value: site.custom_domain || "Pending registration" },
            { label: "Plan",         value: \`\${site.plan} — \${formatPrice(plan.price)}/mo\` },
            { label: "Pages",        value: plan.pages === 1 ? "1 page" : \`Up to \${plan.pages} pages\` },
            { label: "Changes/mo",   value: \`\${remaining} of \${plan.changes} remaining\` },
            { label: "Blog posts",   value: plan.blog > 0 ? \`\${plan.blog} AI posts included\` : "Not on this plan" },
            { label: "Online store", value: plan.store ? "Included" : "Upgrade to Business" },
          ].map(row => (
            <div key={row.label} className="flex justify-between py-2
              border-b border-black/5 last:border-0">
              <span className="text-brand-muted">{row.label}</span>
              <span className="font-medium text-brand-ink">{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-3 gap-3">
        {[
          { href: "/dashboard/my-site",  icon: "🌐", label: "View my site",    desc: "See your live website" },
          { href: "/dashboard/leads",    icon: "🔔", label: "Check leads",     desc: \`\${leadsCount ?? 0} unread messages\` },
          { href: "/dashboard/changes",  icon: "✏️", label: "Request change",  desc: \`\${remaining} changes remaining\` },
        ].map(action => (
          <Link key={action.href} href={action.href}
            className="bg-white rounded-2xl p-4 border border-black/8
              hover:border-brand-green/30 hover:shadow-sm transition-all
              duration-150 no-underline group">
            <span className="text-2xl block mb-2">{action.icon}</span>
            <p className="font-semibold text-sm text-brand-ink group-hover:text-brand-green
              transition-colors">{action.label}</p>
            <p className="text-xs text-brand-muted mt-0.5">{action.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
`;

/* ════════════════════════════════════════════
   FILE 10 — src/app/dashboard/my-site/page.tsx
════════════════════════════════════════════ */
export const MY_SITE_PAGE = `
import { createClient } from "@/lib/supabase/server";
import { Badge }        from "@/components/ui/Badge";
import { Button }       from "@/components/ui/Button";

export default async function MySitePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: site } = await supabase.from("sites").select("*").eq("owner_id", user!.id).single();

  const siteUrl = site.custom_domain
    ? \`https://\${site.custom_domain}\`
    : site.subdomain
      ? \`https://\${site.subdomain}.quicka.website\`
      : null;

  return (
    <div>
      <h1 className="font-serif text-2xl md:text-3xl font-normal text-brand-ink mb-6">
        My Site
      </h1>

      {/* Status + URL */}
      <div className="bg-white rounded-2xl border border-black/8 p-5 mb-5">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <div>
            <p className="font-semibold text-sm mb-1">
              {site.custom_domain || "Domain being set up..."}
            </p>
            <Badge variant={site.status === "active" ? "green" : "amber"}>
              {site.status === "active" ? "🟢 Live" : "⏳ " + site.status}
            </Badge>
          </div>
          {siteUrl && (
            <a href={siteUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="green" size="sm">Visit my site →</Button>
            </a>
          )}
        </div>

        {/* Share row */}
        {siteUrl && (
          <div className="flex items-center gap-2 p-3 bg-brand-bg rounded-xl">
            <p className="text-xs font-mono text-brand-muted flex-1 truncate">{siteUrl}</p>
            <button
              onClick={() => navigator.clipboard.writeText(siteUrl)}
              className="text-xs text-brand-green font-semibold bg-transparent
                border-none cursor-pointer flex-shrink-0 hover:underline"
            >
              Copy
            </button>
          </div>
        )}
      </div>

      {/* Site details */}
      <div className="bg-white rounded-2xl border border-black/8 p-5 mb-5">
        <h3 className="font-semibold text-sm mb-4">Site information</h3>
        <div className="space-y-3 text-sm">
          {[
            { label: "Business name",   value: site.biz_name },
            { label: "Type",            value: site.biz_type },
            { label: "City",            value: site.city },
            { label: "Domain",          value: site.custom_domain || "Pending" },
            { label: "Domain status",   value: site.domain_status },
            { label: "SSL",             value: site.domain_status === "active" ? "✅ Active" : "Pending" },
          ].map(row => (
            <div key={row.label} className="flex justify-between py-2 border-b border-black/5 last:border-0">
              <span className="text-brand-muted">{row.label}</span>
              <span className="font-medium">{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Share buttons */}
      {siteUrl && (
        <div className="bg-white rounded-2xl border border-black/8 p-5">
          <h3 className="font-semibold text-sm mb-4">Share your website</h3>
          <div className="flex flex-wrap gap-3">
            <a
              href={\`https://wa.me/?text=Check out my new website: \${siteUrl}\`}
              target="_blank" rel="noopener noreferrer"
            >
              <Button variant="whatsapp" size="sm">💬 Share on WhatsApp</Button>
            </a>
            <a
              href={\`https://www.facebook.com/sharer/sharer.php?u=\${siteUrl}\`}
              target="_blank" rel="noopener noreferrer"
            >
              <Button variant="primary" size="sm">📘 Share on Facebook</Button>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
`;

/* ════════════════════════════════════════════
   FILE 11 — src/app/dashboard/leads/page.tsx
   Real-time leads with client component
════════════════════════════════════════════ */
export const LEADS_PAGE = `
"use client";

import { useEffect, useState }  from "react";
import { createClient }         from "@/lib/supabase/client";
import { useLeads }             from "@/lib/hooks/useLeads";
import { Badge }                from "@/components/ui/Badge";
import { cn }                   from "@/lib/utils";
import type { Site }            from "@/types";

function LeadsContent({ site }: { site: Site }) {
  const { leads, loading, unread, markRead, markAllRead } = useLeads(site.id);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-brand-green/30 border-t-brand-green
          rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-normal text-brand-ink">
            Leads
          </h1>
          {unread > 0 && (
            <p className="text-sm text-brand-muted mt-0.5">
              {unread} unread message{unread !== 1 ? "s" : ""}
            </p>
          )}
        </div>
        {unread > 0 && (
          <button onClick={markAllRead}
            className="text-sm text-brand-green font-semibold bg-transparent
              border-none cursor-pointer hover:underline">
            Mark all as read
          </button>
        )}
      </div>

      {leads.length === 0 ? (
        <div className="bg-white rounded-2xl border border-black/8 p-10 text-center">
          <div className="text-4xl mb-3">📭</div>
          <h3 className="font-semibold text-brand-ink mb-1">No leads yet</h3>
          <p className="text-sm text-brand-muted max-w-xs mx-auto">
            When someone fills in your contact form, their details will appear here instantly.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {leads.map(lead => (
            <div
              key={lead.id}
              onClick={() => !lead.read && markRead(lead.id)}
              className={cn(
                "bg-white rounded-2xl border p-4 md:p-5 transition-all duration-150",
                lead.read
                  ? "border-black/8 opacity-75"
                  : "border-brand-green/30 shadow-sm cursor-pointer hover:shadow-md"
              )}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 bg-brand-green/10 rounded-full flex items-center
                    justify-center text-brand-green font-bold text-sm flex-shrink-0">
                    {(lead.name || "?")[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{lead.name || "Anonymous"}</p>
                    <p className="text-xs text-brand-muted">
                      {new Date(lead.created_at).toLocaleDateString("en-ZA", {
                        day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
                {!lead.read && (
                  <Badge variant="green" className="flex-shrink-0">New</Badge>
                )}
              </div>

              {/* Contact details */}
              <div className="grid sm:grid-cols-2 gap-2 mb-3 text-sm">
                {lead.phone && (
                  <div className="flex items-center gap-2">
                    <span className="text-brand-muted text-xs">Phone</span>
                    <a href={\`tel:\${lead.phone}\`}
                      className="font-medium text-brand-ink hover:text-brand-green no-underline">
                      {lead.phone}
                    </a>
                  </div>
                )}
                {lead.email && (
                  <div className="flex items-center gap-2">
                    <span className="text-brand-muted text-xs">Email</span>
                    <a href={\`mailto:\${lead.email}\`}
                      className="font-medium text-brand-ink hover:text-brand-green no-underline truncate">
                      {lead.email}
                    </a>
                  </div>
                )}
              </div>

              {/* Message */}
              {lead.message && (
                <p className="text-sm text-brand-muted bg-brand-bg rounded-xl p-3
                  leading-relaxed">
                  {lead.message}
                </p>
              )}

              {/* Reply button */}
              {lead.phone && (
                <div className="mt-3">
                  <a
                    href={\`https://wa.me/\${lead.phone.replace(/\\D/g, "")}\`}
                    target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold
                      text-[#25D366] no-underline hover:underline"
                    onClick={e => e.stopPropagation()}
                  >
                    💬 Reply on WhatsApp →
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Server wrapper to get site then pass to client component
export default function LeadsPage() {
  const [site, setSite] = useState<Site | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase.from("sites").select("*").eq("owner_id", user.id).single()
        .then(({ data }) => setSite(data));
    });
  }, []);

  if (!site) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-brand-green/30 border-t-brand-green
        rounded-full animate-spin" />
    </div>
  );

  return <LeadsContent site={site} />;
}
`;

/* ════════════════════════════════════════════
   FILE 12 — src/app/dashboard/changes/page.tsx
════════════════════════════════════════════ */
export const CHANGES_PAGE = `
"use client";

import { useState, useEffect }   from "react";
import { createClient }          from "@/lib/supabase/client";
import { useChanges }            from "@/lib/hooks/useChanges";
import { Button }                from "@/components/ui/Button";
import { Textarea }              from "@/components/ui/Textarea";
import { Badge }                 from "@/components/ui/Badge";
import { cn }                    from "@/lib/utils";
import type { Site }             from "@/types";

function ChangesContent({ site }: { site: Site }) {
  const { changes, loading, submitting, error, remaining, limit, canSubmit, submit } = useChanges(site);
  const [desc, setDesc] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!desc.trim()) return;
    const ok = await submit(desc);
    if (ok) { setDesc(""); setSubmitted(true); setTimeout(() => setSubmitted(false), 4000); }
  };

  const statusConfig = {
    pending:     { variant: "amber"  as const, label: "Pending" },
    in_progress: { variant: "blue"   as const, label: "In Progress" },
    completed:   { variant: "green"  as const, label: "Completed" },
  };

  return (
    <div>
      <h1 className="font-serif text-2xl md:text-3xl font-normal text-brand-ink mb-2">
        Request a Change
      </h1>
      <p className="text-brand-muted text-sm mb-6">
        Describe what you'd like changed on your site. We aim to complete changes within 24–48 hours.
      </p>

      {/* Changes counter */}
      <div className={cn(
        "rounded-2xl p-4 mb-5 flex items-center gap-3",
        remaining === 0 ? "bg-brand-ember/8 border border-brand-ember/20" : "bg-brand-green/8 border border-brand-green/20"
      )}>
        <span className="text-2xl">{remaining === 0 ? "⚠️" : "✏️"}</span>
        <div>
          <p className="font-semibold text-sm">
            {remaining} of {limit} changes remaining this month
          </p>
          <p className="text-xs text-brand-muted">
            {remaining === 0
              ? "You've used all your changes for this month. They reset on the 1st."
              : \`Resets on the 1st of next month\`}
          </p>
        </div>
      </div>

      {/* Submit form */}
      {canSubmit && (
        <div className="bg-white rounded-2xl border border-black/8 p-5 mb-6">
          <h3 className="font-semibold text-sm mb-3">New change request</h3>

          {submitted && (
            <div className="bg-brand-green/8 border border-brand-green/20 rounded-xl
              p-3 mb-4 text-sm text-brand-green font-semibold">
              ✅ Change request submitted! We'll get to it within 24–48 hours.
            </div>
          )}

          <Textarea
            label="Describe the change"
            value={desc}
            onChange={e => setDesc(e.target.value)}
            placeholder="e.g. Please update the phone number on the contact section to 082 555 1234"
            rows={4}
          />

          {error && <p className="text-xs text-brand-ember mb-3">{error}</p>}

          <div className="flex items-center justify-between">
            <p className="text-xs text-brand-muted">{desc.length}/500 characters</p>
            <Button
              variant="green"
              size="sm"
              disabled={!desc.trim() || desc.length < 10}
              loading={submitting}
              onClick={handleSubmit}
            >
              Submit change →
            </Button>
          </div>
        </div>
      )}

      {/* Change history */}
      <h3 className="font-semibold text-sm mb-3">Change history</h3>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-brand-green/30 border-t-brand-green rounded-full animate-spin" />
        </div>
      ) : changes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-black/8 p-8 text-center">
          <p className="text-brand-muted text-sm">No change requests yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {changes.map(change => {
            const s = statusConfig[change.status];
            return (
              <div key={change.id}
                className="bg-white rounded-2xl border border-black/8 p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <p className="text-sm text-brand-ink leading-relaxed flex-1">
                    {change.description}
                  </p>
                  <Badge variant={s.variant} className="flex-shrink-0">{s.label}</Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-brand-muted">
                  <span>Submitted {new Date(change.created_at).toLocaleDateString("en-ZA")}</span>
                  {change.completed_at && (
                    <span>Completed {new Date(change.completed_at).toLocaleDateString("en-ZA")}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function ChangesPage() {
  const [site, setSite] = useState<Site | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase.from("sites").select("*").eq("owner_id", user.id).single()
        .then(({ data }) => setSite(data));
    });
  }, []);

  if (!site) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-brand-green/30 border-t-brand-green rounded-full animate-spin" /></div>;

  return <ChangesContent site={site} />;
}
`;

/* ════════════════════════════════════════════
   FILE 13 — src/app/dashboard/billing/page.tsx
════════════════════════════════════════════ */
export const BILLING_PAGE = `
import { createClient } from "@/lib/supabase/server";
import { Badge }        from "@/components/ui/Badge";
import { Button }       from "@/components/ui/Button";
import { PLANS }        from "@/lib/constants";
import { formatPrice }  from "@/lib/utils";
import Link             from "next/link";

export default async function BillingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: site } = await supabase.from("sites").select("*").eq("owner_id", user!.id).single();
  const plan = PLANS[site.plan];
  const suspended = site.status === "suspended" || site.status === "payment_failed";

  return (
    <div>
      <h1 className="font-serif text-2xl md:text-3xl font-normal text-brand-ink mb-6">
        Billing
      </h1>

      {/* Current plan */}
      <div className="bg-white rounded-2xl border border-black/8 p-5 mb-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-sm">Current plan</h3>
          <Badge variant={suspended ? "red" : "green"}>
            {suspended ? "Payment issue" : "Active"}
          </Badge>
        </div>
        <div className="flex items-end gap-2 mb-4">
          <span className="font-serif text-4xl">{formatPrice(plan.price)}</span>
          <span className="text-brand-muted text-sm mb-1">/month</span>
        </div>
        <p className="text-sm font-semibold text-brand-ink mb-1">{site.plan} Plan</p>
        <p className="text-xs text-brand-muted mb-4">
          {plan.pages === 1 ? "1 page" : \`\${plan.pages} pages\`}
          {" · "}{plan.items} items
          {" · "}{plan.changes} changes/mo
          {plan.blog > 0 && \` · \${plan.blog} blog posts\`}
        </p>

        {/* Update payment */}
        {suspended && (
          <div className="bg-brand-ember/8 border border-brand-ember/20 rounded-xl p-4 mb-4">
            <p className="text-sm font-semibold text-brand-ember mb-2">
              ⚠️ Payment action required
            </p>
            <p className="text-xs text-brand-muted mb-3">
              Your last payment failed. Update your card details to reactivate your site.
            </p>
            <a href={\`/api/checkout?plan=\${site.plan}&email=\${encodeURIComponent(user!.email ?? "")}&update=true\`}>
              <Button variant="danger" size="sm">Update payment details →</Button>
            </a>
          </div>
        )}
      </div>

      {/* Plan upgrade */}
      {site.plan !== "Business" && (
        <div className="bg-white rounded-2xl border border-black/8 p-5 mb-5">
          <h3 className="font-semibold text-sm mb-4">Upgrade your plan</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {(Object.keys(PLANS) as (keyof typeof PLANS)[])
              .filter(p => PLANS[p].price > plan.price)
              .map(planName => {
                const p = PLANS[planName];
                return (
                  <div key={planName} className="border border-black/8 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-bold text-sm">{planName}</p>
                      <p className="font-serif text-xl">{formatPrice(p.price)}<span className="text-xs font-sans text-brand-muted">/mo</span></p>
                    </div>
                    <p className="text-xs text-brand-muted mb-3">
                      +{p.items - plan.items} more items
                      {p.blog > plan.blog && \` · \${p.blog} blog posts\`}
                      {p.store && " · Online store"}
                    </p>
                    <a href={\`/api/checkout?plan=\${planName}&email=\${encodeURIComponent(user!.email ?? "")}&upgrade=true\`}>
                      <Button variant="green" size="sm" full>Upgrade to {planName} →</Button>
                    </a>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Cancel */}
      <div className="bg-white rounded-2xl border border-black/8 p-5">
        <h3 className="font-semibold text-sm mb-2">Cancel subscription</h3>
        <p className="text-xs text-brand-muted mb-4 leading-relaxed">
          If you cancel, your site will remain live until the end of your billing period.
          Your domain and content will be preserved for 30 days.
        </p>
        <a href="mailto:hello@quicka.website?subject=Cancel subscription">
          <Button variant="ghost" size="sm">Request cancellation</Button>
        </a>
      </div>
    </div>
  );
}
`;

/* ════════════════════════════════════════════
   FILE 14 — src/app/dashboard/settings/page.tsx
════════════════════════════════════════════ */
export const SETTINGS_PAGE = `
"use client";

import { useState, useEffect } from "react";
import { createClient }        from "@/lib/supabase/client";
import { Input }               from "@/components/ui/Input";
import { Textarea }            from "@/components/ui/Textarea";
import { Button }              from "@/components/ui/Button";
import type { Site }           from "@/types";

function SettingsContent({ site: initialSite }: { site: Site }) {
  const [site,    setSite]    = useState(initialSite);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const supabase = createClient();

  const handleSave = async () => {
    setSaving(true);
    await supabase.from("sites").update({
      whatsapp:  site.whatsapp,
      city:      site.city,
      biz_desc:  site.biz_desc,
    }).eq("id", site.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div>
      <h1 className="font-serif text-2xl md:text-3xl font-normal text-brand-ink mb-6">
        Settings
      </h1>

      <div className="bg-white rounded-2xl border border-black/8 p-5 mb-5">
        <h3 className="font-semibold text-sm mb-4">Business details</h3>

        {saved && (
          <div className="bg-brand-green/8 border border-brand-green/20 rounded-xl p-3
            mb-4 text-sm text-brand-green font-semibold">
            ✅ Settings saved successfully!
          </div>
        )}

        <Input
          label="Business name"
          value={site.biz_name}
          onChange={e => setSite(s => ({ ...s, biz_name: e.target.value }))}
        />
        <Input
          label="City / Area"
          value={site.city}
          onChange={e => setSite(s => ({ ...s, city: e.target.value }))}
        />
        <Input
          label="WhatsApp number"
          value={site.whatsapp}
          onChange={e => setSite(s => ({ ...s, whatsapp: e.target.value }))}
          hint="Shown as the WhatsApp button on your site"
        />
        <Textarea
          label="Business description"
          value={site.biz_desc}
          onChange={e => setSite(s => ({ ...s, biz_desc: e.target.value }))}
          rows={4}
          hint="Used on your website's about section"
        />

        <Button variant="green" loading={saving} onClick={handleSave}>
          Save changes →
        </Button>
      </div>

      {/* Account */}
      <div className="bg-white rounded-2xl border border-black/8 p-5">
        <h3 className="font-semibold text-sm mb-4">Account</h3>
        <p className="text-xs text-brand-muted mb-3">
          To change your email address or password, please contact us.
        </p>
        <a href="mailto:hello@quicka.website?subject=Account change request">
          <Button variant="ghost" size="sm">Contact support →</Button>
        </a>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [site, setSite] = useState<Site | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase.from("sites").select("*").eq("owner_id", user.id).single()
        .then(({ data }) => setSite(data));
    });
  }, []);

  if (!site) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-brand-green/30 border-t-brand-green rounded-full animate-spin" /></div>;

  return <SettingsContent site={site} />;
}
`;

// Demo viewer
export default function DashboardDemo() {
  const files = [
    { id: "layout",   label: "🔒 dashboard/layout.tsx",        content: DASHBOARD_LAYOUT },
    { id: "page",     label: "📄 dashboard/page.tsx",           content: DASHBOARD_PAGE },
    { id: "shell",    label: "🏗️ DashboardShell.tsx",           content: DASHBOARD_SHELL },
    { id: "banner",   label: "⚠️ SuspendedBanner.tsx",          content: SUSPENDED_BANNER },
    { id: "statcard", label: "📊 StatCard.tsx",                 content: STAT_CARD },
    { id: "usesite",  label: "🪝 hooks/useSite.ts",             content: USE_SITE_HOOK },
    { id: "useleads", label: "🪝 hooks/useLeads.ts",            content: USE_LEADS_HOOK },
    { id: "usechg",   label: "🪝 hooks/useChanges.ts",          content: USE_CHANGES_HOOK },
    { id: "overview", label: "📊 overview/page.tsx",            content: OVERVIEW_PAGE },
    { id: "mysite",   label: "🌐 my-site/page.tsx",             content: MY_SITE_PAGE },
    { id: "leads",    label: "🔔 leads/page.tsx",               content: LEADS_PAGE },
    { id: "changes",  label: "✏️ changes/page.tsx",             content: CHANGES_PAGE },
    { id: "billing",  label: "💳 billing/page.tsx",             content: BILLING_PAGE },
    { id: "settings", label: "⚙️ settings/page.tsx",            content: SETTINGS_PAGE },
  ];

  const { useState } = require("react");
  const [active, setActive] = useState("layout");
  const current = files.find(f => f.id === active);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", fontFamily: "Arial, sans-serif", background: "#F5F2ED" }}>
      <div style={{ background: "#0A0A0A", padding: "0.85rem 1.5rem", display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
        <div style={{ fontStyle: "italic", fontSize: "1.2rem", color: "#fff" }}>Quick<span style={{ color: "#00C853" }}>a</span></div>
        <div style={{ width: 1, height: 18, background: "rgba(255,255,255,0.15)" }} />
        <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.35)", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase" }}>
          Customer Dashboard — {files.length} files — 6 tabs
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
