import type { TransformDef } from "@/pattern/transforms/types.js";

/**
 * Transform: **replaceAll**
 *
 * @remarks
 * Replaces **all** occurrences of `search` with `replacement`.
 *
 * Pattern syntax: `{variable:replaceAll:search:replacement}`
 *
 * @example
 * ```ts
 * replaceAll.fn("foo bar foo", ["foo", "baz"]); // => "baz bar baz"
 * ```
 */
export const replaceAll: TransformDef = {
  name: "replaceAll",
  fn: (value, [search, replacement]) => {
    if (search === undefined || replacement === undefined)
      throw new Error("replaceAll requires two arguments: {var:replaceAll:search:replacement}");
    return value.replaceAll(search, replacement);
  },
  doc: {
    summary: "Replaces all occurrences of a substring.",
    usage: ["{title:replaceAll:foo:bar}"],
  },
};
