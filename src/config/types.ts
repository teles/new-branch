/**
 * @module config/types
 *
 * Core types for the `new-branch` configuration system.
 *
 * @remarks
 * Naming consistency: always use `new-branch`
 * (never `newBranch` or `newbranch`).
 */

/**
 * A branch type option shown in prompts and used in patterns.
 */
export type BranchType = {
  /**
   * Machine-friendly value written into the branch name.
   * Example: "feat", "fix", "chore"
   */
  value: string;

  /**
   * Human-friendly label shown in interactive prompts.
   * Example: "Feature", "Bug Fix"
   */
  label: string;
};

/**
 * Normalized configuration structure used internally by `new-branch`,
 * regardless of which source provided it.
 */
export type ProjectConfig = {
  /**
   * Pattern used to render the branch name.
   */
  pattern?: string;

  /**
   * Named pattern aliases.
   * Keys are alias names (e.g. "hotfix", "release"), values are pattern strings.
   */
  patterns?: Record<string, string>;

  /**
   * Available branch types.
   */
  types?: BranchType[];

  /**
   * Optional default type.
   * Must exist inside `types` if both are provided.
   */
  defaultType?: string;
};

/**
 * Identifies which configuration source provided the config.
 */
export type ConfigSourceId = "rc" | "package.json" | "git";

/**
 * Result returned by a config loader.
 */
export type LoadResult =
  | {
      found: false;
      source: ConfigSourceId;
      config: undefined;
    }
  | {
      found: true;
      source: ConfigSourceId;
      config: ProjectConfig;
    };

/**
 * A config loader is responsible for:
 * - checking whether its source exists
 * - loading raw data
 * - validating/normalizing into ProjectConfig
 */
export type ConfigLoader = {
  source: ConfigSourceId;
  load(): Promise<LoadResult>;
};
