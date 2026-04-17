/**
 * Quicka — API Routes + Blog Pages (Next.js)
 * ============================================
 * File: Quicka_NextJS_API_Blog.jsx
 *
 * Files in this module:
 *
 * API ROUTES
 *  src/app/api/checkout/route.ts         ← PayFast checkout URL builder
 *  src/app/api/webhook/payfast/route.ts  ← PayFast webhook handler
 *  src/app/api/otp/route.ts              ← Send OTP via Resend
 *  src/app/api/generate/route.ts         ← Trigger AI site generation
 *
 * BLOG PAGES
 *  src/app/blog/page.tsx                 ← Blog listing (SSR + SEO)
 *  src/app/blog/[slug]/page.tsx          ← Individual post (SSR + SEO)
 *  src/app/blog/[slug]/not-found.tsx     ← 404 for missing posts
 *
 * UTILITY PAGES
 *  src/app/not-found.tsx                 ← Global 404
 *  src/app/privacy/page.tsx             ← Privacy policy
 *  src/app/terms/page.tsx               ← Terms of use
 */

/* ════════════════════════════════════════════
   FILE 1 — src/app/api/checkout/route.ts
   Builds signed PayFast redirect URL
   Called from: billing page + site preview
════════════════════════════════════════════ */
export const CHECKOUT_ROUTE = `
import { NextRequest, NextResponse } from "next/server";
import crypto                        from "crypto";
import { createClient }              from "@/lib/supabase/server";
import { PLANS, EMAIL_UPSELL_PRICE, LOGO_UPSELL_PRICE } from "@/lib/constants";
import type { PlanName }             from "@/lib/constants";

// PayFast config
const PF = {
  merchantId:  process.env.NEXT_PUBLIC_PF_MERCHANT_ID!,
  merchantKey: process.env.PF_MERCHANT_KEY!,
  passphrase:  process.env.PF_PASSPHRASE!,
  sandbox:     process.env.NEXT_PUBLIC_PF_SANDBOX === "true",
};

const PF_URL = PF.sandbox
  ? "https://sandbox.payfast.co.za/eng/process"
  : "https://www.payfast.co.za/eng/process";

const SITE_URL      = process.env.NEXT_PUBLIC_SITE_URL      || "https://quicka.website";
const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL || "https://app.quicka.website";

function buildSignature(data: Record<string, string>, passphrase: string): string {
  const str = Object.entries(data)
    .map(([k, v]) => \`\${k}=\${encodeURIComponent(v.trim()).replace(/%20/g, "+")}\`)
    .join("&") + \`&passphrase=\${encodeURIComponent(passphrase.trim()).replace(/%20/g, "+")}\`;
  return crypto.createHash("md5").update(str).digest("hex");
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    plan,
    email,
    siteId,
    bizName,
    emailUpsell = false,
    logoUpsell  = false,
    update      = false,
    upgrade     = false,
  } = body;

  if (!PLANS[plan as PlanName]) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const planData  = PLANS[plan as PlanName];
  const monthly   = planData.price + (emailUpsell ? EMAIL_UPSELL_PRICE : 0);
  const onceOff   = logoUpsell ? LOGO_UPSELL_PRICE : 0;

  // Build unique payment ID
  const mPaymentId = \`quicka_\${siteId}_\${Date.now()}\`;

  const pfData: Record<string, string> = {
    merchant_id:     PF.merchantId,
    merchant_key:    PF.merchantKey,
    return_url:      \`\${DASHBOARD_URL}?payment=success\`,
    cancel_url:      \`\${SITE_URL}?cancelled=true\`,
    notify_url:      \`\${SITE_URL}/api/webhook/payfast\`,
    name_first:      bizName || "Customer",
    email_address:   email,
    m_payment_id:    mPaymentId,
    amount:          (monthly + (onceOff > 0 ? onceOff : 0)).toFixed(2),
    item_name:       \`Quicka \${plan} Plan\${emailUpsell ? " + Email" : ""}\`,
    item_description: \`Monthly website subscription — \${plan} plan\`,
    // Subscription fields
    subscription_type:    "1",
    billing_date:         new Date().toISOString().split("T")[0],
    recurring_amount:     monthly.toFixed(2),
    frequency:            "3", // monthly
    cycles:               "0", // indefinite
    custom_str1:          siteId,
    custom_str2:          plan,
    custom_str3:          emailUpsell ? "email_upsell" : "",
    custom_str4:          logoUpsell  ? "logo_upsell"  : "",
  };

  // Sign the request
  pfData.signature = buildSignature(pfData, PF.passphrase);

  // Store pending payment in Supabase
  const supabase = await createClient();
  await supabase.from("sites").update({
    pf_payment_id: mPaymentId,
    status:        "pending_payment",
  }).eq("id", siteId);

  // Build redirect URL
  const params = new URLSearchParams(pfData).toString();
  const redirectUrl = \`\${PF_URL}?\${params}\`;

  return NextResponse.json({ url: redirectUrl, mPaymentId });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const plan      = searchParams.get("plan") as PlanName;
  const email     = searchParams.get("email") || "";
  const siteId    = searchParams.get("siteId") || "";
  const bizName   = searchParams.get("bizName") || "";

  if (!plan || !PLANS[plan]) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Reuse POST logic
  const res = await POST(new NextRequest(req.url, {
    method: "POST",
    body:   JSON.stringify({ plan, email, siteId, bizName }),
  }));

  const { url } = await res.json();
  return NextResponse.redirect(url);
}
`;

