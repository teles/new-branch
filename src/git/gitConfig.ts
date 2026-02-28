import { execa } from "execa";

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
 * Returns all git config entries matching a key prefix using `--get-regexp`.
 * Each entry is returned as a `[key, value]` tuple.
 *
 * Example: `getGitConfigRegexp("new-branch.patterns\\.")` returns
 * `[["new-branch.patterns.hotfix", "hotfix/{id}"], ...]`
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
