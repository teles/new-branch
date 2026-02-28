import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { ConfigLoader, LoadResult } from "../types.js";
import { validateProjectConfigSource, validateProjectConfigFinal } from "../validate.js";

/** Default filename for the RC configuration file. */
export const RC_FILENAME = ".newbranchrc.json";

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
 * Config loader that reads from a `.newbranchrc.json` file in the
 * current working directory.
 *
 * @remarks
 * Returns `found: false` when the RC file does not exist.
 * Throws for any other filesystem or JSON parse error.
 */
export const rcLoader: ConfigLoader = {
  source: "rc",

  async load(): Promise<LoadResult> {
    try {
      const path = join(process.cwd(), RC_FILENAME);
      const raw = await readFile(path, "utf8");
      const parsed: unknown = JSON.parse(raw);

      const sourceValidated = validateProjectConfigSource(parsed, RC_FILENAME);
      const finalValidated = validateProjectConfigFinal(sourceValidated, RC_FILENAME);

      return { found: true, source: "rc", config: finalValidated };
    } catch (e: unknown) {
      if (isNodeFsError(e) && e.code === "ENOENT") {
        return { found: false, source: "rc", config: undefined };
      }
      throw e;
    }
  },
};
