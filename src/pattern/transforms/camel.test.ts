import { describe, it, expect } from "vitest";
import { camel } from "./camel.js";

describe("camel transform", () => {
  it("converts spaced text to camelCase", () => {
    expect(camel.fn("My Task", [])).toBe("myTask");
  });

  it("handles punctuation and multiple separators", () => {
    expect(camel.fn("hello-world_test", [])).toBe("helloWorldTest");
  });

  it("returns empty string for empty input", () => {
    expect(camel.fn("", [])).toBe("");
  });
});
