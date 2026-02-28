import { describe, it, expect } from "vitest";
import { listTransforms } from "./listTransforms.js";
import type { TransformDef } from "@/pattern/transforms/types.js";

describe("listTransforms", () => {
  const transforms: TransformDef[] = [
    {
      name: "lower",
      fn: (v) => v.toLowerCase(),
      doc: { summary: "Lowercases the value.", usage: ["{name:lower}"] },
    },
    {
      name: "slugify",
      fn: (v) => v,
      doc: { summary: "Slugifies to a git-friendly format.", usage: ["{title:slugify}"] },
    },
  ];

  it("includes header", () => {
    const output = listTransforms(transforms);
    expect(output).toContain("Available transforms:");
  });

  it("lists all transform names", () => {
    const output = listTransforms(transforms);
    expect(output).toContain("lower");
    expect(output).toContain("slugify");
  });

  it("includes summaries", () => {
    const output = listTransforms(transforms);
    expect(output).toContain("Lowercases the value.");
    expect(output).toContain("Slugifies to a git-friendly format.");
  });

  it("includes usage examples", () => {
    const output = listTransforms(transforms);
    expect(output).toContain("Example: {name:lower}");
    expect(output).toContain("Example: {title:slugify}");
  });

  it("handles transform without doc", () => {
    const nodoc: TransformDef[] = [{ name: "custom", fn: (v) => v }];
    const output = listTransforms(nodoc);
    expect(output).toContain("custom");
    expect(output).toContain("(no description)");
  });
});
