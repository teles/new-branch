import type { ParsedPattern } from "@/pattern/types.js";
import type { RenderValues } from "@/pattern/transforms/renderPattern.js";
import type { TransformRegistry } from "@/pattern/transforms/types.js";

/**
 * Input data required by {@link explain} to produce a pipeline breakdown.
 */
export type ExplainInput = {
  /** The raw pattern string. */
  pattern: string;
  /** Where the pattern came from. */
  patternSource: string;
  /** The parsed AST. */
  ast: ParsedPattern;
  /** All values after resolution (builtins + git + CLI + prompted). */
  resolvedValues: RenderValues;
  /** Values provided via CLI flags. */
  cliValues: RenderValues;
  /** Values provided by builtins. */
  builtinValues: RenderValues;
  /** Values provided by git builtins. */
  gitValues: RenderValues;
  /** The final rendered branch name (before sanitization). */
  rendered: string;
  /** The final sanitized branch name. */
  sanitized: string;
  /** The maximum branch name length (if --max-length was set). */
  maxLength?: number;
  /** The branch name after truncation (if --max-length was set). */
  truncated?: string;
  /** The transform registry used for rendering. */
  transforms: TransformRegistry;
};

/**
 * Produces a structured, human-readable breakdown of the full
 * branch-name pipeline.
 *
 * @remarks
 * No branch is created — this is purely informational.
 * Used by the `--explain` CLI flag.
 *
 * Sections printed:
 * 1. Pattern and source
 * 2. Variables used
 * 3. Builtin values
 * 4. Git values
 * 5. CLI values
 * 6. Transform chain with intermediate values
 * 7. Rendered / Sanitized output
 * 8. Max-length truncation (when applicable)
 * 9. Final branch name
 *
 * @param input - The collected pipeline data.
 * @returns A multi-line string ready to be printed to stdout.
 */
export function explain(input: ExplainInput): string {
  const lines: string[] = [];

  lines.push("Pipeline explanation:\n");

  // 1. Pattern
  lines.push(`  Pattern:        ${input.pattern}`);
  lines.push(`  Pattern source: ${input.patternSource}`);

  // 2. Variables used
  const vars = input.ast.variablesUsed;
  lines.push(`\n  Variables used:  ${vars.length > 0 ? vars.join(", ") : "(none)"}`);

  // 3. Builtin values
  const builtinEntries = Object.entries(input.builtinValues).filter(([, v]) => v !== undefined);
  if (builtinEntries.length > 0) {
    lines.push(`\n  Builtin values:`);
    for (const [k, v] of builtinEntries) {
      lines.push(`    ${k} = "${v}"`);
    }
  }

  // 4. Git values
  const gitEntries = Object.entries(input.gitValues).filter(([, v]) => v !== undefined);
  if (gitEntries.length > 0) {
    lines.push(`\n  Git values:`);
    for (const [k, v] of gitEntries) {
      lines.push(`    ${k} = "${v}"`);
    }
  }

  // 5. CLI values
  const cliEntries = Object.entries(input.cliValues).filter(([, v]) => v !== undefined);
  if (cliEntries.length > 0) {
    lines.push(`\n  CLI values:`);
    for (const [k, v] of cliEntries) {
      lines.push(`    ${k} = "${v}"`);
    }
  }

  // 6. Transforms applied — with intermediate values
  const transformNodes = input.ast.nodes.filter(
    (n) => n.kind === "variable" && n.transforms.length > 0,
  );
  if (transformNodes.length > 0) {
    lines.push(`\n  Transforms applied:`);
    for (const node of transformNodes) {
      if (node.kind !== "variable") continue;
      const initial = input.resolvedValues[node.name] ?? "";
      lines.push(`    {${node.name}} = "${initial}"`);
      let current = initial;
      for (const t of node.transforms) {
        const fn = input.transforms[t.name];
        if (fn) {
          current = fn(current, t.args);
        }
        const argsStr = t.args.length > 0 ? `:${t.args.join(":")}` : "";
        lines.push(`      → ${t.name}${argsStr} → "${current}"`);
      }
    }
  }

  // 7. Final result
  lines.push(`\n  Rendered:       ${input.rendered}`);
  if (input.rendered !== input.sanitized) {
    lines.push(`  Sanitized:      ${input.sanitized}`);
  }

  // 8. Max-length truncation
  if (input.maxLength !== undefined) {
    lines.push(`  Max length:     ${input.maxLength}`);
    if (input.truncated !== undefined && input.truncated !== input.sanitized) {
      lines.push(`  Truncated:      ${input.truncated}`);
    } else {
      lines.push(`  Truncated:      (no truncation needed)`);
    }
  }

  const finalName = input.truncated ?? input.sanitized;
  lines.push(`\n  Final branch:   ${finalName}`);

  return lines.join("\n");
}
