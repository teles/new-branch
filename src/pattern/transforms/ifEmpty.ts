import type { TransformDef } from "@/pattern/transforms/types.js";

/**
 * Transform: **ifEmpty**
 *
 * @remarks
 * Provides a fallback value when the current value is an empty string.
 * Useful for guaranteeing a non-empty segment in the branch name.
 *
 * Pattern syntax: `{variable:ifEmpty:fallback}`
 *
 * @example
 * ```ts
 * ifEmpty.fn("", ["no-title"]);    // => "no-title"
 * ifEmpty.fn("hello", ["unused"]); // => "hello"
 * ```
 */
export const ifEmpty: TransformDef = {
  name: "ifEmpty",
  fn: (value, [fallback]) => {
    if (fallback === undefined)
      throw new Error("ifEmpty requires one argument: {var:ifEmpty:fallback}");
    return value === "" ? fallback : value;
  },
  doc: {
    summary: "Provides a fallback value if the result is empty.",
    usage: ["{title:slugify:ifEmpty:no-title}"],
  },
};
