/**
 * Public registrar interface.
 *
 * The rest of the app imports from here — never directly from `./absolute`.
 * If we swap providers later (e.g. switch to Domains.co.za), only this
 * file changes.
 *
 * Usage:
 *   import { getRegistrar } from "@/lib/registrar";
 *   const registrar = getRegistrar();
 *   const result = await registrar.checkAvailability("sarahshair.co.za");
 */

import { AbsoluteHostingRegistrar } from "./absolute";
import type {
  AvailabilityResult,
  DomainInfo,
  RegistrationInput,
  RegistrationResult,
  RenewalResult,
} from "./types";

export interface Registrar {
  checkAvailability(domain: string): Promise<AvailabilityResult>;
  register(input: RegistrationInput): Promise<RegistrationResult>;
  renew(domain: string, period?: number): Promise<RenewalResult>;
  setNameservers(domain: string, nameservers: string[]): Promise<void>;
  setAutoRenew(domain: string, enabled: boolean): Promise<void>;
  setLock(domain: string, locked: boolean): Promise<void>;
  sendAuthCode(domain: string): Promise<void>;
  getDomainInfo(domain: string): Promise<DomainInfo>;
  listDomains(): Promise<string[]>;
}

let cached: Registrar | null = null;

/**
 * Returns the configured registrar singleton. Lazy-init so we don't fail
 * at module load time if env vars are missing — only on first use.
 */
export function getRegistrar(): Registrar {
  if (!cached) {
    cached = new AbsoluteHostingRegistrar();
  }
  return cached;
}

/** Reset for testing. Don't call this in production code. */
export function _resetRegistrar(): void {
  cached = null;
}

export type {
  AvailabilityResult,
  DomainContact,
  DomainInfo,
  RegistrationInput,
  RegistrationResult,
  RenewalResult,
} from "./types";
