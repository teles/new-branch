import { describe, it, expect, beforeEach, vi } from "vitest";

// ---- mocks ----

const rcLoadMock = vi.fn();
const packageLoadMock = vi.fn();
const gitLoadMock = vi.fn();

vi.mock("./sources/rc.loader.js", () => ({
  rcLoader: {
    load: (...args: unknown[]) => rcLoadMock(...args),
  },
}));

vi.mock("./sources/packageJson.loader.js", () => ({
  packageJsonLoader: {
    load: (...args: unknown[]) => packageLoadMock(...args),
  },
}));

vi.mock("./sources/git.loader.js", () => ({
  gitLoader: {
    load: (...args: unknown[]) => gitLoadMock(...args),
  },
}));

// Import AFTER mocks
import { loadConfig } from "./loadConfig.js";
import type { ProjectConfig } from "./types.js";

describe("loadConfig", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns rc config when found (highest precedence)", async () => {
    const rcConfig: ProjectConfig = { pattern: "rc-pattern" };

    rcLoadMock.mockResolvedValue({
      found: true,
      config: rcConfig,
    });

    packageLoadMock.mockResolvedValue({
      found: true,
      config: { pattern: "package-pattern" },
    });

    gitLoadMock.mockResolvedValue({
      found: true,
      config: { pattern: "git-pattern" },
    });

    const result = await loadConfig();

    expect(result).toEqual(rcConfig);

    expect(rcLoadMock).toHaveBeenCalledTimes(1);
    // When rc is found and non-empty we short-circuit and do not call lower
    // precedence loaders.
    expect(packageLoadMock).toHaveBeenCalledTimes(0);
    expect(gitLoadMock).toHaveBeenCalledTimes(0);
  });

  it("falls back to package.json when rc is not found", async () => {
    const pkgConfig: ProjectConfig = { pattern: "package-pattern" };

    rcLoadMock.mockResolvedValue({
      found: false,
      config: {},
    });

    packageLoadMock.mockResolvedValue({
      found: true,
      config: pkgConfig,
    });

    gitLoadMock.mockResolvedValue({
      found: true,
      config: { pattern: "git-pattern" },
    });

    const result = await loadConfig();

    expect(result).toEqual(pkgConfig);
  });

  it("falls back to git config when rc and package are not found", async () => {
    const gitConfig: ProjectConfig = { pattern: "git-pattern" };

    rcLoadMock.mockResolvedValue({
      found: false,
      config: {},
    });

    packageLoadMock.mockResolvedValue({
      found: false,
      config: {},
    });

    gitLoadMock.mockResolvedValue({
      found: true,
      config: gitConfig,
    });

    const result = await loadConfig();

    expect(result).toEqual(gitConfig);
  });

  it("returns empty object when no source is found", async () => {
    rcLoadMock.mockResolvedValue({ found: false, config: {} });
    packageLoadMock.mockResolvedValue({ found: false, config: {} });
    gitLoadMock.mockResolvedValue({ found: false, config: {} });

    const result = await loadConfig();

    expect(result).toEqual({});
  });

  it("does not merge configs (returns only first found)", async () => {
    rcLoadMock.mockResolvedValue({
      found: false,
      config: {},
    });

    packageLoadMock.mockResolvedValue({
      found: true,
      config: {
        pattern: "package-pattern",
      },
    });

    gitLoadMock.mockResolvedValue({
      found: true,
      config: {
        types: [{ value: "feat", label: "Feature" }],
      },
    });

    const result = await loadConfig();

    // Should NOT merge git types into package config
    expect(result).toEqual({
      pattern: "package-pattern",
    });
  });
});
