import type { TransformDef } from "./types.js";
import { splitWords, upperFirst } from "./helpers/words.js";

/**
 * Transform: **camel**
 *
 * @remarks
 * Converts an input string into camelCase. Uses {@link splitWords} to
 * extract word boundaries and lower-cases the words before joining.
 * The first word is kept in lower-case; subsequent words are
 * capitalised with {@link upperFirst}.
 *
 * Pattern syntax: `{variable:camel}`
 *
 * @example
 * ```ts
 * camel.fn("My Task", []);     // => "myTask"
 * camel.fn("HTTP Server", []); // => "httpServer"
 * ```
 */
export const camel: TransformDef = {
  name: "camel",
  fn: (value) => {
    const words = splitWords(value).map((w) => w.toLowerCase());
    if (!words.length) return "";
    return words[0] + words.slice(1).map(upperFirst).join("");
  },
  doc: {
    summary: "Converts value to camelCase.",
    usage: ["{title:camel}"],
  },
};
