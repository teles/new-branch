import { input, select } from "@inquirer/prompts";
import type { ParsedPattern } from "@/pattern/types.js";
import type { RenderValues } from "@/pattern/transforms/renderPattern.js";
import { TYPE_CHOICES } from "@/runtime/enums.js";

export type ResolveOptions = {
  /**
   * When false, missing required variables will throw instead of prompting.
   */
  prompt: boolean;
};

/**
 * Resolves missing variable values required by a parsed pattern.
 *
 * The function inspects `parsed.variablesUsed` and ensures each required
 * variable has a non-empty value in the returned object. If a variable is
 * missing or contains only whitespace and `opts.prompt` is `true`, the
 * function will prompt the user for the value. The special variable name
 * `type` is resolved with a select prompt pre-populated with
 * {@link TYPE_CHOICES}.
 *
 * Behavior summary:
 * - Any variable present in `parsed.variablesUsed` is considered required.
 * - If a value exists and is non-empty (after trimming) it is preserved.
 * - If a value is missing or blank and `opts.prompt` is `false`, an error is
 *   thrown listing the missing variable.
 * - If `opts.prompt` is `true`, the function will:
 *   - use a select prompt for the variable named `type` (choices from
 *     {@link TYPE_CHOICES});
 *   - use a text input prompt for any other variable.
 *
 * @param parsed - Parsed pattern containing `variablesUsed`.
 * @param initialValues - Existing values that may satisfy requirements.
 * @param opts - Options controlling prompting behavior.
 * @returns A promise resolving to a `RenderValues` object containing all
 * required variables (original values preserved when present).
 * @throws When a required variable is missing and `opts.prompt` is false.
 * @example
 * const parsed = parsePattern('{type}/{title}');
 * await resolveMissingValues(parsed, { title: 'Hello' }, { prompt: true });
 */
export async function resolveMissingValues(
  parsed: ParsedPattern,
  initialValues: RenderValues,
  opts: ResolveOptions,
): Promise<RenderValues> {
  const requiredVars = parsed.variablesUsed;

  const values: RenderValues = { ...initialValues };

  for (const name of requiredVars) {
    const current = values[name];

    if (current && current.trim() !== "") continue;

    if (!opts.prompt) {
      throw new Error(`Missing required value: "${name}"`);
    }

    if (name === "type") {
      const selected = await select({
        message: "Select branch type:",
        choices: TYPE_CHOICES,
      });

      values[name] = selected;
      continue;
    }

    const answer = await input({
      message: `Enter ${name}:`,
      validate: (v) => (v.trim() ? true : `${name} cannot be empty`),
    });

    values[name] = answer;
  }

  return values;
}
