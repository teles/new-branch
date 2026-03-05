/**
 * @module csp/formatCspDiff
 *
 * Formats a {@link CspDiff} or {@link CspMergedPolicy} as a human-readable
 * string suitable for terminal output.
 *
 * @remarks
 * Legend:
 * - `[+]` — directive or value added in CSP 2.
 * - `[-]` — directive or value removed in CSP 2.
 * - `    ` — directive or value unchanged.
 *
 * For directives that are unchanged at the directive level but have
 * item-level changes, the directive line itself is printed without a prefix,
 * and each value is individually prefixed.
 */

import type { CspDiff } from "@/csp/types.js";

/**
 * Formats a {@link CspDiff} as a human-readable diff string.
 *
 * @remarks
 * Each directive is printed as one or more lines:
 * - A fully added directive is shown as a single `[+] name value…` line.
 * - A fully removed directive is shown as a single `[-] name value…` line.
 * - A directive whose values changed is shown with the directive name on its
 *   own line, followed by one indented `[+]`, `[-]`, or `   ` line per value.
 * - An unchanged directive (no item changes either) is shown as a single
 *   `    name value…` line.
 *
 * @param diff - The diff produced by {@link compareCsp}.
 * @returns A multi-line string ready to be printed to stdout.
 *
 * @example
 * ```
 *     default-src 'self'
 * [-] img-src 'self' https://cdn.example.com
 * [+] script-src 'self' 'unsafe-inline'
 *     style-src:
 *        'self'
 *    [+] 'unsafe-inline'
 * ```
 */
export function formatCspDiff(diff: CspDiff): string {
  const lines: string[] = [];

  if (diff.directives.length === 0) {
    lines.push("  (no directives)");
    return lines.join("\n");
  }

  for (const directive of diff.directives) {
    const valuesStr = directive.items.map((i) => i.value).join(" ");
    const nameAndValues = valuesStr ? `${directive.name} ${valuesStr}` : directive.name;

    if (directive.status === "added") {
      // Entire directive is new.
      lines.push(`[+] ${nameAndValues}`);
    } else if (directive.status === "removed") {
      // Entire directive was dropped.
      lines.push(`[-] ${nameAndValues}`);
    } else {
      // Directive is unchanged at the top level; check whether any items changed.
      const hasItemChanges = directive.items.some((i) => i.status !== "unchanged");

      if (!hasItemChanges) {
        // Fully unchanged: single compact line.
        lines.push(`    ${nameAndValues}`);
      } else {
        // Mixed item statuses: show directive name header, then per-value lines.
        lines.push(`    ${directive.name}:`);
        for (const item of directive.items) {
          if (item.status === "added") {
            lines.push(`[+]   ${item.value}`);
          } else if (item.status === "removed") {
            lines.push(`[-]   ${item.value}`);
          } else {
            lines.push(`      ${item.value}`);
          }
        }
      }
    }
  }

  return lines.join("\n");
}

/**
 * Returns a short legend string explaining the diff symbols.
 *
 * @returns A human-readable legend.
 */
export function formatCspDiffLegend(): string {
  return ["[+] added   — present in CSP 2 but not in CSP 1", "[-] removed — present in CSP 1 but not in CSP 2", "    unchanged"].join(
    "\n",
  );
}
