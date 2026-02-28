# Init Wizard

The `new-branch init` command creates a `new-branch` configuration through an interactive wizard with **live preview**. You can save to `.newbranchrc.json`, `package.json`, or `git config`.

## Quick Start

```bash
new-branch init
```

Or accept all defaults without prompting:

```bash
new-branch init --yes
```

::: tip
The `--yes` (or `-y`) flag is useful for CI/CD pipelines or when you just want a sensible starting point to customize later.
:::

## What the Wizard Does

The init wizard walks you through each configuration decision in order:

### 1. Choose Config Target

First, select where to save your configuration:

```
? Where do you want to save the configuration?
  ● .newbranchrc.json — Dedicated config file
  ○ package.json — Under the "new-branch" key
  ○ git config — Local repo git config
```

::: info
All three targets are fully supported by `new-branch` at runtime. See [Configuration](/guide/configuration) for precedence rules.
:::

### 2. Select Variables

Choose which variables to include in your branch name pattern:

```
? Which variables do you want in your branch name?
  ◉ type — Branch type (feat, fix, chore...)
  ◉ title — Task or feature title
  ◉ id — Task identifier (PROJ-123)
  ◯ date — Current date (YYYY-MM-DD)
  ◯ userName — Git user name
  ...
```

### 3. Choose Separators

Pick separators between each variable pair:

```
? Separator between {type} and {title}:
  ● / (slash)
  ○ - (dash)
  ○ _ (underscore)
  ○ . (dot)
```

### 4. Apply Transforms

Select transforms for text variables like `title`:

```
? Apply transforms to {title}?
  ● slugify — URL-safe slug
  ○ slugify + max — Slug with length limit
  ○ kebab — kebab-case
  ○ snake — snake_case
  ○ none — Leave as-is
```

### 5. Live Preview

After building the pattern, the wizard shows a preview with realistic mock values:

```
🔍 Preview: feat/add-login-page-PROJ-123
```

### 6. Define Branch Types (Optional)

Optionally define allowed branch types:

```
? Define branch types? Yes
? Use common defaults (feat, fix, chore)? Yes
? Add more types? No
? Set a default type? feat
```

### 7. Define Pattern Aliases (Optional)

Optionally define named pattern aliases for `--use`:

```
? Define pattern aliases for --use? Yes
? Alias name: hotfix
? Pattern for "hotfix": hotfix/{title:slugify}-{id}
   🔍 Preview: hotfix/add-login-page-PROJ-123
? Add another alias? No
```

### 8. Write Config

The wizard displays the final configuration and asks for confirmation:

```
📄 Configuration to write:

{
  "pattern": "{type}/{title:slugify}-{id}",
  "types": [
    { "value": "feat", "label": "Feature" },
    { "value": "fix", "label": "Bug Fix" },
    { "value": "chore", "label": "Chore" }
  ],
  "defaultType": "feat"
}

? Write to .newbranchrc.json? Yes
✅ Written to .newbranchrc.json
```

::: tip
When writing to **git config**, each value is saved as a separate `new-branch.*` key (e.g. `new-branch.pattern`, `new-branch.defaultType`). Pattern aliases are stored as `new-branch.patterns.<name>`.
:::

## Default Config (`--yes`)

When using `--yes`, the wizard writes this configuration to `.newbranchrc.json` without any prompts:

```json
{
  "pattern": "{type}/{title:slugify}-{id}",
  "types": [
    { "value": "feat", "label": "Feature" },
    { "value": "fix", "label": "Bug Fix" },
    { "value": "chore", "label": "Chore" }
  ],
  "defaultType": "feat"
}
```

## Overwriting Existing Config

For file-based targets (`.newbranchrc.json` and `package.json`):

- **Interactive mode**: the wizard asks whether to overwrite or abort.
- **`--yes` mode**: the file is overwritten with a warning message.

For **git config**, values are always overwritten (git config is append/replace by nature).

## After Init

Once your config is in place, you can generate branches without specifying a pattern:

```bash
new-branch --type feat --title "Add login page" --id PROJ-123
```

See [Configuration](/guide/configuration) for all config options and precedence rules.
