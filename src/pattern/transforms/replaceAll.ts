import type { TransformDef } from "@/pattern/transforms/types.js";

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
