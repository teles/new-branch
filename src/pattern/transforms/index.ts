import type { TransformDef } from "@/pattern/transforms/types.js";
import { lower } from "@/pattern/transforms/lower.js";
import { upper } from "@/pattern/transforms/upper.js";
import { max } from "@/pattern/transforms/max.js";
// import { replace } from "./replace.js";
import { slugify } from "./slugify.js";

export const allTransforms = [lower, upper, max, slugify] satisfies TransformDef[];

export function buildRegistry(defs: readonly TransformDef[]) {
  const registry: Record<string, TransformDef["fn"]> = {};
  for (const d of defs) {
    if (registry[d.name]) throw new Error(`Duplicate transform name: "${d.name}"`);
    registry[d.name] = d.fn;
  }
  return registry;
}

export const defaultTransforms = buildRegistry(allTransforms);
