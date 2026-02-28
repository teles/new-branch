import { getGitConfig, getGitConfigRegexp } from "@/git/gitConfig.js";
import type { BranchType, ConfigLoader, LoadResult, ProjectConfig } from "../types.js";
import { validateProjectConfigSource, validateProjectConfigFinal } from "../validate.js";

/**
 * Parses a comma-separated git config value into {@link BranchType} entries.
 *
 * @remarks
 * Each entry may be either `"value"` (label defaults to value) or
 * `"value:label"` (colon-separated).
 *
 * @param raw - The raw comma-separated string from git config.
 * @returns An array of {@link BranchType} objects.
 */
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

/** Prefix used for per-alias pattern keys in git config. */
const PATTERNS_PREFIX = "new-branch.patterns.";

/**
 * Converts raw `git config --get-regexp` entries into a patterns map.
 *
 * @param entries - Key/value tuples from `getGitConfigRegexp`.
 * @returns A record of pattern aliases, or `undefined` when empty.
 */
function parseGitPatterns(entries: [string, string][]): Record<string, string> | undefined {
  if (entries.length === 0) return undefined;

  const result: Record<string, string> = {};
  for (const [key, value] of entries) {
    const name = key.slice(PATTERNS_PREFIX.length);
    if (name && value) {
      result[name] = value;
    }
  }
  return Object.keys(result).length > 0 ? result : undefined;
}

/**
 * Config loader that reads `new-branch.*` keys from git config.
 *
 * @remarks
 * Supported keys:
 * - `new-branch.pattern`
 * - `new-branch.defaultType`
 * - `new-branch.types` (comma-separated)
 * - `new-branch.patterns.<alias>` (named patterns)
 */
export const gitLoader: ConfigLoader = {
  source: "git",

  async load(): Promise<LoadResult> {
    const pattern = await getGitConfig("new-branch.pattern");
    const defaultType = await getGitConfig("new-branch.defaultType");
    const typesRaw = await getGitConfig("new-branch.types");
    const patternsEntries = await getGitConfigRegexp("^new-branch\\.patterns\\.");

    if (!pattern && !defaultType && !typesRaw && patternsEntries.length === 0) {
      return { found: false, source: "git", config: undefined };
    }

    const cfg: ProjectConfig = {};
    if (pattern) cfg.pattern = pattern;
    if (defaultType) cfg.defaultType = defaultType;
    if (typesRaw) cfg.types = parseGitTypes(typesRaw);

    const patterns = parseGitPatterns(patternsEntries);
    if (patterns) cfg.patterns = patterns;

    const sourceValidated = validateProjectConfigSource(cfg, "git config");
    const finalValidated = validateProjectConfigFinal(sourceValidated, "git config");

    return { found: true, source: "git", config: finalValidated };
  },
};
