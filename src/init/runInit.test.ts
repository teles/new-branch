import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";

// ---- Mocks ----

vi.mock("node:fs", () => ({
  existsSync: vi.fn(),
}));

vi.mock("node:fs/promises", () => ({
  readFile: vi.fn(),
  writeFile: vi.fn(),
}));

const execaMock = vi.fn();
vi.mock("execa", () => ({
  execa: (...args: unknown[]) => execaMock(...args),
}));

const confirmMock = vi.fn();
const selectMock = vi.fn();
const checkboxMock = vi.fn();
const inputMock = vi.fn();

vi.mock("@inquirer/prompts", () => ({
  confirm: (...args: unknown[]) => confirmMock(...args),
  select: (...args: unknown[]) => selectMock(...args),
  checkbox: (...args: unknown[]) => checkboxMock(...args),
  input: (...args: unknown[]) => inputMock(...args),
}));

// Mock validate to be a no-op (we test validation elsewhere)
vi.mock("@/config/validate.js", () => ({
  validateProjectConfigFinal: vi.fn(),
}));

import { runInit } from "./runInit.js";

// ---- Helpers ----

const existsSyncMock = existsSync as unknown as ReturnType<typeof vi.fn>;
const writeFileMock = writeFile as unknown as ReturnType<typeof vi.fn>;
const readFileMock = readFile as unknown as ReturnType<typeof vi.fn>;

