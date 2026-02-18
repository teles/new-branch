import { describe, it, expect } from "vitest";
import { splitWords, upperFirst, lowerFirst } from "./words.js";

describe("splitWords", () => {
  it("returns empty array for empty or whitespace-only input", () => {
    expect(splitWords("")).toEqual([]);
    expect(splitWords("   ")).toEqual([]);
  });

  it("splits on separators and trims words", () => {
    expect(splitWords("hello world-test")).toEqual(["hello", "world", "test"]);
    expect(splitWords("  leading  and  trailing  ")).toEqual(["leading", "and", "trailing"]);
  });

  it("handles camelCase boundaries", () => {
    expect(splitWords("myTask")).toEqual(["my", "Task"]);
    expect(splitWords("version2Beta")).toEqual(["version2", "Beta"]);
  });

  it("handles ALLCAPS followed by capitalized word", () => {
    expect(splitWords("HTTPServer")).toEqual(["HTTP", "Server"]);
    expect(splitWords("XMLHttpRequest")).toEqual(["XML", "Http", "Request"]);
  });

  it("keeps Unicode letters and accents", () => {
    expect(splitWords("Título grande")).toEqual(["Título", "grande"]);
  });
});

describe("upperFirst / lowerFirst", () => {
  it("upperFirst capitalizes only the first character", () => {
    expect(upperFirst("hello")).toBe("Hello");
    expect(upperFirst("")).toBe("");
    expect(upperFirst("éclair")).toBe("Éclair");
  });

  it("lowerFirst lowercases only the first character", () => {
    expect(lowerFirst("Hello")).toBe("hello");
    expect(lowerFirst("")).toBe("");
    expect(lowerFirst("Éclair")).toBe("éclair");
  });
});
