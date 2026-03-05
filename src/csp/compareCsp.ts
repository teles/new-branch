/**
 * @module csp/compareCsp
 *
 * Compares two {@link CspPolicy} objects and produces a {@link CspDiff}
 * that annotates every directive and every value with a {@link DiffStatus}.
 *
 * @remarks
 * Comparison rules:
 * - Directive matching is done by directive name (case-sensitive after
 *   parsing, which normalizes names to lower-case).
 * - A directive present only in `csp1` has status `"removed"`.
 * - A directive present only in `csp2` has status `"added"`.
 * - A directive present in both has status `"unchanged"` at the directive
 *   level; individual values may still be `"added"` or `"removed"`.
 * - Value matching within a directive is also by exact string equality.
 *
 * Ordering of directives in the output:
 * 1. All directives from `csp1` in their original order
 *    (with status `"unchanged"` or `"removed"`).
 * 2. Any directives that are new in `csp2` (status `"added"`),
 *    appended in their `csp2` order.
 *
 * Ordering of values within a directive:
 * 1. Values from `csp1` first (in order), annotated as `"unchanged"` or `"removed"`.
 * 2. Values that are new in `csp2` (status `"added"`), appended in `csp2` order.
 */

import type { CspPolicy, CspDiff, CspDirectiveDiff, CspItemDiff } from "@/csp/types.js";

/**
 * Compares two parsed CSP policies and returns a structured diff.
 *
 * @param csp1 - The original (baseline) policy.
 * @param csp2 - The updated policy to compare against `csp1`.
 * @returns A {@link CspDiff} annotating every directive and value.
 *
 * @example
 * ```ts
 * const csp1 = parseCsp("default-src 'self'; img-src 'self'");
 * const csp2 = parseCsp("default-src 'self' 'unsafe-inline'; script-src 'self'");
 * const diff = compareCsp(csp1, csp2);
 * // diff.directives[0] → { name: "default-src", status: "unchanged", items: [
 * //   { value: "'self'",          status: "unchanged" },
 * //   { value: "'unsafe-inline'", status: "added"     },
 * // ]}
 * // diff.directives[1] → { name: "img-src", status: "removed", items: [
 * //   { value: "'self'", status: "removed" },
 * // ]}
 * // diff.directives[2] → { name: "script-src", status: "added", items: [
 * //   { value: "'self'", status: "added" },
 * // ]}
 * ```
 */
export function compareCsp(csp1: CspPolicy, csp2: CspPolicy): CspDiff {
  const csp2Map = new Map(csp2.map((d) => [d.name, d]));
  const csp1Names = new Set(csp1.map((d) => d.name));

  const directives: CspDirectiveDiff[] = [];

  // Step 1: Walk CSP 1 directives in order.
  for (const d1 of csp1) {
    const d2 = csp2Map.get(d1.name);

    if (!d2) {
      // Directive was removed in CSP 2.
      directives.push({
        name: d1.name,
        status: "removed",
        items: d1.values.map((v): CspItemDiff => ({ value: v, status: "removed" })),
      });
    } else {
      // Directive exists in both; diff the values.
      const v2Set = new Set(d2.values);
      const items: CspItemDiff[] = [];

      // Values from CSP 1: unchanged or removed.
      for (const v of d1.values) {
        items.push({ value: v, status: v2Set.has(v) ? "unchanged" : "removed" });
      }

      // Values new in CSP 2: added.
      const v1Set = new Set(d1.values);
      for (const v of d2.values) {
        if (!v1Set.has(v)) {
          items.push({ value: v, status: "added" });
        }
      }

      directives.push({
        name: d1.name,
        status: "unchanged",
        items,
      });
    }
  }

  // Step 2: Append directives that are new in CSP 2 (in CSP 2 order).
  for (const d2 of csp2) {
    if (!csp1Names.has(d2.name)) {
      directives.push({
        name: d2.name,
        status: "added",
        items: d2.values.map((v): CspItemDiff => ({ value: v, status: "added" })),
      });
    }
  }

  return { directives };
}
