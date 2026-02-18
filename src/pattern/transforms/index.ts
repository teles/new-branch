import type { TransformDef } from "@/pattern/transforms/types.js";
import { buildRegistry } from "@/pattern/transforms/registry.js";

import { lower } from "@/pattern/transforms/lower.js";
import { upper } from "@/pattern/transforms/upper.js";
import { max } from "@/pattern/transforms/max.js";
import { slugify } from "@/pattern/transforms/slugify.js";
import { camel } from "@/pattern/transforms/camel.js";
import { kebab } from "@/pattern/transforms/kebab.js";
import { snake } from "@/pattern/transforms/snake.js";
import { title } from "@/pattern/transforms/title.js";
import { words } from "@/pattern/transforms/words.js";

export const allTransforms = [
  lower,
  upper,
  max,
  slugify,
  camel,
  kebab,
  snake,
  title,
  words,
] satisfies TransformDef[];

export const defaultTransforms = buildRegistry(allTransforms);
