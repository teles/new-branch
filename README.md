# new-branch CLI --- Specification

## 1. Overview

`new-branch` is a CLI tool for generating standardized Git branch names
based on a configurable pattern and optional interactive prompts.

It can be executed in two ways:

```bash
npx new-branch
git nb
```

---

## 2. Goals

- Standardize branch naming across teams.
- Provide interactive and non-interactive modes.
- Support a composable transformation pipeline (functional style).
- Ensure generated names are always valid Git references.
- Be easily extensible via custom transforms.

---

## 3. Usage

### 3.1 Basic

```bash
npx new-branch
```

Runs in interactive mode if required fields are missing.

---

### 3.2 With config file

```bash
npx new-branch --config .newbranchrc
```

Alias:

```bash
npx new-branch -c .newbranchrc
```

---

### 3.3 With custom pattern

```bash
npx new-branch --pattern "{type}/{title:slugify;max:25}-{id}"
```

Alias:

```bash
npx new-branch -p "{type}/{title:slugify;max:25}-{id}"
```

---

### 3.4 Non-interactive mode

```bash
npx new-branch   --pattern "{type}/{title:slugify;max:25}-{id}"   --id STK-123   --title "My very interesting task"   --type feat
```

If all required variables are provided, no prompt is shown.

---

## 4. Configuration Precedence

Resolution order (highest priority first):

1.  CLI flags
2.  Environment variables
3.  Config file (.newbranchrc)
4.  Defaults
5.  Interactive prompt (only if required values are missing)

---

## 5. Pattern Language

### 5.1 Syntax

Pattern example:

    {type}/{title:slugify;max:25}-{id}

Structure:

    {variable:transform1;transform2;transformWithArg:arg}

### 5.2 Parsing Model

Each token is parsed into:

- variable name
- ordered list of transforms
- optional arguments per transform

Example AST representation:

```json
{
  "variable": "title",
  "pipeline": [{ "fn": "slugify" }, { "fn": "max", "args": [25] }]
}
```

---

## 6. Built-in Variables

| Variable | Description                     |
| -------- | ------------------------------- |
| type     | Branch type (feat, fix, etc.)   |
| title    | Human-readable task title       |
| id       | Task identifier (e.g., STK-123) |

---

## 7. Built-in Transforms

All transforms must be pure functions.

### 7.1 String Transforms

| Transform | Description               |
| --------- | ------------------------- |
| slugify   | Converts to URL-safe slug |
| lowercase | Converts to lowercase     |
| uppercase | Converts to uppercase     |
| trim      | Trims whitespace          |
| titlecase | Capitalizes words         |

### 7.2 Argument-based Transforms

| Transform | Description                    | Example |
| --------- | ------------------------------ | ------- |
| max       | Truncates string to max length | max:25  |
| pad       | Pads string to length          | pad:10  |

### 7.3 Validation Transforms

Validation transforms do not modify a value but throw errors if invalid.

| Transform | Description                |
| --------- | -------------------------- |
| required  | Ensures value is not empty |
| match     | Validates value via regex  |

---

## 8. Functional Pipeline Execution

Each variable pipeline is executed using reduce semantics:

```js
pipeline.reduce((acc, step) => {
  return transforms[step.fn](acc, ...step.args);
}, baseValue);
```

All transforms must be registered in a dictionary:

```js
const transforms = {
  slugify,
  lowercase,
  uppercase,
  max,
  trim,
};
```

---

## 9. Git Ref Sanitization

After full pattern rendering, a final sanitization step must run:

- Remove invalid Git characters
- Prevent:
  - trailing slash
  - double dots
  - leading dash
  - spaces
- Ensure valid Git ref format

Final step example:

```js
branchName = sanitizeGitRef(branchName);
```

---

## 10. Branch Type Standardization

Supported types:

- feat
- fix
- chore
- docs
- refactor
- test
- perf
- build
- ci

Optional alias mapping:

- feature → feat
- bugfix → fix

---

