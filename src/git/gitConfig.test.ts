import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock execa
vi.mock("execa", () => ({
  execa: vi.fn(),
}));

import { execa } from "execa";
import { getGitConfig } from "./gitConfig.js";

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
