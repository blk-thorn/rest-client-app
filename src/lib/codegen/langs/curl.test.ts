import { describe, it, expect } from "vitest";
import { genCurl } from "./curl";

describe("genCurl", () => {
  it("generates a clean GET request without body", () => {
    const out = genCurl("GET", "https://api.test", [{ key: "Auth", value: "token" }], "");
    expect(out).toContain('curl -X GET "https://api.test"');
    expect(out).toContain('-H "Auth: token"');
    expect(out).not.toContain("--data-raw");
  });

  it("generates a POST request with JSON body and proper headers", () => {
    const body = '{"a":1}';
    const out = genCurl("POST", "https://api.test", [], body);
    expect(out).toContain('curl -X POST "https://api.test"');
    expect(out).toContain("--data-raw");
    expect(out).toContain('"a":1');
  });

  it("escapes single quotes in raw body to prevent bash injection", () => {
    const body = "{'x':1}";
    const out = genCurl("POST", "https://api.test", [], body);
    expect(out).toMatch(/--data-raw '.*'".*".*'/);
  });
});
