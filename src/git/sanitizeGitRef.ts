/**
 * Performs a lightweight sanitization before delegating
 * full validation to Git.
 *
 * This does NOT try to fully reimplement Git rules.
 * Final validation must be done via:
 *   git check-ref-format --branch
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
