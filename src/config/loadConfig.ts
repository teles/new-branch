/**
 * @fileoverview
 * Aggregates configuration sources without merging.
 *
 * Precedence:
 * 1) .new-branchrc.json
 * 2) package.json
 * 3) git config
 */

import type { ProjectConfig } from "./types.js";
import { rcLoader } from "./sources/rc.loader.js";
import { packageJsonLoader } from "./sources/packageJson.loader.js";
import { gitLoader } from "./sources/git.loader.js";

/**
 * Loads the first configuration found.
 * No merging is performed.
 */
export async function loadConfig(): Promise<ProjectConfig> {
  const { config } = await loadConfigWithSource();
  return config;
}

/**
 * Loads the first configuration found and reports which source provided it.
 */
export async function loadConfigWithSource(): Promise<{ config: ProjectConfig; source: string }> {
  const rcRes = await rcLoader.load();
  if (rcRes.found && rcRes.config && Object.keys(rcRes.config).length > 0)
    return { config: rcRes.config, source: ".newbranchrc.json" };

  const pkgRes = await packageJsonLoader.load();
  if (pkgRes.found && pkgRes.config && Object.keys(pkgRes.config).length > 0)
    return { config: pkgRes.config, source: "package.json" };

  const gitRes = await gitLoader.load();
  if (gitRes.found) return { config: gitRes.config ?? {}, source: "git config" };

  return { config: {}, source: "(none)" };
}
