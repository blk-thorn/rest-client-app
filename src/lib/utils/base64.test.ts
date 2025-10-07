import { describe, it, expect } from "vitest";
import { encodeBase64Url, decodeBase64Url } from "./base64";

describe("encodeBase64Url / decodeBase64Url", () => {
  it("correctly encodes and decodes a simple ASCII string", () => {
    const input = "hello";
    const encoded = encodeBase64Url(input);
    expect(encoded).toBe("aGVsbG8");
    const decoded = decodeBase64Url(encoded);
    expect(decoded).toBe(input);
  });

  it("handles strings with spaces and special characters", () => {
    const input = "a b+c/d?=!";
    const encoded = encodeBase64Url(input);
    const decoded = decodeBase64Url(encoded);
    expect(decoded).toBe(input);
  });

  it("returns empty string when encoding/decoding empty input", () => {
    expect(encodeBase64Url("")).toBe("");
    expect(decodeBase64Url("")).toBe("");
  });

  it("decode returns empty string on invalid input", () => {
    expect(decodeBase64Url("***not-base64***")).toBe("");
  });

  it("preserves round-trip integrity for Unicode strings (emoji, Cyrillic, etc.)", () => {
    const input = "Привет 👋";
    const encoded = encodeBase64Url(input);
    const decoded = decodeBase64Url(encoded);
    expect(decoded).toBe(input);
  });
});
