/**
 * @module pattern/types
 *
 * Core AST types for the pattern parser.
 */

/**
 * Represents a single transform applied to a variable.
 *
 * @example
 * For `{title:slugify}` the transform node is `{ name: "slugify", args: [] }`.
 * For `{title:max:25}` the transform node is `{ name: "max", args: ["25"] }`.
 */
export type TransformNode = {
  /** The transform function name (e.g. `"slugify"`, `"max"`). */
  name: string;
  /** Positional arguments passed to the transform. */
  args: string[];
};

/**
 * An AST node representing a `{variable}` reference in a pattern.
 */
export type VariableNode = {
  /** Discriminant for pattern node union. */
  kind: "variable";
  /** The variable name (e.g. `"title"`, `"id"`). */
  name: string;
  /** Ordered transforms to apply to this variable’s value. */
  transforms: TransformNode[];
};

/**
 * An AST node representing literal (static) text in a pattern.
 */
export type LiteralNode = {
  /** Discriminant for pattern node union. */
  kind: "literal";
  /** The literal text content. */
  value: string;
};

/**
 * The result of parsing a branch-name pattern string.
 */
export type ParsedPattern = {
  /** Ordered list of AST nodes (literals and variables). */
  nodes: PatternNode[];
  /** Deduplicated list of variable names in appearance order. */
  variablesUsed: string[];
};

/**
 * A single node in a parsed pattern AST — either a literal or a variable.
 */
export type PatternNode = VariableNode | LiteralNode;
