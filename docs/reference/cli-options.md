# CLI Options

Complete reference for all `new-branch` command-line options.

## Usage

```bash
new-branch [options]
```

Also available as git subcommands:

```bash
git new-branch [options]
git nb [options]
```

## Options

### Input Options

| Option                    | Type     | Description                                                            |
| ------------------------- | -------- | ---------------------------------------------------------------------- |
| `-p, --pattern <pattern>` | `string` | Branch name pattern. Takes highest precedence over all config sources. |
| `--use <name>`            | `string` | Use a named pattern alias defined in configuration.                    |
| `--type <type>`           | `string` | Branch type value (e.g., `feat`, `fix`, `chore`).                      |
| `--title <title>`         | `string` | Task or feature title.                                                 |
| `--id <id>`               | `string` | Task identifier (e.g., `PROJ-123`, `456`).                             |

### Behavior Options

| Option                    | Type      | Default | Description                                                                           |
| ------------------------- | --------- | ------- | ------------------------------------------------------------------------------------- |
| `-L, --max-length <n>`    | `number`  | —       | Maximum length for the final branch name. Truncates from the end if the name exceeds. |
| `--create`                | `boolean` | `false` | Create the branch using `git switch -c` and switch to it.                             |
| `--no-prompt`             | `boolean` | `false` | Disable interactive prompts. Fails if required values are missing.                    |
| `--quiet`                 | `boolean` | `false` | Suppress non-essential output. Only prints the branch name.                           |

### Didactic Options

| Option              | Type      | Description                                              |
| ------------------- | --------- | -------------------------------------------------------- |
| `--explain`         | `boolean` | Show a detailed breakdown of the entire branch pipeline. |
| `--list-transforms` | `boolean` | List all available transforms with descriptions.         |
| `--print-config`    | `boolean` | Print the resolved configuration and its source.         |

### Help

| Option       | Description        |
| ------------ | ------------------ |
| `-h, --help` | Show help message. |

## Examples

### Generate a branch name

```bash
new-branch \
  --pattern "{type}/{title:slugify}-{id}" \
  --type feat \
  --title "Add login" \
  --id PROJ-123
```

```
feat/add-login-PROJ-123
```

### Create branch from a named alias

```bash
new-branch --use hotfix --title "Fix crash" --id PROJ-456 --create
```

```
✅ Branch created and switched to: hotfix/fix-crash-PROJ-456
```

### Generate quietly (for scripts)

```bash
BRANCH=$(new-branch \
  --pattern "{type}/{title:slugify}-{id}" \
  --type feat \
  --title "My task" \
  --id 123 \
  --no-prompt \
  --quiet)

git checkout -b "$BRANCH"
```

### Limit branch name length

```bash
new-branch \
  --pattern "{type}/{title:slugify}-{id}" \
  --type feat \
  --title "Implement user authentication flow" \
  --id PROJ-123 \
  --max-length 30
```

```
feat/implement-user-authentica
```

### Inspect the pipeline

```bash
new-branch \
  --pattern "{type}/{title:slugify;max:25}-{id}" \
  --type feat \
  --title "Implement user authentication" \
  --id PROJ-789 \
  --explain
```
