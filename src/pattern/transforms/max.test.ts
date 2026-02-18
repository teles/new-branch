import { describe, it, expect } from "vitest";
import { max } from "./max.js";

describe("max transform", () => {
  it("truncates the value to the given length", () => {
    expect(max.fn("abcdef", ["3"])).toBe("abc");
    expect(max.fn("short", ["10"])).toBe("short");
  });

  it("throws on negative or non-finite sizes", () => {
    expect(() => max.fn("abc", ["-1"])).toThrow();
    expect(() => max.fn("abc", ["not-a-number"])).toThrow();
    expect(() => max.fn("abc", [])).toThrow();
  });
});
