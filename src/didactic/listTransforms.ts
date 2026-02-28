import type { TransformDef } from "@/pattern/transforms/types.js";

/**
 * Prints a formatted table of all available transforms.
 *
 * Each transform is listed with its name, summary and usage example.
 * This is used by the `--list-transforms` CLI flag.
 */
export function listTransforms(transforms: readonly TransformDef[]): string {
  const lines: string[] = [];

  lines.push("Available transforms:\n");

  const maxName = Math.max(...transforms.map((t) => t.name.length));

  for (const t of transforms) {
    const name = t.name.padEnd(maxName + 2);
    const summary = t.doc?.summary ?? "(no description)";
    const usage = t.doc?.usage?.[0] ?? "";
    lines.push(`  ${name}${summary}`);
    if (usage) {
      lines.push(`  ${"".padEnd(maxName + 2)}Example: ${usage}`);
    }
  }

  return lines.join("\n");
}
