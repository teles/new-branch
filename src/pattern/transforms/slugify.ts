import type { TransformDef } from "@/pattern/transforms/types.js";

/**
 * Transform: **slugify**
 *
 * @remarks
 * Converts the value into a URL / git-friendly slug by:
 * 1. Decomposing Unicode (NFKD) and stripping combining marks.
 * 2. Lowercasing.
 * 3. Replacing non-alphanumeric runs with a single hyphen.
 * 4. Trimming leading/trailing hyphens.
 *
 * Pattern syntax: `{variable:slugify}`
 *
 * @example
 * ```ts
 * slugify.fn("My Feature!!", []); // => "my-feature"
 * slugify.fn("José café", []);    // => "jose-cafe"
 * ```
 */
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
