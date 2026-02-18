import { input } from "@inquirer/prompts";
import type { ParsedPattern } from "@/pattern/types.js";
import type { RenderValues } from "@/pattern/transforms/renderPattern.js";

export type ResolveOptions = {
  /**
   * When false, missing required variables will throw instead of prompting.
   */
  prompt: boolean;
};

/**
 * Resolves missing variable values required by the pattern.
 *
 * Rule (v1):
 * - Any variable used in the pattern is considered required.
 */
export async function resolveMissingValues(
  parsed: ParsedPattern,
  initialValues: RenderValues,
  opts: ResolveOptions,
): Promise<RenderValues> {
  const requiredVars = parsed.variablesUsed;

  const values: RenderValues = { ...initialValues };

  for (const name of requiredVars) {
    if (values[name]) continue;

    if (!opts.prompt) {
      throw new Error(`Missing required value: "${name}"`);
    }

    const answer = await input({
      message: `Enter ${name}:`,
      validate: (v) => (v.trim() ? true : `${name} cannot be empty`),
    });

    values[name] = answer;
  }

  return values;
}
