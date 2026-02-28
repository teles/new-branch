/**
 * @module init/defaults
 *
 * Default values and choices for the init wizard.
 */

/**
 * A selectable variable option in the wizard.
 */
export type VariableOption = {
  /** Variable name used in patterns. */
  name: string;
  /** Human-readable description. */
  description: string;
  /** Whether this variable is selected by default. */
  selected: boolean;
};

/**
 * Available variables to choose from.
 */
export const VARIABLE_OPTIONS: VariableOption[] = [
  { name: "type", description: "Branch type (feat, fix, chore...)", selected: true },
  { name: "title", description: "Task or feature title", selected: true },
  { name: "id", description: "Task identifier (PROJ-123)", selected: true },
  { name: "date", description: "Current date (YYYY-MM-DD)", selected: false },
  { name: "dateCompact", description: "Current date (YYYYMMDD)", selected: false },
  { name: "userName", description: "Git user name", selected: false },
  { name: "shortSha", description: "Short commit SHA", selected: false },
  { name: "currentBranch", description: "Current branch name", selected: false },
  { name: "repoName", description: "Repository name", selected: false },
  { name: "lastTag", description: "Most recent git tag", selected: false },
];

/**
 * Transform presets for the title variable.
 */
export type TransformPreset = {
  /** Display label in the wizard. */
  label: string;
  /** Transform chain to apply (e.g. "slugify;max:30"). */
  chain: string;
};

/**
 * Pre-configured transform presets for the title variable.
 */
export const TITLE_TRANSFORM_PRESETS: TransformPreset[] = [
  { label: "slugify — URL-safe slug", chain: "slugify" },
  { label: "slugify + max — Slug with length limit", chain: "slugify;max:30" },
  { label: "kebab — kebab-case", chain: "kebab" },
  { label: "snake — snake_case", chain: "snake" },
  { label: "none — Leave as-is", chain: "" },
];

/**
 * Common branch type presets.
 */
export const DEFAULT_TYPES = [
  { value: "feat", label: "Feature" },
  { value: "fix", label: "Bug Fix" },
  { value: "chore", label: "Chore" },
  { value: "docs", label: "Documentation" },
  { value: "refactor", label: "Refactor" },
];

/**
 * Default separator used between pattern parts.
 */
export const DEFAULT_SEPARATOR = "/";

/**
 * Builds a pattern string from selected variables, transforms, and separators.
 *
 * @param variables - Ordered list of variable names to include.
 * @param transforms - Map of variable name to transform chain (e.g. { title: "slugify;max:30" }).
 * @param separators - Separators between variables (array of length variables.length - 1).
 * @returns A pattern string.
 */
export function buildPattern(
  variables: string[],
  transforms: Record<string, string>,
  separators: string[],
): string {
  return variables
    .map((v, i) => {
      const t = transforms[v];
      const varPart = t ? `{${v}:${t}}` : `{${v}}`;
      const sep = i < separators.length ? separators[i] : "";
      return varPart + sep;
    })
    .join("");
}
