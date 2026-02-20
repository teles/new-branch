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

## Project Configuration

You can define a default pattern in `package.json`:

```json
{
  "new-branch": {
    "pattern": "{type}/{title:slugify}-{id}"
  }
}
```

### Git Configuration

You can also define a default pattern using Git config:

```bash
git config --local new-branch.pattern "{type}/{title:slugify}-{id}"
```

Or globally:

```bash
git config --global new-branch.pattern "{type}/{title:slugify}-{id}"
```

To remove the pattern from Git config:

```bash
# Remove from local repository
git config --unset --local new-branch.pattern

# Remove from global config
git config --unset --global new-branch.pattern
```

When using Git config, the resolution order becomes:

1. CLI flags
2. `package.json` configuration
3. Git config (`new-branch.pattern`)
4. Interactive prompt (if enabled)

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
