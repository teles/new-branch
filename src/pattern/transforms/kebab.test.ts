import { describe, it, expect } from "vitest";
import { kebab } from "./kebab.js";

describe("kebab transform", () => {
  it("converts spaced text to kebab-case", () => {
    expect(kebab.fn("My Task", [])).toBe("my-task");
  });

  it("handles camelCase and punctuation", () => {
    expect(kebab.fn("myTaskHTTP Server", [])).toBe("my-task-http-server");
  });

  it("returns empty string for empty input", () => {
    expect(kebab.fn("", [])).toBe("");
  });
});
