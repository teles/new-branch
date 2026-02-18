import { describe, it, expect } from "vitest";
import { title } from "./title.js";

describe("title transform", () => {
  it("converts text to Title Case", () => {
    expect(title.fn("hello WORLD", [])).toBe("Hello World");
  });

  it("handles punctuation and multiple separators", () => {
    expect(title.fn("my-task_HTTP server", [])).toBe("My Task Http Server");
  });

  it("returns empty string for empty input", () => {
    expect(title.fn("", [])).toBe("");
  });
});
