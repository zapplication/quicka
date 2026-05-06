/**
 * Tiny SOAP client tailored to Absolute Hosting's API_GENERAL.asmx.
 *
 * Why hand-rolled instead of the `soap` npm package?
 *   - No new runtime dep
 *   - All API_GENERAL methods follow the same shape (zadomains_username,
 *     zadomains_password, fieldvalues), so a generic `call()` covers them all
 *   - Response unwrapping is mechanical (always `<MethodResponse><MethodResult>`)
 *
 * If we later integrate with a registrar with more varied API shapes, we can
 * graduate to a fuller SOAP library.
 */

const DEFAULT_API_URL =
  process.env.ABSOLUTE_HOSTING_API_URL ||
  "https://www.zadomains.net/api/API_GENERAL.asmx";
const DEFAULT_TIMEOUT_MS = 15000;
const NAMESPACE = "http://tempuri.org/";

export interface SoapCallOptions {
  username: string;
  password: string;
  apiUrl?: string;
  timeoutMs?: number;
}

export class SoapError extends Error {
  status: number;
  raw: string;
  constructor(message: string, status: number, raw: string) {
    super(message);
    this.name = "SoapError";
    this.status = status;
    this.raw = raw;
  }
}

/**
 * Encode a value for safe inclusion inside a SOAP envelope's text node.
 * Escapes the five XML special characters; nothing else.
 */
function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Decode the five XML entities in a result string.
 */
function unescapeXml(value: string): string {
  return value
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&gt;/g, ">")
    .replace(/&lt;/g, "<")
    .replace(/&amp;/g, "&");
}

/**
 * Build a SOAP 1.1 envelope for one API_GENERAL operation.
 */
function buildEnvelope(
  method: string,
  username: string,
  password: string,
  fieldvalues: string
): string {
  return [
    `<?xml version="1.0" encoding="utf-8"?>`,
    `<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">`,
    `<soap:Body>`,
    `<${method} xmlns="${NAMESPACE}">`,
    `<zadomains_username>${escapeXml(username)}</zadomains_username>`,
    `<zadomains_password>${escapeXml(password)}</zadomains_password>`,
    `<fieldvalues>${escapeXml(fieldvalues)}</fieldvalues>`,
    `</${method}>`,
    `</soap:Body>`,
    `</soap:Envelope>`,
  ].join("");
}

/**
 * Extract the inner `<MethodResult>...</MethodResult>` text from a SOAP response.
 * Returns the unescaped string or throws a SoapError if the structure is wrong.
 */
function extractResult(xml: string, method: string): string {
  // Match either <MethodResult>...</MethodResult> or
  // <MethodResult/> (empty result).
  const fullPattern = new RegExp(
    `<${method}Result(?:\\s+[^>]*)?>([\\s\\S]*?)</${method}Result>`,
    "i"
  );
  const match = xml.match(fullPattern);
  if (match) return unescapeXml(match[1]);

  const emptyPattern = new RegExp(`<${method}Result(?:\\s+[^>]*)?\\s*/>`, "i");
  if (emptyPattern.test(xml)) return "";

  // SOAP fault?
  const faultMatch = xml.match(/<faultstring[^>]*>([\s\S]*?)<\/faultstring>/i);
  if (faultMatch) {
    throw new SoapError(`SOAP fault: ${unescapeXml(faultMatch[1])}`, 200, xml);
  }

  throw new SoapError(
    `Could not extract <${method}Result> from response`,
    200,
    xml.slice(0, 1000)
  );
}

/**
 * Make one SOAP call to API_GENERAL.asmx and return the unwrapped result string.
 *
 * Most operations on Absolute Hosting return a result string in a custom
 * format — sometimes JSON, sometimes pipe-delimited, sometimes plain text.
 * The caller is responsible for parsing the result; this function just gets
 * the bytes off the wire.
 */
export async function soapCall(
  method: string,
  fieldvalues: string,
  options: SoapCallOptions
): Promise<string> {
  const apiUrl = options.apiUrl ?? DEFAULT_API_URL;
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  const envelope = buildEnvelope(method, options.username, options.password, fieldvalues);
  const soapAction = `${NAMESPACE}${method}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
        "SOAPAction": `"${soapAction}"`,
      },
      body: envelope,
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timer);
    if ((err as Error).name === "AbortError") {
      throw new SoapError(`SOAP request timed out after ${timeoutMs}ms`, 0, "");
    }
    throw new SoapError(`SOAP network error: ${(err as Error).message}`, 0, "");
  }
  clearTimeout(timer);

  const text = await response.text();
  if (!response.ok) {
    throw new SoapError(`SOAP HTTP ${response.status}`, response.status, text.slice(0, 1000));
  }

  return extractResult(text, method);
}

/**
 * Build a pipe-delimited fieldvalues string from an ordered array of values.
 *
 * Sanitises each value to remove '|' characters (replaced with a hyphen)
 * since pipes break Absolute Hosting's parser. Empty / undefined values
 * become empty strings, preserving positional ordering.
 *
 * NOTE: never use this for passwords or secrets — those go in the
 * zadomains_password element, not in fieldvalues.
 */
export function pipeJoin(parts: Array<string | number | boolean | undefined | null>): string {
  return parts
    .map((v) => {
      if (v === undefined || v === null) return "";
      const s = String(v);
      // Replace pipes (rare but possible in user input like company names)
      // with a hyphen rather than rejecting — better UX than a silent failure.
      return s.includes("|") ? s.replace(/\|/g, "-") : s;
    })
    .join("|");
}

/**
 * Parse a pipe-delimited result back into an array of values.
 * Handles trailing empty fields correctly (which String.split silently drops
 * for some patterns but preserves with regex).
 */
export function pipeSplit(value: string): string[] {
  return value.split("|");
}
