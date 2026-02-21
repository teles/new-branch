import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { MockedFunction } from "vitest";

vi.mock("execa", () => ({
  execa: vi.fn(),
}));

vi.mock("@/git/gitConfig.js", () => ({
  getGitConfig: vi.fn(),
}));

import { execa } from "execa";
import { getGitConfig } from "./gitConfig.js";

import {
  getGitBuiltins,
  patternNeedsGitBuiltins,
  extractGitBuiltinKeysFromPattern,
} from "./gitBuiltins.js";

function setEnv(user?: string, username?: string) {
  if (user === undefined) delete process.env.USER;
  else process.env.USER = user;

  if (username === undefined) delete process.env.USERNAME;
  else process.env.USERNAME = username;
}

describe("gitBuiltins", () => {
  // Define minimal types to avoid using `any` while keeping the mocks flexible.
  type ExecaReturn = { stdout: string };
  type ExecaFn = (...args: unknown[]) => Promise<ExecaReturn>;
  type GetGitConfigFn = (...args: unknown[]) => Promise<string | undefined>;

  // Cast to unknown first to avoid incompatibilities between execa's complex
  // function types and Vitest's MockedFunction helper.
  const execaMock = execa as unknown as MockedFunction<ExecaFn>;
  const getGitConfigMock = getGitConfig as unknown as MockedFunction<GetGitConfigFn>;

  beforeEach(() => {
    vi.clearAllMocks();
    setEnv(undefined, undefined);
  });

  afterEach(() => {
    setEnv(undefined, undefined);
  });

  it("patternNeedsGitBuiltins(): true when pattern contains any git key", () => {
    expect(patternNeedsGitBuiltins("feat/{shortSha}/x")).toBe(true);
    expect(patternNeedsGitBuiltins("feat/{userName}/x")).toBe(true);
  });

  it("patternNeedsGitBuiltins(): false when pattern contains no git keys", () => {
    expect(patternNeedsGitBuiltins("feat/{slug}/x")).toBe(false);
    expect(patternNeedsGitBuiltins("hello world")).toBe(false);
  });

  it("extractGitBuiltinKeysFromPattern(): returns only keys present", () => {
    const keys = extractGitBuiltinKeysFromPattern("feat/{shortSha}/{repoName}/{currentBranch}");
    expect(keys.sort()).toEqual(["currentBranch", "repoName", "shortSha"].sort());
  });

  it("getGitBuiltins(keys): resolves only requested keys", async () => {
    execaMock.mockImplementation(async (...argv: unknown[]) => {
      const args = argv[1] as readonly string[];
      const joined = args.join(" ");
      if (joined === "rev-parse --short HEAD") return { stdout: "abc123\n" } as ExecaReturn;
      throw new Error("unexpected git call: " + joined);
    });

    const result = await getGitBuiltins(["shortSha"]);
    expect(result).toEqual({ shortSha: "abc123" });

    // ensure only that git command ran
    expect(execaMock).toHaveBeenCalledTimes(1);
    expect(execaMock).toHaveBeenCalledWith("git", ["rev-parse", "--short", "HEAD"]);
  });

  it("getGitBuiltins(keys): de-duplicates keys (uniqueKeys behavior)", async () => {
    execaMock.mockResolvedValue({ stdout: "abc123\n" } as ExecaReturn);

    const result = await getGitBuiltins(["shortSha", "shortSha"]);
    expect(result).toEqual({ shortSha: "abc123" });
    expect(execaMock).toHaveBeenCalledTimes(1);
  });

  it("shortSha: returns undefined on git failure", async () => {
    execaMock.mockRejectedValue(new Error("git error"));

    const result = await getGitBuiltins(["shortSha"]);
    expect(result).toEqual({ shortSha: undefined });
  });

  it("currentBranch: returns undefined when git returns HEAD (detached)", async () => {
    execaMock.mockImplementation(async (...argv: unknown[]) => {
      const args = argv[1] as readonly string[];
      if (args.join(" ") === "rev-parse --abbrev-ref HEAD")
        return { stdout: "HEAD\n" } as ExecaReturn;
      throw new Error("unexpected");
    });

    const result = await getGitBuiltins(["currentBranch"]);
    expect(result).toEqual({ currentBranch: undefined });
  });

  it("currentBranch: returns branch name when not HEAD", async () => {
    execaMock.mockResolvedValue({ stdout: "main\n" } as ExecaReturn);

    const result = await getGitBuiltins(["currentBranch"]);
    expect(result).toEqual({ currentBranch: "main" });
  });

  it("repoName: derives from repo root path (unix)", async () => {
    execaMock.mockImplementation(async (...argv: unknown[]) => {
      const args = argv[1] as readonly string[];
      if (args.join(" ") === "rev-parse --show-toplevel") {
        return { stdout: "/home/teles/dev/new-branch\n" } as ExecaReturn;
      }
      throw new Error("unexpected");
    });

    const result = await getGitBuiltins(["repoName"]);
    expect(result).toEqual({ repoName: "new-branch" });
  });

  it("repoName: derives from repo root path (windows)", async () => {
    execaMock.mockImplementation(async (...argv: unknown[]) => {
      const args = argv[1] as readonly string[];
      if (args.join(" ") === "rev-parse --show-toplevel") {
        return { stdout: "C:\\Users\\teles\\dev\\new-branch\n" } as ExecaReturn;
      }
      throw new Error("unexpected");
    });

    const result = await getGitBuiltins(["repoName"]);
    expect(result).toEqual({ repoName: "new-branch" });
  });

  it("lastTag: returns latest tag", async () => {
    execaMock.mockResolvedValue({ stdout: "v1.2.3\n" } as ExecaReturn);

    const result = await getGitBuiltins(["lastTag"]);
    expect(result).toEqual({ lastTag: "v1.2.3" });
  });

  it("userName: uses git config user.name when available", async () => {
    getGitConfigMock.mockResolvedValue("José");

    const result = await getGitBuiltins(["userName"]);
    expect(result).toEqual({ userName: "José" });
  });

  it("userName: falls back to env USER / USERNAME when git config is undefined", async () => {
    getGitConfigMock.mockResolvedValue(undefined);
    setEnv("teles", undefined);

    const result = await getGitBuiltins(["userName"]);
    expect(result).toEqual({ userName: "teles" });
  });

  it("userName: returns undefined when git config is undefined and no env", async () => {
    getGitConfigMock.mockResolvedValue(undefined);
    setEnv(undefined, undefined);

    const result = await getGitBuiltins(["userName"]);
    expect(result).toEqual({ userName: undefined });
  });

  it("getGitBuiltins(): resolves all keys when keys omitted", async () => {
    getGitConfigMock.mockResolvedValue("José");

    execaMock.mockImplementation(async (...argv: unknown[]) => {
      const args = argv[1] as readonly string[];
      const joined = args.join(" ");
      if (joined === "rev-parse --short HEAD") return { stdout: "abc123\n" } as ExecaReturn;
      if (joined === "rev-parse --abbrev-ref HEAD") return { stdout: "main\n" } as ExecaReturn;
      if (joined === "rev-parse --show-toplevel")
        return { stdout: "/x/y/new-branch\n" } as ExecaReturn;
      if (joined === "describe --tags --abbrev=0") return { stdout: "v0.3.1\n" } as ExecaReturn;
      throw new Error("unexpected: " + joined);
    });

    const result = await getGitBuiltins();
    expect(result).toEqual({
      shortSha: "abc123",
      currentBranch: "main",
      userName: "José",
      repoName: "new-branch",
      lastTag: "v0.3.1",
    });
  });
});
