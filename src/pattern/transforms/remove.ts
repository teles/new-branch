import type { TransformDef } from "@/pattern/transforms/types.js";

/**
 * Transform: **remove**
 *
 * @remarks
 * Removes **all** occurrences of a substring from the value.
 *
 * Pattern syntax: `{variable:remove:substring}`
 *
 * @example
 * ```ts
 * remove.fn("foobarfoo", ["foo"]); // => "bar"
 * ```
 */
export const remove: TransformDef = {
  name: "remove",
  fn: (value, [target]) => {
    if (target === undefined)
      throw new Error("remove requires one argument: {var:remove:substring}");
    return value.replaceAll(target, "");
  },
  doc: {
    summary: "Removes all occurrences of a substring.",
    usage: ["{title:remove:temp}"],
  },
};
