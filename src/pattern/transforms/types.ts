/**
 * @module pattern/transforms/types
 *
 * Shared types for the transform system.
 */

/**
 * Signature of a transform function.
 *
 * @param _value - The current string value to transform.
 * @param _args  - Positional arguments from the pattern syntax (e.g. `max:25` → `["25"]`).
 * @returns The transformed string.
 */
export type TransformFn = (_value: string, _args: readonly string[]) => string;

/**
 * Definition of a named transform that can be registered in the pipeline.
 */
export type TransformDef = {
  /** Unique transform name used in pattern syntax (e.g. `"slugify"`). */
  name: string;
  /** The transform implementation. */
  fn: TransformFn;
  /** Optional documentation metadata for `--list-transforms`. */
  doc?: {
    /** One-line description shown in the transform list. */
    summary: string;
    /** Usage examples in pattern syntax. */
    usage: string[];
    /** Optional human-readable before/after examples. */
    examples?: string[];
  };
};

/**
 * A lookup map from transform name to its implementation function.
 */
export type TransformRegistry = Record<string, TransformFn>;
