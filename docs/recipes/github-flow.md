# GitHub Flow

[GitHub Flow](https://docs.github.com/en/get-started/using-github/github-flow) is a lightweight branching model where all feature work happens in branches off `main`. Here's how to configure `new-branch` for it.

## Configuration

```json
{
  "pattern": "{type}/{title:slugify;max:40}-{id}",
  "types": [
    { "value": "feat", "label": "Feature" },
    { "value": "fix", "label": "Bug Fix" },
    { "value": "chore", "label": "Chore" },
    { "value": "docs", "label": "Documentation" },
    { "value": "refactor", "label": "Refactor" },
    { "value": "test", "label": "Tests" }
  ],
  "defaultType": "feat"
}
```

## Usage

```bash
# Feature work
npx new-branch --title "Add user dashboard" --id PROJ-123 --create
# → feat/add-user-dashboard-PROJ-123

# Bug fix
npx new-branch --type fix --title "Login crash on Safari" --id PROJ-456 --create
# → fix/login-crash-on-safari-PROJ-456

# Quick chore
npx new-branch --type chore --title "Update dependencies" --create
# → chore/update-dependencies
```

## With Pattern Aliases

For teams that also need release branches:

```json
{
  "pattern": "{type}/{title:slugify;max:40}-{id}",
  "patterns": {
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

```bash
# Normal feature work
npx new-branch --title "Add search" --id PROJ-789 --create

# Release branch
npx new-branch --use release --title "v2.1" --create
# → release/2026-02-28-v2-1
```

## CI Integration

Use `new-branch` in a GitHub Actions workflow to generate branch names:

```yaml
- name: Generate branch name
  run: |
    BRANCH=$(npx new-branch \
      --pattern "{type}/{title:slugify}-{id}" \
      --type feat \
      --title "${{ github.event.issue.title }}" \
      --id "${{ github.event.issue.number }}" \
      --no-prompt --quiet)
    echo "branch=$BRANCH" >> $GITHUB_OUTPUT
```
