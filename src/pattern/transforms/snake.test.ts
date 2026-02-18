import { describe, it, expect } from "vitest";
import { snake } from "./snake.js";

describe("snake transform", () => {
  it("converts spaced text to snake_case", () => {
    expect(snake.fn("My Task", [])).toBe("my_task");
  });

  it("handles camelCase and punctuation", () => {
    expect(snake.fn("myTaskHTTP Server", [])).toBe("my_task_http_server");
  });

  it("returns empty string for empty input", () => {
    expect(snake.fn("", [])).toBe("");
  });
});
