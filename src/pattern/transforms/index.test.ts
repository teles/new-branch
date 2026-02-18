import { describe, it, expect } from "vitest";
import { allTransforms, defaultTransforms } from "./index.js";

describe("pattern/transforms/index", () => {
  it("defaultTransforms has one entry per transform in allTransforms", () => {
    for (const t of allTransforms) {
      expect(defaultTransforms[t.name]).toBe(t.fn);
    }
  });
});
