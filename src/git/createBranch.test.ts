import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";

// Mock do execa (ESM-friendly)
vi.mock("execa", () => {
  return {
    execa: vi.fn(),
  };
});

import { execa } from "execa";
import { createBranch } from "./createBranch.js";

beforeEach(() => {
  vi.resetAllMocks();
});

describe("createBranch", () => {
  it("uses `git switch -c` when available", async () => {
    (execa as unknown as Mock).mockResolvedValueOnce({});

    await expect(createBranch("feat/my-branch")).resolves.toBeUndefined();

    expect(execa).toHaveBeenCalledTimes(1);
    expect(execa).toHaveBeenCalledWith("git", ["switch", "-c", "feat/my-branch"]);
  });

  it("falls back to `git checkout -b` when `git switch -c` fails", async () => {
    (execa as unknown as Mock)
      .mockRejectedValueOnce(new Error("switch failed"))
      .mockResolvedValueOnce({});

    await expect(createBranch("feat/my-branch")).resolves.toBeUndefined();

    expect(execa).toHaveBeenCalledTimes(2);
    expect(execa).toHaveBeenNthCalledWith(1, "git", ["switch", "-c", "feat/my-branch"]);
    expect(execa).toHaveBeenNthCalledWith(2, "git", ["checkout", "-b", "feat/my-branch"]);
  });

  it("throws a friendly error when both strategies fail", async () => {
    (execa as unknown as Mock)
      .mockRejectedValueOnce(new Error("switch failed"))
      .mockRejectedValueOnce(new Error("checkout failed"));

    await expect(createBranch("feat/my-branch")).rejects.toThrow(
      'Failed to create branch "feat/my-branch"',
    );

    expect(execa).toHaveBeenCalledTimes(2);
    expect(execa).toHaveBeenNthCalledWith(1, "git", ["switch", "-c", "feat/my-branch"]);
    expect(execa).toHaveBeenNthCalledWith(2, "git", ["checkout", "-b", "feat/my-branch"]);
  });
});
