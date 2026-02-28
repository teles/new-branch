import type { TransformDef } from "@/pattern/transforms/types.js";

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
