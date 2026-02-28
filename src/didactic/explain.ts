import type { ParsedPattern } from "@/pattern/types.js";
import type { RenderValues } from "@/pattern/transforms/renderPattern.js";
import type { TransformRegistry } from "@/pattern/transforms/types.js";

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
  /** The transform registry used for rendering. */
  transforms: TransformRegistry;
};

/**
 * Produces a structured breakdown of the full branch-name pipeline.
 *
 * No branch is created — this is purely informational.
 * Used by the `--explain` CLI flag.
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
  lines.push(`\n  Final branch:   ${input.sanitized}`);

  return lines.join("\n");
}
