import { describe, it, expect } from "vitest";
import { buildRegistry } from "./registry.js";
import type { TransformDef } from "./types.js";

describe("pattern/transforms/registry", () => {
  it("builds a registry mapping name -> fn", () => {
    const a: TransformDef = { name: "a", fn: (v) => `${v}-a` };
    const b: TransformDef = { name: "b", fn: (v, [x]) => `${v}-b-${x ?? ""}` };

    const registry = buildRegistry([a, b]);

    expect(Object.keys(registry).sort()).toEqual(["a", "b"]);
    expect(registry.a("x", [])).toBe("x-a");
    expect(registry.b("x", ["1"])).toBe("x-b-1");
  });

  it("throws on duplicate transform names", () => {
    const a1: TransformDef = { name: "dup", fn: (v) => v };
    const a2: TransformDef = { name: "dup", fn: (v) => `${v}!` };

    expect(() => buildRegistry([a1, a2])).toThrow(/Duplicate transform name: "dup"/);
  });
});
