---
layout: home

hero:
  name: new-branch
  text: Standardized Git branch names
  tagline: A composable CLI to generate and create branch names using a pattern + transform pipeline.
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/teles/new-branch

features:
  - icon: 🧩
    title: Pattern Language
    details: Define branch names with a declarative pattern syntax — variables, transforms, and arguments in a single expression.
  - icon: 🔄
    title: Composable Transforms
    details: Chain transforms like slugify, kebab, max, and replace to shape variable values exactly the way you need.
  - icon: 🚀
    title: Init Wizard
    details: Run new-branch init to bootstrap your .newbranchrc.json interactively with live preview — or use --yes for sensible defaults.
  - icon: ⚙️
    title: Flexible Configuration
    details: Configure via .newbranchrc.json, package.json, or git config. CLI flags always take precedence.
  - icon: 🏷️
    title: Pattern Aliases
    details: Define named patterns (feature, hotfix, release) and switch between them with --use.
  - icon: 💬
    title: Interactive Mode
    details: Missing values are prompted interactively. Disable with --no-prompt for CI environments.
  - icon: 🔍
    title: Didactic Modes
    details: Use --explain, --list-transforms, and --print-config to understand exactly what the CLI does.
---

## Quick Example

```bash
npx new-branch \
  --pattern "{type}/{title:slugify;max:25}-{id}" \
  --type feat \
  --title "Add user authentication" \
  --id PROJ-456
```

Output:

```
feat/add-user-authenticatio-PROJ-456
```

## Install

```bash
# Run without installing
npx new-branch

# Or install globally
npm install -g new-branch
```
