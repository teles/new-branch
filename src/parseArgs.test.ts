import { describe, it, expect } from "vitest";
import { parseArgs } from "./parseArgs.js";

describe("parseArgs", () => {
  it("parses long options", () => {
    const argv = [
      "node",
      "cli",
      "--pattern",
      "{type}/{title}-{id}",
      "--id",
      "STK-123",
      "--title",
      "Minha tarefa",
      "--type",
      "feat",
      "--create",
    ] as const;

    const res = parseArgs(argv);

    expect(res.options.pattern).toBe("{type}/{title}-{id}");
    expect(res.options.id).toBe("STK-123");
    expect(res.options.title).toBe("Minha tarefa");
    expect(res.options.type).toBe("feat");
    expect(res.options.create).toBe(true);
    expect(res.args).toEqual([]);
  });

  it("parses short -p as pattern", () => {
    const argv = ["node", "cli", "-p", "{type}/{title}-{id}"] as const;

    const res = parseArgs(argv);

    expect(res.options.pattern).toBe("{type}/{title}-{id}");
  });

  it("strips tsx double-dash separator", () => {
    const argv = [
      "node",
      "cli",
      "--",
      "--pattern",
      "{type}/{title}-{id}",
      "--id",
      "STK-123",
    ] as const;

    const res = parseArgs(argv);

    expect(res.options.pattern).toBe("{type}/{title}-{id}");
    expect(res.options.id).toBe("STK-123");
  });

  it("supports --no-prompt", () => {
    const argv = ["node", "cli", "--no-prompt"] as const;

    const res = parseArgs(argv);

    expect(res.options.prompt).toBe(false);
  });
});
