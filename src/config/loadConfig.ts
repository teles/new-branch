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
  // Load rc loader first and prefer a non-empty config. Avoid calling the
  // git loader unless necessary because it depends on external git state
  // and may import modules that are platform-sensitive.
  const rcRes = await rcLoader.load();
  if (rcRes.found && rcRes.config && Object.keys(rcRes.config).length > 0) return rcRes.config;

  const pkgRes = await packageJsonLoader.load();
  if (pkgRes.found && pkgRes.config && Object.keys(pkgRes.config).length > 0) return pkgRes.config;

  const gitRes = await gitLoader.load();
  if (gitRes.found) return gitRes.config ?? {};

  return {};
}
