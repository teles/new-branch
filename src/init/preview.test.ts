import { describe, it, expect } from "vitest";
import { renderPreview, MOCK_VALUES } from "./preview.js";

describe("renderPreview", () => {
  it("renders a simple pattern with type and title", () => {
    const result = renderPreview("{type}/{title:slugify}");
    expect(result).toBe("feat/add-login-page");
  });

  it("renders a pattern with id", () => {
    const result = renderPreview("{type}/{id}-{title:slugify}");
    expect(result).toBe("feat/PROJ-123-add-login-page");
  });

  it("renders a pattern with date variables", () => {
    const result = renderPreview("{dateCompact}/{title:kebab}");
    expect(result).toBe("20260228/add-login-page");
  });

  it("renders a pattern with git variables", () => {
    const result = renderPreview("{userName}/{title:snake}");
    expect(result).toBe("john-doe/add_login_page");
  });

  it("returns (invalid pattern) for malformed patterns", () => {
    const result = renderPreview("{unclosed");
    expect(result).toBe("(invalid pattern)");
  });

  it("handles empty pattern gracefully", () => {
    const result = renderPreview("");
    // Empty pattern produces empty string, which sanitizeGitRef may handle
    expect(typeof result).toBe("string");
  });

  it("MOCK_VALUES contains all expected keys", () => {
    const expectedKeys = [
      "type",
      "title",
      "id",
      "year",
      "month",
      "day",
      "date",
      "dateCompact",
      "currentBranch",
      "shortSha",
      "repoName",
      "userName",
      "lastTag",
    ];
    for (const key of expectedKeys) {
      expect(MOCK_VALUES).toHaveProperty(key);
      expect(typeof MOCK_VALUES[key]).toBe("string");
    }
  });
});
