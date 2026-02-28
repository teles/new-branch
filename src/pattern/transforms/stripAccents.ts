import type { TransformDef } from "@/pattern/transforms/types.js";

/**
 * Transform: **stripAccents**
 *
 * @remarks
 * Removes diacritical marks (accents) from characters by decomposing
 * to NFD and stripping combining marks (`\u0300`–`\u036f`).
 *
 * Pattern syntax: `{variable:stripAccents}`
 *
 * @example
 * ```ts
 * stripAccents.fn("José", []); // => "Jose"
 * stripAccents.fn("café", []); // => "cafe"
 * ```
 */
export const stripAccents: TransformDef = {
  name: "stripAccents",
  fn: (value) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, ""),
  doc: {
    summary: "Removes diacritics from characters.",
    usage: ["{title:stripAccents}"],
    examples: ["José → Jose"],
  },
};
