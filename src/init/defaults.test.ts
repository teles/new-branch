import { describe, it, expect } from "vitest";
import {
  VARIABLE_OPTIONS,
  TITLE_TRANSFORM_PRESETS,
  DEFAULT_TYPES,
  DEFAULT_SEPARATOR,
  buildPattern,
} from "./defaults.js";

describe("VARIABLE_OPTIONS", () => {
  it("contains at least type, title, and id", () => {
    const names = VARIABLE_OPTIONS.map((v) => v.name);
    expect(names).toContain("type");
    expect(names).toContain("title");
    expect(names).toContain("id");
  });

  it("has type, title, and id selected by default", () => {
    const selected = VARIABLE_OPTIONS.filter((v) => v.selected).map((v) => v.name);
    expect(selected).toContain("type");
    expect(selected).toContain("title");
    expect(selected).toContain("id");
  });

  it("each variable has name and description", () => {
    for (const v of VARIABLE_OPTIONS) {
      expect(v.name).toBeTruthy();
      expect(v.description).toBeTruthy();
    }
  });
});

describe("TITLE_TRANSFORM_PRESETS", () => {
  it("contains at least slugify and none options", () => {
    const labels = TITLE_TRANSFORM_PRESETS.map((p) => p.label);
    expect(labels.some((l) => l.includes("slugify"))).toBe(true);
    expect(labels.some((l) => l.includes("none"))).toBe(true);
  });

  it("each preset has a label and chain", () => {
    for (const p of TITLE_TRANSFORM_PRESETS) {
      expect(p.label).toBeTruthy();
      expect(typeof p.chain).toBe("string");
    }
  });
});

describe("DEFAULT_TYPES", () => {
  it("contains feat, fix, and chore", () => {
    const values = DEFAULT_TYPES.map((t) => t.value);
    expect(values).toContain("feat");
    expect(values).toContain("fix");
    expect(values).toContain("chore");
  });

  it("each type has value and label", () => {
    for (const t of DEFAULT_TYPES) {
      expect(t.value).toBeTruthy();
      expect(t.label).toBeTruthy();
    }
  });
});

describe("DEFAULT_SEPARATOR", () => {
  it("is a slash", () => {
    expect(DEFAULT_SEPARATOR).toBe("/");
  });
});

describe("buildPattern", () => {
  it("builds a simple pattern without transforms", () => {
    const result = buildPattern(["type", "title"], {}, ["/"]);
    expect(result).toBe("{type}/{title}");
  });

  it("applies transforms to variables", () => {
    const result = buildPattern(["type", "title"], { title: "slugify" }, ["/"]);
    expect(result).toBe("{type}/{title:slugify}");
  });

  it("handles multiple transforms with semicolons", () => {
    const result = buildPattern(["type", "title"], { title: "slugify;max:30" }, ["/"]);
    expect(result).toBe("{type}/{title:slugify;max:30}");
  });

  it("handles multiple separators", () => {
    const result = buildPattern(["type", "id", "title"], { title: "slugify" }, ["/", "-"]);
    expect(result).toBe("{type}/{id}-{title:slugify}");
  });

  it("handles a single variable", () => {
    const result = buildPattern(["title"], { title: "kebab" }, []);
    expect(result).toBe("{title:kebab}");
  });

  it("handles all variables with transforms", () => {
    const result = buildPattern(
      ["type", "title", "id"],
      { type: "lower", title: "slugify", id: "upper" },
      ["/", "-"],
    );
    expect(result).toBe("{type:lower}/{title:slugify}-{id:upper}");
  });

  it("returns empty string for empty variables", () => {
    const result = buildPattern([], {}, []);
    expect(result).toBe("");
  });
});
