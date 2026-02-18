import { PatternNode, ParsedPattern, TransformNode } from "@/pattern/types.js";
/**
 * Parses a branch name pattern string and produces an abstract syntax tree (AST)
 * representation along with the list of variables used.
 *
 * @remarks
 * ## Pattern Grammar (v1)
 *
 * - **Literals**: Any text outside of `{}` is treated as a literal segment.
 * - **Variables**: Declared inside curly braces, e.g. `{name}`.
 * - **Transforms**: Optional transforms can be applied using `:` and `;`:
 *   - `{name:transform}`
 *   - `{name:transform;transform:arg}`
 * - **Transform arguments**: Separated by `:`, for example:
 *   - `{title:max:25}`
 *   - `{title:slugify;max:25}`
 *
 * This parser does **not** validate transform names or arguments.
 * Validation should be handled in a later stage of the pipeline.
 *
 * @param input - The raw pattern string to parse.
 *
 * @returns An object containing:
 * - `nodes`: An ordered list of parsed pattern nodes (literals and variables).
 * - `variablesUsed`: A deduplicated list of variable names in appearance order.
 *
 * @throws Error
 * - If a variable block is missing a closing `}`.
 * - If a `{` is found inside a variable block.
 * - If a variable block is empty (`{}`).
 * - If a variable name is missing.
 *
 * @example
 * Basic usage:
 *
 * ```ts
 * parsePattern("{type}/{title}-{id}");
 * ```
 *
 * @example
 * With transforms:
 *
 * ```ts
 * parsePattern("{type}/{title:slugify;max:25}-{id}");
 * ```
 *
 * @example
 * Returned structure:
 *
 * ```ts
 * {
 *   nodes: [
 *     { kind: "variable", name: "type", transforms: [] },
 *     { kind: "literal", value: "/" },
 *     {
 *       kind: "variable",
 *       name: "title",
 *       transforms: [
 *         { name: "slugify", args: [] },
 *         { name: "max", args: ["25"] }
 *       ]
 *     },
 *     { kind: "literal", value: "-" },
 *     { kind: "variable", name: "id", transforms: [] }
 *   ],
 *   variablesUsed: ["type", "title", "id"]
 * }
 * ```
 */
export function parsePattern(input: string): ParsedPattern {
  const nodes: PatternNode[] = [];
  const variablesUsed: string[] = [];

  let i = 0;
  let literalBuffer = "";

  const flushLiteral = () => {
    if (literalBuffer.length > 0) {
      nodes.push({ kind: "literal", value: literalBuffer });
      literalBuffer = "";
    }
  };

  while (i < input.length) {
    const ch = input[i];

    if (ch !== "{") {
      literalBuffer += ch;
      i += 1;
      continue;
    }

    // We found "{": start of a variable block.
    flushLiteral();

    const end = input.indexOf("}", i + 1);
    if (end === -1) {
      throw new Error(`Invalid pattern: missing "}" (at index ${i})`);
    }

    const inside = input.slice(i + 1, end).trim();
    if (inside.includes("{")) {
      throw new Error(`Invalid pattern: unexpected "{" inside "{}" (at index ${i})`);
    }
    if (!inside) {
      throw new Error(`Invalid pattern: empty "{}" (at index ${i})`);
    }

    const [rawName, ...rest] = inside.split(":");
    const name = rawName.trim();
    if (!name) {
      throw new Error(`Invalid pattern: missing variable name (at index ${i})`);
    }

    // If there was ":" in the inside, everything after the first ":" is the transform section.
    const transformSection = rest.length > 0 ? rest.join(":").trim() : "";

    const transforms: TransformNode[] = transformSection
      ? transformSection
          .split(";")
          .map((s) => s.trim())
          .filter(Boolean)
          .map(parseTransform)
      : [];

    nodes.push({ kind: "variable", name, transforms });
    variablesUsed.push(name);

    i = end + 1;
  }

  flushLiteral();

  return {
    nodes,
    variablesUsed: uniquePreserveOrder(variablesUsed),
  };
}

function parseTransform(segment: string): TransformNode {
  // segment examples:
  // - "slugify"
  // - "max:25"
  // - "replace:_:-"  (args are ["_", "-"])  (still v1, no quoting rules yet)
  const parts = segment.split(":").map((p) => p.trim());
  const name = parts[0];
  const args = parts.slice(1);

  if (!name) {
    throw new Error(`Invalid transform: "${segment}"`);
  }

  return { name, args };
}

function uniquePreserveOrder(items: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const it of items) {
    if (!seen.has(it)) {
      seen.add(it);
      out.push(it);
    }
  }
  return out;
}
