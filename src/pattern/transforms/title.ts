import type { TransformDef } from "./types.js";
import { splitWords, upperFirst } from "./helpers/words.js";

/**
 * Transform: **title**
 *
 * @remarks
 * Converts an input string into Title Case where each word’s first
 * character is upper-cased and the remainder lower-cased.
 * Uses {@link splitWords} for boundary detection.
 *
 * Pattern syntax: `{variable:title}`
 *
 * @example
 * ```ts
 * title.fn("hello WORLD", []); // => "Hello World"
 * ```
 */
export const title: TransformDef = {
  name: "title",
  fn: (value) =>
    splitWords(value)
      .map((w) => upperFirst(w.toLowerCase()))
      .join(" "),
  doc: {
    summary: "Converts value to Title Case.",
    usage: ["{title:title}"],
  },
};
