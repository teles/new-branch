import type { TransformDef } from "@/pattern/transforms/types.js";

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
