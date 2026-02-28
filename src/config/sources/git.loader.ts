import { getGitConfig } from "@/git/gitConfig.js";
import type { BranchType, ConfigLoader, LoadResult, ProjectConfig } from "../types.js";
import { validateProjectConfigSource, validateProjectConfigFinal } from "../validate.js";

function parseGitTypes(raw: string): BranchType[] {
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((entry) => {
      const idx = entry.indexOf(":");

      if (idx === -1) {
        return { value: entry, label: entry };
      }

      return {
        value: entry.slice(0, idx).trim(),
        label: entry.slice(idx + 1).trim(),
      };
    });
}

export const gitLoader: ConfigLoader = {
  source: "git",

  async load(): Promise<LoadResult> {
    const pattern = await getGitConfig("new-branch.pattern");
    const defaultType = await getGitConfig("new-branch.defaultType");
    const typesRaw = await getGitConfig("new-branch.types");

    if (!pattern && !defaultType && !typesRaw) {
      return { found: false, source: "git", config: undefined };
    }

    const cfg: ProjectConfig = {};
    if (pattern) cfg.pattern = pattern;
    if (defaultType) cfg.defaultType = defaultType;
    if (typesRaw) cfg.types = parseGitTypes(typesRaw);

    const sourceValidated = validateProjectConfigSource(cfg, "git config");
    const finalValidated = validateProjectConfigFinal(sourceValidated, "git config");

    return { found: true, source: "git", config: finalValidated };
  },
};
