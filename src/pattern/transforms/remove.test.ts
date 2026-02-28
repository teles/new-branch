import { describe, it, expect } from "vitest";
import { remove } from "./remove.js";

describe("remove transform", () => {
  it("removes all occurrences of a substring", () => {
    expect(remove.fn("foo temp bar temp", ["temp"])).toBe("foo  bar ");
  });

  it("returns original string if target is not found", () => {
    expect(remove.fn("hello world", ["xyz"])).toBe("hello world");
  });

  it("removes single character occurrences", () => {
    expect(remove.fn("a-b-c", ["-"])).toBe("abc");
  });

  it("throws if argument is missing", () => {
    expect(() => remove.fn("abc", [])).toThrow();
  });
});
