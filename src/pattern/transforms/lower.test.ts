import { describe, it, expect } from "vitest";
import { lower } from "./lower.js";

describe("lower transform", () => {
  it("converts to lowercase", () => {
    expect(lower.fn("Hello WORLD", [])).toBe("hello world");
  });

  it("keeps non-letter characters", () => {
    expect(lower.fn("123-ÁÉ!", [])).toBe("123-áé!");
  });
});
