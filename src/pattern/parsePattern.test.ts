import { describe, it, expect } from "vitest";
import { parsePattern } from "./parsePattern.js";

describe("parsePattern", () => {
  it("parses literals + variables + transforms", () => {
    const res = parsePattern("{type}/{title:slugify;max:25}-{id}");

    expect(res.variablesUsed).toEqual(["type", "title", "id"]);
    expect(res.nodes).toEqual([
      { kind: "variable", name: "type", transforms: [] },
      { kind: "literal", value: "/" },
      {
        kind: "variable",
        name: "title",
        transforms: [
          { name: "slugify", args: [] },
          { name: "max", args: ["25"] },
        ],
      },
      { kind: "literal", value: "-" },
      { kind: "variable", name: "id", transforms: [] },
    ]);
  });

  it("throws on missing closing brace", () => {
    expect(() => parsePattern("{type/{id}")).toThrow(/missing "}"|Invalid pattern/);
  });

  it("throws on nested opening brace inside variable block", () => {
    expect(() => parsePattern("{{type}}")).toThrow(/unexpected "\{" inside/);
  });

  it("throws on empty variable block", () => {
    expect(() => parsePattern("{}")).toThrow(/empty "\{\}"/);
  });

  it("throws on whitespace-only variable block (missing variable name)", () => {
    expect(() => parsePattern("{  :slugify}")).toThrow(/missing variable name/);
  });

  it("parses pattern with only literals (no variables)", () => {
    const res = parsePattern("hotfix/my-branch");

    expect(res.variablesUsed).toEqual([]);
    expect(res.nodes).toEqual([{ kind: "literal", value: "hotfix/my-branch" }]);
  });

  it("deduplicates repeated variable names in variablesUsed", () => {
    const res = parsePattern("{type}/{type}");

    expect(res.variablesUsed).toEqual(["type"]);
    expect(res.nodes).toHaveLength(3);
  });

  it("parses variable with transform section containing multiple args", () => {
    const res = parsePattern("{title:replace:_:-}");

    expect(res.nodes).toEqual([
      {
        kind: "variable",
        name: "title",
        transforms: [{ name: "replace", args: ["_", "-"] }],
      },
    ]);
  });

  it("handles empty transform section after colon gracefully", () => {
    // {name:} — the transform section is empty after trim, so no transforms
    const res = parsePattern("{type:}");

    expect(res.nodes).toEqual([{ kind: "variable", name: "type", transforms: [] }]);
  });

  it("throws on missing closing brace at end of input", () => {
    expect(() => parsePattern("{type")).toThrow(/missing "}"/);
  });

  it("throws on a transform segment that resolves to an empty name", () => {
    // " :arg" -> parts=['',...] -> name is empty
    expect(() => parsePattern("{title: :arg}")).toThrow(/Invalid transform/);
  });
});
