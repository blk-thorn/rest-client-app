import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("merges simple class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("filters out falsy values", () => {
    expect(cn("foo", null, undefined, false, "bar")).toBe("foo bar");
  });

  it("handles conditional classes via object syntax", () => {
    expect(cn("foo", { active: true, hidden: false })).toBe("foo active");
  });

  it("resolves Tailwind conflicts by keeping the last class", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
    expect(cn("text-sm", "text-lg")).toBe("text-lg");
  });

  it("supports mixed input types: strings, arrays, and objects", () => {
    const result = cn("foo", ["bar", { baz: true }], { qux: false }, "zap");
    expect(result).toContain("foo");
    expect(result).toContain("bar");
    expect(result).toContain("baz");
    expect(result).toContain("zap");
  });
});