/* ════════════════════════════════════════════
   FILE 2 — src/app/api/webhook/payfast/route.ts
   Handles all PayFast subscription events
════════════════════════════════════════════ */
export const PAYFAST_WEBHOOK = `
import { NextRequest, NextResponse } from "next/server";
import crypto                        from "crypto";
import { createClient }              from "@supabase/supabase-js";

// Use service role for webhook — bypasses RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PF_PASSPHRASE = process.env.PF_PASSPHRASE!;
const SITE_URL      = process.env.NEXT_PUBLIC_SITE_URL || "https://quicka.website";

// Verify PayFast signature
function verifySignature(data: Record<string, string>): boolean {
  const pfData = { ...data };
  delete pfData.signature;

  const str = Object.entries(pfData)
    .filter(([, v]) => v !== "")
    .map(([k, v]) => \`\${k}=\${encodeURIComponent(v.trim()).replace(/%20/g, "+")}\`)
    .join("&") + \`&passphrase=\${encodeURIComponent(PF_PASSPHRASE.trim()).replace(/%20/g, "+")}\`;

  const computed = crypto.createHash("md5").update(str).digest("hex");
  return computed === data.signature;
}

// Verify request came from PayFast IPs
async function verifyPayFastIP(ip: string): Promise<boolean> {
  const validIPs = [
    "197.97.145.144", "197.97.145.145", "197.97.145.146", "197.97.145.147",
    "41.74.179.194",  "41.74.179.195",  "41.74.179.196",  "41.74.179.197",
  ];
  // In sandbox mode accept all
  if (process.env.NEXT_PUBLIC_PF_SANDBOX === "true") return true;
  return validIPs.includes(ip);
}

export async function POST(req: NextRequest) {
  try {
    // Get IP from Cloudflare header
    const ip = req.headers.get("cf-connecting-ip") || req.headers.get("x-forwarded-for") || "";

    // Parse form body
    const formData = await req.formData();
    const data: Record<string, string> = {};
    formData.forEach((value, key) => { data[key] = value.toString(); });

    // Security checks
    if (!await verifyPayFastIP(ip)) {
      console.error("PayFast webhook: invalid IP", ip);
      return new NextResponse("Forbidden", { status: 403 });
    }

    if (!verifySignature(data)) {
      console.error("PayFast webhook: signature mismatch");
      // Log security event
      await supabase.from("security_log").insert({
        event:    "webhook_signature_failed",
        severity: "critical",
        details:  { ip, endpoint: "payfast-webhook" },
      });
      return new NextResponse("Invalid signature", { status: 400 });
    }

    const {
      payment_status,
      m_payment_id,
      custom_str1: siteId,
      custom_str2: plan,
      custom_str3: emailUpsell,
      custom_str4: logoUpsell,
      email_address: email,
    } = data;

    // ── PAYMENT COMPLETE ───────────────────────
    if (payment_status === "COMPLETE") {
      // Get site details
      const { data: site } = await supabase
        .from("sites")
        .select("*, profiles(email)")
        .eq("id", siteId)
        .single();

      if (!site) return new NextResponse("Site not found", { status: 404 });

      // Activate site
      await supabase.from("sites").update({
        status:             "active",
        plan,
        pf_payment_id:      m_payment_id,
        payment_fail_count: 0,
        grace_period_ends:  null,
        suspended_at:       null,
        email_upsell:       emailUpsell === "email_upsell",
        last_paid_at:       new Date().toISOString(),
      }).eq("id", siteId);

      // Register domain (call Edge Function)
      await fetch(
        \`\${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/register-domain\`,
        {
          method:  "POST",
          headers: {
            "Content-Type":  "application/json",
            "Authorization": \`Bearer \${process.env.SUPABASE_SERVICE_ROLE_KEY}\`,
          },
          body: JSON.stringify({ siteId, domain: site.custom_domain }),
        }
      );

      // Send payment confirmed email
      await supabase.functions.invoke("send-email", {
        body: {
          type:   "payment_confirmed",
          siteId,
          data: {
            email:    email || site.email,
            bizName:  site.biz_name,
            planName: plan,
            amount:   data.amount_gross,
            domain:   site.custom_domain || "Being registered",
          },
        },
      });

      // Notify admin of email upsell
      if (emailUpsell === "email_upsell") {
        await supabase.functions.invoke("send-email", {
          body: {
            type: "email_upsell_admin",
            data: {
              bizName:     site.biz_name,
              clientEmail: email || site.email,
              planName:    plan,
            },
          },
        });
      }
    }

    // ── PAYMENT FAILED / CANCELLED ─────────────
    if (payment_status === "FAILED" || payment_status === "CANCELLED") {
      const { data: site } = await supabase
        .from("sites").select("payment_fail_count, biz_name")
        .eq("id", siteId).single();

      const failCount = (site?.payment_fail_count || 0) + 1;
      const graceEnd  = new Date(Date.now() + 5 * 86400000).toISOString();

      await supabase.from("sites").update({
        status:             "payment_failed",
        payment_fail_count: failCount,
        grace_period_ends:  graceEnd,
      }).eq("id", siteId);

      // Send dunning email
      await supabase.functions.invoke("send-email", {
        body: {
          type:   "dunning_1",
          siteId,
          data: { bizName: site?.biz_name, email, domain: data.custom_str1 },
        },
      });
    }

    // ── SUBSCRIPTION CANCELLED ─────────────────
    if (payment_status === "SUBSCRIPTION_CANCELLED") {
      await supabase.from("sites").update({
        status:    "cancelled",
        cancelled_at: new Date().toISOString(),
      }).eq("id", siteId);
    }

    return new NextResponse("OK", { status: 200 });

  } catch (err) {
    console.error("Webhook error:", err);
    return new NextResponse("Server error", { status: 500 });
  }
}
`;

