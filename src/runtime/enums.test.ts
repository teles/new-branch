import { describe, it, expect } from "vitest";
import { TYPE_CHOICES } from "./enums.js";

describe("runtime/enums", () => {
  it("exports TYPE_CHOICES with expected shape", () => {
    expect(Array.isArray(TYPE_CHOICES)).toBe(true);

    for (const c of TYPE_CHOICES) {
      expect(c).toHaveProperty("name");
      expect(c).toHaveProperty("value");
      expect(typeof c.name).toBe("string");
      expect(typeof c.value).toBe("string");
      expect(c.name.length).toBeGreaterThan(0);
      expect(c.value.length).toBeGreaterThan(0);
    }
  });
});
