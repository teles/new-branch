/**
 * Represents a map of built-in runtime values available
 * during pattern rendering.
 *
 * All values are strings to keep the rendering pipeline
 * strictly string-based and simple.
 */
export type BuiltinValues = Record<string, string>;

/**
 * Pads a number with a leading zero when necessary.
 *
 * @param n - Number to pad.
 * @returns A zero-padded string (e.g., 2 → "02").
 */
function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/**
 * Returns built-in date-based variables derived from
 * the local system time.
 *
 * This function is intentionally synchronous and pure.
 * The optional `now` parameter allows deterministic testing.
 *
 * Provided variables:
 *
 * - `year`        → YYYY
 * - `month`       → MM (zero padded)
 * - `day`         → DD (zero padded)
 * - `date`        → YYYY-MM-DD
 * - `dateCompact` → YYYYMMDD
 *
 * @param now - Optional Date instance used to generate values.
 *              Defaults to the current system date/time.
 * @returns An object containing built-in date variables.
 *
 * @example
 * const builtins = getBuiltinValues(new Date("2026-02-19"));
 * builtins.date; // "2026-02-19"
 */
export function getBuiltinValues(now: Date = new Date()): BuiltinValues {
  const year = String(now.getFullYear());
  const month = pad(now.getMonth() + 1);
  const day = pad(now.getDate());

  return {
    year,
    month,
    day,
    date: `${year}-${month}-${day}`,
    dateCompact: `${year}${month}${day}`,
  };
}
