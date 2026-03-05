/**
 * @module csp/mergeCsp
 *
 * Builds a {@link CspMergedPolicy} — the "third CSP" — from a {@link CspDiff}.
 *
 * @remarks
 * The merged policy is a combined view of two CSPs where every directive and
 * every value carries:
 * - a {@link DiffStatus} (`"unchanged"`, `"added"`, or `"removed"`) so UIs
 *   can highlight new or deleted entries.
 * - a `disabled` flag, defaulting to `false`, that callers can toggle to
 *   exclude specific items from the exported output.
 *
 * By default:
 * - `"removed"` directives and values start as `disabled: true` (they were
 *   dropped in the updated policy and should not appear in the export unless
 *   the user explicitly re-enables them).
 * - `"added"` and `"unchanged"` entries start as `disabled: false`.
 *
 * ### Exporting
 * {@link exportMergedPolicy} converts a {@link CspMergedPolicy} back to a
 * valid CSP header string, skipping any disabled directives or values.
 */

import type { CspDiff, CspMergedPolicy, CspMergedDirective, CspMergedItem } from "@/csp/types.js";

/**
 * Builds a {@link CspMergedPolicy} from a {@link CspDiff}.
 *
 * @remarks
 * `"removed"` entries are pre-disabled so that the default export reflects
 * the updated policy (CSP 2), while still displaying the removed items in
 * the merged view so users are aware of the changes.
 *
 * @param diff - The result of {@link compareCsp}.
 * @returns A {@link CspMergedPolicy} ready for display and export.
 *
 * @example
 * ```ts
 * const diff = compareCsp(parseCsp("default-src 'self'"), parseCsp("default-src *"));
 * const merged = buildMergedPolicy(diff);
 * // merged.directives[0].items →
 * //   { value: "'self'", status: "removed", disabled: true  },
 * //   { value: "*",      status: "added",   disabled: false },
 * ```
 */
export function buildMergedPolicy(diff: CspDiff): CspMergedPolicy {
  const directives: CspMergedDirective[] = diff.directives.map((d): CspMergedDirective => {
    const items: CspMergedItem[] = d.items.map((item): CspMergedItem => ({
      value: item.value,
      status: item.status,
      disabled: item.status === "removed",
    }));

    return {
      name: d.name,
      status: d.status,
      disabled: d.status === "removed",
      items,
    };
  });

  return { directives };
}

/**
 * Exports a {@link CspMergedPolicy} to a valid CSP header string.
 *
 * @remarks
 * - Directives with `disabled: true` are skipped entirely.
 * - Within each directive, values with `disabled: true` are skipped.
 * - Directives that have no enabled values are still included
 *   (e.g. `upgrade-insecure-requests` has no values by design).
 * - Directives are joined by `"; "` and values within each directive by `" "`.
 *
 * @param merged - The merged policy to export.
 * @returns A CSP header string, or an empty string if all directives are disabled.
 *
 * @example
 * ```ts
 * const policy = buildMergedPolicy(diff);
 * // Disable a specific value
 * policy.directives[0].items[0].disabled = true;
 * const header = exportMergedPolicy(policy);
 * ```
 */
export function exportMergedPolicy(merged: CspMergedPolicy): string {
  const parts = merged.directives
    .filter((d) => !d.disabled)
    .map((d) => {
      const enabledValues = d.items.filter((item) => !item.disabled).map((item) => item.value);
      return enabledValues.length > 0 ? `${d.name} ${enabledValues.join(" ")}` : d.name;
    });

  return parts.join("; ");
}
