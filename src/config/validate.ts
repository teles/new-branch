/**
 * @module config/validate
 *
 * Validation and normalisation logic for `new-branch` configuration.
 *
 * @remarks
 * The validation pipeline consists of two stages:
 * 1. {@link validateProjectConfigSource} — structural validation per source.
 * 2. {@link validateProjectConfigFinal} — cross-field business rules.
 */

import type { BranchType, ProjectConfig } from "./types.js";

/**
 * Throws a standardised configuration error when `condition` is falsy.
 *
 * @param condition - The value to assert.
 * @param source    - Label identifying the config source (for error messages).
 * @param message   - Human-readable description of the violated rule.
 */
function invariant(condition: unknown, source: string, message: string): asserts condition {
  if (!condition) {
    throw new Error(`Invalid new-branch config from ${source}: ${message}`);
  }
}

/**
 * Checks whether `v` is a non-null object.
 *
 * @param v - The value to check.
 * @returns `true` if `v` is an object and not `null`.
 */
function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

/**
 * Type guard for strings.
 *
 * @param v - The value to check.
 * @returns `true` if `v` is a `string`.
 */
function isString(v: unknown): v is string {
  return typeof v === "string";
}

/**
 * Trims a string and returns `undefined` when the result is empty.
 *
 * @param v - The string to trim.
 * @returns The trimmed string, or `undefined` if blank.
 */
function trimOrUndefined(v: string): string | undefined {
  const t = v.trim();
  return t.length > 0 ? t : undefined;
}

/**
 * Normalises a raw branch-type entry into a validated {@link BranchType}.
 *
 * @param raw    - The unknown value to normalise.
 * @param source - Config source label (for error messages).
 * @returns A valid {@link BranchType}.
 * @throws {@link Error} If `value` or `label` is missing/empty.
 */
function normalizeBranchType(raw: unknown, source: string): BranchType {
  invariant(isObject(raw), source, "types[] must be an object");

  const obj = raw as Record<string, unknown>;

  const value = trimOrUndefined(String(obj.value ?? ""));
  const label = trimOrUndefined(String(obj.label ?? ""));

  invariant(value, source, "types[].value cannot be empty");
  invariant(label, source, "types[].label cannot be empty");

  return { value, label };
}

/**
 * Performs structural validation for a single configuration source.
 *
 * @remarks
 * Validates shapes but does **not** check cross-field rules
 * (e.g. `defaultType` existing in `types`). Use
 * {@link validateProjectConfigFinal} for that.
 *
 * @param raw    - The raw config object to validate.
 * @param source - Config source label (for error messages).
 * @returns A validated {@link ProjectConfig}.
 * @throws {@link Error} On any structural violation.
 */
export function validateProjectConfigSource(raw: unknown, source: string): ProjectConfig {
  invariant(isObject(raw), source, "config must be an object");

  const obj = raw as Record<string, unknown>;
  const cfg: ProjectConfig = {};

  if ("pattern" in obj) {
    invariant(isString(obj.pattern), source, "pattern must be a string");
    cfg.pattern = trimOrUndefined(obj.pattern);
  }

  if ("defaultType" in obj) {
    invariant(isString(obj.defaultType), source, "defaultType must be a string");
    cfg.defaultType = trimOrUndefined(obj.defaultType);
  }

  if ("patterns" in obj) {
    const patternsVal = obj.patterns;
    invariant(isObject(patternsVal), source, "patterns must be an object");

    const entries = Object.entries(patternsVal as Record<string, unknown>);
    const normalized: Record<string, string> = {};

    for (const [key, val] of entries) {
      invariant(isString(val), source, `patterns["${key}"] must be a string`);
      const trimmed = trimOrUndefined(val);
      invariant(trimmed, source, `patterns["${key}"] cannot be empty`);
      normalized[key] = trimmed;
    }

    if (Object.keys(normalized).length > 0) {
      cfg.patterns = normalized;
    }
  }

  if ("types" in obj) {
    const typesVal = obj.types;
    invariant(Array.isArray(typesVal), source, "types must be an array");

    cfg.types = (typesVal as unknown[]).map((t) => normalizeBranchType(t, source));
  }

  return cfg;
}

/**
 * Performs cross-field (semantic) validation on an already-structurally-valid config.
 *
 * @remarks
 * Rules enforced:
 * - `types`, when present, must not be empty.
 * - `defaultType`, when present alongside `types`, must match one of
 *   the declared type values.
 *
 * @param cfg    - The structurally-valid config to check.
 * @param source - Config source label (for error messages).
 * @returns The same config if all rules pass.
 * @throws {@link Error} On any semantic violation.
 */
export function validateProjectConfigFinal(cfg: ProjectConfig, source: string): ProjectConfig {
  if (cfg.types) {
    invariant(cfg.types.length > 0, source, "types cannot be empty");
  }

  if (cfg.defaultType && cfg.types) {
    const exists = cfg.types.some((t) => t.value === cfg.defaultType);
    invariant(exists, source, `defaultType "${cfg.defaultType}" must exist in types`);
  }

  return cfg;
}
