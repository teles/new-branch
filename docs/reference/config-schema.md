# Config Schema

Complete reference for the `new-branch` configuration schema. This applies to `.newbranchrc.json` and the `"new-branch"` key in `package.json`.

## Full Schema

```json
{
  "pattern": "{type}/{title:slugify}-{id}",
  "patterns": {
    "feature": "{type}/{title:slugify;max:30}-{id}",
    "hotfix": "hotfix/{title:slugify}-{id}",
    "release": "release/{date}-{title:slugify}"
  },
  "types": [
    { "value": "feat", "label": "Feature" },
    { "value": "fix", "label": "Bug Fix" },
    { "value": "chore", "label": "Chore" }
  ],
  "defaultType": "feat"
}
```

## Properties

### `pattern`

- **Type**: `string`
- **Required**: No
- **Description**: The default pattern used to render branch names. Used when no `--pattern` or `--use` flag is provided.

```json
{
  "pattern": "{type}/{title:slugify}-{id}"
}
```

### `patterns`

- **Type**: `Record<string, string>`
- **Required**: No
- **Description**: Named pattern aliases. Keys are alias names, values are pattern strings. Use with `--use <name>` on the CLI.

```json
{
  "patterns": {
    "feature": "{type}/{title:slugify;max:30}-{id}",
    "hotfix": "hotfix/{title:slugify}-{id}"
  }
}
```

**Validation rules:**

- Must be a plain object
- All values must be non-empty strings
- Keys can be any valid string

### `types`

- **Type**: `Array<{ value: string, label: string }>`
- **Required**: No
- **Description**: Available branch type options. When present, these are shown as choices in the interactive `type` prompt.

```json
{
  "types": [
    { "value": "feat", "label": "Feature" },
    { "value": "fix", "label": "Bug Fix" }
  ]
}
```

Each entry must have:

| Property | Type     | Description                                    |
| -------- | -------- | ---------------------------------------------- |
| `value`  | `string` | Machine-friendly value used in the branch name |
| `label`  | `string` | Human-friendly label shown in prompts          |

**Validation rules:**

- Must be an array
- Each entry must have both `value` and `label`
- Both must be non-empty strings

### `defaultType`

- **Type**: `string`
- **Required**: No
- **Description**: Default value for the `type` variable. Used when `--type` is not provided on the CLI.

```json
{
  "defaultType": "feat"
}
```

**Validation rules:**

- Must be a non-empty string
- If `types` is also provided, `defaultType` must match one of the `types[].value` entries

## Git Config Equivalents

When using `git config` instead of a JSON file, use these keys:

| JSON Property | Git Config Key               | Example                                                           |
| ------------- | ---------------------------- | ----------------------------------------------------------------- |
| `pattern`     | `new-branch.pattern`         | `git config new-branch.pattern "{type}/{title:slugify}"`          |
| `patterns.*`  | `new-branch.patterns.<name>` | `git config new-branch.patterns.feature "{type}/{title:slugify}"` |

::: info
Git config does not support `types` or `defaultType`. Use `.newbranchrc.json` or `package.json` for those.
:::

## Minimal Examples

### Just a pattern

```json
{
  "pattern": "{type}/{title:slugify}-{id}"
}
```

### Pattern with types

```json
{
  "pattern": "{type}/{title:slugify}-{id}",
  "types": [
    { "value": "feat", "label": "Feature" },
    { "value": "fix", "label": "Bug Fix" }
  ]
}
```

### Pattern aliases only

```json
{
  "patterns": {
    "feature": "{type}/{title:slugify;max:30}-{id}",
    "hotfix": "hotfix/{title:slugify}-{id}"
  }
}
```
