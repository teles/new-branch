# Monorepo

In monorepos, teams often work on different packages with different branch naming conventions. Here's how to set up `new-branch` for that.

## Per-Package Configuration

Each package can have its own `.newbranchrc.json`:

```
my-monorepo/
├── packages/
│   ├── frontend/
│   │   └── .newbranchrc.json
│   ├── backend/
│   │   └── .newbranchrc.json
│   └── shared/
│       └── .newbranchrc.json
├── .newbranchrc.json   ← root fallback
└── package.json
```

The CLI reads configuration from the **current working directory**, so `cd` into the package before running:

```bash
cd packages/frontend
new-branch --title "Add sidebar" --id FE-123 --create
```

## Root Configuration with Aliases

A simpler approach: define all patterns at the root using aliases:

```json
{
  "pattern": "{type}/{title:slugify}-{id}",
  "patterns": {
    "frontend": "fe/{type}/{title:slugify;max:30}-{id}",
    "backend": "be/{type}/{title:slugify;max:30}-{id}",
    "shared": "shared/{type}/{title:slugify}-{id}",
    "infra": "infra/{title:slugify}-{id}",
    "cross": "{type}/{title:slugify}-{id}"
  },
  "types": [
    { "value": "feat", "label": "Feature" },
    { "value": "fix", "label": "Bug Fix" },
    { "value": "chore", "label": "Chore" }
  ]
}
```

```bash
# Frontend work
new-branch --use frontend --type feat --title "Add sidebar" --id FE-123 --create
# → fe/feat/add-sidebar-FE-123

# Backend work
new-branch --use backend --type fix --title "Fix auth timeout" --id BE-456 --create
# → be/fix/fix-auth-timeout-BE-456

# Infrastructure
new-branch --use infra --title "Upgrade Node to 22" --create
# → infra/upgrade-node-to-22

# Cross-cutting changes (uses default pattern)
new-branch --type chore --title "Update ESLint config" --create
# → chore/update-eslint-config
```

## With Scope Prefix

Use the `before` transform to conditionally add scope prefixes:

```json
{
  "patterns": {
    "scoped": "{type}/{repoName:before:scope-}/{title:slugify}-{id}"
  }
}
```

## Team-Specific Patterns

For organizations where teams own different packages:

```json
{
  "patterns": {
    "platform": "platform/{userName:kebab}/{type}/{title:slugify;max:25}-{id}",
    "mobile": "mobile/{type}/{title:slugify}-{id}",
    "web": "web/{type}/{title:slugify}-{id}"
  }
}
```

```bash
# Platform team includes author name
new-branch --use platform --type feat --title "Add caching layer" --id PLAT-789 --create
# → platform/john-doe/feat/add-caching-layer-PLAT-789

# Mobile team uses simpler convention
new-branch --use mobile --type fix --title "Fix scroll jank" --id MOB-321 --create
# → mobile/fix/fix-scroll-jank-MOB-321
```

## Tips

::: tip
Use `git config` for developer-specific overrides in monorepos. Each developer can set their own `new-branch.pattern` locally without affecting the shared config:

```bash
git config --local new-branch.pattern "{userName:kebab}/{type}/{title:slugify}-{id}"
```

:::
