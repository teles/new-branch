import { execa } from "execa";

/**
 * Creates and switches to a new Git branch.
 *
 * Strategy:
 * 1. Try `git switch -c <name>` (modern Git ≥ 2.23).
 * 2. Fallback to `git checkout -b <name>` if switch is unavailable.
 *
 * @throws Error if branch creation fails.
 */
export async function createBranch(name: string): Promise<void> {
  try {
    await execa("git", ["switch", "-c", name]);
    return;
  } catch {
    try {
      await execa("git", ["checkout", "-b", name]);
      return;
    } catch {
      throw new Error(`Failed to create branch "${name}"`);
    }
  }
}
