import { describe, it, expect } from "vitest";
import { formatCspDiff, formatCspDiffLegend } from "./formatCspDiff.js";
import { compareCsp } from "./compareCsp.js";
import { parseCsp } from "./parseCsp.js";
import type { CspDiff } from "./types.js";

const emptyDiff: CspDiff = { directives: [] };

describe("formatCspDiff", () => {
  it("prints (no directives) for an empty diff", () => {
    expect(formatCspDiff(emptyDiff)).toBe("  (no directives)");
  });

  it("formats a fully unchanged directive on a single line", () => {
    const diff = compareCsp(parseCsp("default-src 'self'"), parseCsp("default-src 'self'"));
    const output = formatCspDiff(diff);
    expect(output).toBe("    default-src 'self'");
  });

  it("formats a fully added directive with [+] prefix", () => {
    const diff = compareCsp(parseCsp(""), parseCsp("script-src 'self'"));
    const output = formatCspDiff(diff);
    expect(output).toBe("[+] script-src 'self'");
  });

  it("formats a fully removed directive with [-] prefix", () => {
    const diff = compareCsp(parseCsp("img-src *"), parseCsp(""));
    const output = formatCspDiff(diff);
    expect(output).toBe("[-] img-src *");
  });

  it("formats a directive with item-level changes using per-value lines", () => {
    const diff = compareCsp(
      parseCsp("img-src 'self' https://old.com"),
      parseCsp("img-src 'self' https://new.com"),
    );
    const output = formatCspDiff(diff);
    expect(output).toContain("    img-src:");
    expect(output).toContain("      'self'");
    expect(output).toContain("[-]   https://old.com");
    expect(output).toContain("[+]   https://new.com");
  });

  it("formats a directive with no values (e.g. upgrade-insecure-requests)", () => {
    const diff = compareCsp(
      parseCsp("upgrade-insecure-requests"),
      parseCsp("upgrade-insecure-requests"),
    );
    const output = formatCspDiff(diff);
    expect(output).toBe("    upgrade-insecure-requests");
  });

  it("formats a realistic multi-directive diff", () => {
    const csp1 = parseCsp("default-src 'self'; script-src 'self' 'unsafe-inline'; img-src 'self'");
    const csp2 = parseCsp("default-src 'self'; script-src 'self'; img-src *; style-src 'self'");
    const diff = compareCsp(csp1, csp2);
    const output = formatCspDiff(diff);

    expect(output).toContain("    default-src 'self'");
    expect(output).toContain("    script-src:");
    expect(output).toContain("[-]   'unsafe-inline'");
    expect(output).toContain("    img-src:");
    expect(output).toContain("[-]   'self'");
    expect(output).toContain("[+]   *");
    expect(output).toContain("[+] style-src 'self'");
  });

  it("does not include [+] prefix for added values within unchanged directive header", () => {
    const diff = compareCsp(parseCsp("img-src 'self'"), parseCsp("img-src 'self' *"));
    const output = formatCspDiff(diff);
    // directive header should not have [+] prefix (it exists in both)
    const lines = output.split("\n");
    const headerLine = lines.find((l) => l.includes("img-src:"));
    expect(headerLine).toBeDefined();
    expect(headerLine).not.toMatch(/^\[/);
  });

  it("orders lines: unchanged-prefix directive → per-value lines", () => {
    const diff = compareCsp(parseCsp("img-src 'self'"), parseCsp("img-src 'self' *"));
    const output = formatCspDiff(diff);
    const lines = output.split("\n");
    expect(lines[0]).toMatch(/^\s+img-src:/);
    expect(lines[1]).toMatch(/^\s+'self'/);
    expect(lines[2]).toMatch(/^\[\+\]\s+\*/);
  });
});

describe("formatCspDiffLegend", () => {
  it("contains [+] and [-] symbols", () => {
    const legend = formatCspDiffLegend();
    expect(legend).toContain("[+]");
    expect(legend).toContain("[-]");
  });

  it("describes added and removed", () => {
    const legend = formatCspDiffLegend();
    expect(legend).toContain("added");
    expect(legend).toContain("removed");
  });
});
