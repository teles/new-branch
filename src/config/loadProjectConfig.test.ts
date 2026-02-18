import { vi, describe, it, expect, beforeEach } from "vitest";
import type { Mock } from "vitest";

vi.mock("node:fs/promises", () => ({
  readFile: vi.fn(),
}));

import { readFile } from "node:fs/promises";

describe("loadProjectConfig", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("returns pattern when package.json contains new-branch.pattern as string", async () => {
    (readFile as unknown as Mock).mockResolvedValueOnce(
      JSON.stringify({ "new-branch": { pattern: "{type}/{title}-{id}" } }),
    );

    const { loadProjectConfig } = await import("./loadProjectConfig.js");

    const cfg = await loadProjectConfig();
    expect(cfg).toEqual({ pattern: "{type}/{title}-{id}" });
  });

  it("returns empty object when package.json has no new-branch key", async () => {
    (readFile as unknown as Mock).mockResolvedValueOnce(JSON.stringify({ name: "pkg" }));

    const { loadProjectConfig } = await import("./loadProjectConfig.js");

    const cfg = await loadProjectConfig();
    expect(cfg).toEqual({});
  });

  it("ignores non-string pattern values", async () => {
    (readFile as unknown as Mock).mockResolvedValueOnce(
      JSON.stringify({ "new-branch": { pattern: 123 } }),
    );

    const { loadProjectConfig } = await import("./loadProjectConfig.js");

    const cfg = await loadProjectConfig();
    expect(cfg).toEqual({});
  });

  it("returns empty object if reading package.json throws", async () => {
    (readFile as unknown as Mock).mockRejectedValueOnce(new Error("enoent"));

    const { loadProjectConfig } = await import("./loadProjectConfig.js");

    const cfg = await loadProjectConfig();
    expect(cfg).toEqual({});
  });
});
