/**
 * @module runtime/enums
 *
 * Shared enum-like choice definitions used during interactive prompts.
 */

/**
 * Represents a selectable choice in an interactive prompt.
 */
export type EnumChoice = {
  /** Human-readable label shown to the user. */
  name: string;
  /** Machine-friendly value written into the pattern. */
  value: string;
};

/**
 * Default branch-type choices used when the project does not
 * define custom types.
 *
 * @remarks
 * These follow the
 * {@link https://www.conventionalcommits.org/ | Conventional Commits}
 * type taxonomy.
 */
export const TYPE_CHOICES: readonly EnumChoice[] = [
  { name: "Feature", value: "feat" },
  { name: "Fix", value: "fix" },
  { name: "Documentation", value: "docs" },
  { name: "Chore", value: "chore" },
  { name: "Refactor", value: "refactor" },
  { name: "Test", value: "test" },
  { name: "Performance", value: "perf" },
  { name: "Build", value: "build" },
  { name: "CI", value: "ci" },
];
