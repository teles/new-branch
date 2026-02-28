import { describe, it, expect } from "vitest";
import { truncateEnd } from "./truncateEnd.js";

describe("truncateEnd", () => {
  it("returns the string unchanged when length <= maxLength", () => {
    expect(truncateEnd("hello", 10)).toBe("hello");
    expect(truncateEnd("hello", 5)).toBe("hello");
  });

  it("truncates from the end when length > maxLength", () => {
    expect(truncateEnd("feat/123-this-title-is-way-too-long-for-some-systems", 20)).toBe(
      "feat/123-this-title-",
    );
  });

  it("handles maxLength = 1", () => {
    expect(truncateEnd("abcdef", 1)).toBe("a");
  });

  it("handles empty string", () => {
    expect(truncateEnd("", 5)).toBe("");
  });

  it("handles maxLength equal to string length", () => {
    expect(truncateEnd("exact", 5)).toBe("exact");
  });

  it("handles very large maxLength", () => {
    expect(truncateEnd("short", 99999)).toBe("short");
  });

  it("throws on maxLength = 0", () => {
    expect(() => truncateEnd("abc", 0)).toThrow(/positive integer/);
  });

  it("throws on negative maxLength", () => {
    expect(() => truncateEnd("abc", -5)).toThrow(/positive integer/);
  });

  it("throws on non-integer maxLength", () => {
    expect(() => truncateEnd("abc", 3.5)).toThrow(/positive integer/);
  });

  it("throws on NaN", () => {
    expect(() => truncateEnd("abc", NaN)).toThrow(/positive integer/);
  });

  it("throws on Infinity", () => {
    expect(() => truncateEnd("abc", Infinity)).toThrow(/positive integer/);
  });
});