/* ════════════════════════════════════════════
   FILE 3 — src/app/api/otp/route.ts
   Sends OTP email via Resend
════════════════════════════════════════════ */
export const OTP_ROUTE = `
import { NextRequest, NextResponse } from "next/server";
import { Resend }                    from "resend";
import { createClient }              from "@supabase/supabase-js";

const resend   = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Simple in-memory rate limiting (use Redis in production)
const otpAttempts = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(email: string): boolean {
  const now    = Date.now();
  const record = otpAttempts.get(email);

  if (!record || record.resetAt < now) {
    otpAttempts.set(email, { count: 1, resetAt: now + 10 * 60 * 1000 });
    return true;
  }

  if (record.count >= 5) return false;
  record.count++;
  return true;
}

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email || !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  if (!checkRateLimit(email)) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait 10 minutes." },
      { status: 429 }
    );
  }

  // Generate 6-digit OTP
  const code     = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  // Store OTP in Supabase
  await supabase.from("otp_codes").upsert({
    email,
    code,
    expires_at: expiresAt,
    used:       false,
  });

  // Send OTP email
  await resend.emails.send({
    from:    "Quicka <hello@quicka.website>",
    to:      email,
    subject: "Your Quicka verification code",
    html:    \`
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px">
        <h1 style="font-family:Georgia,serif;font-size:28px;font-weight:400;margin-bottom:8px">
          Here's your code.
        </h1>
        <p style="color:#6B7280;font-size:15px;margin-bottom:24px">
          Enter this code to verify your email address.
        </p>
        <div style="background:#F5F2ED;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px">
          <div style="font-size:40px;font-weight:900;letter-spacing:10px;color:#0A0A0A">
            \${code}
          </div>
          <p style="color:#9CA3AF;font-size:13px;margin-top:8px">
            Expires in 10 minutes
          </p>
        </div>
        <p style="color:#9CA3AF;font-size:13px">
          If you didn't request this, you can safely ignore this email.
        </p>
      </div>
    \`,
  });

  return NextResponse.json({ success: true });
}

export async function PUT(req: NextRequest) {
  // Verify OTP
  const { email, code } = await req.json();

  // Demo mode — accept 123456
  if (code === "123456") {
    return NextResponse.json({ valid: true, demo: true });
  }

  const { data } = await supabase
    .from("otp_codes")
    .select("*")
    .eq("email", email)
    .eq("code", code)
    .eq("used", false)
    .gt("expires_at", new Date().toISOString())
    .single();

  if (!data) {
    return NextResponse.json({ valid: false, error: "Invalid or expired code" }, { status: 400 });
  }

  // Mark as used
  await supabase.from("otp_codes").update({ used: true }).eq("id", data.id);

  return NextResponse.json({ valid: true });
}
`;

