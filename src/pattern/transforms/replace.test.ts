import { describe, it, expect } from "vitest";
import { replace } from "./replace.js";

describe("replace transform", () => {
  it("replaces the first occurrence of a substring", () => {
    expect(replace.fn("foo bar foo", ["foo", "baz"])).toBe("baz bar foo");
  });

  it("returns original string if search is not found", () => {
    expect(replace.fn("hello world", ["xyz", "abc"])).toBe("hello world");
  });

  it("replaces with empty string", () => {
    expect(replace.fn("hello world", ["world", ""])).toBe("hello ");
  });

  it("throws if arguments are missing", () => {
    expect(() => replace.fn("abc", [])).toThrow();
    expect(() => replace.fn("abc", ["foo"])).toThrow();
  });
});
