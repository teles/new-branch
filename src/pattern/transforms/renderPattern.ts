import type { ParsedPattern, PatternNode } from "@/pattern/types.js";
import type { TransformRegistry } from "@/pattern/transforms/types.js";

/**
 * A map of variable names to their string values.
 *
 * @remarks
 * Values may be `undefined` when not yet resolved; strict-mode
 * rendering will throw for any missing value.
 */
export type RenderValues = Record<string, string | undefined>;

/**
 * Options for {@link renderPattern}.
 */
export type RenderOptions = {
  /**
   * Map of available transforms by name.
   */
  transforms: TransformRegistry;

  /**
   * When `true`, throws if a variable is missing in `values`.
   * When `false`, missing variables are silently replaced with `""`.
   *
   * @defaultValue `true`
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

/**
 * Renders a node within the pattern AST.
 *
 * @param node       - The AST node (literal or variable).
 * @param values     - Current resolved values.
 * @param transforms - Transform registry for applying transforms.
 * @param strict     - Throw on missing values when `true`.
 * @returns The rendered string for this node.
 */
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
