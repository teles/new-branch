import type { TransformDef } from "@/pattern/transforms/types.js";

export const max: TransformDef = {
  name: "max",
  fn: (value, [n]) => {
    const size = Number(n);
    if (!Number.isFinite(size) || size < 0)
      throw new Error(`max expects a non-negative number, got "${n ?? ""}"`);
    return value.slice(0, size);
  },
  doc: {
    summary: "Truncates the value to a maximum length.",
    usage: ["{name:max:25}"],
  },
};
