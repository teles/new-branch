import { describe, it, expect } from "vitest";
import { stripAccents } from "./stripAccents.js";

describe("stripAccents transform", () => {
  it("removes diacritics from characters", () => {
    expect(stripAccents.fn("José", [])).toBe("Jose");
  });

  it("handles multiple accented characters", () => {
    expect(stripAccents.fn("café résumé naïve", [])).toBe("cafe resume naive");
  });

  it("leaves non-accented characters unchanged", () => {
    expect(stripAccents.fn("hello world", [])).toBe("hello world");
  });

  it("handles empty string", () => {
    expect(stripAccents.fn("", [])).toBe("");
  });

  it("handles complex diacritics", () => {
    expect(stripAccents.fn("àáâãäåèéêëìíîïòóôõöùúûüñç", [])).toBe("aaaaaaeeeeiiiiooooouuuunc");
  });
});
