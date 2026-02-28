import { describe, it, expect } from "vitest";
import { validateProjectConfigFinal, validateProjectConfigSource } from "./validate.js";
import type { ProjectConfig } from "./types.js";

describe("validateProjectConfigSource", () => {
  it("throws when raw is not an object", () => {
    expect(() => validateProjectConfigSource(null, "rc")).toThrow(
      /Invalid new-branch config from rc: config must be an object/,
    );
    expect(() => validateProjectConfigSource("nope", "rc")).toThrow(
      /Invalid new-branch config from rc: config must be an object/,
    );
  });

  it("returns empty config when no known keys exist", () => {
    const cfg = validateProjectConfigSource({ foo: "bar" }, "pkg");
    expect(cfg).toEqual({});
  });

  it("validates and trims pattern; blank becomes undefined", () => {
    const cfg1 = validateProjectConfigSource({ pattern: "  {type}/{id}  " }, "pkg");
    expect(cfg1).toEqual({ pattern: "{type}/{id}" });

    const cfg2 = validateProjectConfigSource({ pattern: "   " }, "pkg");
    expect(cfg2).toEqual({ pattern: undefined });
  });

  it("throws when pattern is present but not a string", () => {
    expect(() => validateProjectConfigSource({ pattern: 123 }, "pkg")).toThrow(
      /Invalid new-branch config from pkg: pattern must be a string/,
    );
  });

  it("validates and trims defaultType; blank becomes undefined", () => {
    const cfg1 = validateProjectConfigSource({ defaultType: "  feat  " }, "rc");
    expect(cfg1).toEqual({ defaultType: "feat" });

    const cfg2 = validateProjectConfigSource({ defaultType: "   " }, "rc");
    expect(cfg2).toEqual({ defaultType: undefined });
  });

  it("throws when defaultType is present but not a string", () => {
    expect(() => validateProjectConfigSource({ defaultType: false }, "rc")).toThrow(
      /Invalid new-branch config from rc: defaultType must be a string/,
    );
  });

  it("throws when types is present but not an array", () => {
    expect(() => validateProjectConfigSource({ types: "feat" }, "pkg")).toThrow(
      /Invalid new-branch config from pkg: types must be an array/,
    );
  });

  it("normalizes types entries (trims) and enforces value/label", () => {
    const cfg = validateProjectConfigSource(
      {
        types: [
          { value: " feat ", label: " Feature " },
          { value: "fix", label: "Bug Fix" },
        ],
      },
      "rc",
    );

    expect(cfg).toEqual({
      types: [
        { value: "feat", label: "Feature" },
        { value: "fix", label: "Bug Fix" },
      ],
    });
  });

  it("throws when a types[] entry is not an object", () => {
    expect(() => validateProjectConfigSource({ types: ["feat"] }, "rc")).toThrow(
      /Invalid new-branch config from rc: types\[\] must be an object/,
    );
  });

  it("throws when types[].value is empty after trimming", () => {
    expect(() =>
      validateProjectConfigSource({ types: [{ value: "   ", label: "Feature" }] }, "rc"),
    ).toThrow(/Invalid new-branch config from rc: types\[\]\.value cannot be empty/);
  });

  it("throws when types[].label is empty after trimming", () => {
    expect(() =>
      validateProjectConfigSource({ types: [{ value: "feat", label: "   " }] }, "pkg"),
    ).toThrow(/Invalid new-branch config from pkg: types\[\]\.label cannot be empty/);
  });

  it("throws when types[].value/label are missing (undefined)", () => {
    expect(() =>
      validateProjectConfigSource({ types: [{ value: undefined, label: "Feature" }] }, "rc"),
    ).toThrow(/Invalid new-branch config from rc: types\[\]\.value cannot be empty/);

    expect(() =>
      validateProjectConfigSource({ types: [{ value: "feat", label: undefined }] }, "rc"),
    ).toThrow(/Invalid new-branch config from rc: types\[\]\.label cannot be empty/);
  });

  it("does not fail if types is absent", () => {
    const cfg = validateProjectConfigSource({ pattern: "{id}" }, "git");
    expect(cfg).toEqual({ pattern: "{id}" });
  });

  it("validates patterns as a Record<string, string>", () => {
    const cfg = validateProjectConfigSource(
      {
        patterns: {
          hotfix: "hotfix/{id}-{title:kebab}",
          release: "release/{currentBranch}",
        },
      },
      "rc",
    );
    expect(cfg).toEqual({
      patterns: {
        hotfix: "hotfix/{id}-{title:kebab}",
        release: "release/{currentBranch}",
      },
    });
  });

  it("trims pattern alias values", () => {
    const cfg = validateProjectConfigSource(
      {
        patterns: {
          hotfix: "  hotfix/{id}  ",
        },
      },
      "rc",
    );
    expect(cfg.patterns).toEqual({ hotfix: "hotfix/{id}" });
  });

  it("throws when patterns is not an object", () => {
    expect(() => validateProjectConfigSource({ patterns: "not-an-object" }, "rc")).toThrow(
      /Invalid new-branch config from rc: patterns must be an object/,
    );
  });

  it("throws when a patterns value is not a string", () => {
    expect(() => validateProjectConfigSource({ patterns: { hotfix: 123 } }, "rc")).toThrow(
      /Invalid new-branch config from rc: patterns\["hotfix"\] must be a string/,
    );
  });

  it("throws when a patterns value is empty after trimming", () => {
    expect(() => validateProjectConfigSource({ patterns: { hotfix: "   " } }, "rc")).toThrow(
      /Invalid new-branch config from rc: patterns\["hotfix"\] cannot be empty/,
    );
  });

  it("omits patterns when all entries are empty (edge case)", () => {
    // Actually this should throw per validation, so test individual empty
    expect(() => validateProjectConfigSource({ patterns: { empty: "" } }, "pkg")).toThrow(
      /patterns\["empty"\] cannot be empty/,
    );
  });
});

describe("validateProjectConfigFinal", () => {
  it("returns cfg unchanged when no cross-field rules apply", () => {
    const cfg: ProjectConfig = { pattern: "{id}", defaultType: "feat" };
    const out = validateProjectConfigFinal(cfg, "rc");
    expect(out).toBe(cfg); // same reference ok
  });

  it("throws when types exists but is empty", () => {
    expect(() => validateProjectConfigFinal({ types: [] }, "pkg")).toThrow(
      /Invalid new-branch config from pkg: types cannot be empty/,
    );
  });

  it("throws when defaultType is not included in types", () => {
    expect(() =>
      validateProjectConfigFinal(
        {
          defaultType: "feat",
          types: [{ value: "fix", label: "Bug Fix" }],
        },
        "rc",
      ),
    ).toThrow(/Invalid new-branch config from rc: defaultType "feat" must exist in types/);
  });

  it("passes when defaultType exists in types", () => {
    const cfg: ProjectConfig = {
      defaultType: "feat",
      types: [
        { value: "feat", label: "Feature" },
        { value: "fix", label: "Bug Fix" },
      ],
    };

    const out = validateProjectConfigFinal(cfg, "rc");
    expect(out).toEqual(cfg);
  });

  it("does not require defaultType when types exists", () => {
    const cfg: ProjectConfig = {
      types: [{ value: "feat", label: "Feature" }],
    };

    const out = validateProjectConfigFinal(cfg, "rc");
    expect(out).toEqual(cfg);
  });
});
