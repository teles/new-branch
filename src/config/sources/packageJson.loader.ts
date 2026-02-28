import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { ConfigLoader, LoadResult } from "../types.js";
import { validateProjectConfigSource, validateProjectConfigFinal } from "../validate.js";

/**
 * Type guard for Node.js filesystem errors with a `code` property.
 *
 * @param e - The caught error value.
 * @returns `true` if `e` has a `code` property.
 */
function isNodeFsError(e: unknown): e is { code?: string } {
  return typeof e === "object" && e !== null && "code" in e;
}

/**
 * Config loader that reads the `"new-branch"` key from `package.json`.
 *
 * @remarks
 * Returns `found: false` when `package.json` does not exist or
 * does not contain a `"new-branch"` key.
 */
export const packageJsonLoader: ConfigLoader = {
  source: "package.json",

  async load(): Promise<LoadResult> {
    try {
      const path = join(process.cwd(), "package.json");
      const raw = await readFile(path, "utf8");
      const parsed = JSON.parse(raw) as unknown;

      if (typeof parsed !== "object" || parsed === null) {
        return { found: false, source: "package.json", config: undefined };
      }

      const pkg = parsed as Record<string, unknown>;
      const block = pkg["new-branch"];

      if (!block) {
        return { found: false, source: "package.json", config: undefined };
      }

      const sourceValidated = validateProjectConfigSource(block, "package.json");
      const finalValidated = validateProjectConfigFinal(sourceValidated, "package.json");

      return {
        found: true,
        source: "package.json",
        config: finalValidated,
      };
    } catch (e: unknown) {
      if (isNodeFsError(e) && e.code === "ENOENT") {
        return { found: false, source: "package.json", config: undefined };
      }
      throw e;
    }
  },
};
