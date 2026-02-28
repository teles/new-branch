import { execa } from "execa";

/**
 * Validates a branch name by delegating to Git itself.
 *
 * @remarks
 * Invokes `git check-ref-format --branch <name>` as a subprocess.
 * This ensures the name complies with all rules enforced by the
 * installed version of Git.
 *
 * @param name - The branch name to validate.
 * @throws {@link Error} If the branch name does not pass `git check-ref-format`.
 *
 * @example
 * ```ts
 * await validateBranchName("feat/my-branch"); // resolves
 * await validateBranchName("..");              // throws
 * ```
 */
export async function validateBranchName(name: string): Promise<void> {
  try {
    await execa("git", ["check-ref-format", "--branch", name]);
  } catch {
    throw new Error(`Invalid git branch name: "${name}"`);
  }
}
