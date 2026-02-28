/**
 * Truncates a string from the end to ensure it does not exceed `maxLength`.
 *
 * @remarks
 * This is intentionally simple and deterministic:
 * - If the string length is `<= maxLength`, return it unchanged.
 * - Otherwise, cut from the end.
 *
 * Used by the `--max-length` CLI option after sanitization and before
 * branch-name validation.
 *
 * @param value - The string to truncate.
 * @param maxLength - The maximum allowed length. Must be a positive integer (`>= 1`).
 * @returns The (possibly truncated) string.
 * @throws {@link Error} If `maxLength` is not a positive integer.
 *
 * @example
 * ```ts
 * truncateEnd("feat/my-feature", 10); // => "feat/my-fe"
 * truncateEnd("short", 100);          // => "short"
 * ```
 */
export function truncateEnd(value: string, maxLength: number): string {
  if (!Number.isInteger(maxLength) || maxLength < 1) {
    throw new Error(`--max-length must be a positive integer (>= 1), got "${maxLength}".`);
  }

  if (value.length <= maxLength) {
    return value;
  }

  return value.slice(0, maxLength);
}
