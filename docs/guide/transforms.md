# Transforms

Transforms are pure functions that modify variable values during pattern rendering. They can be chained and accept arguments.

## Syntax

```
{variable:transform}
{variable:transform:arg}
{variable:transform1;transform2}
{variable:transform1;transform2:arg}
```

- Transforms are separated by `;`
- Arguments follow the transform name with `:`
- Transforms run **left-to-right** — the output of one is the input of the next

## Available Transforms

### Text Case

#### `lower`

Converts the value to lowercase.

```
{title:lower}
```

| Input        | Output       |
| ------------ | ------------ |
| `My Feature` | `my feature` |
| `UPPERCASE`  | `uppercase`  |

#### `upper`

Converts the value to uppercase.

```
{title:upper}
```

| Input        | Output       |
| ------------ | ------------ |
| `my feature` | `MY FEATURE` |

#### `camel`

Converts to camelCase.

```
{title:camel}
```

| Input              | Output           |
| ------------------ | ---------------- |
| `my feature title` | `myFeatureTitle` |
| `some-kebab-text`  | `someKebabText`  |

#### `kebab`

Converts to kebab-case.

```
{title:kebab}
```

| Input              | Output             |
| ------------------ | ------------------ |
| `My Feature Title` | `my-feature-title` |
| `camelCase`        | `camel-case`       |

#### `snake`

Converts to snake_case.

```
{title:snake}
```

| Input              | Output             |
| ------------------ | ------------------ |
| `My Feature Title` | `my_feature_title` |

#### `title`

Converts to Title Case.

```
{title:title}
```

| Input              | Output             |
| ------------------ | ------------------ |
| `my feature title` | `My Feature Title` |

### Formatting

#### `slugify`

Converts to a URL-safe, git-friendly slug. Removes accents, lowercases, and replaces non-alphanumeric characters with hyphens.

```
{title:slugify}
```

| Input                 | Output             |
| --------------------- | ------------------ |
| `My Feature — Title!` | `my-feature-title` |
| `Café au lait`        | `cafe-au-lait`     |

#### `stripAccents`

Removes diacritics/accents from characters without changing case or spacing.

```
{title:stripAccents}
```

| Input          | Output         |
| -------------- | -------------- |
| `José García`  | `Jose Garcia`  |
| `crème brûlée` | `creme brulee` |

### Truncation

#### `max:n`

Truncates the value to at most `n` characters.

```
{title:max:25}
```

| Input                          | Output                     |
| ------------------------------ | -------------------------- |
| `a-very-long-branch-name-here` | `a-very-long-branch-name-` |

::: tip
Use `max` after `slugify` to keep branch names short:

```
{title:slugify;max:30}
```

:::

#### `words:n`

Keeps at most `n` words (space-separated).

```
{title:words:3}
```

| Input                            | Output                    |
| -------------------------------- | ------------------------- |
| `add user authentication module` | `add user authentication` |

### String Manipulation

#### `replace:search:replacement`

Replaces the **first** occurrence of a substring.

```
{title:replace:foo:bar}
```

| Input        | Output       |
| ------------ | ------------ |
| `foo is foo` | `bar is foo` |

#### `replaceAll:search:replacement`

Replaces **all** occurrences of a substring.

```
{title:replaceAll:foo:bar}
```

| Input        | Output       |
| ------------ | ------------ |
| `foo is foo` | `bar is bar` |

#### `remove:substring`

Removes all occurrences of a substring.

```
{title:remove:temp}
```

| Input               | Output      |
| ------------------- | ----------- |
| `temp-feature-temp` | `-feature-` |

### Conditional

#### `ifEmpty:fallback`

Uses a fallback value if the input is empty.

```
{id:ifEmpty:no-id}
```

| Input      | Output     |
| ---------- | ---------- |
| `PROJ-123` | `PROJ-123` |
| _(empty)_  | `no-id`    |

#### `before:prefix`

Adds a prefix, but only if the value is not empty.

```
{id:before:ticket-}
```

| Input     | Output       |
| --------- | ------------ |
| `123`     | `ticket-123` |
| _(empty)_ | _(empty)_    |

#### `after:suffix`

Adds a suffix, but only if the value is not empty.

```
{id:after:-wip}
```

| Input     | Output    |
| --------- | --------- |
| `123`     | `123-wip` |
| _(empty)_ | _(empty)_ |

## Chaining Transforms

Transforms run left-to-right. Order matters:

```
{title:stripAccents;slugify;max:25}
```

1. `stripAccents` → `Jose Garcia Login Page`
2. `slugify` → `jose-garcia-login-page`
3. `max:25` → `jose-garcia-login-page`

::: warning
Order can affect the result. For example:

- `{title:max:5;slugify}` — truncates first, then slugifies
- `{title:slugify;max:5}` — slugifies first, then truncates

The second form is usually what you want.
:::

## Listing Transforms

Use `--list-transforms` to see all available transforms in your terminal:

```bash
new-branch --list-transforms
```
