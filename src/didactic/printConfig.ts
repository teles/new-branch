import type { ProjectConfig } from "@/config/types.js";

/**
 * Formats the resolved configuration for display.
 *
 * Shows the final resolved values from whichever source took precedence.
 * This is used by the `--print-config` CLI flag.
 */
export function printConfig(config: ProjectConfig, source: string): string {
  const lines: string[] = [];

  lines.push("Resolved configuration:\n");
  lines.push(`  Source:       ${source}`);
  lines.push(`  Pattern:      ${config.pattern ?? "(not set)"}`);
  lines.push(`  Default type: ${config.defaultType ?? "(not set)"}`);

  if (config.types && config.types.length > 0) {
    lines.push(`  Types:`);
    for (const t of config.types) {
      lines.push(`    - ${t.value} (${t.label})`);
    }
  } else {
    lines.push(`  Types:        (not configured)`);
  }

  return lines.join("\n");
}