## 11. Interactive Mode Behavior

If required values are missing:

Prompt user for: - type - id - title

Validation must occur immediately after input.

---

## 12. Optional Flags

| Flag       | Description                                |
| ---------- | ------------------------------------------ |
| `--create` | Creates branch using `git switch -c`       |
| `--print`  | Prints branch name only (default behavior) |

---

## 13. Example Outputs

Input:

    type = feat
    title = My very interesting task
    id = STK-123

Pattern:

    {type}/{title:slugify;max:25}-{id}

Output:

    feat/my-very-interesting-task-STK-123

---

## 14. Future Extensions

- Custom transform plugins
- Jira integration (auto-fetch title from ID)
- Branch existence check
- Automatic incremental suffixing
- Conventional commits integration

---

## 15. Summary

`new-branch` is a composable, functional, extensible CLI tool for
standardized Git branch naming.

Core principles:

- Functional pipeline transforms
- Deterministic output
- Git-safe sanitization
- Clear precedence rules
- Interactive fallback

# new-branch

A small CLI tool to generate and optionally create standardized Git branch names
based on a composable pattern language.

---

## Installation

Using npx:

```bash
npx new-branch
```

Or install globally:

```bash
npm install -g new-branch
```

---

## Usage

### Generate a branch name

```bash
new-branch \
  --pattern "{type}/{title:slugify}-{id}" \
  --type feat \
  --title "My task" \
  --id STK-123
```

Output:

```
feat/minha-tarefa-STK-123
```

---

### Create the branch automatically

```bash
new-branch \
  --pattern "{type:upper}/{title:slugify}-{id}" \
  --type feat \
  --title "My task" \
  --id STK-123 \
  --create
```

This runs:

```
git switch -c <generated-branch>
```

---

### Interactive mode

If required variables in the pattern are missing, the CLI will prompt for them.

Example:

```bash
new-branch \
  --pattern "{type:upper}/{title:slugify}-{id}" \
  --title "My task" \
  --id STK-123 \
  --create
```

You will be prompted for `type`.

---

## CLI Options

| Option                    | Description                                  |
| ------------------------- | -------------------------------------------- |
| `-p, --pattern <pattern>` | Branch name pattern                          |
| `--id <id>`               | Task ID                                      |
| `--title <title>`         | Task title                                   |
| `--type <type>`           | Branch type                                  |
| `--create`                | Create the branch using `git switch -c`      |
| `--no-prompt`             | Fail instead of prompting for missing values |
| `--quiet`                 | Do not print any output                      |

---

## Pattern Language

Branch names are generated from a pattern string.

Example:

```
{type}/{title:slugify;max:25}-{id}
```

### Syntax

```
{variable:transform1;transform2:arg}
```

- Variables are wrapped in `{}`
- Transforms are separated by `;`
- Transform arguments are separated by `:`

---

## Built-in Variables

These variables are currently supported:

- `type`
- `title`
- `id`

---

## Built-in Transforms

All transforms are pure functions and executed left-to-right.

### String transforms

| Transform | Description                 |
| --------- | --------------------------- |
| `lower`   | Lowercases the value        |
| `upper`   | Uppercases the value        |
| `slugify` | Converts to a git-safe slug |

### Argument-based transforms

| Transform | Description                    | Example  |
| --------- | ------------------------------ | -------- |
| `max`     | Truncates string to max length | `max:25` |

Example:

```
{title:slugify;max:25}
```

---

## Git Ref Validation

After rendering, branch names are:

1. Lightly sanitized
2. Validated using `git check-ref-format --branch`

If invalid, the command fails.

---

## Example

Input:

```
type = feat
title = My task
id = STK-123
```

Pattern:

```
{type}/{title:slugify;max:25}-{id}
```

Output:

```
feat/my-task-STK-123
```

---

## Roadmap

Planned future features:

- Config file support
- Custom transform plugins
- Additional variable providers (e.g. git username, date)
- Branch existence checks

---

## License

MIT
