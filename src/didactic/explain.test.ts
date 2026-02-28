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

  it("shows (none) when no variables are used", () => {
    const ast: ParsedPattern = {
      nodes: [{ kind: "literal", value: "static-branch" }],
      variablesUsed: [],
    };
    const output = explain(
      makeInput({
        pattern: "static-branch",
        ast,
        resolvedValues: {},
        cliValues: {},
        builtinValues: {},
        rendered: "static-branch",
        sanitized: "static-branch",
      }),
    );
    expect(output).toContain("Variables used:  (none)");
  });

  it("omits builtin values section when empty", () => {
    const output = explain(makeInput({ builtinValues: {} }));
    expect(output).not.toContain("Builtin values:");
  });

  it("omits CLI values section when empty", () => {
    const output = explain(makeInput({ cliValues: {} }));
    expect(output).not.toContain("CLI values:");
  });

  it("omits transforms section when no variable has transforms", () => {
    const ast: ParsedPattern = {
      nodes: [
        { kind: "variable", name: "type", transforms: [] },
        { kind: "literal", value: "/" },
        { kind: "variable", name: "id", transforms: [] },
      ],
      variablesUsed: ["type", "id"],
    };
    const output = explain(makeInput({ ast }));
    expect(output).not.toContain("Transforms applied:");
  });

  it("handles unknown transform gracefully (no fn in registry)", () => {
    const ast: ParsedPattern = {
      nodes: [
        {
          kind: "variable",
          name: "title",
          transforms: [{ name: "nonexistent", args: [] }],
        },
      ],
      variablesUsed: ["title"],
    };
    const output = explain(
      makeInput({
        pattern: "{title:nonexistent}",
        ast,
        resolvedValues: { title: "hello" },
        rendered: "hello",
        sanitized: "hello",
        transforms: {},
      }),
    );
    expect(output).toContain("Transforms applied:");
    expect(output).toContain('{title} = "hello"');
    expect(output).toContain('→ nonexistent → "hello"');
  });

  it("skips undefined builtin/git/cli values in their sections", () => {
    const output = explain(
      makeInput({
        builtinValues: { date: "2026-01-01", unused: undefined },
        gitValues: { branch: "main", sha: undefined },
        cliValues: { title: "x", id: undefined },
      }),
    );
    expect(output).toContain('date = "2026-01-01"');
    expect(output).not.toContain("unused");
    expect(output).toContain('branch = "main"');
    expect(output).not.toContain("sha");
    expect(output).toContain('title = "x"');
    expect(output).not.toContain("id = ");
  });

  it("shows max-length info when truncation happened", () => {
    const output = explain(
      makeInput({
        sanitized: "feat/my-feature-very-long-name",
        maxLength: 15,
        truncated: "feat/my-feature",
      }),
    );
    expect(output).toContain("Max length:     15");
    expect(output).toContain("Truncated:      feat/my-feature");
    expect(output).toContain("Final branch:   feat/my-feature");
  });

  it("shows max-length info when no truncation needed", () => {
    const output = explain(
      makeInput({
        sanitized: "feat/short",
        maxLength: 100,
        truncated: "feat/short",
      }),
    );
    expect(output).toContain("Max length:     100");
    expect(output).toContain("Truncated:      (no truncation needed)");
    expect(output).toContain("Final branch:   feat/short");
  });

  it("does not show max-length section when maxLength is not set", () => {
    const output = explain(makeInput());
    expect(output).not.toContain("Max length:");
    expect(output).not.toContain("Truncated:");
  });
});
