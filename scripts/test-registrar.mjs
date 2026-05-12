#!/usr/bin/env node
/**
 * Smoke test for the Absolute Hosting registrar integration.
 *
 * Run locally:
 *   ABSOLUTE_HOSTING_USERNAME=DUTO5772 \
 *   ABSOLUTE_HOSTING_PASSWORD=*** \
 *   node scripts/test-registrar.mjs
 *
 * What it does (read-only — never registers anything):
 *   1. ZACR WHOIS check on a known-taken domain (google.co.za)
 *   2. ZACR WHOIS check on a likely-available domain (random UUID + .co.za)
 *   3. SOAP smoke test: list our reseller's domains via Domain_SelectAll
 *      (read-only, billed nothing)
 *
 * Expected output: three ✓ lines. Any ✗ means the integration needs
 * attention before going to production.
 *
 * No side effects. Safe to run repeatedly.
 */

import { connect } from "node:net";
import { randomUUID } from "node:crypto";

// ───────────────────────────────────────────────────────────────────────────
// Config
// ───────────────────────────────────────────────────────────────────────────

const WHOIS_HOST = "whois.registry.net.za";
const WHOIS_PORT = 43;
const API_URL = process.env.ABSOLUTE_HOSTING_API_URL || "https://www.zadomains.net/api/API_GENERAL.asmx";
const USER = process.env.ABSOLUTE_HOSTING_USERNAME;
const PASS = process.env.ABSOLUTE_HOSTING_PASSWORD;

const ok = (msg) => console.log(`\x1b[32m✓\x1b[0m ${msg}`);
const fail = (msg) => console.log(`\x1b[31m✗\x1b[0m ${msg}`);
const info = (msg) => console.log(`\x1b[2m  ${msg}\x1b[0m`);

// ───────────────────────────────────────────────────────────────────────────
// WHOIS
// ───────────────────────────────────────────────────────────────────────────

function whoisQuery(domain, timeoutMs = 8000) {
  return new Promise((resolve, reject) => {
    const socket = connect({ host: WHOIS_HOST, port: WHOIS_PORT });
    const chunks = [];
    const t = setTimeout(() => {
      socket.destroy();
      reject(new Error(`WHOIS timeout after ${timeoutMs}ms`));
    }, timeoutMs);
    socket.on("connect", () => socket.write(`${domain}\r\n`));
    socket.on("data", (c) => chunks.push(c));
    socket.on("end", () => {
      clearTimeout(t);
      resolve(Buffer.concat(chunks).toString("utf8"));
    });
    socket.on("error", (e) => {
      clearTimeout(t);
      reject(e);
    });
  });
}

function classify(raw) {
  const t = raw.toLowerCase();
  if (t.includes("throttle") || t.includes("rate limit")) return "rate-limited";
  if (t.includes("domain name:") || t.includes("registrant:") || t.includes("registrar:")) return "taken";
  if (
    t.includes("available") || t.includes("no data found") ||
    t.includes("no entries found") || t.includes("not registered")
  ) return "available";
  return "unknown";
}

// ───────────────────────────────────────────────────────────────────────────
// SOAP
// ───────────────────────────────────────────────────────────────────────────

function escapeXml(v) {
  return String(v)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

async function soapCall(method, fieldvalues) {
  if (!USER || !PASS) {
    throw new Error("Set ABSOLUTE_HOSTING_USERNAME and ABSOLUTE_HOSTING_PASSWORD env vars");
  }
  const envelope =
    `<?xml version="1.0" encoding="utf-8"?>` +
    `<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">` +
    `<soap:Body>` +
    `<${method} xmlns="http://tempuri.org/">` +
    `<zadomains_username>${escapeXml(USER)}</zadomains_username>` +
    `<zadomains_password>${escapeXml(PASS)}</zadomains_password>` +
    `<fieldvalues>${escapeXml(fieldvalues)}</fieldvalues>` +
    `</${method}>` +
    `</soap:Body>` +
    `</soap:Envelope>`;

  const r = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
      "SOAPAction": `"http://tempuri.org/${method}"`,
    },
    body: envelope,
  });
  const text = await r.text();
  if (!r.ok) {
    throw new Error(`HTTP ${r.status}: ${text.slice(0, 200)}`);
  }
  // Extract <MethodResult>...</MethodResult>
  const m = text.match(new RegExp(`<${method}Result[^>]*>([\\s\\S]*?)</${method}Result>`, "i"));
  if (!m) {
    const fault = text.match(/<faultstring[^>]*>([\s\S]*?)<\/faultstring>/i);
    if (fault) throw new Error(`SOAP fault: ${fault[1]}`);
    throw new Error(`Could not extract result from response`);
  }
  return m[1]
    .replace(/&apos;/g, "'").replace(/&quot;/g, '"')
    .replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&amp;/g, "&");
}

// ───────────────────────────────────────────────────────────────────────────
// Tests
// ───────────────────────────────────────────────────────────────────────────

async function runTests() {
  console.log("\nRegistrar integration smoke test\n" + "─".repeat(40));

  // Test 1 — WHOIS taken
  try {
    const raw = await whoisQuery("google.co.za");
    const verdict = classify(raw);
    if (verdict === "taken") {
      ok("ZACR WHOIS: google.co.za correctly reports as taken");
    } else {
      fail(`ZACR WHOIS: google.co.za reported as "${verdict}" (expected "taken")`);
      info(`raw response: ${raw.slice(0, 200)}…`);
    }
  } catch (e) {
    fail(`ZACR WHOIS taken-check: ${e.message}`);
  }

  // Test 2 — WHOIS available
  const randomName = `quicka-test-${randomUUID().slice(0, 8)}.co.za`;
  try {
    const raw = await whoisQuery(randomName);
    const verdict = classify(raw);
    if (verdict === "available") {
      ok(`ZACR WHOIS: ${randomName} correctly reports as available`);
    } else if (verdict === "rate-limited") {
      fail(`ZACR WHOIS: rate-limited. Wait a few seconds and retry.`);
    } else {
      fail(`ZACR WHOIS: ${randomName} reported as "${verdict}" (expected "available")`);
      info(`raw response: ${raw.slice(0, 200)}…`);
    }
  } catch (e) {
    fail(`ZACR WHOIS available-check: ${e.message}`);
  }

  // Test 3 — SOAP read-only call
  if (!USER || !PASS) {
    info("Skipping SOAP test: ABSOLUTE_HOSTING_USERNAME / _PASSWORD not set");
    info("Set them and rerun to validate Absolute Hosting connectivity.");
    return;
  }

  try {
    const raw = await soapCall("Domain_SelectAll", "");
    ok(`Absolute Hosting SOAP: Domain_SelectAll responded (${raw.length} chars)`);
    info(`first 200 chars: ${raw.slice(0, 200).replace(/\n/g, " ")}…`);
  } catch (e) {
    fail(`Absolute Hosting SOAP: ${e.message}`);
    info("Check that USERNAME and PASSWORD are correct and not URL-encoded.");
    info("If 'Auth' or 'Login' shows in the error, the password rotation may not have applied yet.");
  }

  console.log("─".repeat(40) + "\nDone.\n");
}

runTests().catch((e) => {
  console.error("\nUnexpected error:", e);
  process.exit(1);
});
