import { describe, it, expect, vi, beforeEach } from "vitest";

// Mutable parseArgs result so tests can change it per-case
let parseArgsResult: { options: Record<string, unknown>; args: unknown[] } = {
  options: { id: "123", title: "hi" },
  args: [],
};
vi.mock("@/parseArgs.js", () => ({
  parseArgs: () => parseArgsResult,
}));

vi.mock("@/config/loadConfig.js", () => ({
  loadConfig: async () => ({
    pattern: "{type}/{id}",
    types: [
      { value: "rc", label: "RC" },
      { value: "feat", label: "Feature" },
    ],
    defaultType: "rc",
  }),
}));

vi.mock("@/pattern/parsePattern.js", () => ({
  parsePattern: () => ({ variablesUsed: ["type", "id"] }),
}));

vi.mock("@/runtime/builtins.js", () => ({ getBuiltinValues: () => ({}) }));
vi.mock("@/git/gitBuiltins.js", () => ({ patternNeedsGitBuiltins: () => false }));
vi.mock("@/git/gitConfig.js", () => ({ getGitConfig: async () => undefined }));
vi.mock("@/git/createBranch.js", () => ({ createBranch: async () => undefined }));
vi.mock("@/pattern/transforms/renderPattern.js", () => ({ renderPattern: () => "rendered" }));

const resolveMissingValuesMock = vi.fn(
  async (_ast: unknown, initialValues: Record<string, unknown>) => {
    return initialValues;
  },
);

vi.mock("@/runtime/resolveMissingValues.js", () => ({
  resolveMissingValues: (...args: unknown[]) =>
    resolveMissingValuesMock(args[0], args[1] as Record<string, unknown>),
}));

// Import run after setting up mocks
const { run } = await import("./cli.js");

beforeEach(() => {
  vi.resetAllMocks();
  parseArgsResult = { options: { id: "123", title: "hi" }, args: [] };
});

describe("CLI defaultType behavior", () => {
  it("uses config.defaultType when CLI --type not provided and does not prompt", async () => {
    await run();

    expect(resolveMissingValuesMock).toHaveBeenCalledTimes(1);
    const callArgs = resolveMissingValuesMock.mock.calls[0];
    const initialValues = callArgs[1] as Record<string, unknown>;
    expect(initialValues.type).toBe("rc");
  });

  it("non-interactive (--no-prompt) still works and uses defaultType", async () => {
    parseArgsResult = { options: { id: "123", title: "hi", prompt: false }, args: [] };

    await run();

    expect(resolveMissingValuesMock).toHaveBeenCalledTimes(1);
    const callArgs = resolveMissingValuesMock.mock.calls[0];
    const initialValues = callArgs[1] as Record<string, unknown>;
    expect(initialValues.type).toBe("rc");
  });
});
