import type { TransformDef } from "./types.js";
import { splitWords } from "./helpers/words.js";

/**
 * Transform: kebab
 *
 * Converts an input string into kebab-case (lowercased words joined with
 * hyphens). Uses `splitWords` to determine word boundaries.
 *
 * Example: "My Task" -> "my-task"
 */
export const kebab: TransformDef = {
  name: "kebab",
  fn: (value) =>
    splitWords(value)
      .map((w) => w.toLowerCase())
      .join("-"),
  doc: {
    summary: "Converts value to kebab-case.",
    usage: ["{title:kebab}"],
  },
};
