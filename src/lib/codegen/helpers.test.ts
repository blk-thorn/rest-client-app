import { describe, it, expect } from "vitest";
import {
  methodSupportsBody,
  normalizeHeaders,
  tryParseJson,
  escShellSingle,
  escBackticks,
  headersToObject,
  type GenHeader,
} from "./helpers";

describe("helpers", () => {
  describe("methodSupportsBody", () => {
    it("returns true for HTTP methods that support request body", () => {
      expect(methodSupportsBody("POST")).toBe(true);
      expect(methodSupportsBody("PUT")).toBe(true);
      expect(methodSupportsBody("PATCH")).toBe(true);
      expect(methodSupportsBody("DELETE")).toBe(true);
    });

    it("returns false for methods that do not support request body", () => {
      expect(methodSupportsBody("GET")).toBe(false);
    });
  });

  describe("normalizeHeaders", () => {
    it("trims keys and values, removes trailing colon from keys, and filters out empty keys", () => {
      const input: GenHeader[] = [
        { key: "  Content-Type:  ", value: "  application/json  " },
        { key: "X-Auth:", value: " t " },
        { key: "   ", value: "x" },
        { key: "", value: "y" },
      ];
      const out = normalizeHeaders(input);
      expect(out).toEqual([
        { key: "Content-Type", value: "application/json" },
        { key: "X-Auth", value: "t" },
      ]);
    });

    it("leaves clean, valid headers unchanged", () => {
      const input: GenHeader[] = [{ key: "Accept", value: "text/plain" }];
      expect(normalizeHeaders(input)).toEqual([{ key: "Accept", value: "text/plain" }]);
    });
  });

  describe("tryParseJson", () => {
    it("returns null for empty/whitespace strings and non-object/array JSON", () => {
      expect(tryParseJson("")).toBeNull();
      expect(tryParseJson("   ")).toBeNull();
      expect(tryParseJson("hello")).toBeNull();
      expect(tryParseJson("123")).toBeNull();
      expect(tryParseJson("true")).toBeNull();
    });

    it("successfully parses valid JSON objects and arrays", () => {
      const obj = tryParseJson(`{"a":1,"b":"x"}`) as { a: number; b: string };
      expect(obj).toEqual({ a: 1, b: "x" });

      const arr = tryParseJson(`[1, 2, 3]`) as number[];
      expect(arr).toEqual([1, 2, 3]);
    });

    it("returns null on invalid JSON", () => {
      expect(tryParseJson(`{invalid`)).toBeNull();
      expect(tryParseJson(`[1, 2,`)).toBeNull();
    });
  });

  describe("escShellSingle", () => {
    it("properly escapes single quotes for POSIX shell (bash, zsh, sh)", () => {
      expect(escShellSingle("simple")).toBe("simple");
      expect(escShellSingle("it's fine")).toBe("it'\"'\"'s fine");
      expect(escShellSingle("'start' and 'end'")).toBe("'\"'\"'start'\"'\"' and '\"'\"'end'\"'\"'");
    });
  });

  describe("escBackticks", () => {
    it("escapes backticks to prevent template literal injection", () => {
      expect(escBackticks("no ticks")).toBe("no ticks");
      expect(escBackticks("`code` block")).toBe("\\`code\\` block");
      expect(escBackticks("a`b`c`")).toBe("a\\`b\\`c\\`");
    });
  });

  describe("headersToObject", () => {
    it("converts array of header key-value pairs to an object", () => {
      const hs: GenHeader[] = [
        { key: "A", value: "1" },
        { key: "B", value: "2" },
      ];
      expect(headersToObject(hs)).toEqual({ A: "1", B: "2" });
    });

    it("last duplicate header wins", () => {
      const hs: GenHeader[] = [
        { key: "X", value: "1" },
        { key: "X", value: "2" },
        { key: "X", value: "3" },
      ];
      expect(headersToObject(hs)).toEqual({ X: "3" });
    });
  });
});