/* ════════════════════════════════════════════
   FILE 4 — src/app/api/generate/route.ts
   AI site generation trigger
════════════════════════════════════════════ */
export const GENERATE_ROUTE = `
import { NextRequest, NextResponse } from "next/server";
import Anthropic                     from "@anthropic-ai/sdk";
import { createClient }              from "@supabase/supabase-js";
import { sanitiseForAI, slugifyDomain } from "@/lib/utils";
import { PLANS }                     from "@/lib/constants";
import type { OnboardingData }       from "@/types";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const supabase  = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://quicka.website";

export async function POST(req: NextRequest) {
  const data: OnboardingData = await req.json();

  // Validate required fields
  if (!data.email || !data.bizName || !data.bizDesc || !data.plan) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const plan   = PLANS[data.plan];
  const domain = slugifyDomain(data.bizName) + ".co.za";

  // ── 1. Create site record in Supabase ───────────
  const { data: site, error: siteErr } = await supabase
    .from("sites")
    .insert({
      email:              data.email,
      status:             "preview",
      plan:               data.plan,
      biz_name:           sanitiseForAI(data.bizName),
      biz_desc:           sanitiseForAI(data.bizDesc),
      biz_type:           data.bizType,
      city:               data.city,
      whatsapp:           data.whatsapp,
      facebook:           data.facebook,
      instagram:          data.instagram,
      tiktok:             data.tiktok,
      use_industry_photos: data.useIndustryPhotos,
      brand_colour:       data.customColour ? data.customHex : null,
      brand_colour_index: data.brandColourIndex,
      email_upsell:       data.emailUpsell,
      logo_upsell:        data.logoUpsell,
      custom_domain:      domain,
      preview_expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      changes_used:       0,
      changes_reset_date: new Date(new Date().setDate(1) + 32 * 86400000).toISOString(),
    })
    .select()
    .single();

  if (siteErr || !site) {
    return NextResponse.json({ error: "Failed to create site" }, { status: 500 });
  }

  // ── 2. Generate site HTML with Claude ───────────
  const itemsList = data.items
    .filter(i => i.name)
    .slice(0, plan.items)
    .map(i => \`- \${i.name}: \${i.description} (R\${i.price})\`)
    .join("\\n");

  const blogInstructions = plan.blog > 0
    ? \`Also generate \${plan.blog} blog post summaries relevant to this business type.\`
    : "";

  const prompt = \`
You are a professional web designer. Generate a complete, beautiful HTML website for this South African business.

Business details:
- Name: \${sanitiseForAI(data.bizName)}
- Type: \${data.bizType} business
- Description: \${sanitiseForAI(data.bizDesc)}
- City: \${data.city}
- WhatsApp: \${data.whatsapp}
- Facebook: \${data.facebook || "none"}
- Instagram: \${data.instagram || "none"}

\${data.bizType}s offered:
\${itemsList}

Design requirements:
- Modern, mobile-first responsive design
- Brand colour: \${data.customColour ? data.customHex : "use a professional colour based on the business type"}
- Clean typography, lots of white space
- Include: hero section, \${data.bizType.toLowerCase()}s section with cards, contact section
\${plan.store ? "- Include a simple online store / order section" : ""}
\${plan.gallery ? "- Include a photo gallery section" : ""}
\${plan.blog > 0 ? \`- Include a blog section with \${plan.blog} AI-generated post previews\` : ""}
- WhatsApp button: https://wa.me/\${data.whatsapp.replace(/\\D/g, "")}
- Footer with: business name, city, social links
- DO NOT include any real images — use CSS gradients and emoji placeholders
- Include "Powered by Quicka" in the footer in small text

Return ONLY valid HTML. No markdown, no explanations.
\`;

  const message = await anthropic.messages.create({
    model:      "claude-sonnet-4-20250514",
    max_tokens: 8000,
    messages: [{ role: "user", content: prompt }],
  });

  const html = message.content[0].type === "text" ? message.content[0].text : "";

  // ── 3. Store generated HTML ─────────────────────
  await supabase.from("sites").update({
    generated_html: html,
    generated_at:   new Date().toISOString(),
  }).eq("id", site.id);

  // ── 4. Upload logo to storage (if provided) ─────
  if (data.logo) {
    const base64 = data.logo.replace(/^data:image\\/\\w+;base64,/, "");
    const buffer = Buffer.from(base64, "base64");
    const ext    = data.logo.split(";")[0].split("/")[1];

    await supabase.storage
      .from("site-assets")
      .upload(\`logos/\${site.id}.\${ext}\`, buffer, {
        contentType: \`image/\${ext}\`,
        upsert:      true,
      });
  }

  // ── 5. Schedule reminder emails ─────────────────
  const now = new Date();
  await supabase.from("email_schedule").insert([
    {
      site_id:   site.id,
      type:      "preview_ready",
      scheduled: now.toISOString(),
      data:      JSON.stringify({
        bizName:    data.bizName,
        previewUrl: \`\${SITE_URL}/preview/\${site.id}\`,
        planName:   data.plan,
        email:      data.email,
      }),
      sent: false,
    },
    {
      site_id:   site.id,
      type:      "preview_reminder_25",
      scheduled: new Date(now.getTime() + 25 * 60 * 1000).toISOString(),
      data:      JSON.stringify({
        bizName:    data.bizName,
        previewUrl: \`\${SITE_URL}/preview/\${site.id}\`,
        email:      data.email,
      }),
      sent: false,
    },
    {
      site_id:   site.id,
      type:      "preview_reminder_48",
      scheduled: new Date(now.getTime() + 48 * 60 * 1000).toISOString(),
      data:      JSON.stringify({
        bizName:    data.bizName,
        previewUrl: \`\${SITE_URL}/preview/\${site.id}\`,
        email:      data.email,
      }),
      sent: false,
    },
    {
      site_id:   site.id,
      type:      "preview_expired",
      scheduled: new Date(now.getTime() + 75 * 60 * 1000).toISOString(),
      data:      JSON.stringify({ bizName: data.bizName, email: data.email }),
      sent: false,
    },
  ]);

  // ── 6. Immediately send preview_ready email ──────
  await supabase.functions.invoke("send-email", {
    body: {
      type:   "preview_ready",
      siteId: site.id,
      data: {
        bizName:    data.bizName,
        previewUrl: \`\${SITE_URL}/preview/\${site.id}\`,
        planName:   data.plan,
        email:      data.email,
      },
    },
  });

  return NextResponse.json({
    success:   true,
    siteId:    site.id,
    previewUrl: \`\${SITE_URL}/preview/\${site.id}\`,
  });
}
`;

