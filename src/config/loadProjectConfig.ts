import { readFile } from "node:fs/promises";
import { join } from "node:path";

export type ProjectConfig = {
  pattern?: string;
};

export async function loadProjectConfig(): Promise<ProjectConfig> {
  try {
    const path = join(process.cwd(), "package.json");
    const raw = await readFile(path, "utf8");
    const pkg = JSON.parse(raw) as Record<string, unknown>;

    const config = pkg["new-branch"];
    if (!config || typeof config !== "object") return {};

    const cfg = config as Record<string, unknown>;

    return {
      pattern: typeof cfg.pattern === "string" ? cfg.pattern : undefined,
    };
  } catch {
    return {};
  }
}
