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
});
