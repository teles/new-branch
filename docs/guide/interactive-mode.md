# Interactive Mode

By default, `new-branch` prompts for any missing values that are referenced by the pattern. This makes the CLI easy to use without memorizing all the required flags.

## How It Works

When a pattern references a variable (like `{type}`, `{title}`, or `{id}`) and that variable hasn't been provided via CLI flags or built-in values, the CLI will prompt you interactively.

```bash
# Only providing the pattern — will prompt for type, title, and id
npx new-branch --pattern "{type}/{title:slugify}-{id}"
```

```
? Select branch type: (Use arrow keys)
❯ Feature
  Bug Fix
  Chore

? Enter title: Add login page

? Enter id: PROJ-123
```

## Type Selection

When your configuration defines `types`, the interactive prompt shows them as a selection list instead of a free text input:

```json
{
  "types": [
    { "value": "feat", "label": "Feature" },
    { "value": "fix", "label": "Bug Fix" },
    { "value": "chore", "label": "Chore" }
  ]
}
```

The `label` is what the user sees in the prompt, and the `value` is what gets used in the branch name.

## Disabling Prompts

For CI/CD environments or scripts, disable interactive prompts with `--no-prompt`:

```bash
npx new-branch \
  --pattern "{type}/{title:slugify}-{id}" \
  --type feat \
  --title "My task" \
  --no-prompt
```

If a required value is missing and prompts are disabled, the CLI fails with a descriptive error:

```
❌ Failed to resolve required values.
   Missing: id
```

## Partial Values

You can provide some values via flags and let the CLI prompt for the rest:

```bash
# Provides type, will prompt for title and id
npx new-branch --pattern "{type}/{title:slugify}-{id}" --type feat
```

## Built-in Values

Date and git variables are resolved automatically and never prompted:

- Date variables (`year`, `month`, `day`, `date`, `dateCompact`) are derived from system time
- Git variables (`currentBranch`, `shortSha`, `repoName`, `userName`, `lastTag`) are derived from the git repository

Only user-provided variables (`type`, `title`, `id`) are prompted when missing.
