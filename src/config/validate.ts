/**
 * @fileoverview
 * Validation + normalization logic for `new-branch` configuration.
 *
 * Strategy:
 * 1) validateProjectConfigSource → structural validation per source
 * 2) validateProjectConfigFinal → cross-field business rules
 */

import type { BranchType, ProjectConfig } from "./types.js";

/**
 * Throws a standardized configuration error.
 */
function invariant(condition: unknown, source: string, message: string): asserts condition {
  if (!condition) {
    throw new Error(`Invalid new-branch config from ${source}: ${message}`);
  }
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function isString(v: unknown): v is string {
  return typeof v === "string";
}

function trimOrUndefined(v: string): string | undefined {
  const t = v.trim();
  return t.length > 0 ? t : undefined;
}

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
 * Structural validation for a single source.
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
 * Final cross-field validation.
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
