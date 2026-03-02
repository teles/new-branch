# Getting Started

## Installation

You can run `new-branch` without installing using `npx`:

```bash
npx new-branch --pattern "{type}/{title:slugify}-{id}" --type feat --title "My task" --id 123
```

Or install it globally:

::: code-group

```bash [npm]
npm install -g new-branch
```

```bash [pnpm]
pnpm add -g new-branch
```

```bash [yarn]
yarn global add new-branch
```

:::

## Available Commands

After installing globally, you can use any of these aliases:

```bash
new-branch     # full name
git new-branch # as a git subcommand
git nb         # short alias
```

Or use without installation via `npx`:

```bash
npx new-branch # run without installing
```

::: tip
When installed globally, `git-new-branch` and `git-nb` are automatically available as git subcommands thanks to git's naming convention. Any executable named `git-<name>` on your `PATH` becomes `git <name>`.
:::

## Your First Branch

Generate a branch name by providing a pattern and values:

```bash
npx new-branch \
  --pattern "{type}/{title:slugify}-{id}" \
  --type feat \
  --title "Add login page" \
  --id PROJ-123
```

Output:

```
feat/add-login-page-PROJ-123
```

## Create the Branch

Add `--create` to actually create and switch to the branch:

```bash
npx new-branch \
  --pattern "{type}/{title:slugify}-{id}" \
  --type feat \
  --title "Add login page" \
  --id PROJ-123 \
  --create
```

Output:

```
✅ Branch created and switched to: feat/add-login-page-PROJ-123
```

## Interactive Mode

If you omit values that the pattern needs, the CLI will prompt you interactively:

```bash
npx new-branch --pattern "{type}/{title:slugify}-{id}"
# → Prompts for type, title, and id
```

Disable prompting (useful for CI) with `--no-prompt`:

```bash
npx new-branch --pattern "{type}/{title:slugify}-{id}" --no-prompt
# → Fails with an error listing missing values
```

## Bootstrap Your Config

Instead of creating a config file manually, use the **init wizard**:

```bash
npx new-branch init
```

The wizard walks you through selecting variables, transforms, branch types, and pattern aliases — with a **live preview** at each step. It writes a `.newbranchrc.json` file when you're done.

For CI or quick setup, accept all defaults:

```bash
npx new-branch init --yes
```

Learn more in the [Init Wizard](/guide/init) guide.

## Save Your Pattern

You can also create a config file manually:

::: code-group

```json [.newbranchrc.json]
{
  "pattern": "{type}/{title:slugify}-{id}",
  "types": [
    { "value": "feat", "label": "Feature" },
    { "value": "fix", "label": "Bug Fix" },
    { "value": "chore", "label": "Chore" }
  ]
}
```

```json [package.json]
{
  "new-branch": {
    "pattern": "{type}/{title:slugify}-{id}"
  }
}
```

```bash [git config]
git config new-branch.pattern "{type}/{title:slugify}-{id}"
```

:::

Now you can simply run:

```bash
npx new-branch --type feat --title "Add login page" --id PROJ-123
```

## What's Next?

- Bootstrap your config with the [Init Wizard](/guide/init)
- Learn the [Pattern Language](/guide/patterns) in depth
- See all available [Transforms](/guide/transforms)
- Configure [Pattern Aliases](/guide/pattern-aliases) for different workflows
- Explore [Recipes](/recipes/github-flow) for common branching strategies
