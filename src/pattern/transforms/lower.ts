import type { TransformDef } from "@/pattern/transforms/types.js";
export const lower: TransformDef = {
  name: "lower",
  fn: (value) => value.toLowerCase(),
  doc: {
    summary: "Lowercases the value.",
    usage: ["{name:lower}"],
  },
};
