import type { ProjectConfig } from "@/config/types.js";

/**
 * Formats the resolved project configuration for display.
 *
 * @remarks
 * Shows the final resolved values from whichever source took
 * precedence. Used by the `--print-config` CLI flag.
 *
 * @param config - The resolved {@link ProjectConfig}.
 * @param source - Human-readable label identifying the winning source.
 * @returns A multi-line formatted string ready to be printed to stdout.
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
