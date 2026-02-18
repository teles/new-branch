import { describe, it, expect } from "vitest";
import { sanitizeGitRef } from "./sanitizeGitRef.js";

describe("sanitizeGitRef", () => {
  it("trims input and replaces whitespace with dashes", () => {
    expect(sanitizeGitRef("  feature  new   ")).toBe("feature-new");
  });

  it("removes forbidden characters and sequences", () => {
    const input = "~^:??*[\\]name@{weird}";
    // forbidden chars removed and @{ removed
    expect(sanitizeGitRef(input)).toBe("nameweird}");
  });

  it("collapses multiple slashes and removes leading/trailing slashes", () => {
    expect(sanitizeGitRef("///a//b/c///")).toBe("a/b/c");
  });

  it("collapses repeated dots and trims trailing dots", () => {
    expect(sanitizeGitRef("v1..0...")).toBe("v1.0");
  });

  it("prevents leading dash or slash and trailing dot or slash", () => {
    expect(sanitizeGitRef("-/--abc/.")).toBe("abc");
  });

  it("removes trailing .lock suffix", () => {
    expect(sanitizeGitRef("release.lock")).toBe("release");
    // multiple .lock occurrences only remove final suffix
    expect(sanitizeGitRef("a.lock.lock")).toBe("a.lock");
  });

  it("works with an empty-ish result (keeps dot/punctuations according to sanitizer)", () => {
    // Implementation collapses dots and slashes but does not remove the leading dot
    expect(sanitizeGitRef("   ....///--- ")).toBe("./---");
  });
});
