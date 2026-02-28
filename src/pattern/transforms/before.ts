import type { TransformDef } from "@/pattern/transforms/types.js";

export const before: TransformDef = {
  name: "before",
  fn: (value, [prefix]) => {
    if (prefix === undefined) throw new Error("before requires one argument: {var:before:prefix}");
    return value === "" ? "" : prefix + value;
  },
  doc: {
    summary: "Adds a prefix only if the value is not empty.",
    usage: ["{title:before:hotfix-}"],
  },
};
