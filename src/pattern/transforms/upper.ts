import type { TransformDef } from "@/pattern/transforms/types.js";

/**
 * Transform: **upper**
 *
 * @remarks
 * Uppercases the entire string using `String.prototype.toUpperCase()`.
 *
 * Pattern syntax: `{variable:upper}`
 *
 * @example
 * ```ts
 * upper.fn("hello", []); // => "HELLO"
 * ```
 */
export const upper: TransformDef = {
  name: "upper",
  fn: (value) => value.toUpperCase(),
  doc: {
    summary: "Uppercases the value.",
    usage: ["{name:upper}"],
  },
};
