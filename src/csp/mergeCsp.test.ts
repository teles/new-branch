import { describe, it, expect } from "vitest";
import { buildMergedPolicy, exportMergedPolicy } from "./mergeCsp.js";
import { compareCsp } from "./compareCsp.js";
import { parseCsp } from "./parseCsp.js";
import type { CspDiff } from "./types.js";

const emptyDiff: CspDiff = { directives: [] };

describe("buildMergedPolicy", () => {
  it("returns no directives for an empty diff", () => {
    expect(buildMergedPolicy(emptyDiff)).toEqual({ directives: [] });
  });

  it("marks unchanged items as not disabled", () => {
    const diff = compareCsp(parseCsp("default-src 'self'"), parseCsp("default-src 'self'"));
    const merged = buildMergedPolicy(diff);
    expect(merged.directives[0].disabled).toBe(false);
    expect(merged.directives[0].items[0].disabled).toBe(false);
  });

  it("marks added items as not disabled", () => {
    const diff = compareCsp(parseCsp("default-src 'self'"), parseCsp("default-src 'self' *"));
    const merged = buildMergedPolicy(diff);
    const added = merged.directives[0].items.find((i) => i.status === "added");
    expect(added).toBeDefined();
    expect(added!.disabled).toBe(false);
  });

  it("marks removed items as disabled by default", () => {
    const diff = compareCsp(parseCsp("default-src 'self' *"), parseCsp("default-src 'self'"));
    const merged = buildMergedPolicy(diff);
    const removed = merged.directives[0].items.find((i) => i.status === "removed");
    expect(removed).toBeDefined();
    expect(removed!.disabled).toBe(true);
  });

  it("marks removed directives as disabled by default", () => {
    const diff = compareCsp(parseCsp("default-src 'self'; img-src *"), parseCsp("default-src 'self'"));
    const merged = buildMergedPolicy(diff);
    const imgSrc = merged.directives.find((d) => d.name === "img-src");
    expect(imgSrc).toBeDefined();
    expect(imgSrc!.disabled).toBe(true);
  });

  it("marks added directives as not disabled", () => {
    const diff = compareCsp(parseCsp("default-src 'self'"), parseCsp("default-src 'self'; script-src 'self'"));
    const merged = buildMergedPolicy(diff);
    const scriptSrc = merged.directives.find((d) => d.name === "script-src");
    expect(scriptSrc).toBeDefined();
    expect(scriptSrc!.disabled).toBe(false);
  });

  it("preserves diff status on directives", () => {
    const diff = compareCsp(
      parseCsp("default-src 'self'; img-src *"),
      parseCsp("default-src 'self'; script-src 'self'"),
    );
    const merged = buildMergedPolicy(diff);
    expect(merged.directives[0].status).toBe("unchanged");
    expect(merged.directives[1].status).toBe("removed");
    expect(merged.directives[2].status).toBe("added");
  });

  it("preserves diff status on items", () => {
    const diff = compareCsp(parseCsp("img-src 'self' https://old.com"), parseCsp("img-src 'self' https://new.com"));
    const merged = buildMergedPolicy(diff);
    const items = merged.directives[0].items;
    expect(items.find((i) => i.value === "'self'")!.status).toBe("unchanged");
    expect(items.find((i) => i.value === "https://old.com")!.status).toBe("removed");
    expect(items.find((i) => i.value === "https://new.com")!.status).toBe("added");
  });
});

describe("exportMergedPolicy", () => {
  it("returns empty string when no directives", () => {
    expect(exportMergedPolicy({ directives: [] })).toBe("");
  });

  it("exports a simple unchanged directive", () => {
    const diff = compareCsp(parseCsp("default-src 'self'"), parseCsp("default-src 'self'"));
    const merged = buildMergedPolicy(diff);
    expect(exportMergedPolicy(merged)).toBe("default-src 'self'");
  });

  it("omits disabled directives", () => {
    const diff = compareCsp(parseCsp("default-src 'self'; img-src *"), parseCsp("default-src 'self'"));
    const merged = buildMergedPolicy(diff);
    // img-src is disabled by default (removed)
    expect(exportMergedPolicy(merged)).toBe("default-src 'self'");
  });

  it("omits disabled values within a directive", () => {
    const diff = compareCsp(parseCsp("img-src 'self' https://old.com"), parseCsp("img-src 'self'"));
    const merged = buildMergedPolicy(diff);
    // https://old.com is disabled (removed)
    expect(exportMergedPolicy(merged)).toBe("img-src 'self'");
  });

  it("includes added values (not disabled)", () => {
    const diff = compareCsp(parseCsp("img-src 'self'"), parseCsp("img-src 'self' https://new.com"));
    const merged = buildMergedPolicy(diff);
    expect(exportMergedPolicy(merged)).toBe("img-src 'self' https://new.com");
  });

  it("re-enables a previously disabled directive", () => {
    const diff = compareCsp(parseCsp("default-src 'self'; img-src *"), parseCsp("default-src 'self'"));
    const merged = buildMergedPolicy(diff);
    const imgSrc = merged.directives.find((d) => d.name === "img-src")!;
    imgSrc.disabled = false;
    imgSrc.items.forEach((i) => (i.disabled = false));
    expect(exportMergedPolicy(merged)).toBe("default-src 'self'; img-src *");
  });

  it("re-enables a previously disabled value", () => {
    const diff = compareCsp(parseCsp("img-src 'self' https://old.com"), parseCsp("img-src 'self'"));
    const merged = buildMergedPolicy(diff);
    const old = merged.directives[0].items.find((i) => i.value === "https://old.com")!;
    old.disabled = false;
    expect(exportMergedPolicy(merged)).toBe("img-src 'self' https://old.com");
  });

  it("handles directives with no values (e.g. upgrade-insecure-requests)", () => {
    const diff = compareCsp(
      parseCsp("upgrade-insecure-requests"),
      parseCsp("upgrade-insecure-requests"),
    );
    const merged = buildMergedPolicy(diff);
    expect(exportMergedPolicy(merged)).toBe("upgrade-insecure-requests");
  });

  it("exports multiple directives joined by '; '", () => {
    const diff = compareCsp(
      parseCsp("default-src 'self'; script-src 'self'"),
      parseCsp("default-src 'self'; script-src 'self'"),
    );
    const merged = buildMergedPolicy(diff);
    expect(exportMergedPolicy(merged)).toBe("default-src 'self'; script-src 'self'");
  });
});
