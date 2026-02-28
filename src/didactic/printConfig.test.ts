import { describe, it, expect } from "vitest";
import { printConfig } from "./printConfig.js";
import type { ProjectConfig } from "@/config/types.js";

describe("printConfig", () => {
  it("shows source, pattern, defaultType and types", () => {
    const config: ProjectConfig = {
      pattern: "{type}/{title:slugify}",
      defaultType: "feat",
      types: [
        { value: "feat", label: "Feature" },
        { value: "fix", label: "Bug Fix" },
      ],
    };

    const output = printConfig(config, ".newbranchrc.json");

    expect(output).toContain("Resolved configuration:");
    expect(output).toContain("Source:       .newbranchrc.json");
    expect(output).toContain("Pattern:      {type}/{title:slugify}");
    expect(output).toContain("Default type: feat");
    expect(output).toContain("- feat (Feature)");
    expect(output).toContain("- fix (Bug Fix)");
  });

  it("shows (not set) for missing values", () => {
    const config: ProjectConfig = {};
    const output = printConfig(config, "(none)");

    expect(output).toContain("Pattern:      (not set)");
    expect(output).toContain("Default type: (not set)");
    expect(output).toContain("Types:        (not configured)");
  });

  it("shows (not configured) when types array is empty", () => {
    const config: ProjectConfig = { types: [] };
    const output = printConfig(config, "package.json");

    expect(output).toContain("Types:        (not configured)");
  });
});
