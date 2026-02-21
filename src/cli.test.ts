import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// ---- Mocks (must be declared before importing run) ----

const parseArgsMock = vi.fn();
vi.mock("@/parseArgs.js", () => ({
  parseArgs: (...args: unknown[]) => parseArgsMock(...args),
}));

const loadProjectConfigMock = vi.fn();
vi.mock("./config/loadProjectConfig.js", () => ({
  loadProjectConfig: (...args: unknown[]) => loadProjectConfigMock(...args),
}));

const getGitConfigMock = vi.fn();
vi.mock("@/git/gitConfig.js", () => ({
  getGitConfig: (...args: unknown[]) => getGitConfigMock(...args),
}));

const getBuiltinValuesMock = vi.fn();
vi.mock("@/runtime/builtins.js", () => ({
  getBuiltinValues: (...args: unknown[]) => getBuiltinValuesMock(...args),
}));

const resolveMissingValuesMock = vi.fn();
vi.mock("@/runtime/resolveMissingValues.js", () => ({
  resolveMissingValues: (...args: unknown[]) => resolveMissingValuesMock(...args),
}));

const parsePatternMock = vi.fn();
vi.mock("@/pattern/parsePattern.js", () => ({
  parsePattern: (...args: unknown[]) => parsePatternMock(...args),
}));

const renderPatternMock = vi.fn();
vi.mock("@/pattern/transforms/renderPattern.js", () => ({
  renderPattern: (...args: unknown[]) => renderPatternMock(...args),
}));

vi.mock("@/pattern/transforms/index.js", () => ({
  // just needs to exist; not used directly in our renderPattern mock
  defaultTransforms: {},
}));

const sanitizeGitRefMock = vi.fn();
vi.mock("@/git/sanitizeGitRef.js", () => ({
  sanitizeGitRef: (...args: unknown[]) => sanitizeGitRefMock(...args),
}));

const validateBranchNameMock = vi.fn();
vi.mock("@/git/validateBranchName.js", () => ({
  validateBranchName: (...args: unknown[]) => validateBranchNameMock(...args),
}));

const createBranchMock = vi.fn();
vi.mock("@/git/createBranch.js", () => ({
  createBranch: (...args: unknown[]) => createBranchMock(...args),
}));

const patternNeedsGitBuiltinsMock = vi.fn();
const extractGitBuiltinKeysFromPatternMock = vi.fn();
const getGitBuiltinsMock = vi.fn();
vi.mock("@/git/gitBuiltins.js", () => ({
  patternNeedsGitBuiltins: (...args: unknown[]) => patternNeedsGitBuiltinsMock(...args),
  extractGitBuiltinKeysFromPattern: (...args: unknown[]) =>
    extractGitBuiltinKeysFromPatternMock(...args),
  getGitBuiltins: (...args: unknown[]) => getGitBuiltinsMock(...args),
}));

// Now we can import run (after mocks)
import { run } from "./cli.js";

// ---- Helpers ----

function setArgv(args: string[]) {
  process.argv = ["node", "cli", ...args];
}

function defaultParseArgsReturn(overrides?: Partial<ReturnType<typeof parseArgsMock>>) {
  return {
    options: {
      pattern: undefined,
      id: undefined,
      title: undefined,
      type: undefined,
      create: false,
      prompt: true,
      quiet: false,
      ...((overrides as { options?: Record<string, unknown> } | undefined)?.options ?? {}),
    },
    args: [],
    ...overrides,
  };
}

