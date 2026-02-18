import type { ParsedPattern, PatternNode } from "@/pattern/types.js";
import type { TransformRegistry } from "@/pattern/transforms/types.js";

export type RenderValues = Record<string, string | undefined>;

export type RenderOptions = {
  /**
   * Map of available transforms by name.
   */
  transforms: TransformRegistry;

  /**
   * When true, throws if a variable is missing in `values`.
   * When false, missing variables become "".
   */
  strict?: boolean;
};

/**
 * Renders a parsed pattern AST into its final string representation.
 *
 * @param parsed - The parsed pattern AST.
 * @param values - A map of variable values.
 * @param opts - Rendering options including transform registry.
 *
 * @returns The rendered string.
 *
 * @throws Error If a required variable is missing in strict mode.
 * @throws Error If an unknown transform is encountered.
 */
export function renderPattern(
  parsed: ParsedPattern,
  values: RenderValues,
  opts: RenderOptions,
): string {
  const strict = opts.strict ?? true;

  return parsed.nodes.map((node) => renderNode(node, values, opts.transforms, strict)).join("");
}

function renderNode(
  node: PatternNode,
  values: RenderValues,
  transforms: TransformRegistry,
  strict: boolean,
): string {
  if (node.kind === "literal") {
    return node.value;
  }

  const raw = values[node.name];

  if (raw == null) {
    if (strict) {
      throw new Error(`Missing value for "{${node.name}}"`);
    }
    return "";
  }

  let result = raw;

  for (const transform of node.transforms) {
    const fn = transforms[transform.name];

    if (!fn) {
      throw new Error(`Unknown transform "${transform.name}" on "{${node.name}}"`);
    }

    result = fn(result, transform.args);
  }

  return result;
}
