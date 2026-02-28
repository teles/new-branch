# Init Wizard

The `new-branch init` command creates a `.newbranchrc.json` configuration file through an interactive wizard with **live preview**.

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

### 1. Select Variables

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

### 2. Choose Separators

Pick separators between each variable pair:

```
? Separator between {type} and {title}:
  ● / (slash)
  ○ - (dash)
  ○ _ (underscore)
  ○ . (dot)
```

### 3. Apply Transforms

Select transforms for text variables like `title`:

```
? Apply transforms to {title}?
  ● slugify — URL-safe slug
  ○ slugify + max — Slug with length limit
  ○ kebab — kebab-case
  ○ snake — snake_case
  ○ none — Leave as-is
```

### 4. Live Preview

After building the pattern, the wizard shows a preview with realistic mock values:

```
🔍 Preview: feat/add-login-page-PROJ-123
```

### 5. Define Branch Types (Optional)

Optionally define allowed branch types:

```
? Define branch types? Yes
? Use common defaults (feat, fix, chore)? Yes
? Add more types? No
? Set a default type? feat
```

### 6. Define Pattern Aliases (Optional)

Optionally define named pattern aliases for `--use`:

```
? Define pattern aliases for --use? Yes
? Alias name: hotfix
? Pattern for "hotfix": hotfix/{title:slugify}-{id}
   🔍 Preview: hotfix/add-login-page-PROJ-123
? Add another alias? No
```

### 7. Write Config

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

## Default Config (`--yes`)

When using `--yes`, the wizard writes this configuration without any prompts:

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

If a `.newbranchrc.json` already exists:

- **Interactive mode**: the wizard asks whether to overwrite or abort.
- **`--yes` mode**: the file is overwritten with a warning message.

## After Init

Once your config is in place, you can generate branches without specifying a pattern:

```bash
new-branch --type feat --title "Add login page" --id PROJ-123
```

See [Configuration](/guide/configuration) for all config options and precedence rules.
