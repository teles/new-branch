import { describe, it, expect } from "vitest";
import { compareCsp } from "./compareCsp.js";
import { parseCsp } from "./parseCsp.js";
import type { CspPolicy } from "./types.js";

const empty: CspPolicy = [];

describe("compareCsp", () => {
  it("returns no directives when both policies are empty", () => {
    expect(compareCsp(empty, empty)).toEqual({ directives: [] });
  });

  it("marks all directives as removed when csp2 is empty", () => {
    const csp1 = parseCsp("default-src 'self'; img-src *");
    const diff = compareCsp(csp1, empty);
    expect(diff.directives).toHaveLength(2);
    expect(diff.directives[0]).toMatchObject({ name: "default-src", status: "removed" });
    expect(diff.directives[1]).toMatchObject({ name: "img-src", status: "removed" });
  });

  it("marks all directives as added when csp1 is empty", () => {
    const csp2 = parseCsp("default-src 'self'; img-src *");
    const diff = compareCsp(empty, csp2);
    expect(diff.directives).toHaveLength(2);
    expect(diff.directives[0]).toMatchObject({ name: "default-src", status: "added" });
    expect(diff.directives[1]).toMatchObject({ name: "img-src", status: "added" });
  });

  it("marks identical policies as unchanged", () => {
    const policy = parseCsp("default-src 'self'; img-src 'self' https://cdn.example.com");
    const diff = compareCsp(policy, policy);
    for (const d of diff.directives) {
      expect(d.status).toBe("unchanged");
      for (const item of d.items) {
        expect(item.status).toBe("unchanged");
      }
    }
  });

  it("marks a new directive as added", () => {
    const csp1 = parseCsp("default-src 'self'");
    const csp2 = parseCsp("default-src 'self'; script-src 'self'");
    const diff = compareCsp(csp1, csp2);
    const scriptSrc = diff.directives.find((d) => d.name === "script-src");
    expect(scriptSrc).toBeDefined();
    expect(scriptSrc!.status).toBe("added");
    expect(scriptSrc!.items).toEqual([{ value: "'self'", status: "added" }]);
  });

  it("marks a removed directive as removed", () => {
    const csp1 = parseCsp("default-src 'self'; img-src *");
    const csp2 = parseCsp("default-src 'self'");
    const diff = compareCsp(csp1, csp2);
    const imgSrc = diff.directives.find((d) => d.name === "img-src");
    expect(imgSrc).toBeDefined();
    expect(imgSrc!.status).toBe("removed");
    expect(imgSrc!.items).toEqual([{ value: "*", status: "removed" }]);
  });

  it("marks added values within an existing directive", () => {
    const csp1 = parseCsp("img-src 'self'");
    const csp2 = parseCsp("img-src 'self' https://cdn.example.com");
    const diff = compareCsp(csp1, csp2);
    const directive = diff.directives[0];
    expect(directive.status).toBe("unchanged");
    expect(directive.items).toEqual([
      { value: "'self'", status: "unchanged" },
      { value: "https://cdn.example.com", status: "added" },
    ]);
  });

  it("marks removed values within an existing directive", () => {
    const csp1 = parseCsp("img-src 'self' https://cdn.example.com");
    const csp2 = parseCsp("img-src 'self'");
    const diff = compareCsp(csp1, csp2);
    const directive = diff.directives[0];
    expect(directive.status).toBe("unchanged");
    expect(directive.items).toEqual([
      { value: "'self'", status: "unchanged" },
      { value: "https://cdn.example.com", status: "removed" },
    ]);
  });

  it("preserves directive order: csp1 first, then new csp2 directives", () => {
    const csp1 = parseCsp("default-src 'self'; img-src *");
    const csp2 = parseCsp("img-src *; default-src 'self'; script-src 'self'");
    const diff = compareCsp(csp1, csp2);
    const names = diff.directives.map((d) => d.name);
    // default-src and img-src from csp1, then script-src (new in csp2)
    expect(names).toEqual(["default-src", "img-src", "script-src"]);
  });

  it("preserves value order: csp1 values first, then added csp2 values", () => {
    const csp1 = parseCsp("script-src 'self' https://a.com");
    const csp2 = parseCsp("script-src https://b.com 'self' https://c.com");
    const diff = compareCsp(csp1, csp2);
    const directive = diff.directives[0];
    // 'self' is unchanged (in csp1 first), https://a.com is removed,
    // https://b.com and https://c.com are added (in csp2 order)
    expect(directive.items).toEqual([
      { value: "'self'", status: "unchanged" },
      { value: "https://a.com", status: "removed" },
      { value: "https://b.com", status: "added" },
      { value: "https://c.com", status: "added" },
    ]);
  });

  it("handles directives with no values", () => {
    const csp1 = parseCsp("upgrade-insecure-requests");
    const csp2 = parseCsp("upgrade-insecure-requests");
    const diff = compareCsp(csp1, csp2);
    expect(diff.directives[0]).toMatchObject({
      name: "upgrade-insecure-requests",
      status: "unchanged",
      items: [],
    });
  });

  it("handles a full realistic comparison", () => {
    const csp1 = parseCsp(
      "default-src 'self'; script-src 'self' 'unsafe-inline'; img-src 'self'",
    );
    const csp2 = parseCsp("default-src 'self'; script-src 'self'; img-src *; style-src 'self'");
    const diff = compareCsp(csp1, csp2);

    expect(diff.directives).toHaveLength(4);

    // default-src: unchanged
    expect(diff.directives[0]).toMatchObject({ name: "default-src", status: "unchanged" });

    // script-src: 'unsafe-inline' removed
    expect(diff.directives[1]).toMatchObject({ name: "script-src", status: "unchanged" });
    expect(diff.directives[1].items).toContainEqual({ value: "'unsafe-inline'", status: "removed" });

    // img-src: 'self' removed, * added
    expect(diff.directives[2]).toMatchObject({ name: "img-src", status: "unchanged" });
    expect(diff.directives[2].items).toContainEqual({ value: "'self'", status: "removed" });
    expect(diff.directives[2].items).toContainEqual({ value: "*", status: "added" });

    // style-src: added directive
    expect(diff.directives[3]).toMatchObject({ name: "style-src", status: "added" });
  });
});