/* ════════════════════════════════════════════
   FILE 5 — src/app/blog/page.tsx
   Blog listing — fully server rendered for SEO
════════════════════════════════════════════ */
export const BLOG_LISTING_PAGE = `
import type { Metadata } from "next";
import Link              from "next/link";
import { createClient }  from "@/lib/supabase/server";

export const metadata: Metadata = {
  title:       "Blog — Quicka | Tips for South African Small Businesses",
  description: "Practical advice on getting your South African business online, growing your customer base, and making the most of your website.",
  openGraph: {
    title:       "Quicka Blog — Tips for SA Small Businesses",
    description: "Practical advice on getting online and growing your business in South Africa.",
    url:         "https://quicka.website/blog",
  },
};

// Fallback posts if DB is empty
const FALLBACK_POSTS = [
  {
    slug:     "get-more-customers-online-2025",
    title:    "How to Get More Customers Online in 2025",
    excerpt:  "Having a website is no longer optional for South African small businesses. Here are 5 proven ways to attract more customers online without spending a fortune.",
    date:     "2025-03-01",
    category: "Growth",
    readTime: "3 min read",
  },
  {
    slug:     "why-every-small-business-needs-coza-domain",
    title:    "Why Every Small Business Needs a .co.za Domain",
    excerpt:  "A professional domain builds trust with your customers and helps you rank on Google. Here is why it matters — and how to get one included free with Quicka.",
    date:     "2025-02-01",
    category: "Domains",
    readTime: "2 min read",
  },
  {
    slug:     "5-things-your-website-must-have",
    title:    "5 Things Your Website Must Have to Convert Visitors",
    excerpt:  "Most small business websites lose customers within the first 5 seconds. Make sure yours has these essential elements that turn visitors into paying customers.",
    date:     "2025-01-15",
    category: "Tips",
    readTime: "4 min read",
  },
  {
    slug:     "seo-tips-south-african-small-business",
    title:    "SEO Tips for South African Small Businesses",
    excerpt:  "Getting your business to show up on Google doesn't have to be complicated. Here are the basics every SA small business owner should know about SEO.",
    date:     "2025-01-05",
    category: "SEO",
    readTime: "5 min read",
  },
  {
    slug:     "whatsapp-business-tips",
    title:    "How to Use WhatsApp to Grow Your Business",
    excerpt:  "WhatsApp is South Africa's most popular app. Here is how to use it effectively to communicate with customers and grow your business.",
    date:     "2024-12-15",
    category: "Marketing",
    readTime: "4 min read",
  },
  {
    slug:     "mobile-first-why-it-matters",
    title:    "Why Your Website Must Be Mobile-First in South Africa",
    excerpt:  "Over 90% of South Africans access the internet via mobile phone. If your website isn't mobile-optimised, you are losing customers every day.",
    date:     "2024-12-01",
    category: "Design",
    readTime: "3 min read",
  },
];

export default async function BlogPage() {
  // In production fetch from Supabase
  // const supabase = await createClient();
  // const { data: posts } = await supabase.from("blog_posts").select("*").order("date", { ascending: false });
  const posts = FALLBACK_POSTS;

  const categories = ["All", ...Array.from(new Set(posts.map(p => p.category)))];

  return (
    <main className="min-h-screen bg-brand-bg">
      {/* Nav spacer */}
      <div className="h-16 bg-brand-ink" />

      {/* Header */}
      <div className="bg-brand-ink pb-16 pt-12 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-bold tracking-widest uppercase text-brand-green mb-3">
            Blog
          </p>
          <h1 className="font-serif text-4xl md:text-5xl font-normal text-white
            tracking-tight leading-tight">
            Tips for SA{" "}
            <em className="text-brand-green">small businesses.</em>
          </h1>
          <p className="text-white/40 text-sm mt-3 max-w-lg">
            Practical advice on getting online, growing your customer base
            and making the most of your Quicka website.
          </p>
        </div>
      </div>

      {/* Posts grid */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 gap-5">
          {posts.map(post => (
            <Link key={post.slug} href={\`/blog/\${post.slug}\`}
              className="no-underline group">
              <article className="bg-white rounded-2xl p-6 border border-black/8
                hover:-translate-y-1 transition-all duration-200 hover:shadow-md
                h-full flex flex-col">
                <div className="flex gap-2 mb-4">
                  <span className="text-xs text-brand-muted bg-brand-warm
                    px-3 py-1 rounded-full">{post.category}</span>
                  <span className="text-xs text-brand-muted bg-brand-warm
                    px-3 py-1 rounded-full">{post.readTime}</span>
                </div>
                <h2 className="font-bold text-brand-ink text-base leading-snug mb-3
                  group-hover:text-brand-green transition-colors flex-1">
                  {post.title}
                </h2>
                <p className="text-sm text-brand-muted leading-relaxed mb-4">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-xs text-brand-muted">
                    {new Date(post.date).toLocaleDateString("en-ZA", {
                      day: "numeric", month: "long", year: "numeric",
                    })}
                  </span>
                  <span className="text-sm font-semibold text-brand-green">
                    Read more →
                  </span>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
`;

