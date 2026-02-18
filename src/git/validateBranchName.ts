import { execa } from "execa";

/**
 * Validates a branch name by delegating to Git itself.
 *
 * Uses:
 *   git check-ref-format --branch <name>
 *
 * Throws if invalid.
 */
export async function validateBranchName(name: string): Promise<void> {
  try {
    await execa("git", ["check-ref-format", "--branch", name]);
  } catch {
    throw new Error(`Invalid git branch name: "${name}"`);
  }
}
