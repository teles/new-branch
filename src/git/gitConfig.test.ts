import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock execa
vi.mock("execa", () => ({
  execa: vi.fn(),
}));

import { execa } from "execa";
import { getGitConfig, getGitConfigRegexp } from "./gitConfig.js";

const execaMock = execa as unknown as ReturnType<typeof vi.fn>;

describe("getGitConfig", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns trimmed value when git config succeeds", async () => {
    execaMock.mockResolvedValueOnce({ stdout: "  {type}/{title}-{id}  " });

    const result = await getGitConfig("new-branch.pattern");

    expect(execaMock).toHaveBeenCalledWith("git", ["config", "--get", "new-branch.pattern"]);

    expect(result).toBe("{type}/{title}-{id}");
  });

  it("handles null stdout gracefully (coerces to empty string)", async () => {
    execaMock.mockResolvedValueOnce({ stdout: null });

    const result = await getGitConfig("new-branch.pattern");

    expect(result).toBeUndefined();
  });

  it("handles undefined stdout gracefully (coerces to empty string)", async () => {
    execaMock.mockResolvedValueOnce({ stdout: undefined });

    const result = await getGitConfig("new-branch.pattern");

    expect(result).toBeUndefined();
  });

  it("returns undefined when stdout is empty", async () => {
    execaMock.mockResolvedValueOnce({ stdout: "   " });

    const result = await getGitConfig("new-branch.pattern");

    expect(result).toBeUndefined();
  });

  it("returns undefined when git config throws", async () => {
    execaMock.mockRejectedValueOnce(new Error("not found"));

    const result = await getGitConfig("new-branch.pattern");

    expect(result).toBeUndefined();
  });
});

describe("getGitConfigRegexp", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns key-value tuples from git config --get-regexp output", async () => {
    execaMock.mockResolvedValueOnce({
      stdout:
        "new-branch.patterns.hotfix hotfix/{id}-{title:kebab}\nnew-branch.patterns.release release/{currentBranch}",
    });

    const result = await getGitConfigRegexp("^new-branch\\.patterns\\.");

    expect(execaMock).toHaveBeenCalledWith("git", [
      "config",
      "--get-regexp",
      "^new-branch\\.patterns\\.",
    ]);

    expect(result).toEqual([
      ["new-branch.patterns.hotfix", "hotfix/{id}-{title:kebab}"],
      ["new-branch.patterns.release", "release/{currentBranch}"],
    ]);
  });

  it("returns empty array when stdout is empty", async () => {
    execaMock.mockResolvedValueOnce({ stdout: "" });

    const result = await getGitConfigRegexp("^new-branch\\.patterns\\.");

    expect(result).toEqual([]);
  });

  it("handles null stdout gracefully in getGitConfigRegexp", async () => {
    execaMock.mockResolvedValueOnce({ stdout: null });

    const result = await getGitConfigRegexp("^new-branch\\.patterns\\.");

    expect(result).toEqual([]);
  });

  it("handles undefined stdout gracefully in getGitConfigRegexp", async () => {
    execaMock.mockResolvedValueOnce({ stdout: undefined });

    const result = await getGitConfigRegexp("^new-branch\\.patterns\\.");

    expect(result).toEqual([]);
  });

  it("returns empty array when git config throws (no matching keys)", async () => {
    execaMock.mockRejectedValueOnce(new Error("no matching keys"));

    const result = await getGitConfigRegexp("^new-branch\\.patterns\\.");

    expect(result).toEqual([]);
  });

  it("skips malformed lines without spaces", async () => {
    execaMock.mockResolvedValueOnce({
      stdout:
        "new-branch.patterns.hotfix hotfix/{id}\nmalformedline\nnew-branch.patterns.release release/{id}",
    });

    const result = await getGitConfigRegexp("^new-branch\\.patterns\\.");

    expect(result).toEqual([
      ["new-branch.patterns.hotfix", "hotfix/{id}"],
      ["new-branch.patterns.release", "release/{id}"],
    ]);
  });
});
