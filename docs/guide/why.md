# Why new-branch?

## The Problem

Inconsistent branch names cause real friction in software teams:

- **CI/CD breaks** — pipelines that filter on branch prefixes (`feature/*`, `release/*`) fail silently when someone uses `feat/` instead of `feature/`.
- **Noisy git history** — `git log --oneline` becomes unreadable when branch names follow no convention.
- **Automation gaps** — tools like semantic-release, changelog generators, and Jira/Linear integrations rely on consistent naming patterns.
- **Onboarding friction** — new team members have to ask "how should I name my branch?" every time.

## The Solution

`new-branch` solves this at the right layer — **at branch creation time** — with a declarative pattern language:

```bash
# Instead of remembering conventions...
git checkout -b feat/add-login-page-PROJ-123

# ...declare a pattern and let the tool enforce it
new-branch --pattern "{type}/{title:slugify}-{id}" --create
```

## Design Principles

### Explicit over Implicit

> "Explicit is better than implicit." — The Zen of Python (PEP 20)

Every part of the branch name is declared in the pattern. No magic. No hidden transformations.

### Pipeline Architecture

The CLI follows a strict pipeline:

```
Pattern → AST → Resolve Values → Render → Sanitize → Validate → Git
```

Each stage is a pure function. You can inspect every step with `--explain`.

### Progressive Configuration

Start with zero config and add structure as needed:

1. **CLI flags** — just pass `--pattern` inline
2. **Project config** — save patterns in `.newbranchrc.json` or `package.json`
3. **Git config** — set patterns per-repo or globally
4. **Pattern aliases** — define named patterns like `feature`, `hotfix`, `release`

### Composable Transforms

Transforms are small, focused functions that chain together:

```
{title:stripAccents;slugify;max:25}
```

This strips accents, then slugifies, then truncates — in order, predictably.

### Safe by Default

After rendering, every branch name is:

1. Sanitized to remove invalid git ref characters
2. Validated via `git check-ref-format --branch`

Invalid names cause the command to fail — never silently produce broken branches.
