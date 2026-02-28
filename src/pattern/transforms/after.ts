import type { TransformDef } from "@/pattern/transforms/types.js";

/**
 * Transform: **after**
 *
 * @remarks
 * Appends a suffix to the value. If the value is empty, returns
 * an empty string (the suffix is not added to avoid dangling separators).
 *
 * Pattern syntax: `{variable:after:suffix}`
 *
 * @example
 * ```ts
 * after.fn("feat", ["-wip"]); // => "feat-wip"
 * after.fn("", ["-wip"]);     // => ""
 * ```
 */
export const after: TransformDef = {
  name: "after",
  fn: (value, [suffix]) => {
    if (suffix === undefined) throw new Error("after requires one argument: {var:after:suffix}");
    return value === "" ? "" : value + suffix;
  },
  doc: {
    summary: "Adds a suffix only if the value is not empty.",
    usage: ["{title:after:-wip}"],
  },
};
