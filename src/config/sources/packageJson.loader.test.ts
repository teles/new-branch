import { describe, it, expect, beforeEach, vi } from "vitest";

// ---- mocks ----
const readFileMock = vi.fn();

vi.mock("node:fs/promises", () => ({
  readFile: (...args: unknown[]) => readFileMock(...args),
}));

const validateProjectConfigSourceMock = vi.fn();
const validateProjectConfigFinalMock = vi.fn();

vi.mock("../validate.js", () => ({
  validateProjectConfigSource: (...args: unknown[]) => validateProjectConfigSourceMock(...args),
  validateProjectConfigFinal: (...args: unknown[]) => validateProjectConfigFinalMock(...args),
}));

// import AFTER mocks
import { packageJsonLoader } from "./packageJson.loader.js";
import type { ProjectConfig } from "../types.js";

describe("packageJsonLoader", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // default: validations pass through
    validateProjectConfigSourceMock.mockImplementation((cfg: unknown) => cfg);
    validateProjectConfigFinalMock.mockImplementation((cfg: unknown) => cfg);
  });

  it("returns found:false when package.json does not exist (ENOENT)", async () => {
    readFileMock.mockRejectedValue({ code: "ENOENT" });

    const res = await packageJsonLoader.load();

    expect(res).toEqual({
      found: false,
      source: "package.json",
      config: undefined,
    });

    expect(validateProjectConfigSourceMock).not.toHaveBeenCalled();
    expect(validateProjectConfigFinalMock).not.toHaveBeenCalled();
  });

  it("rethrows errors other than ENOENT", async () => {
    readFileMock.mockRejectedValue(new Error("boom"));

    await expect(packageJsonLoader.load()).rejects.toThrow("boom");
  });

  it("returns found:false when JSON is not an object", async () => {
    readFileMock.mockResolvedValue('"not-an-object"');

    const res = await packageJsonLoader.load();

    expect(res).toEqual({
      found: false,
      source: "package.json",
      config: undefined,
    });

    expect(validateProjectConfigSourceMock).not.toHaveBeenCalled();
  });

  it("returns found:false when 'new-branch' block is missing", async () => {
    readFileMock.mockResolvedValue(
      JSON.stringify({
        name: "app",
        version: "1.0.0",
      }),
    );

    const res = await packageJsonLoader.load();

    expect(res).toEqual({
      found: false,
      source: "package.json",
      config: undefined,
    });

    expect(validateProjectConfigSourceMock).not.toHaveBeenCalled();
  });

  it("returns found:true when 'new-branch' block exists", async () => {
    readFileMock.mockResolvedValue(
      JSON.stringify({
        name: "app",
        "new-branch": {
          pattern: "{type}/{id}",
        },
      }),
    );

    const res = await packageJsonLoader.load();

    expect(res.found).toBe(true);
    expect(res.source).toBe("package.json");

    const cfg = res.config as ProjectConfig;
    expect(cfg).toEqual({ pattern: "{type}/{id}" });

    expect(validateProjectConfigSourceMock).toHaveBeenCalledWith(
      { pattern: "{type}/{id}" },
      "package.json",
    );
    expect(validateProjectConfigFinalMock).toHaveBeenCalledWith(
      { pattern: "{type}/{id}" },
      "package.json",
    );
  });

  it("returns validated result (uses final validator return value)", async () => {
    readFileMock.mockResolvedValue(
      JSON.stringify({
        "new-branch": {
          pattern: "{id}",
        },
      }),
    );

    validateProjectConfigSourceMock.mockReturnValue({ pattern: "{id}" });
    validateProjectConfigFinalMock.mockReturnValue({
      pattern: "{id}",
      defaultType: "feat",
    });

    const res = await packageJsonLoader.load();

    expect(res).toEqual({
      found: true,
      source: "package.json",
      config: {
        pattern: "{id}",
        defaultType: "feat",
      },
    });
  });

  it("throws when JSON is invalid", async () => {
    readFileMock.mockResolvedValue("{ invalid json");

    await expect(packageJsonLoader.load()).rejects.toThrow();
  });
});
