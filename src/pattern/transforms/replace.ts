import type { TransformDef } from "@/pattern/transforms/types.js";

/**
 * Transform: **replace**
 *
 * @remarks
 * Replaces the **first** occurrence of `search` with `replacement`.
 *
 * Pattern syntax: `{variable:replace:search:replacement}`
 *
 * @example
 * ```ts
 * replace.fn("foo bar foo", ["foo", "baz"]); // => "baz bar foo"
 * ```
 */
export const replace: TransformDef = {
  name: "replace",
  fn: (value, [search, replacement]) => {
    if (search === undefined || replacement === undefined)
      throw new Error("replace requires two arguments: {var:replace:search:replacement}");
    return value.replace(search, replacement);
  },
  doc: {
    summary: "Replaces the first occurrence of a substring.",
    usage: ["{title:replace:foo:bar}"],
  },
};
