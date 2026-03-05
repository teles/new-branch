import { describe, it, expect } from "vitest";
import { parseCsp } from "./parseCsp.js";

describe("parseCsp", () => {
  it("parses a single directive with no values", () => {
    expect(parseCsp("upgrade-insecure-requests")).toEqual([
      { name: "upgrade-insecure-requests", values: [] },
    ]);
  });

  it("parses a single directive with one value", () => {
    expect(parseCsp("default-src 'self'")).toEqual([{ name: "default-src", values: ["'self'"] }]);
  });

  it("parses a single directive with multiple values", () => {
    expect(parseCsp("img-src 'self' https://cdn.example.com")).toEqual([
      { name: "img-src", values: ["'self'", "https://cdn.example.com"] },
    ]);
  });

  it("parses multiple directives separated by semicolons", () => {
    expect(parseCsp("default-src 'self'; img-src 'self' https://cdn.example.com")).toEqual([
      { name: "default-src", values: ["'self'"] },
      { name: "img-src", values: ["'self'", "https://cdn.example.com"] },
    ]);
  });

  it("normalizes directive names to lower-case", () => {
    expect(parseCsp("Default-Src 'self'")).toEqual([{ name: "default-src", values: ["'self'"] }]);
  });

  it("trims whitespace around directive tokens", () => {
    expect(parseCsp("  default-src   'self'  ;  img-src  *  ")).toEqual([
      { name: "default-src", values: ["'self'"] },
      { name: "img-src", values: ["*"] },
    ]);
  });

  it("ignores empty segments (trailing semicolon)", () => {
    expect(parseCsp("default-src 'self';")).toEqual([{ name: "default-src", values: ["'self'"] }]);
  });

  it("ignores empty segments (multiple consecutive semicolons)", () => {
    expect(parseCsp("default-src 'self';;img-src *")).toEqual([
      { name: "default-src", values: ["'self'"] },
      { name: "img-src", values: ["*"] },
    ]);
  });

  it("returns an empty array for an empty string", () => {
    expect(parseCsp("")).toEqual([]);
  });

  it("returns an empty array for a whitespace-only string", () => {
    expect(parseCsp("   ")).toEqual([]);
  });

  it("preserves value casing (values are not lower-cased)", () => {
    expect(parseCsp("script-src 'self' https://Example.COM")).toEqual([
      { name: "script-src", values: ["'self'", "https://Example.COM"] },
    ]);
  });

  it("handles a full realistic CSP string", () => {
    const result = parseCsp(
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src *; upgrade-insecure-requests",
    );
    expect(result).toEqual([
      { name: "default-src", values: ["'self'"] },
      { name: "script-src", values: ["'self'", "'unsafe-inline'"] },
      { name: "style-src", values: ["'self'", "'unsafe-inline'"] },
      { name: "img-src", values: ["*"] },
      { name: "upgrade-insecure-requests", values: [] },
    ]);
  });
});
