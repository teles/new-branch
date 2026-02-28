import { getGitConfig } from "@/git/gitConfig.js";
import { execa } from "execa";

/**
 * Map of all supported git-derived built-in variables.
 *
 * @remarks
 * Each property corresponds to a variable name that can be referenced
 * inside a pattern (e.g. `{shortSha}`, `{currentBranch}`).
 */
export type GitBuiltins = {
  /** Short commit SHA of HEAD (e.g. `"abc1234"`). */
  shortSha?: string;
  /** Name of the currently checked-out branch (e.g. `"main"`). */
  currentBranch?: string;
  /** Git `user.name` or OS username as fallback. */
  userName?: string;
  /** Name of the repository derived from the repo root directory. */
  repoName?: string;
  /** Most recent reachable tag (via `git describe --tags --abbrev=0`). */
  lastTag?: string;
};

/**
 * Union type of valid keys in {@link GitBuiltins}.
 */
export type GitBuiltinKey = keyof GitBuiltins;

/**
 * Ordered list of all supported {@link GitBuiltinKey} values.
 */
export const GIT_BUILTIN_KEYS: GitBuiltinKey[] = [
  "shortSha",
  "currentBranch",
  "userName",
  "repoName",
  "lastTag",
];

/**
 * Deduplicates an array of {@link GitBuiltinKey} values.
 *
 * @param keys - Array of keys that may contain duplicates.
 * @returns A new array with unique keys only.
 */
function uniqueKeys(keys: GitBuiltinKey[]): GitBuiltinKey[] {
  return Array.from(new Set(keys));
}

/**
 * Returns the requested keys, or all supported keys when none are specified.
 *
 * @param keys - Optional subset of keys to resolve.
 * @returns The keys to resolve (deduplicated).
 */
function pickAllKeysIfUndefined(keys?: GitBuiltinKey[]): GitBuiltinKey[] {
  return keys?.length ? uniqueKeys(keys) : GIT_BUILTIN_KEYS;
}

/**
 * Executes a git command and returns its trimmed stdout, or `undefined` on failure.
 *
 * @param args - Arguments to pass to the `git` command.
 * @returns The trimmed stdout output, or `undefined` if the command fails or produces no output.
 */
async function safeExec(args: string[]): Promise<string | undefined> {
  try {
    const { stdout } = (await execa("git", args)) as { stdout: string };
    const value = String(stdout ?? "").trim();
    return value.length ? value : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Derives the repository name from the absolute path to the repo root.
 *
 * @param repoRoot - Absolute path returned by `git rev-parse --show-toplevel`.
 * @returns The last segment of the path, or `undefined` if the path is empty.
 */
function deriveRepoName(repoRoot: string): string | undefined {
  const parts = repoRoot.split(/[\\/]/).filter(Boolean);
  return parts.length ? parts[parts.length - 1] : undefined;
}

/**
 * Resolver map for each supported {@link GitBuiltinKey}.
 *
 * @remarks
 * Each resolver is an async function that returns the resolved value
 * or `undefined` when unavailable.
 */
const RESOLVERS: Record<GitBuiltinKey, () => Promise<string | undefined>> = {
  shortSha: () => safeExec(["rev-parse", "--short", "HEAD"]),

  currentBranch: async () => {
    const value = await safeExec(["rev-parse", "--abbrev-ref", "HEAD"]);
    return value === "HEAD" ? undefined : value;
  },

  repoName: async () => {
    const repoRoot = await safeExec(["rev-parse", "--show-toplevel"]);
    return repoRoot ? deriveRepoName(repoRoot) : undefined;
  },

  lastTag: () => safeExec(["describe", "--tags", "--abbrev=0"]),

  userName: async () => {
    const value = await getGitConfig("user.name");
    return value ?? process.env.USER ?? process.env.USERNAME ?? undefined;
  },
};

/**
 * Internal resolver that resolves the requested git builtin keys in parallel.
 *
 * @param keys - Optional subset of keys to resolve. When omitted, all keys are resolved.
 * @returns An object containing the resolved values.
 */
async function resolveGitBuiltins(keys?: GitBuiltinKey[]): Promise<GitBuiltins> {
  const wanted = pickAllKeysIfUndefined(keys);

  const entries = await Promise.all(
    wanted.map(async (key) => {
      const value = await RESOLVERS[key]();
      return [key, value] as const;
    }),
  );

  return entries.reduce<GitBuiltins>((acc, [key, value]) => {
    acc[key] = value;
    return acc;
  }, {});
}

/**
 * Resolves git-based built-in variables.
 *
 * @remarks
 * Each variable maps to a git command executed in the current repository.
 * Resolution is done in parallel for performance.
 *
 * @param keys - Optional subset of {@link GitBuiltinKey} values to resolve.
 *   When omitted, all supported git builtins are resolved.
 * @returns A promise resolving to a {@link GitBuiltins} object.
 *
 * @example
 * ```ts
 * // Resolve only what is needed
 * const builtins = await getGitBuiltins(["shortSha", "currentBranch"]);
 * builtins.shortSha;       // "abc1234"
 * builtins.currentBranch;  // "main"
 * ```
 */
export async function getGitBuiltins(keys?: GitBuiltinKey[]): Promise<GitBuiltins> {
  return resolveGitBuiltins(keys);
}

/**
 * Checks whether a pattern string references at least one git builtin key.
 *
 * @remarks
 * Use this before calling {@link getGitBuiltins} to avoid spawning
 * unnecessary git subprocesses.
 *
 * @param pattern - The raw pattern string to check.
 * @returns `true` if the pattern contains at least one {@link GitBuiltinKey}.
 */
export function patternNeedsGitBuiltins(pattern: string): boolean {
  return GIT_BUILTIN_KEYS.some((key) => pattern.includes(key));
}

/**
 * Extracts which {@link GitBuiltinKey} values are present in a pattern.
 *
 * @param pattern - The raw pattern string to inspect.
 * @returns An array of {@link GitBuiltinKey} values found in the pattern.
 *
 * @example
 * ```ts
 * extractGitBuiltinKeysFromPattern("{currentBranch}-{shortSha}");
 * // => ["shortSha", "currentBranch"]
 * ```
 */
export function extractGitBuiltinKeysFromPattern(pattern: string): GitBuiltinKey[] {
  return GIT_BUILTIN_KEYS.filter((key) => pattern.includes(key));
}
