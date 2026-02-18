import { describe, it, expect } from "vitest";
import { slugify } from "./slugify.js";

describe("slugify transform", () => {
  it("removes accents, lowercases and replaces non-alphanum with dashes", () => {
    const input = "Título com Acentos & símbolos!";
    const out = slugify.fn(input, []);
    expect(out).toBe("titulo-com-acentos-simbolos");
  });

  it("collapses multiple separators into one and trims dashes", () => {
    const input = "  --Hello___World--  ";
    const out = slugify.fn(input, []);
    expect(out).toBe("hello-world");
  });
});
