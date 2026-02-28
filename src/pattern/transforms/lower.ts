import type { TransformDef } from "@/pattern/transforms/types.js";

/**
 * Transform: **lower**
 *
 * @remarks
 * Lowercases the entire string using `String.prototype.toLowerCase()`.
 *
 * Pattern syntax: `{variable:lower}`
 *
 * @example
 * ```ts
 * lower.fn("HELLO", []); // => "hello"
 * ```
 */
export const lower: TransformDef = {
  name: "lower",
  fn: (value) => value.toLowerCase(),
  doc: {
    summary: "Lowercases the value.",
    usage: ["{name:lower}"],
  },
};
