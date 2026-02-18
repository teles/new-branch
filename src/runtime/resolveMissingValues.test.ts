import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";
import { resolveMissingValues } from "./resolveMissingValues.js";
import { parsePattern } from "../pattern/parsePattern.js";

// Mock prompts module so tests can control interactive behavior
vi.mock("@inquirer/prompts", () => {
  return {
    input: vi.fn(),
    select: vi.fn(),
  };
});

// Provide a lightweight mock for the runtime enums so module resolution
// does not fail in the test environment (we only need the shape used
// by the code under test).
vi.mock("@/runtime/enums.js", () => ({
  TYPE_CHOICES: [
    { name: "Feature", value: "feat" },
    { name: "Fix", value: "fix" },
  ],
}));

import { input, select } from "@inquirer/prompts";

beforeEach(() => {
  // resetAllMocks clears implementations and mock queues (e.g. mockResolvedValueOnce)
  // which prevents cross-test leakage of one-off mock return values.
  vi.resetAllMocks();
});

describe("resolveMissingValues", () => {
  it("returns values unchanged when all required vars are present", async () => {
    const parsed = parsePattern("{type}/{title}-{id}");
    const initial = { type: "feat", title: "My Task", id: "123" };

    const out = await resolveMissingValues(parsed, initial, { prompt: true });

    expect(out).toEqual(initial);
    expect(input).not.toHaveBeenCalled();
    expect(select).not.toHaveBeenCalled();
  });

  it("prompts for a missing non-type variable using input", async () => {
    const parsed = parsePattern("{type}/{title}");
    // input should be used for `title`
    (input as unknown as Mock).mockResolvedValueOnce("Provided Title");

    // Type is present so select should not be called
    const out = await resolveMissingValues(parsed, { type: "fix" }, { prompt: true });

    expect(input).toHaveBeenCalled();
    expect(select).not.toHaveBeenCalled();
    expect(out.title).toBe("Provided Title");
  });

  it("uses select for the `type` variable", async () => {
    const parsed = parsePattern("{type}/{title}");
    (select as unknown as Mock).mockResolvedValueOnce("feat");
    (input as unknown as Mock).mockResolvedValueOnce("Some title");

    const out = await resolveMissingValues(parsed, { title: "Some title" }, { prompt: true });

    expect(select).toHaveBeenCalledTimes(1);
    expect(select).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Select branch type:",
        choices: [
          { name: "Feature", value: "feat" },
          { name: "Fix", value: "fix" },
        ],
      }),
    );
    expect(out.type).toBe("feat");
  });

  it("throws when prompt is false and a required variable is missing", async () => {
    const parsed = parsePattern("{id}");

    await expect(resolveMissingValues(parsed, {}, { prompt: false })).rejects.toThrow(
      /Missing required value/i,
    );
  });

  it("treats whitespace-only values as missing and prompts", async () => {
    const parsed = parsePattern("{title}");
    (input as unknown as Mock).mockResolvedValueOnce("Trimmed");

    const out = await resolveMissingValues(parsed, { title: "   " }, { prompt: true });

    expect(input).toHaveBeenCalled();
    expect(out.title).toBe("Trimmed");
  });
});
