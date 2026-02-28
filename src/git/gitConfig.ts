import { execa } from "execa";

/**
 * Retrieves a single Git config value by key.
 *
 * @remarks
 * Runs `git config --get <key>` as a subprocess. Returns `undefined`
 * when the key is not set or the command fails (e.g. outside a repo).
 *
 * @param key - The Git config key to look up (e.g. `"user.name"`).
 * @returns The trimmed config value, or `undefined` if not found.
 *
 * @example
 * ```ts
 * const name = await getGitConfig("user.name"); // "Alice" | undefined
 * ```
 */
export async function getGitConfig(key: string): Promise<string | undefined> {
  try {
    const { stdout } = (await execa("git", ["config", "--get", key])) as { stdout: string };
    const value = String(stdout ?? "").trim();
    return value.length ? value : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Returns all git config entries matching a key pattern using `--get-regexp`.
 *
 * @remarks
 * Each entry is returned as a `[key, value]` tuple. Returns an empty
 * array if no entries match or if the command fails.
 *
 * @param pattern - A regular expression pattern passed to `git config --get-regexp`.
 * @returns An array of `[key, value]` tuples.
 *
 * @example
 * ```ts
 * const entries = await getGitConfigRegexp("^new-branch\\.patterns\\.");
 * // => [["new-branch.patterns.hotfix", "hotfix/{id}"], ...]
 * ```
 */
export async function getGitConfigRegexp(pattern: string): Promise<[key: string, value: string][]> {
  try {
    const { stdout } = (await execa("git", ["config", "--get-regexp", pattern])) as {
      stdout: string;
    };
    const raw = String(stdout ?? "").trim();
    if (!raw.length) return [];

    return raw.split("\n").reduce<[string, string][]>((acc, line) => {
      const idx = line.indexOf(" ");
      if (idx === -1) return acc;
      const key = line.slice(0, idx);
      const value = line.slice(idx + 1);
      if (key && value) acc.push([key, value]);
      return acc;
    }, []);
  } catch {
    return [];
  }
}
