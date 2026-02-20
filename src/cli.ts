#!/usr/bin/env node

import { parseArgs } from "@/parseArgs.js";
import { parsePattern } from "@/pattern/parsePattern.js";
import { defaultTransforms } from "@/pattern/transforms/index.js";
import { renderPattern } from "@/pattern/transforms/renderPattern.js";
import { resolveMissingValues } from "@/runtime/resolveMissingValues.js";
import { getBuiltinValues } from "@/runtime/builtins.js";
import { loadProjectConfig } from "./config/loadProjectConfig.js";
import { getGitConfig } from "@/git/gitConfig.js";
import type { RenderValues } from "@/pattern/transforms/renderPattern.js";
import { sanitizeGitRef } from "@/git/sanitizeGitRef.js";
import { validateBranchName } from "@/git/validateBranchName.js";
import { createBranch } from "@/git/createBranch.js";

/**
 * Minimal Result type to keep CLI flow as a pipeline without try/catch everywhere.
 */
type Ok<T> = { ok: true; value: T };
type Err = { ok: false; error: unknown };
type Result<T> = Ok<T> | Err;

const ok = <T>(value: T): Ok<T> => ({ ok: true, value });
const err = (error: unknown): Err => ({ ok: false, error });

const isOk = <T>(r: Result<T>): r is Ok<T> => r.ok;

function fail(msg: string, e?: unknown): never {
  console.error(`\n❌ ${msg}`);
  if (e) console.error(e);
  process.exit(1);
}

function safe<T>(fn: () => T): Result<T> {
  try {
    return ok(fn());
  } catch (e) {
    return err(e);
  }
}

async function safeAsync<T>(fn: () => Promise<T>): Promise<Result<T>> {
  try {
    return ok(await fn());
  } catch (e) {
    return err(e);
  }
}

function requirePattern(pattern: string | undefined): Result<string> {
  if (!pattern || pattern.trim().length === 0) {
    return err(new Error("Pattern is required. Use --pattern to specify it."));
  }
  return ok(pattern);
}

function toInitialValues(args: ReturnType<typeof parseArgs>): RenderValues {
  return {
    id: args.options.id,
    title: args.options.title,
    type: args.options.type,
  };
}

type Ctx = {
  quiet: boolean;
  create: boolean;
  prompt: boolean;
  pattern: string;
  ast: ReturnType<typeof parsePattern>;
  values: RenderValues;
  branchName: string;
};

export async function run(): Promise<void> {
  // Step 0: args/options
  // Note: CAC prints help, but depending on our parseArgs wrapper we might not
  // expose `help` in `args.options`. We still want to exit early and never
  // require a pattern when the user just asked for help.
  const argv = process.argv.slice(2);
  const wantsHelp = argv.includes("--help") || argv.includes("-h");

  const args = parseArgs(process.argv);
  if (wantsHelp) {
    return;
  }
  const quiet = args.options.quiet === true;
  const create = args.options.create === true;
  const prompt = args.options.prompt !== false;

  // Pipeline: pattern -> AST -> resolve values -> render -> sanitize -> validate -> (optional) git -> output
  const projectConfig = await loadProjectConfig();

  // Git config (respects local -> global precedence automatically)
  let gitPattern: string | undefined;

  if (!args.options.pattern && !projectConfig.pattern) {
    gitPattern = await getGitConfig("new-branch.pattern");
  }

  const resolvedPattern = args.options.pattern ?? projectConfig.pattern ?? gitPattern;
  const patternRes = requirePattern(resolvedPattern);
  if (!isOk(patternRes)) fail("Invalid CLI arguments.", patternRes.error);

  const astRes = safe(() => parsePattern(patternRes.value));
  if (!isOk(astRes)) fail("Invalid pattern.", astRes.error);

  const builtinValues = getBuiltinValues();

  const initialValues = {
    ...builtinValues,
    ...toInitialValues(args),
  };

  const valuesRes = await safeAsync(() =>
    resolveMissingValues(astRes.value, initialValues, {
      prompt,
    }),
  );
  if (!isOk(valuesRes)) fail("Failed to resolve required values.", valuesRes.error);

  const renderedRes = safe(() =>
    renderPattern(astRes.value, valuesRes.value, {
      transforms: defaultTransforms,
      strict: true,
    }),
  );
  if (!isOk(renderedRes)) fail("Failed to render branch name.", renderedRes.error);

  const sanitized = sanitizeGitRef(renderedRes.value);

  const validateRes = await safeAsync(() => validateBranchName(sanitized));
  if (!isOk(validateRes)) fail("Branch name is not valid for git.", validateRes.error);

  const ctx: Ctx = {
    quiet,
    create,
    prompt,
    pattern: patternRes.value,
    ast: astRes.value,
    values: valuesRes.value,
    branchName: sanitized,
  };

  const createRes = create ? await safeAsync(() => createBranch(ctx.branchName)) : ok(undefined);
  if (!isOk(createRes)) fail("Failed to create branch.", createRes.error);

  if (!ctx.quiet) {
    if (ctx.create) {
      console.log(`\n✅ Branch created and switched to: ${ctx.branchName}`);
    } else {
      console.log(ctx.branchName);
    }
  }
}

// Only execute the CLI automatically when not running tests.
// In tests, `run` can be imported and called directly.
if (process.env.NODE_ENV !== "test") {
  run().catch((e) => fail("Unexpected error in CLI.", e));
}
