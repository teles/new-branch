import type { TransformDef } from "@/pattern/transforms/types.js";

export const slugify: TransformDef = {
  name: "slugify",
  fn: (value) =>
    value
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, ""),
  doc: {
    summary: "Slugifies to a git-friendly format.",
    usage: ["{title:slugify}"],
  },
};
