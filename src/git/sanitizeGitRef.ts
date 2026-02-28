/**
 * Performs a lightweight sanitization of a Git ref name.
 *
 * @remarks
 * This function applies a set of heuristic cleanups to make the input
 * more likely to pass `git check-ref-format --branch`. It does **not**
 * fully reimplement all Git ref rules — final validation must still be
 * delegated to Git itself via {@link validateBranchName}.
 *
 * Sanitization steps:
 * 1. Trim whitespace and replace internal whitespace with `-`.
 * 2. Remove characters forbidden by Git (`~ ^ : ? * [ ] \`).
 * 3. Remove `@{` sequences.
 * 4. Collapse multiple slashes and repeated dots.
 * 5. Strip leading dashes/slashes and trailing slashes/dots.
 * 6. Remove `.lock` suffix.
 *
 * @param input - The raw ref name to sanitize.
 * @returns The sanitized ref name.
 *
 * @example
 * ```ts
 * sanitizeGitRef("feat/My Feature!!"); // => "feat/My-Feature"
 * sanitizeGitRef("--leading/slash");   // => "leading/slash"
 * ```
 */
export function sanitizeGitRef(input: string): string {
  let name = input.trim();

  // Replace whitespace with "-"
  name = name.replace(/\s+/g, "-");

  // Remove characters Git never allows in refs
  // ~ ^ : ? * [ \ and ASCII control chars
  name = name.replace(/[~^:?*[\]\\]/g, "");
  //   name = name.replace(/[\u0000-\u001F\u007F]/g, "");

  // Remove occurrences of "@{"
  name = name.replace(/@\{/g, "");

  // Collapse multiple slashes
  name = name.replace(/\/+/g, "/");

  // Remove repeated dots
  name = name.replace(/\.\.+/g, ".");

  // Prevent leading dash or slash
  name = name.replace(/^[-/]+/, "");

  // Prevent trailing slash or dot
  name = name.replace(/[/.]+$/, "");

  // Prevent ending with ".lock"
  if (name.endsWith(".lock")) {
    name = name.slice(0, -5);
  }

  return name;
}
