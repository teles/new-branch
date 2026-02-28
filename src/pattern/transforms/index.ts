/**
 * @module pattern/transforms
 *
 * Barrel module that exports the complete set of built-in transforms
 * and a pre-built default {@link TransformRegistry}.
 */
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
import { replace } from "@/pattern/transforms/replace.js";
import { replaceAll } from "@/pattern/transforms/replaceAll.js";
import { remove } from "@/pattern/transforms/remove.js";
import { stripAccents } from "@/pattern/transforms/stripAccents.js";
import { ifEmpty } from "@/pattern/transforms/ifEmpty.js";
import { before } from "@/pattern/transforms/before.js";
import { after } from "@/pattern/transforms/after.js";

/**
 * All built-in transform definitions, in registration order.
 */
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
  replace,
  replaceAll,
  remove,
  stripAccents,
  ifEmpty,
  before,
  after,
] satisfies TransformDef[];

/**
 * Pre-built {@link TransformRegistry} containing all built-in transforms.
 *
 * @remarks
 * This is the registry used by the CLI pipeline — pass it to
 * {@link renderPattern} as `transforms`.
 */
export const defaultTransforms = buildRegistry(allTransforms);
