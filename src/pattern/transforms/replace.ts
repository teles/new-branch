import type { TransformDef } from "@/pattern/transforms/types.js";

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
