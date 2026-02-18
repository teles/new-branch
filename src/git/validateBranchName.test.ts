// src/git/validateBranchName.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";

// ESM-friendly mock
vi.mock("execa", () => ({
  execa: vi.fn(),
}));

import { execa } from "execa";
import { validateBranchName } from "./validateBranchName.js";

beforeEach(() => {
  vi.resetAllMocks();
});

describe("validateBranchName", () => {
  it("resolves when git accepts the branch name", async () => {
    (execa as unknown as Mock).mockResolvedValueOnce({});

    await expect(validateBranchName("feat/my-branch")).resolves.toBeUndefined();

    expect(execa).toHaveBeenCalledTimes(1);
    expect(execa).toHaveBeenCalledWith("git", ["check-ref-format", "--branch", "feat/my-branch"]);
  });

  it("throws a friendly error when git rejects the branch name", async () => {
    (execa as unknown as Mock).mockRejectedValueOnce(new Error("git says no"));

    await expect(validateBranchName("master///nope")).rejects.toThrow(
      'Invalid git branch name: "master///nope"',
    );

    expect(execa).toHaveBeenCalledTimes(1);
    expect(execa).toHaveBeenCalledWith("git", ["check-ref-format", "--branch", "master///nope"]);
  });
});
˜