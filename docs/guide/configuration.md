# Configuration

`new-branch` supports multiple configuration sources with a clear precedence order. This lets you start simple and add structure as your team grows.

## Configuration Precedence

The CLI resolves the first non-empty configuration it finds, from highest to lowest priority:

| Priority | Source                              | Scope              |
| -------- | ----------------------------------- | ------------------ |
| 1        | CLI flags                           | Per invocation     |
| 2        | `.newbranchrc.json`                 | Per repository     |
| 3        | `package.json` (`"new-branch"` key) | Per repository     |
| 4        | Git config (`new-branch.*`)         | Per repo or global |
| 5        | Interactive prompt                  | Fallback           |

::: info
Higher-precedence sources **override** lower ones entirely. Configuration is **not** merged across sources.
:::

## Configuration Sources

### CLI Flags

CLI flags always take the highest precedence:

```bash
new-branch --pattern "{type}/{title:slugify}-{id}" --type feat
```

### `.newbranchrc.json`

A JSON file at the root of your repository. You can create one interactively with [`new-branch init`](/guide/init), or write it manually:

```json
{
  "pattern": "{type}/{title:slugify}-{id}",
  "types": [
    { "value": "feat", "label": "Feature" },
    { "value": "fix", "label": "Bug Fix" },
    { "value": "chore", "label": "Chore" },
    { "value": "docs", "label": "Documentation" },
    { "value": "refactor", "label": "Refactor" }
  ],
  "defaultType": "feat",
  "patterns": {
    "feature": "{type}/{title:slugify;max:30}-{id}",
    "hotfix": "hotfix/{title:slugify}-{id}",
    "release": "release/{date}-{title:slugify}"
  }
}
```

### `package.json`

Add a `"new-branch"` key to your existing `package.json`:

```json
{
  "name": "my-project",
  "new-branch": {
    "pattern": "{type}/{title:slugify}-{id}",
    "types": [
      { "value": "feat", "label": "Feature" },
      { "value": "fix", "label": "Bug Fix" }
    ],
    "defaultType": "fix"
  }
}
```

### Git Config

Use `git config` for per-repo or global settings:

```bash
# Per repository
git config --local new-branch.pattern "{type}/{title:slugify}-{id}"

# Global (all repositories)
git config --global new-branch.pattern "{type}/{title:slugify}-{id}"
```

Git config also supports pattern aliases:

```bash
git config new-branch.patterns.feature "{type}/{title:slugify;max:30}-{id}"
git config new-branch.patterns.hotfix "hotfix/{title:slugify}-{id}"
```

To remove a setting:

```bash
git config --unset --local new-branch.pattern
git config --unset --global new-branch.pattern
```

## Configuration Options

### `pattern`

The default pattern used to render branch names.

```json
{
  "pattern": "{type}/{title:slugify}-{id}"
}
```

### `patterns`

Named pattern aliases. Use with `--use` flag on the CLI.

```json
{
  "patterns": {
    "feature": "{type}/{title:slugify;max:30}-{id}",
    "hotfix": "hotfix/{title:slugify}-{id}",
    "release": "release/{date}-{title:slugify}"
  }
}
```

See [Pattern Aliases](/guide/pattern-aliases) for details.

### `types`

An array of branch type options. When configured, these are shown as choices in interactive prompts.

```json
{
  "types": [
    { "value": "feat", "label": "Feature" },
    { "value": "fix", "label": "Bug Fix" },
    { "value": "chore", "label": "Chore" }
  ]
}
```

Each type has:

- `value` — machine-friendly string used in the branch name
- `label` — human-friendly label shown in prompts

### `defaultType`

A default value for the `type` variable. Must match one of the `types[].value` entries if both are provided.

```json
{
  "types": [
    { "value": "feat", "label": "Feature" },
    { "value": "fix", "label": "Bug Fix" }
  ],
  "defaultType": "feat"
}
```

## Type Resolution

The `type` variable follows a specific resolution order:

1. **CLI `--type`** — explicit flag overrides everything
2. **`defaultType`** — from configuration
3. **Single type shortcut** — if only one type is declared in `types[]`, it's used automatically
4. **Interactive prompt** — if prompting is enabled
5. **Error** — if `--no-prompt` is set and type is missing

## Inspecting Configuration

Use `--print-config` to see the resolved configuration and its source:

```bash
new-branch --print-config
```

This shows which configuration source was selected and its full contents.
