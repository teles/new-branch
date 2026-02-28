import type { TransformDef } from "@/pattern/transforms/types.js";

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
