import { describe, it, expect } from "vitest";
import { before } from "./before.js";

describe("before transform", () => {
  it("adds prefix when value is not empty", () => {
    expect(before.fn("fix-123", ["hotfix-"])).toBe("hotfix-fix-123");
  });

  it("returns empty string when value is empty", () => {
    expect(before.fn("", ["hotfix-"])).toBe("");
  });

  it("throws if prefix argument is missing", () => {
    expect(() => before.fn("abc", [])).toThrow();
  });
});
