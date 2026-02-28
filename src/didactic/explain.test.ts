import { describe, it, expect } from "vitest";
import { explain } from "./explain.js";
import type { ExplainInput } from "./explain.js";
import type { ParsedPattern } from "@/pattern/types.js";
import { defaultTransforms } from "@/pattern/transforms/index.js";

function makeAst(overrides?: Partial<ParsedPattern>): ParsedPattern {
  return {
    nodes: [
      {
        kind: "variable",
        name: "type",
        transforms: [],
      },
      { kind: "literal", value: "/" },
      {
        kind: "variable",
        name: "title",
        transforms: [
          { name: "slugify", args: [] },
          { name: "max", args: ["25"] },
        ],
      },
    ],
    variablesUsed: ["type", "title"],
    ...overrides,
  };
}

function makeInput(overrides?: Partial<ExplainInput>): ExplainInput {
  return {
    pattern: "{type}/{title:slugify;max:25}",
    patternSource: "CLI --pattern",
    ast: makeAst(),
    resolvedValues: { type: "feat", title: "my feature" },
    cliValues: { title: "my feature" },
    builtinValues: { date: "2026-02-28" },
    gitValues: {},
    rendered: "feat/my-feature",
    sanitized: "feat/my-feature",
    transforms: defaultTransforms,
    ...overrides,
  };
}

describe("explain", () => {
  it("includes pipeline header", () => {
    const output = explain(makeInput());
    expect(output).toContain("Pipeline explanation:");
  });

  it("shows pattern and source", () => {
    const output = explain(makeInput());
    expect(output).toContain("Pattern:        {type}/{title:slugify;max:25}");
    expect(output).toContain("Pattern source: CLI --pattern");
  });

  it("lists variables used", () => {
    const output = explain(makeInput());
    expect(output).toContain("Variables used:  type, title");
  });

  it("shows builtin values", () => {
    const output = explain(makeInput());
    expect(output).toContain("Builtin values:");
    expect(output).toContain('date = "2026-02-28"');
  });

  it("shows CLI values", () => {
    const output = explain(makeInput());
    expect(output).toContain("CLI values:");
    expect(output).toContain('title = "my feature"');
  });

  it("shows transforms with intermediate values", () => {
    const output = explain(makeInput());
    expect(output).toContain("Transforms applied:");
    expect(output).toContain('{title} = "my feature"');
    expect(output).toContain('→ slugify → "my-feature"');
    expect(output).toContain('→ max:25 → "my-feature"');
  });

  it("shows chained transform intermediates with real changes", () => {
    const ast: ParsedPattern = {
      nodes: [
        {
          kind: "variable",
          name: "title",
          transforms: [
            { name: "slugify", args: [] },
            { name: "upper", args: [] },
          ],
        },
      ],
      variablesUsed: ["title"],
    };
    const output = explain(
      makeInput({
        pattern: "{title:slugify;upper}",
        ast,
        resolvedValues: { title: "Hello World" },
        rendered: "HELLO-WORLD",
        sanitized: "HELLO-WORLD",
      }),
    );
    expect(output).toContain('{title} = "Hello World"');
    expect(output).toContain('→ slugify → "hello-world"');
    expect(output).toContain('→ upper → "HELLO-WORLD"');
  });

  it("shows transform args in intermediate output", () => {
    const ast: ParsedPattern = {
      nodes: [
        {
          kind: "variable",
          name: "title",
          transforms: [{ name: "replace", args: ["foo", "bar"] }],
        },
      ],
      variablesUsed: ["title"],
    };
    const output = explain(
      makeInput({
        pattern: "{title:replace:foo:bar}",
        ast,
        resolvedValues: { title: "foo baz foo" },
        rendered: "bar baz foo",
        sanitized: "bar-baz-foo",
      }),
    );
    expect(output).toContain('{title} = "foo baz foo"');
    expect(output).toContain('→ replace:foo:bar → "bar baz foo"');
  });

  it("shows final branch name", () => {
    const output = explain(makeInput());
    expect(output).toContain("Final branch:   feat/my-feature");
  });

  it("omits git values section when empty", () => {
    const output = explain(makeInput({ gitValues: {} }));
    expect(output).not.toContain("Git values:");
  });

  it("shows git values when present", () => {
    const output = explain(makeInput({ gitValues: { branch: "main" } }));
    expect(output).toContain("Git values:");
    expect(output).toContain('branch = "main"');
  });

  it("shows rendered vs sanitized only when different", () => {
    const same = explain(makeInput({ rendered: "feat/hello", sanitized: "feat/hello" }));
    expect(same).not.toContain("Sanitized:");

    const diff = explain(
      makeInput({
        rendered: "feat/My Feature!!",
        sanitized: "feat/My-Feature",
      }),
    );
    expect(diff).toContain("Rendered:       feat/My Feature!!");
    expect(diff).toContain("Sanitized:      feat/My-Feature");
  });
});
