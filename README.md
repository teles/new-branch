# new-branch

<p align="center">
  <img src="./logo.svg" width="180" alt="new-branch logo" />
</p>

> “Explicit is better than implicit.”
> — The Zen of Python (PEP 20)

A composable CLI to generate and optionally create standardized Git branch names using a pattern + transform pipeline.

![demo](./demo.gif)

[![CI](https://github.com/teles/new-branch/actions/workflows/ci.yml/badge.svg)](https://github.com/teles/new-branch/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/teles/new-branch/branch/main/graph/badge.svg)](https://codecov.io/gh/teles/new-branch)

---

## Why

Keep branch names consistent across your team using a declarative pattern language.

---

## Install

Run without installing:

```bash
npx new-branch
```

Or install globally:

```bash
npm install -g new-branch
```

---

## Usage

Generate a branch name:

```bash
new-branch \
  --pattern "{type}/{title:slugify;max:25}-{id}" \
  --type feat \
  --title "My task" \
  --id STK-123
```

Create the branch automatically:

```bash
new-branch \
  --pattern "{type}/{title:slugify}-{id}" \
  --type feat \
  --title "My task" \
  --id STK-123 \
  --create
```

---

## Pattern Language

Patterns are composed of variables and ordered transforms.

Example:

```
{type}/{title:slugify;max:25}-{id}
```

### Syntax

```
{variable:transform1;transform2:arg}
```

- Variables are wrapped in `{}`
- Transforms run left-to-right
- Multiple transforms are separated by `;`
- Transform arguments use `:`

---

## Built-in Variables

### Core Variables

- `type`
- `title`
- `id`

### Date Built-ins (derived from local system time)

- `year` → YYYY
- `month` → MM (zero padded)
- `day` → DD (zero padded)
- `date` → YYYY-MM-DD
- `dateCompact` → YYYYMMDD

### Git Built-ins (derived from current Git repository)

- `currentBranch` → Current Git branch name (e.g. `main`, `feature/PROJ-123`)
- `shortSha` → Short SHA of `HEAD` (e.g. `a1b2c3d`)
- `repoName` → Repository directory name
- `userName` → Git user name (`git config user.name`)
- `lastTag` → Most recent Git tag (`git describe --tags --abbrev=0`)

> Note:
>
> - Git built-ins are resolved lazily and only when referenced in the pattern.
> - They are never prompted interactively.
> - When unavailable (e.g. outside a Git repository), they resolve to an empty string.

#### Example with Git built-ins

```bash
new-branch \
  --pattern "{currentBranch}-{shortSha}-{type}-{title:slugify}" \
  --type feat \
  --title "Improve logging"
```

Example output:

```
main-a1b2c3d-feat-improve-logging
```

---

## Built-in Transforms

| Transform | Description                |
| --------- | -------------------------- |
| `slugify` | Convert to URL-safe slug   |
| `lower`   | Convert to lowercase       |
| `upper`   | Convert to uppercase       |
| `camel`   | Convert to camelCase       |
| `kebab`   | Convert to kebab-case      |
| `snake`   | Convert to snake_case      |
| `title`   | Convert to Title Case      |
| `words:n` | Keep at most `n` words     |
| `max:n`   | Truncate to `n` characters |

All transforms are pure functions and composable.

---

## Interactive Mode

If variables referenced by the pattern are missing, the CLI prompts for them by default.

Disable prompts with:

```bash
--no-prompt
```

---

## CLI Options

| Option                    | Description                         |
| ------------------------- | ----------------------------------- |
| `-p, --pattern <pattern>` | Branch pattern                      |
| `--type <type>`           | Branch type                         |
| `--title <title>`         | Task title                          |
| `--id <id>`               | Task identifier                     |
| `--create`                | Create branch using `git switch -c` |
| `--no-prompt`             | Fail instead of prompting           |
| `--quiet`                 | Suppress output                     |

---

## Project Configuration and precedence

Configuration for `new-branch` may come from several places. The CLI resolves the first _non-empty_ configuration it finds according to the following precedence (highest → lowest):

1. CLI flags (explicit `--pattern`, `--type`, etc.)
2. `.newbranchrc.json` (a repository-local JSON config file)
3. `package.json` under the `new-branch` key
4. Git config (`new-branch.pattern`) — local then global
5. Interactive prompt (only if enabled and a value is still missing)

This means that if a higher-precedence source provides a non-empty value, lower-precedence sources are not consulted or merged.

Examples

1. `.newbranchrc.json` (preferred when present and non-empty):

```json
{
  "pattern": "{type}/{title:slugify}-{id}",
  "types": [
    { "value": "feat", "label": "Feature" },
    { "value": "fix", "label": "Fix" }
  ],
  "defaultType": "feat"
}
```

2. `package.json` fallback:

```json
{
  "new-branch": {
    "pattern": "{type}/{title:slugify}-{id}",
    "defaultType": "fix"
  }
}
```

3. Git config fallback (local takes precedence over global):

```bash
git config --local new-branch.pattern "{type}/{title:slugify}-{id}"
git config --global new-branch.pattern "{type}/{title:slugify}-{id}"
```

Notes about `type` and `defaultType`

- Order for resolving the branch `type` follows the SPEC behavior we implemented:
  1. CLI `--type` (explicit flag) overrides everything.
  2. `defaultType` from the selected configuration source is used next (if present).
  3. If the project config declares exactly one `type` in `types[]`, that single type is used as a convenience.
  4. If the type is still not resolved and interactive prompting is allowed, the CLI will prompt for it.
  5. If the type is still missing and `--no-prompt` (or `prompt: false`) is in effect, the CLI will fail with a helpful error.

- Validation: when a configuration source provides both `types[]` and `defaultType`, the `defaultType` must match one of the declared `types[].value`. If it does not, configuration validation will surface an error.

- Interactive prompts: when `types[]` are present in the chosen project config, those entries are exposed as choices to the interactive `type` select prompt so users see and can pick project-defined types.

To remove the pattern from Git config:

```bash
# Remove from local repository
git config --unset --local new-branch.pattern

# Remove from global config
git config --unset --global new-branch.pattern
```

---

## Git Safety

After rendering, branch names are:

1. Lightly sanitized
2. Validated via `git check-ref-format --branch`

Invalid names cause the command to fail.

---

## Development

```bash
pnpm install
pnpm test:run
pnpm build
```

---

## License

MIT
