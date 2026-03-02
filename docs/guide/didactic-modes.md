# Didactic Modes

`new-branch` includes several introspection modes that help you understand exactly what the CLI does, debug your configuration, and discover available features.

## `--explain`

Shows a detailed breakdown of the entire branch name pipeline without creating a branch:

```bash
npx new-branch \
  --pattern "{type}/{title:slugify;max:25}-{id}" \
  --type feat \
  --title "Add user authentication module" \
  --id PROJ-456 \
  --explain
```

The output includes:

- **Pattern source** — where the pattern came from (CLI, config file, git config, or `--use` alias)
- **AST breakdown** — parsed structure of the pattern
- **Variable resolution** — which values came from CLI, builtins, git, or prompts
- **Transform pipeline** — step-by-step rendering with each transform applied
- **Final result** — rendered and sanitized branch name

::: tip
`--explain` is especially useful when debugging pattern aliases:

```bash
npx new-branch --use hotfix --title "Fix crash" --id PROJ-456 --explain
```

The output will show `CLI --use (hotfix)` as the pattern source.
:::

## `--list-transforms`

Lists all available transforms with their descriptions and usage examples:

```bash
npx new-branch --list-transforms
```

Output:

```
Available transforms:

  lower          Convert to lowercase
                 Usage: {var:lower}

  upper          Convert to uppercase
                 Usage: {var:upper}

  slugify        Slugifies to a git-friendly format
                 Usage: {var:slugify}

  ...
```

## `--print-config`

Prints the resolved project configuration and which source it came from:

```bash
npx new-branch --print-config
```

Example output:

```
Configuration source: .newbranchrc.json

{
  "pattern": "{type}/{title:slugify}-{id}",
  "types": [
    { "value": "feat", "label": "Feature" },
    { "value": "fix", "label": "Bug Fix" }
  ],
  "defaultType": "feat"
}
```

This helps you verify:

- Which configuration file is being read
- What values are resolved
- Whether your config file is being found at all

## Combining Modes

Didactic flags are mutually exclusive — use one at a time. They all exit immediately without creating a branch.

| Flag                | Purpose                                           |
| ------------------- | ------------------------------------------------- |
| `--explain`         | Full pipeline breakdown for a specific invocation |
| `--list-transforms` | Discover available transforms                     |
| `--print-config`    | Inspect resolved configuration                    |
