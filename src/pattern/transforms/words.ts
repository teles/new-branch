import type { TransformDef } from "./types.js";
import { splitWords } from "./helpers/words.js";

/**
 * Transform: words
 *
 * Limits the input to at most `n` words. The transform expects a single
 * numeric argument that indicates the maximum number of words to keep. The
 * returned value is the first `n` words joined by a single space.
 *
 * Examples:
 * - `{title:words:2}` applied to "My big title" -> "My big"
 *
 * @throws If the provided argument is missing or not a non-negative number.
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
