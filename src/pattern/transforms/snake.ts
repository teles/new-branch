import type { TransformDef } from "./types.js";
import { splitWords } from "./helpers/words.js";

/**
 * Transform: **snake**
 *
 * @remarks
 * Converts an input string into snake_case (lowercased words joined
 * with underscores). Uses {@link splitWords} to determine boundaries.
 *
 * Pattern syntax: `{variable:snake}`
 *
 * @example
 * ```ts
 * snake.fn("My Task", []); // => "my_task"
 * ```
 */
export const snake: TransformDef = {
  name: "snake",
  fn: (value) =>
    splitWords(value)
      .map((w) => w.toLowerCase())
      .join("_"),
  doc: {
    summary: "Converts value to snake_case.",
    usage: ["{title:snake}"],
  },
};