describe("runInit", () => {
  let logSpy: ReturnType<typeof vi.spyOn>;
  let exitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    existsSyncMock.mockReturnValue(false);
    writeFileMock.mockResolvedValue(undefined);
    readFileMock.mockRejectedValue(new Error("ENOENT"));
    execaMock.mockResolvedValue({ stdout: "" });
    logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    exitSpy = vi.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("process.exit called");
    });
  });

  afterEach(() => {
    logSpy.mockRestore();
    exitSpy.mockRestore();
  });

  describe("--yes mode (non-interactive)", () => {
    it("writes default config to .newbranchrc.json without prompting", async () => {
      await runInit({ yes: true, cwd: "/tmp/test" });

      expect(confirmMock).not.toHaveBeenCalled();
      expect(checkboxMock).not.toHaveBeenCalled();
      expect(selectMock).not.toHaveBeenCalled();

      expect(writeFileMock).toHaveBeenCalledOnce();
      const [path, content] = writeFileMock.mock.calls[0];
      expect(path).toContain(".newbranchrc.json");

      const config = JSON.parse(content);
      expect(config.pattern).toBe("{type}/{title:slugify}-{id}");
      expect(config.types).toBeInstanceOf(Array);
      expect(config.types.length).toBe(3);
      expect(config.defaultType).toBe("feat");
    });

    it("warns about existing config in --yes mode", async () => {
      existsSyncMock.mockReturnValue(true);

      await runInit({ yes: true, cwd: "/tmp/test" });

      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("Overwriting"));
      expect(writeFileMock).toHaveBeenCalledOnce();
    });
  });

  describe("config target selection", () => {
    it("prompts for config target in interactive mode", async () => {
      // Target: .newbranchrc.json
      selectMock.mockResolvedValueOnce("rc");
      // Minimal wizard
      checkboxMock.mockResolvedValueOnce(["title"]);
      selectMock.mockResolvedValueOnce("slugify");
      confirmMock.mockResolvedValueOnce(false); // no types
      confirmMock.mockResolvedValueOnce(false); // no aliases
      confirmMock.mockResolvedValueOnce(true); // write

      await runInit({ cwd: "/tmp/test" });

      expect(selectMock).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining("Where do you want to save"),
        }),
      );
      expect(writeFileMock).toHaveBeenCalledOnce();
      const [path] = writeFileMock.mock.calls[0];
      expect(path).toContain(".newbranchrc.json");
    });

    it("writes to package.json when selected", async () => {
      readFileMock.mockResolvedValueOnce(JSON.stringify({ name: "my-project", version: "1.0.0" }));
      // Target: package.json
      selectMock.mockResolvedValueOnce("package.json");
      // Minimal wizard
      checkboxMock.mockResolvedValueOnce(["title"]);
      selectMock.mockResolvedValueOnce("kebab");
      confirmMock.mockResolvedValueOnce(false); // no types
      confirmMock.mockResolvedValueOnce(false); // no aliases
      confirmMock.mockResolvedValueOnce(true); // write

      await runInit({ cwd: "/tmp/test" });

      expect(writeFileMock).toHaveBeenCalledOnce();
      const [path, content] = writeFileMock.mock.calls[0];
      expect(path).toContain("package.json");
      const pkg = JSON.parse(content);
      expect(pkg.name).toBe("my-project");
      expect(pkg["new-branch"]).toBeDefined();
      expect(pkg["new-branch"].pattern).toBe("{title:kebab}");
    });

    it("writes to git config when selected", async () => {
      // Target: git config
      selectMock.mockResolvedValueOnce("git");
      // Minimal wizard
      checkboxMock.mockResolvedValueOnce(["type", "title"]);
      selectMock.mockResolvedValueOnce("/");
      selectMock.mockResolvedValueOnce("slugify");
      confirmMock.mockResolvedValueOnce(false); // no types
      confirmMock.mockResolvedValueOnce(false); // no aliases
      confirmMock.mockResolvedValueOnce(true); // write

      await runInit({ cwd: "/tmp/test" });

      expect(writeFileMock).not.toHaveBeenCalled();
      expect(execaMock).toHaveBeenCalledWith("git", [
        "config",
        "--local",
        "new-branch.pattern",
        "{type}/{title:slugify}",
      ]);
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("git config"));
    });
  });

  describe("existing config detection", () => {
    it("asks to overwrite when rc config exists", async () => {
      existsSyncMock.mockReturnValue(true);
      selectMock.mockResolvedValueOnce("rc"); // target
      confirmMock.mockResolvedValueOnce(false); // Don't overwrite

      await runInit({ cwd: "/tmp/test" });

      expect(confirmMock).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining("already exists"),
        }),
      );
      expect(writeFileMock).not.toHaveBeenCalled();
      expect(logSpy).toHaveBeenCalledWith("Aborted.");
    });

    it("skips overwrite check for git config target", async () => {
      existsSyncMock.mockReturnValue(true);
      selectMock.mockResolvedValueOnce("git"); // target
      // Minimal wizard (no overwrite prompt expected)
      checkboxMock.mockResolvedValueOnce(["title"]);
      selectMock.mockResolvedValueOnce("slugify");
      confirmMock.mockResolvedValueOnce(false); // no types
      confirmMock.mockResolvedValueOnce(false); // no aliases
      confirmMock.mockResolvedValueOnce(true); // write

      await runInit({ cwd: "/tmp/test" });

      // First confirm should NOT be about overwriting
      expect(confirmMock.mock.calls[0][0].message).not.toMatch(/already exists/);
      expect(execaMock).toHaveBeenCalled();
    });

    it("proceeds when user confirms overwrite", async () => {
      existsSyncMock.mockReturnValue(true);
      selectMock.mockResolvedValueOnce("rc"); // target
      // Overwrite: yes
      confirmMock.mockResolvedValueOnce(true);
      // Build interactive config
      checkboxMock.mockResolvedValueOnce(["type", "title"]);
      selectMock.mockResolvedValueOnce("/"); // separator
      selectMock.mockResolvedValueOnce("slugify"); // transform
      // Define types? no
      confirmMock.mockResolvedValueOnce(false);
      // Define aliases? no
      confirmMock.mockResolvedValueOnce(false);
      // Write file? yes
      confirmMock.mockResolvedValueOnce(true);

      await runInit({ cwd: "/tmp/test" });

      expect(writeFileMock).toHaveBeenCalledOnce();
    });
  });

  describe("interactive wizard", () => {
    it("builds config from wizard answers", async () => {
      selectMock.mockResolvedValueOnce("rc"); // target
      // Select variables
      checkboxMock.mockResolvedValueOnce(["type", "title", "id"]);
      // Separators (2 separators for 3 variables)
      selectMock.mockResolvedValueOnce("/"); // between type and title
      selectMock.mockResolvedValueOnce("-"); // between title and id
      // Transforms for title (type and id are not text vars)
      selectMock.mockResolvedValueOnce("slugify");
      // Define types? yes
      confirmMock.mockResolvedValueOnce(true);
      // Use defaults? yes
      confirmMock.mockResolvedValueOnce(true);
      // Add more? no
      confirmMock.mockResolvedValueOnce(false);
      // Default type selection
      selectMock.mockResolvedValueOnce("feat");
      // Define aliases? no
      confirmMock.mockResolvedValueOnce(false);
      // Write file? yes
      confirmMock.mockResolvedValueOnce(true);

      await runInit({ cwd: "/tmp/test" });

      expect(writeFileMock).toHaveBeenCalledOnce();
      const [, content] = writeFileMock.mock.calls[0];
      const config = JSON.parse(content);

      expect(config.pattern).toBe("{type}/{title:slugify}-{id}");
      expect(config.types).toEqual([
        { value: "feat", label: "Feature" },
        { value: "fix", label: "Bug Fix" },
        { value: "chore", label: "Chore" },
      ]);
      expect(config.defaultType).toBe("feat");
    });

    it("aborts when user declines to write", async () => {
      selectMock.mockResolvedValueOnce("rc"); // target
      checkboxMock.mockResolvedValueOnce(["type", "title"]);
      selectMock.mockResolvedValueOnce("/");
      selectMock.mockResolvedValueOnce("slugify");
      confirmMock.mockResolvedValueOnce(false); // no types
      confirmMock.mockResolvedValueOnce(false); // no aliases
      confirmMock.mockResolvedValueOnce(false); // decline write

      await runInit({ cwd: "/tmp/test" });

      expect(writeFileMock).not.toHaveBeenCalled();
      expect(logSpy).toHaveBeenCalledWith("Aborted.");
    });

    it("exits when no variables selected", async () => {
      selectMock.mockResolvedValueOnce("rc"); // target
      checkboxMock.mockResolvedValueOnce([]);

      await expect(runInit({ cwd: "/tmp/test" })).rejects.toThrow("process.exit");
      expect(writeFileMock).not.toHaveBeenCalled();
    });

    it("handles aliased patterns", async () => {
      selectMock.mockResolvedValueOnce("rc"); // target
      checkboxMock.mockResolvedValueOnce(["type", "title"]);
      selectMock.mockResolvedValueOnce("/");
      selectMock.mockResolvedValueOnce("kebab");
      confirmMock.mockResolvedValueOnce(false); // no types
      // Define aliases? yes
      confirmMock.mockResolvedValueOnce(true);
      // Alias name
      inputMock.mockResolvedValueOnce("hotfix");
      // Alias pattern
      inputMock.mockResolvedValueOnce("hotfix/{title:slugify}");
      // Add more? no
      confirmMock.mockResolvedValueOnce(false);
      // Write file? yes
      confirmMock.mockResolvedValueOnce(true);

      await runInit({ cwd: "/tmp/test" });

      const [, content] = writeFileMock.mock.calls[0];
      const config = JSON.parse(content);

      expect(config.patterns).toEqual({
        hotfix: "hotfix/{title:slugify}",
      });
    });

    it("handles transform with max length prompt", async () => {
      selectMock.mockResolvedValueOnce("rc"); // target
      checkboxMock.mockResolvedValueOnce(["title"]);
      // No separators needed (single var)
      // Transform with max
      selectMock.mockResolvedValueOnce("slugify;max:30");
      inputMock.mockResolvedValueOnce("50"); // max length
      confirmMock.mockResolvedValueOnce(false); // no types
      confirmMock.mockResolvedValueOnce(false); // no aliases
      confirmMock.mockResolvedValueOnce(true); // write

      await runInit({ cwd: "/tmp/test" });

      const [, content] = writeFileMock.mock.calls[0];
      const config = JSON.parse(content);
      expect(config.pattern).toBe("{title:slugify;max:50}");
    });

    it("writes pattern aliases as separate git config keys", async () => {
      selectMock.mockResolvedValueOnce("git"); // target
      checkboxMock.mockResolvedValueOnce(["type", "title"]);
      selectMock.mockResolvedValueOnce("/");
      selectMock.mockResolvedValueOnce("slugify");
      confirmMock.mockResolvedValueOnce(false); // no types
      // Define aliases? yes
      confirmMock.mockResolvedValueOnce(true);
      inputMock.mockResolvedValueOnce("hotfix");
      inputMock.mockResolvedValueOnce("hotfix/{title:slugify}");
      confirmMock.mockResolvedValueOnce(false); // no more aliases
      confirmMock.mockResolvedValueOnce(true); // write

      await runInit({ cwd: "/tmp/test" });

      expect(execaMock).toHaveBeenCalledWith("git", [
        "config",
        "--local",
        "new-branch.patterns.hotfix",
        "hotfix/{title:slugify}",
      ]);
    });
  });
});
