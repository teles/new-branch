/**
 * @module parseArgs
 *
 * CLI argument parser built on top of {@link https://github.com/cacjs/cac | cac}.
 * Defines every flag accepted by `new-branch` and coerces raw `process.argv`
 * values into a strongly-typed {@link ParsedArgs} object.
 */
import { cac } from "cac";

/**
 * Strongly-typed representation of the CLI arguments returned by {@link parseArgs}.
 */
export type ParsedArgs = {
  options: {
    /** Branch pattern template string (e.g. `"{type}/{id}-{title | slugify}"`). */
    pattern?: string;
    /** Named pattern alias defined in the project configuration. */
    use?: string;
    /** Task / issue identifier injected into the pattern as `{id}`. */
    id?: string;
    /** Human-readable task title injected as `{title}`. */
    title?: string;
    /** Branch type token injected as `{type}` (e.g. `feat`, `fix`). */
    type?: string;
    /** When `true`, run `git checkout -b <branch>` after generating the name. */
    create?: boolean;
    /** When `false` (`--no-prompt`), fail instead of prompting for missing values. */
    prompt?: boolean;
    /** Suppress non-essential output. */
    quiet?: boolean;
    /** Show the built-in help message. */
    help?: boolean;
    /** Show a detailed breakdown of the branch-name pipeline. */
    explain?: boolean;
    /** List all registered transforms and exit. */
    listTransforms?: boolean;
    /** Print the fully resolved configuration and exit. */
    printConfig?: boolean;
    /** Maximum allowed length for the final branch name (deterministic end-truncation). */
    maxLength?: number;
  };
  /** Positional (non-option) arguments that follow the flags. */
  args: readonly string[];
};

/**
 * Remove the bare `"--"` separator from an argv array so that `cac` does not
 * choke on it. Everything before and after the separator is preserved.
 *
 * @param argv - Raw argument vector (typically `process.argv`).
 * @returns A new array with the `"--"` element removed, if present.
 */
function stripDoubleDash(argv: readonly string[]): string[] {
  const idx = argv.indexOf("--");
  if (idx === -1) return [...argv];
  // keep node + script, remove the "--" separator and retain the rest
  return [...argv.slice(0, idx), ...argv.slice(idx + 1)];
}

/**
 * Parse a raw argument vector into a typed {@link ParsedArgs} object.
 *
 * @remarks
 * String-like option values are coerced via `String()` and numeric ones via
 * `Number()`, so callers always receive the expected primitive types regardless
 * of how the shell delivers them.
 *
 * @param argv - The argument vector to parse (defaults to `process.argv`).
 * @returns Parsed and coerced CLI arguments.
 *
 * @example
 * ```ts
 * const { options } = parseArgs(["node", "new-branch", "--type", "feat", "--id", "42"]);
 * // options.type === "feat"
 * // options.id   === "42"
 * ```
 */
export function parseArgs(argv: readonly string[] = process.argv): ParsedArgs {
  const cli = cac("new-branch");

  cli
    .option("-p, --pattern <pattern>", "Branch pattern")
    .option("--use <name>", "Use a named pattern alias from configuration")
    .option("--id <id>", "Task id")
    .option("--title <title>", "Task title")
    .option("--type <type>", "Branch type")
    .option("--create", "Create branch")
    .option("--no-prompt", "Fail instead of prompting for missing values")
    .option("--quiet", "Suppress non-essential output")
    .option(
      "--explain",
      "Show a detailed breakdown of the branch pipeline without creating a branch",
    )
    .option("--list-transforms", "List all available transforms")
    .option("--print-config", "Print the resolved configuration")
    .option("-L, --max-length <n>", "Maximum length for the final branch name")
    .help();

  const cleaned = stripDoubleDash(argv);
  const parsed = cli.parse(cleaned);

  const opts = parsed.options as Record<string, unknown>;

  const options: ParsedArgs["options"] = {
    // Accept numeric or string-like values and coerce to string when present.
    pattern: opts.pattern !== undefined ? String(opts.pattern) : undefined,
    use: opts.use !== undefined ? String(opts.use) : undefined,
    id: opts.id !== undefined ? String(opts.id) : undefined,
    title: opts.title !== undefined ? String(opts.title) : undefined,
    type: opts.type !== undefined ? String(opts.type) : undefined,
    create: typeof opts.create === "boolean" ? opts.create : undefined,
    // CAC provides `--no-prompt` as `noPrompt` normally, but the flag will
    // also be available as `prompt` when parsed; keep boolean handling.
    prompt: typeof opts.prompt === "boolean" ? opts.prompt : undefined,
    quiet: typeof opts.quiet === "boolean" ? opts.quiet : undefined,
    help: typeof opts.help === "boolean" ? opts.help : undefined,
    explain: typeof opts.explain === "boolean" ? opts.explain : undefined,
    listTransforms: typeof opts.listTransforms === "boolean" ? opts.listTransforms : undefined,
    printConfig: typeof opts.printConfig === "boolean" ? opts.printConfig : undefined,
    maxLength: opts.maxLength !== undefined ? Number(opts.maxLength) : undefined,
  };

  return {
    options,
    args: parsed.args,
  };
}
