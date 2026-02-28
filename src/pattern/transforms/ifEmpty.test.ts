import { describe, it, expect } from "vitest";
import { ifEmpty } from "./ifEmpty.js";

describe("ifEmpty transform", () => {
  it("returns fallback when value is empty", () => {
    expect(ifEmpty.fn("", ["no-title"])).toBe("no-title");
  });

  it("returns original value when not empty", () => {
    expect(ifEmpty.fn("hello", ["fallback"])).toBe("hello");
  });

  it("does not treat whitespace as empty", () => {
    expect(ifEmpty.fn(" ", ["fallback"])).toBe(" ");
  });

  it("throws if fallback argument is missing", () => {
    expect(() => ifEmpty.fn("", [])).toThrow();
  });
});
