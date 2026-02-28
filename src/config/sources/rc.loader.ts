import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { ConfigLoader, LoadResult } from "../types.js";
import { validateProjectConfigSource, validateProjectConfigFinal } from "../validate.js";

export const RC_FILENAME = ".newbranchrc.json";

function isNodeFsError(e: unknown): e is { code?: string } {
  return typeof e === "object" && e !== null && "code" in e;
}

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
