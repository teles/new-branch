/**
 * @module csp/parseCsp
 *
 * Parses a raw Content Security Policy header string into a structured
 * {@link CspPolicy} (an ordered list of {@link CspDirective} objects).
 *
 * @remarks
 * Parsing rules:
 * - Directives are separated by semicolons (`;`).
 * - Within each directive, the first token (case-insensitive, normalized to
 *   lower-case) is the directive name; the remaining tokens are its values.
 * - Leading/trailing whitespace around tokens is ignored.
 * - Empty segments (e.g. trailing semicolons) are skipped.
 * - Duplicate directive names are preserved in order (the standard says the
 *   first occurrence wins, but for comparison purposes we keep all).
 */

import type { CspPolicy, CspDirective } from "@/csp/types.js";

/**
 * Parses a raw CSP header string into an ordered list of directives.
 *
 * @param csp - The raw `Content-Security-Policy` header value, e.g.
 *              `"default-src 'self'; img-src 'self' https://cdn.example.com"`.
 * @returns An ordered {@link CspPolicy} array.
 *
 * @example
 * ```ts
 * parseCsp("default-src 'self'; img-src 'self' https://cdn.example.com");
 * // [
 * //   { name: "default-src", values: ["'self'"] },
 * //   { name: "img-src",     values: ["'self'", "https://cdn.example.com"] }
 * // ]
 * ```
 */
export function parseCsp(csp: string): CspPolicy {
  return csp
    .split(";")
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0)
    .map((segment): CspDirective => {
      const tokens = segment.split(/\s+/).filter((t) => t.length > 0);
      const name = tokens[0].toLowerCase();
      const values = tokens.slice(1);
      return { name, values };
    });
}
