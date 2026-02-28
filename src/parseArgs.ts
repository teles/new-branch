import { cac } from "cac";

export type ParsedArgs = {
  options: {
    pattern?: string;
    id?: string;
    title?: string;
    type?: string;
    create?: boolean;
    prompt?: boolean;
    quiet?: boolean;
    help?: boolean;
    explain?: boolean;
    listTransforms?: boolean;
    printConfig?: boolean;
  };
  args: readonly string[];
};

function stripDoubleDash(argv: readonly string[]): string[] {
  const idx = argv.indexOf("--");
  if (idx === -1) return [...argv];
  // keep node + script, remove the "--" separator and retain the rest
  return [...argv.slice(0, idx), ...argv.slice(idx + 1)];
}

export function parseArgs(argv: readonly string[] = process.argv): ParsedArgs {
  const cli = cac("new-branch");

  cli
    .option("-p, --pattern <pattern>", "Branch pattern")
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
    .help();

  const cleaned = stripDoubleDash(argv);
  const parsed = cli.parse(cleaned);

  const opts = parsed.options as Record<string, unknown>;

  const options: ParsedArgs["options"] = {
    // Accept numeric or string-like values and coerce to string when present.
    pattern: opts.pattern !== undefined ? String(opts.pattern) : undefined,
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
  };

  return {
    options,
    args: parsed.args,
  };
}