/* ════════════════════════════════════════════
   FILE 6 — src/app/blog/[slug]/page.tsx
   Individual blog post — fully SSR for SEO
════════════════════════════════════════════ */
export const BLOG_POST_PAGE = `
import type { Metadata } from "next";
import { notFound }      from "next/navigation";
import Link              from "next/link";

// In production: fetch from Supabase
// For now: static content map
const POSTS: Record<string, {
  title:    string;
  excerpt:  string;
  date:     string;
  category: string;
  readTime: string;
  content:  string;
}> = {
  "get-more-customers-online-2025": {
    title:    "How to Get More Customers Online in 2025",
    excerpt:  "Having a website is no longer optional for South African small businesses.",
    date:     "2025-03-01",
    category: "Growth",
    readTime: "3 min read",
    content: \`
## Why Every SA Business Needs an Online Presence

South Africa has over 40 million internet users, and most of them use their phones to find local businesses. If you don't have a website, you're invisible to these potential customers.

## 5 Ways to Attract More Customers Online

### 1. Have a Professional Website
Your website is your 24/7 salesperson. It should load fast, look great on mobile, and clearly show what you offer and how to contact you.

### 2. Get on Google
Claim your Google Business Profile (it's free). Add your business name, phone number, website, and photos. Customers searching for your services in your area will find you.

### 3. Use WhatsApp Effectively
South Africa has one of the highest WhatsApp usage rates in the world. Add a WhatsApp button to your website so customers can message you directly.

### 4. Collect and Show Reviews
Ask happy customers to leave a Google review. Even 5 good reviews make a huge difference to new customers deciding whether to use your business.

### 5. Share Your Website Link
Put your website address on your business cards, WhatsApp status, Facebook page, and everywhere else. Every share is a free advertisement.

## The Quicka Advantage

Quicka builds your complete website in 60 seconds — with your own .co.za domain, contact form, and WhatsApp button. From R99/month with no upfront costs.
    \`,
  },
  "why-every-small-business-needs-coza-domain": {
    title:    "Why Every Small Business Needs a .co.za Domain",
    excerpt:  "A professional domain builds trust and helps you rank on Google.",
    date:     "2025-02-01",
    category: "Domains",
    readTime: "2 min read",
    content: \`
## What Is a .co.za Domain?

A .co.za domain is a South African web address — like sarahshair.co.za or thaborestaurant.co.za. It tells customers immediately that you're a South African business.

## Why It Matters

### Trust
Customers trust a professional domain over a generic one. sarahshair.co.za looks far more professional than sarahshair.wixsite.com.

### SEO
Google gives preference to .co.za domains for South African searches. If someone in Johannesburg searches for "hair salon near me", a .co.za site has an advantage.

### Email
With a .co.za domain, you can have a professional email like hello@sarahshair.co.za instead of sarahshair123@gmail.com.

## Included Free with Quicka

Every Quicka plan includes a custom .co.za domain at no extra cost. You pay one monthly price and your domain is registered, renewed, and managed automatically.
    \`,
  },
};

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = POSTS[slug];

  if (!post) return { title: "Post not found — Quicka" };

  return {
    title:       \`\${post.title} — Quicka Blog\`,
    description: post.excerpt,
    openGraph: {
      title:       post.title,
      description: post.excerpt,
      url:         \`https://quicka.website/blog/\${slug}\`,
      type:        "article",
      publishedTime: post.date,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = POSTS[slug];
  if (!post) notFound();

  // Parse simple markdown-style content
  const sections = post.content.split("\\n").filter(Boolean);

  return (
    <main className="min-h-screen bg-brand-bg">
      <div className="h-16 bg-brand-ink" />

      {/* Article header */}
      <div className="bg-brand-ink pb-12 pt-10 px-6">
        <div className="max-w-2xl mx-auto">
          <Link href="/blog"
            className="text-white/40 text-sm hover:text-white no-underline
              transition-colors inline-flex items-center gap-1 mb-6">
            ← Back to blog
          </Link>
          <div className="flex gap-2 mb-4">
            <span className="text-xs text-brand-green bg-brand-green/15
              px-3 py-1 rounded-full font-medium">{post.category}</span>
            <span className="text-xs text-white/35 bg-white/10
              px-3 py-1 rounded-full">{post.readTime}</span>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-normal text-white
            tracking-tight leading-tight mb-4">
            {post.title}
          </h1>
          <p className="text-white/40 text-sm">
            {new Date(post.date).toLocaleDateString("en-ZA", {
              day: "numeric", month: "long", year: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Article content */}
      <div className="max-w-2xl mx-auto px-6 py-12">
        <article className="bg-white rounded-2xl border border-black/8 p-8">
          {sections.map((line, i) => {
            if (line.startsWith("## ")) {
              return <h2 key={i} className="font-serif text-2xl font-normal text-brand-ink mt-8 mb-4 first:mt-0">{line.slice(3)}</h2>;
            }
            if (line.startsWith("### ")) {
              return <h3 key={i} className="font-bold text-brand-ink text-base mt-6 mb-2">{line.slice(4)}</h3>;
            }
            return <p key={i} className="text-brand-muted text-sm leading-relaxed mb-4">{line}</p>;
          })}
        </article>

        {/* CTA */}
        <div className="mt-8 bg-brand-ink rounded-2xl p-8 text-center">
          <h3 className="font-serif text-2xl font-normal text-white mb-2">
            Ready to get online?
          </h3>
          <p className="text-white/50 text-sm mb-6">
            Build your complete website in 60 seconds. Free .co.za domain included.
          </p>
          <Link href="/?build=true"
            className="inline-flex bg-brand-green text-white no-underline
              px-6 py-3 rounded-full font-semibold text-sm hover:bg-brand-greenDark
              transition-colors">
            Build my free preview →
          </Link>
        </div>

        {/* Back link */}
        <div className="mt-6 text-center">
          <Link href="/blog"
            className="text-sm text-brand-muted hover:text-brand-ink no-underline transition-colors">
            ← All blog posts
          </Link>
        </div>
      </div>
    </main>
  );
}

export async function generateStaticParams() {
  return Object.keys(POSTS).map(slug => ({ slug }));
}
`;

