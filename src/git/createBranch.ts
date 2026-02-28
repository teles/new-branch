import { execa } from "execa";

/**
 * Creates and switches to a new Git branch.
 *
 * @remarks
 * Uses a two-step strategy for maximum compatibility:
 * 1. Try `git switch -c <name>` (modern Git ≥ 2.23).
 * 2. Fallback to `git checkout -b <name>` if `switch` is unavailable.
 *
 * @param name - The name of the branch to create.
 * @throws {@link Error} If both `git switch -c` and `git checkout -b` fail.
 *
 * @example
 * ```ts
 * await createBranch("feat/my-feature");
 * ```
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
