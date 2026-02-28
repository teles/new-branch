import { describe, it, expect } from "vitest";
import { after } from "./after.js";

describe("after transform", () => {
  it("adds suffix when value is not empty", () => {
    expect(after.fn("feature", ["-wip"])).toBe("feature-wip");
  });

  it("returns empty string when value is empty", () => {
    expect(after.fn("", ["-wip"])).toBe("");
  });

  it("throws if suffix argument is missing", () => {
    expect(() => after.fn("abc", [])).toThrow();
  });
});
