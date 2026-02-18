import type { TransformDef, TransformRegistry } from "@/pattern/transforms/types.js";

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
