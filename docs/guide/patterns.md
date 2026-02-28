# Patterns

Patterns are the core of `new-branch`. They define the structure of your branch names using a declarative syntax with variables and transforms.

## Syntax

```
{variable:transform1;transform2:arg}
```

- **Variables** are wrapped in `{}`
- **Transforms** are applied left-to-right, separated by `;`
- **Arguments** are passed after `:` following the transform name

## Examples

### Simple pattern

```
{type}/{title}-{id}
```

With `type=feat`, `title=My Task`, `id=123`:

```
feat/My Task-123
```

### With transforms

```
{type}/{title:slugify;max:25}-{id}
```

With `type=feat`, `title=Add user authentication module`, `id=PROJ-456`:

```
feat/add-user-authenticatio-PROJ-456
```

### With date variables

```
{type}/{date}-{title:slugify}-{id}
```

Output:

```
feat/2026-02-28-add-login-page-PROJ-123
```

### With git variables

```
{userName:kebab}/{type}/{title:slugify}-{id}
```

Output:

```
john-doe/feat/add-login-page-PROJ-123
```

## How It Works

Under the hood, the pattern string is parsed into an Abstract Syntax Tree (AST):

```
{type}/{title:slugify;max:25}-{id}
```

Produces:

```
├── Variable: type (no transforms)
├── Literal: "/"
├── Variable: title
│   ├── Transform: slugify
│   └── Transform: max(25)
├── Literal: "-"
└── Variable: id (no transforms)
```

The AST is then rendered by resolving each variable and applying transforms in order.

## Literals

Any text outside of `{}` is treated as a literal and included as-is in the output:

```
prefix-{type}/{title:slugify}--suffix
```

Common literals include `/`, `-`, `_`, and `.` used as separators.

## Variables

Variables are placeholders that get replaced with values at runtime. They come from three sources:

1. **CLI flags** — `--type`, `--title`, `--id`
2. **Built-in values** — date variables (`year`, `month`, `day`, etc.) and git variables (`currentBranch`, `shortSha`, etc.)
3. **Interactive prompts** — if a variable is missing and prompting is enabled

See [Built-in Variables](/reference/built-in-variables) for the complete list.

## Transform Chains

Transforms are applied left-to-right. The output of one transform becomes the input of the next:

```
{title:stripAccents;lower;slugify;max:25}
```

1. `stripAccents` — removes diacritics (é → e)
2. `lower` — converts to lowercase
3. `slugify` — converts to URL-safe slug
4. `max:25` — truncates to 25 characters

See [Transforms](/guide/transforms) for all available transforms.

## Error Handling

The parser will throw clear errors for invalid patterns:

| Error                 | Example          |
| --------------------- | ---------------- |
| Missing closing `}`   | `{title`         |
| Empty variable block  | `{}`             |
| Nested braces         | `{type/{title}}` |
| Missing variable name | `{:slugify}`     |
