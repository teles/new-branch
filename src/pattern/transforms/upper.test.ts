import { describe, it, expect } from "vitest";
import { upper } from "./upper.js";

describe("upper transform", () => {
  it("converts to uppercase", () => {
    expect(upper.fn("Hello world", [])).toBe("HELLO WORLD");
  });

  it("keeps non-letter characters", () => {
    expect(upper.fn("123-áé!", [])).toBe("123-ÁÉ!");
  });
});