describe("cli.ts (run)", () => {
  const originalArgv = process.argv;
  const originalEnv = process.env.NODE_ENV;

  let exitSpy: ReturnType<(typeof vi)["spyOn"]>;

  const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

  beforeEach(() => {
    vi.clearAllMocks();

    getGitConfigMock.mockResolvedValue(undefined);

    getBuiltinValuesMock.mockReturnValue({ day: "01", month: "02", year: "2026" });

    patternNeedsGitBuiltinsMock.mockReturnValue(false);
    extractGitBuiltinKeysFromPatternMock.mockReturnValue([]);
    getGitBuiltinsMock.mockResolvedValue({});

    // Keep tests deterministic
    process.env.NODE_ENV = "test";

    // Default behavior for dependencies
    parseArgsMock.mockReturnValue(defaultParseArgsReturn());
    loadProjectConfigMock.mockResolvedValue({ pattern: "{type}/{title}-{id}" });

    parsePatternMock.mockReturnValue({
      nodes: [],
      variablesUsed: ["type", "title", "id"],
    });

    resolveMissingValuesMock.mockImplementation(
      async (_ast: unknown, initial: unknown) => initial as unknown,
    );

    renderPatternMock.mockReturnValue("feat/my-task-STK-1");
    sanitizeGitRefMock.mockImplementation((s: string) => s);

    validateBranchNameMock.mockResolvedValue(undefined);
    createBranchMock.mockResolvedValue(undefined);

    // process.exit should not actually exit tests
    exitSpy = vi
      .spyOn(process, "exit")
      .mockImplementation((code?: string | number | null | undefined) => {
        throw new Error(`process.exit:${code ?? 0}`);
      });
  });

  afterEach(() => {
    process.argv = originalArgv;
    process.env.NODE_ENV = originalEnv;
    exitSpy.mockRestore();
  });

  it("returns early on --help without requiring pattern", async () => {
    setArgv(["--help"]);

    // Even if parseArgs returns no pattern, it should not fail.
    parseArgsMock.mockReturnValue(defaultParseArgsReturn({ options: { pattern: undefined } }));

    await expect(run()).resolves.toBeUndefined();

    expect(loadProjectConfigMock).not.toHaveBeenCalled();
    expect(getGitConfigMock).not.toHaveBeenCalled();
    expect(getBuiltinValuesMock).not.toHaveBeenCalled();
    expect(patternNeedsGitBuiltinsMock).not.toHaveBeenCalled();
    expect(extractGitBuiltinKeysFromPatternMock).not.toHaveBeenCalled();
    expect(getGitBuiltinsMock).not.toHaveBeenCalled();
    expect(parsePatternMock).not.toHaveBeenCalled();
    expect(resolveMissingValuesMock).not.toHaveBeenCalled();
    expect(renderPatternMock).not.toHaveBeenCalled();
    expect(logSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it("uses CLI --pattern over package.json config and prints branch name", async () => {
    setArgv([
      "--pattern",
      "{type}/{title}-{id}",
      "--id",
      "STK-1",
      "--title",
      "My task",
      "--type",
      "feat",
    ]);

    parseArgsMock.mockReturnValue(
      defaultParseArgsReturn({
        options: { pattern: "{type}/{title}-{id}", id: "STK-1", title: "My task", type: "feat" },
      }),
    );

    await run();

    expect(loadProjectConfigMock).toHaveBeenCalledTimes(1);
    expect(getGitConfigMock).not.toHaveBeenCalled();
    expect(getBuiltinValuesMock).toHaveBeenCalledTimes(1);
    expect(patternNeedsGitBuiltinsMock).toHaveBeenCalledWith("{type}/{title}-{id}");
    expect(extractGitBuiltinKeysFromPatternMock).not.toHaveBeenCalled();
    expect(getGitBuiltinsMock).not.toHaveBeenCalled();
    expect(parsePatternMock).toHaveBeenCalledWith("{type}/{title}-{id}");
    expect(renderPatternMock).toHaveBeenCalledTimes(1);
    expect(sanitizeGitRefMock).toHaveBeenCalledWith("feat/my-task-STK-1");
    expect(validateBranchNameMock).toHaveBeenCalledWith("feat/my-task-STK-1");
    expect(createBranchMock).not.toHaveBeenCalled();

    expect(logSpy).toHaveBeenCalledWith("feat/my-task-STK-1");
  });

  it("resolves git builtins only when the pattern references them (and only requested keys)", async () => {
    setArgv(["--pattern", "{currentBranch}-{shortSha}-{id}", "--id", "STK-1", "--type", "feat"]);

    parseArgsMock.mockReturnValue(
      defaultParseArgsReturn({
        options: { pattern: "{currentBranch}-{shortSha}-{id}", id: "STK-1", type: "feat" },
      }),
    );

    patternNeedsGitBuiltinsMock.mockReturnValue(true);
    extractGitBuiltinKeysFromPatternMock.mockReturnValue(["currentBranch", "shortSha"]);
    getGitBuiltinsMock.mockResolvedValue({ currentBranch: "main", shortSha: "abc123" });

    // Pattern variables used include git builtins so resolveMissingValues should NOT prompt for them
    parsePatternMock.mockReturnValue({
      nodes: [],
      variablesUsed: ["currentBranch", "shortSha", "id"],
    });

    resolveMissingValuesMock.mockImplementation(async (_ast: unknown, initial: unknown) => {
      return initial as unknown;
    });

    renderPatternMock.mockReturnValue("main-abc123-STK-1");

    await run();

    expect(getBuiltinValuesMock).toHaveBeenCalledTimes(1);
    expect(patternNeedsGitBuiltinsMock).toHaveBeenCalledWith("{currentBranch}-{shortSha}-{id}");
    expect(extractGitBuiltinKeysFromPatternMock).toHaveBeenCalledWith(
      "{currentBranch}-{shortSha}-{id}",
    );
    expect(getGitBuiltinsMock).toHaveBeenCalledWith(["currentBranch", "shortSha"]);

    // Ensure resolveMissingValues received the git + runtime + cli values merged
    const call = resolveMissingValuesMock.mock.calls[0];
    const passedInitial = call?.[1] as Record<string, unknown>;
    expect(passedInitial.currentBranch).toBe("main");
    expect(passedInitial.shortSha).toBe("abc123");
    expect(passedInitial.id).toBe("STK-1");

    expect(logSpy).toHaveBeenCalledWith("main-abc123-STK-1");
  });

  it("uses package.json pattern when CLI --pattern is missing, even if git config has a pattern", async () => {
    setArgv(["--id", "STK-1", "--title", "My task", "--type", "feat"]);

    parseArgsMock.mockReturnValue(
      defaultParseArgsReturn({ options: { id: "STK-1", title: "My task", type: "feat" } }),
    );

    loadProjectConfigMock.mockResolvedValue({ pattern: "{type}/{title}-{id}" });
    getGitConfigMock.mockResolvedValue("{id}-{title}");

    await run();

    expect(parsePatternMock).toHaveBeenCalledWith("{type}/{title}-{id}");
    expect(patternNeedsGitBuiltinsMock).toHaveBeenCalledWith("{type}/{title}-{id}");
  });

  it("falls back to git config pattern when CLI and package.json are missing", async () => {
    setArgv(["--id", "STK-1", "--title", "My task", "--type", "feat"]);

    parseArgsMock.mockReturnValue(
      defaultParseArgsReturn({ options: { id: "STK-1", title: "My task", type: "feat" } }),
    );

    loadProjectConfigMock.mockResolvedValue({ pattern: undefined });
    getGitConfigMock.mockResolvedValue("{type}/{title}-{id}");

    await run();

    expect(parsePatternMock).toHaveBeenCalledWith("{type}/{title}-{id}");
    expect(patternNeedsGitBuiltinsMock).toHaveBeenCalledWith("{type}/{title}-{id}");
  });

  it("when --create is set, calls createBranch and prints success message", async () => {
    setArgv([
      "--pattern",
      "{type}/{title}-{id}",
      "--create",
      "--id",
      "STK-1",
      "--title",
      "My task",
      "--type",
      "feat",
    ]);

    parseArgsMock.mockReturnValue(
      defaultParseArgsReturn({
        options: {
          pattern: "{type}/{title}-{id}",
          create: true,
          id: "STK-1",
          title: "My task",
          type: "feat",
        },
      }),
    );

    await run();

    expect(createBranchMock).toHaveBeenCalledWith("feat/my-task-STK-1");
    expect(logSpy).toHaveBeenCalledWith("\n✅ Branch created and switched to: feat/my-task-STK-1");
  });

  it("when --quiet is set, prints nothing (even with --create)", async () => {
    setArgv([
      "--pattern",
      "{type}/{title}-{id}",
      "--create",
      "--quiet",
      "--id",
      "STK-1",
      "--title",
      "My task",
      "--type",
      "feat",
    ]);

    parseArgsMock.mockReturnValue(
      defaultParseArgsReturn({
        options: {
          pattern: "{type}/{title}-{id}",
          create: true,
          quiet: true,
          id: "STK-1",
          title: "My task",
          type: "feat",
        },
      }),
    );

    await run();

    expect(createBranchMock).toHaveBeenCalledTimes(1);
    expect(logSpy).not.toHaveBeenCalled();
  });

  it("fails when no pattern is provided (neither CLI, package.json, nor git config)", async () => {
    setArgv([]);

    loadProjectConfigMock.mockResolvedValue({ pattern: undefined });
    getGitConfigMock.mockResolvedValue(undefined);
    parseArgsMock.mockReturnValue(defaultParseArgsReturn({ options: { pattern: undefined } }));

    await expect(run()).rejects.toThrow(/process\.exit:1/);

    expect(errorSpy).toHaveBeenCalled();
    expect(errorSpy.mock.calls.map((c) => c.join(" ")).join("\n")).toMatch(
      /Invalid CLI arguments/i,
    );
    expect(getBuiltinValuesMock).not.toHaveBeenCalled();
    expect(getGitBuiltinsMock).not.toHaveBeenCalled();
  });

  it("fails on invalid pattern (parsePattern throws)", async () => {
    setArgv(["--pattern", "{type}/{title-{id}"]);

    parseArgsMock.mockReturnValue(
      defaultParseArgsReturn({ options: { pattern: "{type}/{title-{id}" } }),
    );
    parsePatternMock.mockImplementation(() => {
      throw new Error("boom");
    });

    await expect(run()).rejects.toThrow(/process\.exit:1/);

    expect(errorSpy).toHaveBeenCalled();
    expect(errorSpy.mock.calls.map((c) => c.join(" ")).join("\n")).toMatch(/Invalid pattern/i);
    expect(getBuiltinValuesMock).not.toHaveBeenCalled();
    expect(getGitBuiltinsMock).not.toHaveBeenCalled();
  });

  it("fails if validateBranchName rejects", async () => {
    setArgv([
      "--pattern",
      "{type}/{title}-{id}",
      "--id",
      "STK-1",
      "--title",
      "My task",
      "--type",
      "feat",
    ]);

    validateBranchNameMock.mockRejectedValue(new Error("invalid branch"));

    await expect(run()).rejects.toThrow(/process\.exit:1/);

    expect(errorSpy).toHaveBeenCalled();
    expect(errorSpy.mock.calls.map((c) => c.join(" ")).join("\n")).toMatch(
      /Branch name is not valid for git/i,
    );
  });
});
