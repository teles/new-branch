import type { TransformDef } from "@/pattern/transforms/types.js";

/**
 * Transform: **before**
 *
 * @remarks
 * Prepends a prefix to the value. If the value is empty, returns
 * an empty string (the prefix is not added to avoid dangling separators).
 *
 * Pattern syntax: `{variable:before:prefix}`
 *
 * @example
 * ```ts
 * before.fn("fix", ["hotfix-"]); // => "hotfix-fix"
 * before.fn("", ["hotfix-"]);    // => ""
 * ```
 */
export const before: TransformDef = {
  name: "before",
  fn: (value, [prefix]) => {
    if (prefix === undefined) throw new Error("before requires one argument: {var:before:prefix}");
    return value === "" ? "" : prefix + value;
  },
  doc: {
    summary: "Adds a prefix only if the value is not empty.",
    usage: ["{title:before:hotfix-}"],
  },
};
