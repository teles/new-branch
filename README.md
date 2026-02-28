# new-branch

<p align="center">
  <img src="./logo.svg" width="180" alt="new-branch logo" />
</p>

A composable CLI to generate and create standardized Git branch names using a pattern + transform pipeline.

![demo](./demo.gif)

[![CI](https://github.com/teles/new-branch/actions/workflows/ci.yml/badge.svg)](https://github.com/teles/new-branch/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/teles/new-branch/branch/main/graph/badge.svg)](https://codecov.io/gh/teles/new-branch)

📖 **[Full Documentation](https://teles.github.io/new-branch/)**

---

## Install

```bash
npx new-branch
```

Or install globally:

```bash
npm install -g new-branch
```

## Quick Start

```bash
new-branch \
  --pattern "{type}/{title:slugify;max:25}-{id}" \
  --type feat \
  --title "Add login page" \
  --id PROJ-123 \
  --create
```

```
✅ Branch created and switched to: feat/add-login-page-PROJ-123
```

Save your pattern so you don't have to type it every time:

```json
{
  "pattern": "{type}/{title:slugify}-{id}",
  "types": [
    { "value": "feat", "label": "Feature" },
    { "value": "fix", "label": "Bug Fix" }
  ]
}
```

## Features

- **Pattern language** — declarative syntax with variables, transforms, and arguments
- **16 built-in transforms** — `slugify`, `kebab`, `camel`, `max`, `replace`, `stripAccents`, and more
- **Flexible config** — `.newbranchrc.json`, `package.json`, or `git config`
- **Pattern aliases** — define named patterns and switch with `--use feature`
- **Interactive mode** — prompts for missing values, disable with `--no-prompt`
- **Git safety** — sanitized and validated via `git check-ref-format`
- **Didactic modes** — `--explain`, `--list-transforms`, `--print-config`

## Documentation

| Section | Description |
|---------|-------------|
| [Getting Started](https://teles.github.io/new-branch/guide/getting-started) | Installation and first branch |
| [Patterns](https://teles.github.io/new-branch/guide/patterns) | Pattern language syntax and examples |
| [Transforms](https://teles.github.io/new-branch/guide/transforms) | All 16 transforms with I/O tables |
| [Configuration](https://teles.github.io/new-branch/guide/configuration) | Config sources and precedence |
| [Pattern Aliases](https://teles.github.io/new-branch/guide/pattern-aliases) | Named patterns with `--use` |
| [CLI Reference](https://teles.github.io/new-branch/reference/cli-options) | All flags and options |
| [Recipes](https://teles.github.io/new-branch/recipes/github-flow) | GitHub Flow, Gitflow, Monorepo |

## Development

```bash
pnpm install
pnpm test:run
pnpm build
```

## License

MIT
