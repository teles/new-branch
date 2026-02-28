/**
 * @module init/runInit
 *
 * Interactive wizard that walks the user through creating a `.newbranchrc.json`
 * configuration file.
 *
 * @remarks
 * The wizard flow:
 * 1. Detect existing config → offer to overwrite or abort
 * 2. Select variables to include in the pattern
 * 3. Choose separators between variables
 * 4. Choose transforms (for title and other text variables)
 * 5. Show live preview
 * 6. Optionally define branch types
 * 7. Optionally define pattern aliases
 * 8. Show final config → write to disk
 */

import { existsSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { input, select, confirm, checkbox } from "@inquirer/prompts";
import type { ProjectConfig, BranchType } from "@/config/types.js";
import { validateProjectConfigFinal } from "@/config/validate.js";
import {
  VARIABLE_OPTIONS,
  TITLE_TRANSFORM_PRESETS,
  DEFAULT_TYPES,
  buildPattern,
} from "@/init/defaults.js";
import { renderPreview } from "@/init/preview.js";

const CONFIG_FILE = ".newbranchrc.json";

/**
 * Options for {@link runInit}.
 */
export type InitOptions = {
  /** Accept all defaults without prompting. */
  yes?: boolean;
  /** Working directory (defaults to `process.cwd()`). */
  cwd?: string;
};

/**
 * Runs the init wizard and writes a `.newbranchrc.json` file.
 *
 * @param options - Options controlling wizard behavior.
 */
export async function runInit(options: InitOptions = {}): Promise<void> {
  const cwd = options.cwd ?? process.cwd();
  const configPath = resolve(cwd, CONFIG_FILE);

  // Step 0: Detect existing config
  if (existsSync(configPath)) {
    if (options.yes) {
      console.log(`⚠️  Overwriting existing ${CONFIG_FILE}`);
    } else {
      const overwrite = await confirm({
        message: `${CONFIG_FILE} already exists. Overwrite?`,
        default: false,
      });
      if (!overwrite) {
        console.log("Aborted.");
        return;
      }
    }
  }

  let config: ProjectConfig;

  if (options.yes) {
    config = buildDefaultConfig();
  } else {
    config = await buildInteractiveConfig();
  }

  // Validate before writing
  validateProjectConfigFinal(config, "init wizard");

  const json = JSON.stringify(config, null, 2) + "\n";

  // Show final config
  console.log("\n📄 Configuration to write:\n");
  console.log(json);

  if (!options.yes) {
    const proceed = await confirm({
      message: `Write to ${CONFIG_FILE}?`,
      default: true,
    });
    if (!proceed) {
      console.log("Aborted.");
      return;
    }
  }

  await writeFile(configPath, json, "utf-8");
  console.log(`✅ Written to ${CONFIG_FILE}`);
}

/**
 * Builds a config with sensible defaults (used with --yes).
 */
function buildDefaultConfig(): ProjectConfig {
  return {
    pattern: "{type}/{title:slugify}-{id}",
    types: DEFAULT_TYPES.slice(0, 3).map((t) => ({ value: t.value, label: t.label })),
    defaultType: "feat",
  };
}

/**
 * Walks the user through the interactive wizard.
 */
async function buildInteractiveConfig(): Promise<ProjectConfig> {
  const config: ProjectConfig = {};

  // Step 1: Select variables
  const selectedVars = await selectVariables();
  if (selectedVars.length === 0) {
    console.log("No variables selected. Aborting.");
    process.exit(0);
  }

  // Step 2: Choose separators
  const separators = await chooseSeparators(selectedVars);

  // Step 3: Choose transforms
  const transforms = await chooseTransforms(selectedVars);

  // Build pattern and show preview
  const pattern = buildPattern(selectedVars, transforms, separators);
  config.pattern = pattern;

  const preview = renderPreview(pattern);
  console.log(`\n🔍 Preview: ${preview}\n`);

  // Step 4: Define types (optional)
  const wantTypes = await confirm({
    message: "Define branch types?",
    default: true,
  });

  if (wantTypes) {
    const { types, defaultType } = await defineTypes();
    config.types = types;
    if (defaultType) {
      config.defaultType = defaultType;
    }
  }

  // Step 5: Define aliases (optional)
  const wantAliases = await confirm({
    message: "Define pattern aliases for --use?",
    default: false,
  });

  if (wantAliases) {
    config.patterns = await defineAliases();
  }

  return config;
}

/**
 * Prompts the user to select which variables to include.
 */
async function selectVariables(): Promise<string[]> {
  const choices = VARIABLE_OPTIONS.map((v) => ({
    name: `${v.name} — ${v.description}`,
    value: v.name,
    checked: v.selected,
  }));

  return checkbox({
    message: "Which variables do you want in your branch name?",
    choices,
  });
}

/**
 * Prompts for separators between variables.
 */
async function chooseSeparators(variables: string[]): Promise<string[]> {
  if (variables.length <= 1) return [];

  const separators: string[] = [];
  for (let i = 0; i < variables.length - 1; i++) {
    const defaultSep = i === 0 && variables[0] === "type" ? "/" : "-";
    const sep = await select({
      message: `Separator between {${variables[i]}} and {${variables[i + 1]}}:`,
      choices: [
        { name: "/ (slash)", value: "/" },
        { name: "- (dash)", value: "-" },
        { name: "_ (underscore)", value: "_" },
        { name: ". (dot)", value: "." },
      ],
      default: defaultSep,
    });
    separators.push(sep);
  }

  return separators;
}

/**
 * Prompts for transforms to apply to text variables.
 */
async function chooseTransforms(variables: string[]): Promise<Record<string, string>> {
  const transforms: Record<string, string> = {};

  // Only offer transforms for text-content variables
  const textVars = variables.filter(
    (v) => !["type", "id", "year", "month", "day", "date", "dateCompact", "shortSha"].includes(v),
  );

  for (const v of textVars) {
    const preset = await select({
      message: `Apply transforms to {${v}}?`,
      choices: TITLE_TRANSFORM_PRESETS.map((p) => ({
        name: p.label,
        value: p.chain,
      })),
      default: "slugify",
    });

    if (preset.includes("max")) {
      const maxVal = await input({
        message: `Max length for {${v}}? (characters)`,
        default: "30",
        validate: (val) => {
          const n = Number(val);
          return n > 0 && Number.isInteger(n) ? true : "Enter a positive integer";
        },
      });
      transforms[v] = preset.replace("max:30", `max:${maxVal}`);
    } else if (preset) {
      transforms[v] = preset;
    }
  }

  return transforms;
}

/**
 * Prompts the user to define branch types.
 */
async function defineTypes(): Promise<{ types: BranchType[]; defaultType?: string }> {
  const useDefaults = await confirm({
    message: `Use common defaults (${DEFAULT_TYPES.slice(0, 3)
      .map((t) => t.value)
      .join(", ")})?`,
    default: true,
  });

  let types: BranchType[];

  if (useDefaults) {
    types = DEFAULT_TYPES.slice(0, 3).map((t) => ({ value: t.value, label: t.label }));

    const addMore = await confirm({
      message: "Add more types?",
      default: false,
    });

    if (addMore) {
      const extras = await addCustomTypes();
      types = [...types, ...extras];
    }
  } else {
    types = await addCustomTypes();
    if (types.length === 0) {
      return { types: [] };
    }
  }

  // Default type
  const defaultType = await select({
    message: "Set a default type?",
    choices: [
      ...types.map((t) => ({ name: `${t.value} (${t.label})`, value: t.value })),
      { name: "(none)", value: "__none__" },
    ],
    default: types[0]?.value,
  });

  return {
    types,
    defaultType: defaultType === "__none__" ? undefined : defaultType,
  };
}

/**
 * Interactive loop to add custom branch types.
 */
async function addCustomTypes(): Promise<BranchType[]> {
  const types: BranchType[] = [];

  while (true) {
    const value = await input({
      message: "Type value (e.g., feat) — leave blank to finish:",
    });

    if (!value.trim()) break;

    const label = await input({
      message: `Label for "${value.trim()}":`,
      default: value.trim().charAt(0).toUpperCase() + value.trim().slice(1),
    });

    types.push({ value: value.trim(), label: label.trim() });
  }

  return types;
}

/**
 * Interactive loop to add pattern aliases.
 */
async function defineAliases(): Promise<Record<string, string>> {
  const patterns: Record<string, string> = {};

  while (true) {
    const name = await input({
      message: "Alias name (e.g., hotfix) — leave blank to finish:",
    });

    if (!name.trim()) break;

    const pattern = await input({
      message: `Pattern for "${name.trim()}":`,
      validate: (val) => (val.trim().length > 0 ? true : "Pattern cannot be empty"),
    });

    patterns[name.trim()] = pattern.trim();

    const preview = renderPreview(pattern.trim());
    console.log(`   🔍 Preview: ${preview}`);

    const addMore = await confirm({
      message: "Add another alias?",
      default: false,
    });

    if (!addMore) break;
  }

  return patterns;
}
