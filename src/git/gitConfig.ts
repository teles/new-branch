import { execa } from "execa";

export async function getGitConfig(key: string): Promise<string | undefined> {
  try {
    const { stdout } = await execa("git", ["config", "--get", key]);
    const value = stdout.trim();
    return value.length ? value : undefined;
  } catch {
    return undefined;
  }
}
