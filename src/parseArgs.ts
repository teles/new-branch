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
    .help();

  const cleaned = stripDoubleDash(argv);
  const parsed = cli.parse(cleaned);

  const opts = parsed.options as Record<string, unknown>;

  const options: ParsedArgs["options"] = {
    pattern: typeof opts.pattern === "string" ? opts.pattern : undefined,
    id: typeof opts.id === "string" ? opts.id : undefined,
    title: typeof opts.title === "string" ? opts.title : undefined,
    type: typeof opts.type === "string" ? opts.type : undefined,
    create: typeof opts.create === "boolean" ? opts.create : undefined,
    prompt: typeof opts.prompt === "boolean" ? opts.prompt : undefined,
    quiet: typeof opts.quiet === "boolean" ? opts.quiet : undefined,
    help: typeof opts.help === "boolean" ? opts.help : undefined,
  };

  return {
    options,
    args: parsed.args,
  };
}
