import type { TransformDef, TransformRegistry } from "@/pattern/transforms/types.js";

/**
 * Builds a {@link TransformRegistry} from an array of {@link TransformDef} definitions.
 *
 * @param defs - The transform definitions to register.
 * @returns A record mapping each transform name to its function.
 * @throws {@link Error} If two definitions share the same name.
 *
 * @example
 * ```ts
 * const registry = buildRegistry([lower, upper, slugify]);
 * registry["lower"]("ABC", []); // => "abc"
 * ```
 */
export function buildRegistry(defs: readonly TransformDef[]): TransformRegistry {
  const registry: TransformRegistry = {};

  for (const d of defs) {
    if (registry[d.name]) {
      throw new Error(`Duplicate transform name: "${d.name}"`);
    }
    registry[d.name] = d.fn;
  }

  return registry;
}
