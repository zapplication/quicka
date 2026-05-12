/**
 * POST /api/domains/register
 *
 * Server-only endpoint that registers a domain via the Absolute Hosting API.
 *
 * **This endpoint should ONLY be called from the PayFast webhook** (after
 * payment confirmation), not from the user's browser. To enforce that, every
 * request must include an `x-internal-secret` header matching
 * `INTERNAL_API_SECRET` env var. Any request without this is rejected.
 *
 * Body:
 *   {
 *     domain: string,                 // "sarahshair.co.za"
 *     period: 1 | 2 | 5 | 10,
 *     contact: DomainContact,
 *     nameservers?: string[]          // optional, defaults to Cloudflare/AH defaults
 *   }
 *
 * Returns:
 *   { registered: boolean, domain: string, providerReference?: string, error?: string }
 *
 * Security model:
 *   - Auth via shared secret in header (rotated regularly via Vercel env)
 *   - Input validation rejects malformed contact records
 *   - All calls are logged (without credentials) for audit
 *   - Idempotent: if domain is already registered to us, returns success
 */

import { NextRequest, NextResponse } from "next/server";
import { getRegistrar } from "@/lib/registrar";
import type { RegistrationInput } from "@/lib/registrar";

export const runtime = "nodejs";

const INTERNAL_SECRET = process.env.INTERNAL_API_SECRET ?? "";

function isAuthorised(req: NextRequest): boolean {
  if (!INTERNAL_SECRET) return false; // no secret configured = always reject
  const provided = req.headers.get("x-internal-secret");
  if (!provided) return false;
  // constant-time compare
  if (provided.length !== INTERNAL_SECRET.length) return false;
  let mismatch = 0;
  for (let i = 0; i < provided.length; i++) {
    mismatch |= provided.charCodeAt(i) ^ INTERNAL_SECRET.charCodeAt(i);
  }
  return mismatch === 0;
}

function validateInput(body: unknown): RegistrationInput | { error: string } {
  if (!body || typeof body !== "object") return { error: "Invalid body" };
  const b = body as Record<string, unknown>;

  if (typeof b.domain !== "string" || !/^[a-z0-9-]+\.[a-z.]+$/i.test(b.domain.trim())) {
    return { error: "domain is required and must be a valid hostname" };
  }
  if (![1, 2, 5, 10].includes(Number(b.period))) {
    return { error: "period must be one of 1, 2, 5, 10" };
  }

  const c = b.contact as Record<string, unknown> | undefined;
  if (!c || typeof c !== "object") return { error: "contact is required" };

  const requiredStringFields: Array<keyof RegistrationInput["contact"]> = [
    "firstName",
    "lastName",
    "email",
    "addressLine1",
    "city",
    "province",
    "postalCode",
    "countryCode",
    "contactNumber",
    "userReference",
  ];

  for (const field of requiredStringFields) {
    const v = c[field];
    if (typeof v !== "string" || v.trim().length === 0) {
      return { error: `contact.${field} is required` };
    }
  }

  return {
    domain: (b.domain as string).trim().toLowerCase(),
    period: Number(b.period) as 1 | 2 | 5 | 10,
    contact: c as unknown as RegistrationInput["contact"],
    nameservers: Array.isArray(b.nameservers)
      ? (b.nameservers as unknown[]).filter((s) => typeof s === "string") as string[]
      : undefined,
  };
}

export async function POST(req: NextRequest) {
  if (!isAuthorised(req)) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const validated = validateInput(body);
  if ("error" in validated) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  try {
    const registrar = getRegistrar();
    const result = await registrar.register(validated);

    // Log without credentials or full contact PII
    console.log("[/api/domains/register]", {
      domain: result.domain,
      registered: result.registered,
      providerReference: result.providerReference,
    });

    if (!result.registered) {
      return NextResponse.json(result, { status: 422 });
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("[/api/domains/register] error:", err);
    return NextResponse.json(
      {
        registered: false,
        domain: validated.domain,
        error: "Internal error during registration",
      },
      { status: 500 }
    );
  }
}
