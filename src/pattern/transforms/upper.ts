import type { TransformDef } from "@/pattern/transforms/types.js";
export const upper: TransformDef = {
  name: "upper",
  fn: (value) => value.toUpperCase(),
  doc: {
    summary: "Uppercases the value.",
    usage: ["{name:upper}"],
  },
};
