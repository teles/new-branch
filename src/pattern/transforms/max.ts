import type { TransformDef } from "@/pattern/transforms/types.js";

/**
 * Transform: **max**
 *
 * @remarks
 * Truncates the value to at most `n` characters. If the value is
 * already shorter than or equal to `n`, it is returned unchanged.
 *
 * Pattern syntax: `{variable:max:n}`
 *
 * @example
 * ```ts
 * max.fn("abcdef", ["3"]); // => "abc"
 * max.fn("hi", ["10"]);    // => "hi"
 * ```
 */
export const max: TransformDef = {
  name: "max",
  fn: (value, [n]) => {
    const size = Number(n);
    if (!Number.isFinite(size) || size < 0)
      throw new Error(`max expects a non-negative number, got "${n ?? ""}"`);
    return value.slice(0, size);
  },
  doc: {
    summary: "Truncates the value to a maximum length.",
    usage: ["{name:max:25}"],
  },
};
