import { describe, it, expect } from "vitest";
import { renderPattern } from "./renderPattern.js";
import { parsePattern } from "../parsePattern.js";
import { lower } from "./lower.js";
import { upper } from "./upper.js";
import { max } from "./max.js";
import { slugify } from "./slugify.js";
import type { ParsedPattern } from "../types.js";

const defaultTransforms = {
  [lower.name]: lower.fn,
  [upper.name]: upper.fn,
  [max.name]: max.fn,
  [slugify.name]: slugify.fn,
};

describe("renderPattern", () => {
  it("renders literals and variables without transforms", () => {
    const parsed = parsePattern("{type}/{title}-{id}");
    const out = renderPattern(
      parsed,
      { type: "feat", title: "My Task", id: "123" },
      { transforms: defaultTransforms },
    );
    expect(out).toBe("feat/My Task-123");
  });

  it("applies transforms in order (slugify then max)", () => {
    const parsed = parsePattern("{title:slugify;max:5}");
    const out = renderPattern(
      parsed,
      { title: "Título grande" },
      { transforms: defaultTransforms },
    );
    // slugify -> "titulo-grande" then max:5 -> "titul"
    expect(out).toBe("titul");
  });

  it("throws when an unknown transform is used", () => {
    const parsed: ParsedPattern = {
      nodes: [{ kind: "variable", name: "foo", transforms: [{ name: "nope", args: [] }] }],
      variablesUsed: ["foo"],
    };

    expect(() => renderPattern(parsed, { foo: "bar" }, { transforms: defaultTransforms })).toThrow(
      /Unknown transform/i,
    );
  });

  it("throws on missing variable in strict mode (default)", () => {
    const parsed = parsePattern("{id}");
    expect(() => renderPattern(parsed, {}, { transforms: defaultTransforms })).toThrow(
      /Missing value/,
    );
  });

  it("returns empty for missing variable when strict is false", () => {
    const parsed = parsePattern("pre-{id}-post");
    const out = renderPattern(parsed, {}, { transforms: defaultTransforms, strict: false });
    expect(out).toBe("pre--post");
  });

  it("propagates transform errors (invalid max arg)", () => {
    const parsed = parsePattern("{title:max:-1}");
    expect(() =>
      renderPattern(parsed, { title: "abc" }, { transforms: defaultTransforms }),
    ).toThrow();
  });
});
