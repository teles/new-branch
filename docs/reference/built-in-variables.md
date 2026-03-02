# Built-in Variables

Variables are placeholders in patterns that get replaced with values at runtime. `new-branch` provides several categories of built-in variables.

## Core Variables

These are the primary variables provided by the user via CLI flags or interactive prompts.

| Variable | CLI Flag  | Description                                |
| -------- | --------- | ------------------------------------------ |
| `type`   | `--type`  | Branch type (e.g., `feat`, `fix`, `chore`) |
| `title`  | `--title` | Task or feature title                      |
| `id`     | `--id`    | Task identifier (e.g., `PROJ-123`)         |

```
{type}/{title:slugify}-{id}
```

## Date Variables

Derived from the local system time. Always available, never prompted.

| Variable      | Format             | Example      |
| ------------- | ------------------ | ------------ |
| `year`        | `YYYY`             | `2026`       |
| `month`       | `MM` (zero-padded) | `02`         |
| `day`         | `DD` (zero-padded) | `28`         |
| `date`        | `YYYY-MM-DD`       | `2026-02-28` |
| `dateCompact` | `YYYYMMDD`         | `20260228`   |

### Example

```bash
npx new-branch --pattern "release/{date}-{title:slugify}" --title "v2.0"
```

```
release/2026-02-28-v2-0
```

## Git Variables

Derived from the current Git repository. Resolved **lazily** — only when referenced in the pattern. Never prompted interactively.

| Variable        | Description                            | Example      |
| --------------- | -------------------------------------- | ------------ |
| `currentBranch` | Current branch name                    | `main`       |
| `shortSha`      | Short SHA of HEAD                      | `a1b2c3d`    |
| `repoName`      | Repository directory name              | `my-project` |
| `userName`      | Git user name (`git config user.name`) | `John Doe`   |
| `lastTag`       | Most recent git tag                    | `v1.2.3`     |

### Fallback Behavior

When a git variable is unavailable (e.g., no tags exist, or running outside a git repo), it resolves to an empty string.

::: tip
Use the `ifEmpty` transform to provide fallback values:

```
{lastTag:ifEmpty:v0.0.0}
```

:::

### Example

```bash
npx new-branch \
  --pattern "{userName:kebab}/{type}/{title:slugify}-{shortSha}" \
  --type feat \
  --title "Improve logging"
```

```
john-doe/feat/improve-logging-a1b2c3d
```

## Variable Resolution Order

For user-provided variables (`type`, `title`, `id`), values are resolved in this order:

1. **CLI flags** — `--type`, `--title`, `--id`
2. **Configuration defaults** — `defaultType` from config
3. **Single-type shortcut** — if only one `type` is defined, it's used automatically
4. **Interactive prompt** — if enabled (default)
5. **Error** — if `--no-prompt` is set

Date and git variables bypass this chain entirely — they are always resolved from the system/repository.

## Using Variables in Patterns

Any variable can be combined with [transforms](/guide/transforms):

```
{userName:kebab}/{type}/{title:stripAccents;slugify;max:30}-{id}
```

Variables not recognized as built-ins are treated as user variables and will be prompted for (or fail with `--no-prompt`).
