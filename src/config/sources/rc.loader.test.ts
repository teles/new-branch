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
import { rcLoader, RC_FILENAME } from "./rc.loader.js";
import type { ProjectConfig } from "../types.js";

describe("rcLoader", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // default: validations pass-through
    validateProjectConfigSourceMock.mockImplementation((cfg: unknown) => cfg);
    validateProjectConfigFinalMock.mockImplementation((cfg: unknown) => cfg);
  });

  it("returns found:false when rc file does not exist (ENOENT)", async () => {
    readFileMock.mockRejectedValue({ code: "ENOENT" });

    const res = await rcLoader.load();

    expect(res).toEqual({
      found: false,
      source: "rc",
      config: undefined,
    });

    expect(validateProjectConfigSourceMock).not.toHaveBeenCalled();
    expect(validateProjectConfigFinalMock).not.toHaveBeenCalled();
  });

  it("rethrows errors other than ENOENT", async () => {
    readFileMock.mockRejectedValue(new Error("boom"));

    await expect(rcLoader.load()).rejects.toThrow("boom");
  });

  it("returns found:true when rc file exists and is valid", async () => {
    readFileMock.mockResolvedValue(
      JSON.stringify({
        pattern: "{type}/{id}",
      }),
    );

    const res = await rcLoader.load();

    expect(res.found).toBe(true);
    expect(res.source).toBe("rc");

    const cfg = res.config as ProjectConfig;
    expect(cfg).toEqual({ pattern: "{type}/{id}" });

    expect(validateProjectConfigSourceMock).toHaveBeenCalledWith(
      { pattern: "{type}/{id}" },
      RC_FILENAME,
    );
    expect(validateProjectConfigFinalMock).toHaveBeenCalledWith(
      { pattern: "{type}/{id}" },
      RC_FILENAME,
    );
  });

  it("returns validated result (uses final validator output)", async () => {
    readFileMock.mockResolvedValue(
      JSON.stringify({
        pattern: "{id}",
      }),
    );

    validateProjectConfigSourceMock.mockReturnValue({ pattern: "{id}" });
    validateProjectConfigFinalMock.mockReturnValue({
      pattern: "{id}",
      defaultType: "feat",
    });

    const res = await rcLoader.load();

    expect(res).toEqual({
      found: true,
      source: "rc",
      config: {
        pattern: "{id}",
        defaultType: "feat",
      },
    });
  });

  it("throws when JSON is invalid", async () => {
    readFileMock.mockResolvedValue("{ invalid json");

    await expect(rcLoader.load()).rejects.toThrow();
  });

  it("passes RC_FILENAME as source to validators", async () => {
    readFileMock.mockResolvedValue(
      JSON.stringify({
        pattern: "{id}",
      }),
    );

    await rcLoader.load();

    expect(validateProjectConfigSourceMock).toHaveBeenCalledWith(expect.any(Object), RC_FILENAME);
    expect(validateProjectConfigFinalMock).toHaveBeenCalledWith(expect.any(Object), RC_FILENAME);
  });
});
