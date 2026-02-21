import { execa } from "execa";
import { getGitConfig } from "@/git/gitConfig.js";

export type GitBuiltins = {
  shortSha?: string;
  currentBranch?: string;
  userName?: string;
  repoName?: string;
  lastTag?: string;
};

export type GitBuiltinKey = keyof GitBuiltins;

export const GIT_BUILTIN_KEYS: GitBuiltinKey[] = [
  "shortSha",
  "currentBranch",
  "userName",
  "repoName",
  "lastTag",
];

function uniqueKeys(keys: GitBuiltinKey[]): GitBuiltinKey[] {
  return Array.from(new Set(keys));
}

function pickAllKeysIfUndefined(keys?: GitBuiltinKey[]): GitBuiltinKey[] {
  return keys?.length ? uniqueKeys(keys) : GIT_BUILTIN_KEYS;
}

async function safeExec(args: string[]): Promise<string | undefined> {
  try {
    const { stdout } = await execa("git", args);
    const value = stdout.trim();
    return value.length ? value : undefined;
  } catch {
    return undefined;
  }
}

function deriveRepoName(repoRoot: string): string | undefined {
  const parts = repoRoot.split(/[\\/]/).filter(Boolean);
  return parts.length ? parts[parts.length - 1] : undefined;
}

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
 * - If `keys` is omitted, resolves all supported git builtins.
 * - If `keys` is provided, resolves only those keys.
 */
export async function getGitBuiltins(keys?: GitBuiltinKey[]): Promise<GitBuiltins> {
  return resolveGitBuiltins(keys);
}

/**
 * Returns true if the pattern contains at least one git builtin key.
 * (Call this before `getGitBuiltins()` if you want to avoid running git at all.)
 */
export function patternNeedsGitBuiltins(pattern: string): boolean {
  return GIT_BUILTIN_KEYS.some((key) => pattern.includes(key));
}

/**
 * Extracts which git builtin keys are present in the pattern.
 * (Use the returned keys to resolve only what you need.)
 */
export function extractGitBuiltinKeysFromPattern(pattern: string): GitBuiltinKey[] {
  return GIT_BUILTIN_KEYS.filter((key) => pattern.includes(key));
}
