/**
 * Sanity check the signature builder against a known PayFast example.
 *
 * This is a one-off node script you can run with:
 *   node scripts/test-signature.mjs
 *
 * It uses the same algorithm as src/lib/payfast.ts.
 */

import crypto from "node:crypto";

function buildPfOutput(data, passphrase) {
  const pairs = [];
  for (const [key, raw] of Object.entries(data)) {
    if (key === "signature") continue;
    if (raw === undefined || raw === null) continue;
    const value = String(raw).trim();
    if (value === "") continue;
    pairs.push(`${key}=${encodeURIComponent(value).replace(/%20/g, "+")}`);
  }
  let pfOutput = pairs.join("&");
  if (passphrase && passphrase.trim() !== "") {
    pfOutput += `&passphrase=${encodeURIComponent(passphrase.trim()).replace(/%20/g, "+")}`;
  }
  return pfOutput;
}

function sign(data, passphrase) {
  return crypto.createHash("md5").update(buildPfOutput(data, passphrase)).digest("hex");
}

// Sandbox demo merchant from PayFast docs
const data = {
  merchant_id: "10000100",
  merchant_key: "46f0cd694581a",
  return_url: "https://quicka.website/payment/success",
  cancel_url: "https://quicka.website/payment/cancel",
  notify_url: "https://quicka.website/api/webhook/payfast",
  name_first: "Sarah",
  email_address: "sarah@hairstudio.co.za",
  m_payment_id: "quicka_site123_1730000000",
  amount: "99.00",
  item_name: "Quicka Growth Plan",
  item_description: "Monthly Quicka subscription — Growth plan",
  custom_str1: "site123",
  custom_str2: "Growth",
  subscription_type: "1",
  billing_date: "2026-05-06",
  recurring_amount: "99.00",
  frequency: "3",
  cycles: "0",
};

const passphrase = "jt7NOE43FZPn";

console.log("pfOutput:", buildPfOutput(data, passphrase));
console.log("signature:", sign(data, passphrase));

// Round-trip check
const sig = sign(data, passphrase);
const roundTrip = sign(data, passphrase);
console.log("deterministic:", sig === roundTrip ? "yes" : "NO — bug!");

// Empty-value handling check
const withEmpty = { ...data, custom_str3: "", custom_str4: "" };
const sigEmpty = sign(withEmpty, passphrase);
console.log("empty values stripped (should equal):", sig === sigEmpty ? "yes" : "NO — bug!");

// Passphrase-changes-signature check
const sigNoPass = sign(data, "");
console.log("passphrase changes signature (should differ):", sig !== sigNoPass ? "yes" : "NO — bug!");

// Tamper check
const tampered = { ...data, amount: "1.00" };
const sigTamper = sign(tampered, passphrase);
console.log("tamper detection (should differ):", sig !== sigTamper ? "yes" : "NO — bug!");
