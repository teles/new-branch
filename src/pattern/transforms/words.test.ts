import { describe, it, expect } from "vitest";
import { words } from "./words.js";

describe("words transform", () => {
  it("limits the number of words when a positive number is provided", () => {
    expect(words.fn("one two three four", ["2"]).trim()).toBe("one two");
    expect(words.fn("hello world", ["5"]).trim()).toBe("hello world");
  });

  it("returns empty string when 0 is provided", () => {
    expect(words.fn("some text here", ["0"]).trim()).toBe("");
  });

  it("throws when argument is missing or invalid", () => {
    expect(() => words.fn("a b c", [])).toThrow();
    expect(() => words.fn("a b c", ["-1"])).toThrow();
    expect(() => words.fn("a b c", ["not-a-number"])).toThrow();
  });
});
