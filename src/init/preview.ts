/**
 * @module init/preview
 *
 * Utility to render a live preview of a pattern using deterministic mock
 * values, used by the init wizard to show the user what their branch name
 * will look like.
 */

import { parsePattern } from "@/pattern/parsePattern.js";
import { renderPattern } from "@/pattern/transforms/renderPattern.js";
import { defaultTransforms } from "@/pattern/transforms/index.js";
import { sanitizeGitRef } from "@/git/sanitizeGitRef.js";

/**
 * Deterministic mock values used for previewing patterns.
 * These produce realistic-looking branch names.
 */
export const MOCK_VALUES: Record<string, string> = {
  type: "feat",
  title: "Add login page",
  id: "PROJ-123",
  year: "2026",
  month: "02",
  day: "28",
  date: "2026-02-28",
  dateCompact: "20260228",
  currentBranch: "main",
  shortSha: "a1b2c3d",
  repoName: "my-project",
  userName: "john-doe",
  lastTag: "v1.0.0",
};

/**
 * Renders a pattern string into a preview branch name using mock values.
 *
 * @param pattern - The pattern string to preview.
 * @returns The rendered and sanitized branch name, or an error message.
 */
export function renderPreview(pattern: string): string {
  try {
    const ast = parsePattern(pattern);
    const rendered = renderPattern(ast, MOCK_VALUES, {
      transforms: defaultTransforms,
      strict: false,
    });
    return sanitizeGitRef(rendered);
  } catch {
    return "(invalid pattern)";
  }
}
