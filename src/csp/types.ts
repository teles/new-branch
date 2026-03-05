/**
 * @module csp/types
 *
 * Core types for the CSP (Content Security Policy) comparison system.
 *
 * @remarks
 * A CSP header string like:
 *   `"default-src 'self'; img-src 'self' https://cdn.example.com"`
 * is parsed into a {@link CspPolicy} — an ordered list of
 * {@link CspDirective} objects, each containing a directive name and its values.
 *
 * Two policies can then be compared to produce a {@link CspDiff}, which
 * annotates every directive and every value with a {@link DiffStatus}
 * (`"unchanged"`, `"added"`, or `"removed"`).
 *
 * A {@link CspMergedPolicy} represents the "third CSP" concept: all
 * directives and values from both policies in one view, where each item
 * can be individually disabled so that it is excluded when the merged
 * policy is exported back to a header string.
 */

/**
 * The diff status of a directive or a value within a directive.
 *
 * - `"unchanged"` — present in both CSP 1 and CSP 2 with the same value.
 * - `"added"`     — present only in CSP 2 (new in the updated policy).
 * - `"removed"`   — present only in CSP 1 (dropped in the updated policy).
 */
export type DiffStatus = "unchanged" | "added" | "removed";

/**
 * A single CSP directive, consisting of a name and an ordered list of values.
 *
 * @example
 * Directive from `"img-src 'self' https://cdn.example.com"`:
 * ```json
 * { "name": "img-src", "values": ["'self'", "https://cdn.example.com"] }
 * ```
 */
export type CspDirective = {
  /** Lowercase directive name, e.g. `"default-src"`, `"script-src"`. */
  name: string;
  /** Ordered list of values for this directive. May be empty. */
  values: string[];
};

/**
 * An ordered list of {@link CspDirective} objects representing a full CSP.
 */
export type CspPolicy = CspDirective[];

/**
 * A single value within a directive annotated with its {@link DiffStatus}.
 */
export type CspItemDiff = {
  /** The value string, e.g. `"'self'"`, `"https://cdn.example.com"`. */
  value: string;
  /** Whether this value is new, removed, or unchanged relative to the other policy. */
  status: DiffStatus;
};

/**
 * A directive annotated with its {@link DiffStatus} and the per-value diff of its items.
 *
 * @remarks
 * - `status === "added"`   — the entire directive is new in CSP 2.
 * - `status === "removed"` — the entire directive was dropped in CSP 2.
 * - `status === "unchanged"` — the directive exists in both; individual items
 *   may still be `"added"` or `"removed"`.
 */
export type CspDirectiveDiff = {
  /** Lowercase directive name. */
  name: string;
  /** Status of the directive as a whole. */
  status: DiffStatus;
  /** Per-value diff for the directive's values. */
  items: CspItemDiff[];
};

/**
 * The result of comparing two {@link CspPolicy} objects.
 *
 * Directives are ordered: CSP 1 directives first (in their original order),
 * followed by any directives that are new in CSP 2 (in their CSP 2 order).
 */
export type CspDiff = {
  /** Annotated list of all directives from both policies. */
  directives: CspDirectiveDiff[];
};

/**
 * A single value in a merged policy, combining diff status with an optional
 * disabled flag so users can exclude specific values from the exported output.
 */
export type CspMergedItem = {
  /** The value string. */
  value: string;
  /** Whether this value is new, removed, or unchanged. */
  status: DiffStatus;
  /**
   * When `true` the value is excluded from the exported CSP string.
   * Defaults to `false`.
   */
  disabled: boolean;
};

/**
 * A directive in a merged policy.
 */
export type CspMergedDirective = {
  /** Lowercase directive name. */
  name: string;
  /** Status of the directive as a whole. */
  status: DiffStatus;
  /**
   * When `true` the entire directive is excluded from the exported CSP string.
   * Defaults to `false`.
   */
  disabled: boolean;
  /** Per-value entries with diff status and disabled flag. */
  items: CspMergedItem[];
};

/**
 * The "third CSP" — a merged view of two {@link CspPolicy} objects.
 *
 * @remarks
 * Contains every directive and every value from both policies.
 * Each item carries:
 * - a {@link DiffStatus} so callers know if it is new/removed/unchanged.
 * - a `disabled` flag that the caller can toggle; disabled items are
 *   omitted when the merged policy is exported to a header string.
 *
 * This lets UIs show an annotated combined view while still producing a
 * clean, valid CSP string on export.
 */
export type CspMergedPolicy = {
  directives: CspMergedDirective[];
};
