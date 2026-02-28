import type { TransformDef } from "@/pattern/transforms/types.js";

/**
 * Formats a human-readable table of all available transforms.
 *
 * @remarks
 * Each transform is listed with its name, summary, and an optional
 * usage example. Used by the `--list-transforms` CLI flag.
 *
 * @param transforms - The ordered list of {@link TransformDef} definitions.
 * @returns A multi-line formatted string ready to be printed to stdout.
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
