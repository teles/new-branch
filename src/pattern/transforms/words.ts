import type { TransformDef } from "./types.js";
import { splitWords } from "./helpers/words.js";

/**
 * Transform: **words**
 *
 * @remarks
 * Limits the input to at most `n` words. The returned value is the
 * first `n` words joined by a single space.
 *
 * Pattern syntax: `{variable:words:n}`
 *
 * @throws {@link Error} If the argument is missing or not a non-negative number.
 *
 * @example
 * ```ts
 * words.fn("My big title", ["2"]); // => "My big"
 * ```
 */
export const words: TransformDef = {
  name: "words",
  fn: (value, [n]) => {
    const count = Number(n);
    if (!Number.isFinite(count) || count < 0) {
      throw new Error(`words expects a non-negative number, got "${n ?? ""}"`);
    }

    return splitWords(value).slice(0, count).join(" ");
  },
  doc: {
    summary: "Limits value to a maximum number of words.",
    usage: ["{title:words:3}"],
  },
};
