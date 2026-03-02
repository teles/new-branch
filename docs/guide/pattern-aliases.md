# Pattern Aliases

Pattern aliases let you define named patterns in your configuration and select them at runtime with `--use`. This is useful when your team uses different branch naming conventions for different workflows.

## Defining Aliases

Add a `patterns` object to any configuration source:

::: code-group

```json [.newbranchrc.json]
{
  "pattern": "{type}/{title:slugify}-{id}",
  "patterns": {
    "feature": "{type}/{title:slugify;max:30}-{id}",
    "hotfix": "hotfix/{title:slugify}-{id}",
    "release": "release/{date}-{title:slugify}",
    "experiment": "exp/{userName:kebab}/{title:slugify}"
  }
}
```

```json [package.json]
{
  "new-branch": {
    "patterns": {
      "feature": "{type}/{title:slugify;max:30}-{id}",
      "hotfix": "hotfix/{title:slugify}-{id}"
    }
  }
}
```

```bash [git config]
git config new-branch.patterns.feature "{type}/{title:slugify;max:30}-{id}"
git config new-branch.patterns.hotfix "hotfix/{title:slugify}-{id}"
git config new-branch.patterns.release "release/{date}-{title:slugify}"
```

:::

## Using Aliases

Use the `--use` flag to select a named pattern:

```bash
# Use the "feature" pattern
npx new-branch --use feature --type feat --title "Add login" --id PROJ-123

# Use the "hotfix" pattern
npx new-branch --use hotfix --title "Fix crash on startup" --id PROJ-456

# Use the "release" pattern
npx new-branch --use release --title "v2.0"
```

## Precedence

The `--use` flag sits between `--pattern` and the default `pattern` in precedence:

| Priority | Source                          |
| -------- | ------------------------------- |
| 1        | `--pattern` (inline pattern)    |
| 2        | `--use` (named alias)           |
| 3        | `pattern` (default from config) |
| 4        | Git config `new-branch.pattern` |

This means `--pattern` always wins if both are provided:

```bash
# --pattern overrides --use
npx new-branch --pattern "{title:slugify}" --use feature --title "My task"
# → uses "{title:slugify}", NOT the "feature" alias
```

## Error Handling

If you use `--use` with a name that doesn't exist in your configuration, the CLI will show a helpful error:

```bash
$ npx new-branch --use typo --title "My task"

❌ Unknown pattern alias "typo". Available aliases: feature, hotfix, release
```

## Example Workflow

A common setup is to define patterns for each workflow your team uses:

```json
{
  "pattern": "{type}/{title:slugify}-{id}",
  "patterns": {
    "feature": "{type}/{title:slugify;max:30}-{id}",
    "hotfix": "hotfix/{date}-{title:slugify}-{id}",
    "release": "release/{date}-{title:slugify}",
    "experiment": "exp/{userName:kebab}/{title:slugify}"
  },
  "types": [
    { "value": "feat", "label": "Feature" },
    { "value": "fix", "label": "Bug Fix" },
    { "value": "chore", "label": "Chore" }
  ]
}
```

Then developers use `--use` to pick the right one:

```bash
# Day-to-day feature work
npx new-branch --use feature --title "User dashboard" --id PROJ-789 --create

# Urgent fix
npx new-branch --use hotfix --title "Fix payment crash" --id PROJ-790 --create

# Preparing a release
npx new-branch --use release --title "v3.1" --create
```

## Inspecting Aliases

Use `--explain` to see which pattern was resolved and from where:

```bash
npx new-branch --use hotfix --title "Fix crash" --id PROJ-456 --explain
```

The output will show `CLI --use (hotfix)` as the pattern source.
