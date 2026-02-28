import { describe, it, expect, beforeEach, vi } from "vitest";

// ---- mocks ----
const getGitConfigMock = vi.fn();
const getGitConfigRegexpMock = vi.fn();
vi.mock("@/git/gitConfig.js", () => ({
  getGitConfig: (...args: unknown[]) => getGitConfigMock(...args),
  getGitConfigRegexp: (...args: unknown[]) => getGitConfigRegexpMock(...args),
}));

const validateProjectConfigSourceMock = vi.fn();
const validateProjectConfigFinalMock = vi.fn();

vi.mock("../validate.js", () => ({
  validateProjectConfigSource: (...args: unknown[]) => validateProjectConfigSourceMock(...args),
  validateProjectConfigFinal: (...args: unknown[]) => validateProjectConfigFinalMock(...args),
}));

// import after mocks
import { gitLoader } from "./git.loader.js";
import type { ProjectConfig } from "../types.js";

describe("gitLoader", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // default pass-through validation
    validateProjectConfigSourceMock.mockImplementation((cfg: unknown) => cfg);
    validateProjectConfigFinalMock.mockImplementation((cfg: unknown) => cfg);

    // default: nothing in git config
    getGitConfigMock.mockResolvedValue(undefined);
    getGitConfigRegexpMock.mockResolvedValue([]);
  });

  it("returns found:false when pattern, defaultType and types are all missing", async () => {
    getGitConfigMock.mockResolvedValue(undefined);

    const res = await gitLoader.load();

    expect(getGitConfigMock).toHaveBeenCalledWith("new-branch.pattern");
    expect(getGitConfigMock).toHaveBeenCalledWith("new-branch.defaultType");
    expect(getGitConfigMock).toHaveBeenCalledWith("new-branch.types");

    expect(validateProjectConfigSourceMock).not.toHaveBeenCalled();
    expect(validateProjectConfigFinalMock).not.toHaveBeenCalled();

    expect(res).toEqual({ found: false, source: "git", config: undefined });
  });

  it("returns found:true when pattern exists (even if others missing)", async () => {
    getGitConfigMock.mockImplementation(async (key: string) => {
      if (key === "new-branch.pattern") return "{type}/{id}-{title}";
      return undefined;
    });

    const res = await gitLoader.load();

    expect(res.found).toBe(true);
    expect(res.source).toBe("git");

    const cfg = res.config as ProjectConfig;
    expect(cfg.pattern).toBe("{type}/{id}-{title}");
    expect(cfg.defaultType).toBeUndefined();
    expect(cfg.types).toBeUndefined();

    expect(validateProjectConfigSourceMock).toHaveBeenCalledTimes(1);
    expect(validateProjectConfigFinalMock).toHaveBeenCalledTimes(1);
    expect(validateProjectConfigSourceMock).toHaveBeenCalledWith(expect.any(Object), "git config");
    expect(validateProjectConfigFinalMock).toHaveBeenCalledWith(expect.any(Object), "git config");
  });

  it("returns found:true when defaultType exists (even if others missing)", async () => {
    getGitConfigMock.mockImplementation(async (key: string) => {
      if (key === "new-branch.defaultType") return "feat";
      return undefined;
    });

    const res = await gitLoader.load();

    expect(res.found).toBe(true);
    const cfg = res.config as ProjectConfig;
    expect(cfg.pattern).toBeUndefined();
    expect(cfg.defaultType).toBe("feat");
    expect(cfg.types).toBeUndefined();

    expect(validateProjectConfigSourceMock).toHaveBeenCalledWith(
      expect.objectContaining({ defaultType: "feat" }),
      "git config",
    );
  });

  it("parses types from git config (value:Label + trims + ignores empty)", async () => {
    getGitConfigMock.mockImplementation(async (key: string) => {
      if (key === "new-branch.types") {
        return " feat:Feature , fix: Bug Fix, chore , , docs:Docs  ";
      }
      return undefined;
    });

    const res = await gitLoader.load();

    expect(res.found).toBe(true);

    const cfg = res.config as ProjectConfig;
    expect(cfg.types).toEqual([
      { value: "feat", label: "Feature" },
      { value: "fix", label: "Bug Fix" },
      // no ":" => label === value
      { value: "chore", label: "chore" },
      { value: "docs", label: "Docs" },
    ]);
  });

  it("still returns found:true if only types exist", async () => {
    getGitConfigMock.mockImplementation(async (key: string) => {
      if (key === "new-branch.types") return "feat:Feature";
      return undefined;
    });

    const res = await gitLoader.load();

    expect(res).toEqual({
      found: true,
      source: "git",
      config: {
        pattern: undefined,
        defaultType: undefined,
        types: [{ value: "feat", label: "Feature" }],
      },
    });

    expect(validateProjectConfigSourceMock).toHaveBeenCalledTimes(1);
    expect(validateProjectConfigFinalMock).toHaveBeenCalledTimes(1);
  });

  it("passes the validated config through (uses validate return, not raw cfg)", async () => {
    getGitConfigMock.mockImplementation(async (key: string) => {
      if (key === "new-branch.pattern") return "{id}";
      return undefined;
    });

    validateProjectConfigSourceMock.mockReturnValue({ pattern: "{id}" });
    validateProjectConfigFinalMock.mockReturnValue({ pattern: "{id}", defaultType: "feat" });

    const res = await gitLoader.load();

    expect(res.found).toBe(true);
    expect(res.config).toEqual({ pattern: "{id}", defaultType: "feat" });
  });

  it("reads patterns from git config --get-regexp", async () => {
    getGitConfigRegexpMock.mockResolvedValue([
      ["new-branch.patterns.hotfix", "hotfix/{id}-{title:kebab}"],
      ["new-branch.patterns.release", "release/{currentBranch}"],
    ]);

    const res = await gitLoader.load();

    expect(res.found).toBe(true);
    const cfg = res.config as ProjectConfig;
    expect(cfg.patterns).toEqual({
      hotfix: "hotfix/{id}-{title:kebab}",
      release: "release/{currentBranch}",
    });

    expect(getGitConfigRegexpMock).toHaveBeenCalledWith("^new-branch\\.patterns\\.");
  });

  it("returns found:true when only patterns exist", async () => {
    getGitConfigRegexpMock.mockResolvedValue([
      ["new-branch.patterns.spike", "spike/{title:kebab}"],
    ]);

    const res = await gitLoader.load();

    expect(res.found).toBe(true);
    const cfg = res.config as ProjectConfig;
    expect(cfg.patterns).toEqual({ spike: "spike/{title:kebab}" });
    expect(cfg.pattern).toBeUndefined();
    expect(cfg.defaultType).toBeUndefined();
    expect(cfg.types).toBeUndefined();
  });

  it("includes patterns alongside other git config fields", async () => {
    getGitConfigMock.mockImplementation(async (key: string) => {
      if (key === "new-branch.pattern") return "{type}/{id}";
      return undefined;
    });

    getGitConfigRegexpMock.mockResolvedValue([["new-branch.patterns.hotfix", "hotfix/{id}"]]);

    const res = await gitLoader.load();

    expect(res.found).toBe(true);
    const cfg = res.config as ProjectConfig;
    expect(cfg.pattern).toBe("{type}/{id}");
    expect(cfg.patterns).toEqual({ hotfix: "hotfix/{id}" });
  });

  it("returns found:false when pattern, defaultType, types, and patterns are all missing", async () => {
    getGitConfigMock.mockResolvedValue(undefined);
    getGitConfigRegexpMock.mockResolvedValue([]);

    const res = await gitLoader.load();

    expect(res).toEqual({ found: false, source: "git", config: undefined });
  });
});
