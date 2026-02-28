import { describe, it, expect } from "vitest";
import { replaceAll } from "./replaceAll.js";

describe("replaceAll transform", () => {
  it("replaces all occurrences of a substring", () => {
    expect(replaceAll.fn("foo bar foo", ["foo", "baz"])).toBe("baz bar baz");
  });

  it("returns original string if search is not found", () => {
    expect(replaceAll.fn("hello world", ["xyz", "abc"])).toBe("hello world");
  });

  it("replaces with empty string", () => {
    expect(replaceAll.fn("aaa", ["a", ""])).toBe("");
  });

  it("throws if arguments are missing", () => {
    expect(() => replaceAll.fn("abc", [])).toThrow();
    expect(() => replaceAll.fn("abc", ["foo"])).toThrow();
  });
});
