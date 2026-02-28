#!/usr/bin/env node

import { parseArgs } from "@/parseArgs.js";
import { parsePattern } from "@/pattern/parsePattern.js";
import { allTransforms, defaultTransforms } from "@/pattern/transforms/index.js";
import { renderPattern } from "@/pattern/transforms/renderPattern.js";
import { resolveMissingValues } from "@/runtime/resolveMissingValues.js";
import { getBuiltinValues } from "@/runtime/builtins.js";
import { loadConfigWithSource } from "@/config/loadConfig.js";
import { getGitConfig } from "@/git/gitConfig.js";
import {
  extractGitBuiltinKeysFromPattern,
  getGitBuiltins,
  patternNeedsGitBuiltins,
} from "@/git/gitBuiltins.js";
import type { RenderValues } from "@/pattern/transforms/renderPattern.js";
import { sanitizeGitRef } from "@/git/sanitizeGitRef.js";
import { validateBranchName } from "@/git/validateBranchName.js";
import { createBranch } from "@/git/createBranch.js";
import { listTransforms } from "@/didactic/listTransforms.js";
import { printConfig } from "@/didactic/printConfig.js";
import { explain } from "@/didactic/explain.js";

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
  // Normalize argv so it works consistently across:
  // - node dist/cli.js --id 123
  // - pnpm dev -- --id 123
  // - tsx src/cli.ts --id 123
  //
  // Notes:
  // - `pnpm` may inject a standalone "--" before the script flags.
  // - `tsx` puts the script path (e.g. `src/cli.ts`) as the first item in `process.argv.slice(2)`.
  //   That script path is not a flag, so we strip leading non-flag arguments.
  let argv = process.argv.slice(2);

  // Strip leading positional entries like `src/cli.ts` (common when running via `tsx`).
  while (argv.length > 0 && argv[0] !== "--" && !argv[0].startsWith("-")) {
    argv = argv.slice(1);
  }

  // Strip standalone "--" injected by pnpm.
  if (argv[0] === "--") {
    argv = argv.slice(1);
  }

  const wantsHelp = argv.includes("--help") || argv.includes("-h");

  // Important: parseArgs should receive the reconstructed argv
  const args = parseArgs(["node", "cli", ...argv]);
  if (wantsHelp) {
    return;
  }

  // --- Didactic mode: --list-transforms ---
  if (args.options.listTransforms) {
    console.log(listTransforms(allTransforms));
    return;
  }

  const quiet = args.options.quiet === true;
  const create = args.options.create === true;
  const prompt = args.options.prompt !== false;
  const isExplain = args.options.explain === true;

  // Pipeline: pattern -> AST -> resolve values -> render -> sanitize -> validate -> (optional) git -> output
  const { config: projectConfig, source: configSource } = await loadConfigWithSource();

  // --- Didactic mode: --print-config ---
  if (args.options.printConfig) {
    console.log(printConfig(projectConfig, configSource));
    return;
  }

  // Git config (respects local -> global precedence automatically)
  let gitPattern: string | undefined;

  if (!args.options.pattern && !projectConfig.pattern) {
    gitPattern = await getGitConfig("new-branch.pattern");
  }

  const resolvedPattern = args.options.pattern ?? projectConfig.pattern ?? gitPattern;
  const patternSource = args.options.pattern
    ? "CLI --pattern"
    : projectConfig.pattern
      ? configSource
      : gitPattern
        ? "git config"
        : "(none)";
  const patternRes = requirePattern(resolvedPattern);
  if (!isOk(patternRes)) fail("Invalid CLI arguments.", patternRes.error);

  const astRes = safe(() => parsePattern(patternRes.value));
  if (!isOk(astRes)) fail("Invalid pattern.", astRes.error);

  // Runtime built-ins (date, etc.)
  const builtinValues = getBuiltinValues();

  // Git built-ins (only if the pattern references them)
  let gitValues: RenderValues = {};
  if (patternNeedsGitBuiltins(patternRes.value)) {
    const gitKeys = extractGitBuiltinKeysFromPattern(patternRes.value);

    const gitRes = await safeAsync(() => getGitBuiltins(gitKeys));
    if (!isOk(gitRes)) fail("Failed to resolve git builtins.", gitRes.error);

    // GitBuiltins is compatible with RenderValues (string | undefined)
    gitValues = gitRes.value as RenderValues;
  }

  // Resolve `type` from CLI or config, honoring precedence:
  // 1. CLI --type overrides everything
  // 2. projectConfig.defaultType (if present)
  // 3. if only one type is declared, use that as a convenience
  // 4. otherwise leave undefined so resolveMissingValues will prompt (if prompt===true)
  let resolvedType = args.options.type ?? projectConfig.defaultType;

  if (!resolvedType && projectConfig.types?.length === 1) {
    resolvedType = projectConfig.types[0].value;
  }

  const initialValues: RenderValues = {
    ...builtinValues,
    ...gitValues,
    ...toInitialValues(args),
    type: resolvedType,
  };

  const valuesRes = await safeAsync(() =>
    resolveMissingValues(astRes.value, initialValues, {
      prompt,
      // If project config defines `types`, expose them as choices for the
      // interactive `type` select so the user sees and can choose project values.
      typeChoices: projectConfig.types
        ? projectConfig.types.map((t) => ({ name: t.label, value: t.value }))
        : undefined,
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

  // --- Didactic mode: --explain ---
  if (isExplain) {
    console.log(
      explain({
        pattern: patternRes.value,
        patternSource,
        ast: astRes.value,
        resolvedValues: valuesRes.value,
        cliValues: toInitialValues(args),
        builtinValues,
        gitValues,
        rendered: renderedRes.value,
        sanitized,
        transforms: defaultTransforms,
      }),
    );
    return;
  }

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
