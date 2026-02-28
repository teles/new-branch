# Gitflow

[Gitflow](https://nvie.com/posts/a-successful-git-branching-model/) uses multiple long-lived branches (`main`, `develop`) and specific branch prefixes for features, releases, and hotfixes. Here's how to configure `new-branch` for it.

## Configuration

```json
{
  "pattern": "{type}/{title:slugify;max:40}-{id}",
  "patterns": {
    "feature": "feature/{title:slugify;max:40}-{id}",
    "bugfix": "bugfix/{title:slugify;max:40}-{id}",
    "hotfix": "hotfix/{date}-{title:slugify;max:30}-{id}",
    "release": "release/{title:slugify}",
    "support": "support/{title:slugify}"
  },
  "types": [
    { "value": "feature", "label": "Feature" },
    { "value": "bugfix", "label": "Bug Fix" },
    { "value": "hotfix", "label": "Hotfix" },
    { "value": "release", "label": "Release" },
    { "value": "support", "label": "Support" }
  ]
}
```

## Usage

```bash
# Feature branch (from develop)
new-branch --use feature --title "User authentication" --id PROJ-123 --create
# → feature/user-authentication-PROJ-123

# Bugfix (from develop)
new-branch --use bugfix --title "Fix search filter" --id PROJ-456 --create
# → bugfix/fix-search-filter-PROJ-456

# Hotfix (from main)
new-branch --use hotfix --title "Fix payment crash" --id PROJ-789 --create
# → hotfix/2026-02-28-fix-payment-crash-PROJ-789

# Release branch
new-branch --use release --title "v2.0.0" --create
# → release/v2-0-0

# Support branch
new-branch --use support --title "v1.x" --create
# → support/v1-x
```

## Why Use Aliases Here?

Gitflow has distinct branch prefixes with different structures. Pattern aliases map perfectly to this:

| Workflow           | Alias           | Pattern                      |
| ------------------ | --------------- | ---------------------------- |
| New feature        | `--use feature` | `feature/{title}-{id}`       |
| Bug on develop     | `--use bugfix`  | `bugfix/{title}-{id}`        |
| Urgent fix on main | `--use hotfix`  | `hotfix/{date}-{title}-{id}` |
| Release prep       | `--use release` | `release/{title}`            |

The hotfix pattern includes `{date}` so you can see when it was created, which is useful for tracking urgency.

## Tips

::: tip
Set your most common workflow as the default `pattern`, and use `--use` for the less frequent ones. Most teams create features far more often than releases or hotfixes.
:::