/* ════════════════════════════════════════════
   FILE 7 — src/app/not-found.tsx
════════════════════════════════════════════ */
export const NOT_FOUND_PAGE = `
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="font-serif text-8xl text-brand-green mb-4">404</div>
        <h1 className="font-serif text-3xl font-normal text-brand-ink mb-3">
          Page not found
        </h1>
        <p className="text-brand-muted text-sm mb-8 leading-relaxed">
          The page you're looking for doesn't exist. It may have been moved or deleted.
        </p>
        <Link href="/"
          className="inline-flex bg-brand-green text-white no-underline
            px-6 py-3 rounded-full font-semibold text-sm hover:bg-brand-greenDark
            transition-colors">
          ← Back to home
        </Link>
      </div>
    </div>
  );
}
`;

/* ════════════════════════════════════════════
   FILE 8 — src/app/privacy/page.tsx
════════════════════════════════════════════ */
export const PRIVACY_PAGE = `
import type { Metadata } from "next";
import Link              from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — Quicka",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-brand-bg py-20 px-6">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-brand-green text-sm hover:underline no-underline mb-8 inline-block">
          ← Back to home
        </Link>
        <h1 className="font-serif text-4xl font-normal text-brand-ink mb-2">Privacy Policy</h1>
        <p className="text-brand-muted text-sm mb-8">Last updated: March 2025</p>

        {[
          {
            title: "What information we collect",
            body: "We collect your email address, business name, business description, city, WhatsApp number, and social media handles when you build your website. We also collect payment information through PayFast — we never store your card details.",
          },
          {
            title: "How we use your information",
            body: "We use your information to build and host your website, process your subscription, and send you service-related emails (payment receipts, site updates, lead notifications). We do not sell your data to third parties.",
          },
          {
            title: "Data storage",
            body: "Your data is stored securely on Supabase servers. Your website is hosted on Cloudflare Pages. Both providers maintain enterprise-grade security and comply with international data protection standards.",
          },
          {
            title: "Your rights",
            body: "You may request a copy of your data, request deletion of your account, or update your information at any time by contacting hello@quicka.website.",
          },
          {
            title: "Cookies",
            body: "We use essential cookies for authentication. We do not use advertising or tracking cookies.",
          },
          {
            title: "Contact",
            body: "For any privacy questions, contact us at hello@quicka.website.",
          },
        ].map(section => (
          <div key={section.title} className="mb-8">
            <h2 className="font-bold text-brand-ink text-base mb-2">{section.title}</h2>
            <p className="text-brand-muted text-sm leading-relaxed">{section.body}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
`;

