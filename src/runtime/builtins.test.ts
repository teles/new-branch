import { describe, it, expect } from "vitest";
import { getBuiltinValues } from "./builtins.js";

describe("getBuiltinValues", () => {
  it("returns correct padded date values", () => {
    const fake = new Date("2026-02-09T10:00:00Z");

    const result = getBuiltinValues(fake);

    expect(result.year).toBe("2026");
    expect(result.month).toBe("02");
    expect(result.day).toBe("09");
    expect(result.date).toBe("2026-02-09");
    expect(result.dateCompact).toBe("20260209");
  });
});
