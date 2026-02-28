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

  it("parses --use option", () => {
    const argv = ["node", "cli", "--use", "hotfix"] as const;

    const res = parseArgs(argv);

    expect(res.options.use).toBe("hotfix");
  });

  it("parses --use alongside other options", () => {
    const argv = [
      "node",
      "cli",
      "--use",
      "release",
      "--id",
      "STK-1",
      "--title",
      "My task",
    ] as const;

    const res = parseArgs(argv);

    expect(res.options.use).toBe("release");
    expect(res.options.id).toBe("STK-1");
    expect(res.options.title).toBe("My task");
  });

  it("returns undefined for --use when not provided", () => {
    const argv = ["node", "cli", "--pattern", "{type}/{id}"] as const;

    const res = parseArgs(argv);

    expect(res.options.use).toBeUndefined();
  });

  it("coerces numeric --id and --pattern to strings", () => {
    const argv = ["node", "cli", "--id", "42", "--pattern", "123"] as const;

    const res = parseArgs(argv);

    expect(res.options.id).toBe("42");
    expect(res.options.pattern).toBe("123");
  });

  it("returns undefined for boolean flags when not provided", () => {
    const argv = ["node", "cli"] as const;

    const res = parseArgs(argv);

    expect(res.options.create).toBeUndefined();
    expect(res.options.quiet).toBeUndefined();
    expect(res.options.explain).toBeUndefined();
    expect(res.options.listTransforms).toBeUndefined();
    expect(res.options.printConfig).toBeUndefined();
    expect(res.options.help).toBeUndefined();
  });

  it("parses all boolean flags when provided", () => {
    const argv = [
      "node",
      "cli",
      "--create",
      "--quiet",
      "--explain",
      "--list-transforms",
      "--print-config",
    ] as const;

    const res = parseArgs(argv);

    expect(res.options.create).toBe(true);
    expect(res.options.quiet).toBe(true);
    expect(res.options.explain).toBe(true);
    expect(res.options.listTransforms).toBe(true);
    expect(res.options.printConfig).toBe(true);
  });
});