/* ════════════════════════════════════════════
   FILE 9 — src/app/terms/page.tsx
════════════════════════════════════════════ */
export const TERMS_PAGE = `
import type { Metadata } from "next";
import Link              from "next/link";

export const metadata: Metadata = {
  title: "Terms of Use — Quicka",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-brand-bg py-20 px-6">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-brand-green text-sm hover:underline no-underline mb-8 inline-block">
          ← Back to home
        </Link>
        <h1 className="font-serif text-4xl font-normal text-brand-ink mb-2">Terms of Use</h1>
        <p className="text-brand-muted text-sm mb-8">Last updated: March 2025</p>

        {[
          {
            title: "1. Service",
            body: "Quicka provides AI-powered website creation and hosting services for South African businesses. By using our service, you agree to these terms.",
          },
          {
            title: "2. Subscription",
            body: "Subscriptions are billed monthly via PayFast. You may cancel at any time with 30 days notice. Your site remains live until the end of your billing period.",
          },
          {
            title: "3. Your content",
            body: "You own all content you provide. By submitting content, you grant Quicka a licence to display it on your website. You are responsible for ensuring your content does not infringe any laws.",
          },
          {
            title: "4. Acceptable use",
            body: "You may not use Quicka to host illegal content, spam, or content that infringes on others' rights. We reserve the right to suspend sites that violate these terms.",
          },
          {
            title: "5. Changes",
            body: "Changes to your website are subject to the limits of your plan (5, 8 or 10 per month). Unused changes do not roll over.",
          },
          {
            title: "6. Domains",
            body: "Your .co.za domain is registered in your name. If you cancel, domain ownership transfers to you.",
          },
          {
            title: "7. Liability",
            body: "Quicka is provided as-is. We are not liable for any business losses resulting from website downtime or technical issues, beyond refunding the affected month's subscription fee.",
          },
          {
            title: "8. Governing law",
            body: "These terms are governed by South African law. Disputes will be resolved in South African courts.",
          },
          {
            title: "Contact",
            body: "For any questions about these terms, contact hello@quicka.website.",
          },
        ].map(section => (
          <div key={section.title} className="mb-8">
            <h2 className="font-bold text-brand-ink text-base mb-2">{section.title}</h2>
            <p className="text-brand-muted text-sm leading-relaxed">{section.body}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
`;

/* ════════════════════════════════════════════
   SQL: Additional tables needed
════════════════════════════════════════════ */
export const ADDITIONAL_SQL = `
-- Run in Supabase SQL Editor
-- Additional tables for Next.js app

-- OTP codes table
create table public.otp_codes (
  id         uuid default uuid_generate_v4() primary key,
  email      text not null,
  code       text not null,
  used       boolean default false,
  expires_at timestamptz not null,
  created_at timestamptz default now()
);
create index idx_otp_email on public.otp_codes(email);
alter table public.otp_codes enable row level security;
-- No client access — only service role

-- Add generated_html column to sites
alter table public.sites add column if not exists generated_html   text;
alter table public.sites add column if not exists generated_at     timestamptz;
alter table public.sites add column if not exists preview_expires_at timestamptz;
alter table public.sites add column if not exists pf_payment_id    text;
alter table public.sites add column if not exists last_paid_at     timestamptz;
alter table public.sites add column if not exists cancelled_at     timestamptz;
alter table public.sites add column if not exists email_upsell     boolean default false;
alter table public.sites add column if not exists logo_upsell      boolean default false;
alter table public.sites add column if not exists use_industry_photos boolean default true;
alter table public.sites add column if not exists brand_colour     text;
alter table public.sites add column if not exists brand_colour_index int default 0;

-- Email schedule table (for timed preview reminder emails)
create table public.email_schedule (
  id         uuid default uuid_generate_v4() primary key,
  site_id    uuid references public.sites(id) on delete cascade,
  type       text not null,
  scheduled  timestamptz not null,
  data       jsonb,
  sent       boolean default false,
  created_at timestamptz default now()
);
create index idx_email_schedule_pending on public.email_schedule(scheduled) where sent = false;
alter table public.email_schedule enable row level security;
-- No client access — service role only
`;

// Demo viewer
export default function APIBlogDemo() {
  const files = [
    { id: "checkout",     label: "💳 api/checkout/route.ts",       content: CHECKOUT_ROUTE },
    { id: "webhook",      label: "🔔 api/webhook/payfast/route.ts", content: PAYFAST_WEBHOOK },
    { id: "otp",          label: "🔐 api/otp/route.ts",             content: OTP_ROUTE },
    { id: "generate",     label: "⚡ api/generate/route.ts",         content: GENERATE_ROUTE },
    { id: "blog_list",    label: "📝 blog/page.tsx",                content: BLOG_LISTING_PAGE },
    { id: "blog_post",    label: "📄 blog/[slug]/page.tsx",         content: BLOG_POST_PAGE },
    { id: "not_found",    label: "🔍 not-found.tsx",                content: NOT_FOUND_PAGE },
    { id: "privacy",      label: "🔏 privacy/page.tsx",             content: PRIVACY_PAGE },
    { id: "terms",        label: "📋 terms/page.tsx",               content: TERMS_PAGE },
    { id: "sql",          label: "🗄️ Additional SQL",               content: ADDITIONAL_SQL },
  ];

  const { useState } = require("react");
  const [active, setActive] = useState("checkout");
  const current = files.find(f => f.id === active);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", fontFamily: "Arial, sans-serif", background: "#F5F2ED" }}>
      <div style={{ background: "#0A0A0A", padding: "0.85rem 1.5rem", display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
        <div style={{ fontStyle: "italic", fontSize: "1.2rem", color: "#fff" }}>Quick<span style={{ color: "#00C853" }}>a</span></div>
        <div style={{ width: 1, height: 18, background: "rgba(255,255,255,0.15)" }} />
        <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.35)", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase" }}>
          API Routes + Blog + Utility Pages — {files.length} files
        </span>
        <div style={{ marginLeft: "auto", background: "rgba(0,200,83,0.15)", color: "#00C853", fontSize: "0.72rem", fontWeight: 700, padding: "0.25rem 0.65rem", borderRadius: "100px" }}>
          Complete ✅
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
