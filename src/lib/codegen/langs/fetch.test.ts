import { describe, it, expect } from "vitest";
import { genFetch } from "./fetch";

describe("genFetch", () => {
  it("GET: trims URL, normalizes headers, omits body entirely", () => {
    const out = genFetch(
      "GET",
      "   https://api.test/path   ",
      [
        { key: "  Content-Type: ", value: " application/json " },
        { key: "X-Auth", value: " t " },
        { key: "   ", value: "ignored" },
      ],
      `{"will":"be ignored for GET"}`
    );

    expect(out).toContain('await fetch("https://api.test/path", {');
    expect(out).toContain('method: "GET",');

    expect(out).toContain(
      `headers: {
  "Content-Type": "application/json",
  "X-Auth": "t"
}`
    );

    expect(out).not.toContain("body:");
  });

  it("POST with valid JSON body: uses JSON.stringify with pretty formatting", () => {
    const out = genFetch("POST", "https://api.test", [], `{"a":1,"b":"x"}`);

    expect(out).toContain('method: "POST",');
    expect(out).toContain(
      `body: JSON.stringify({
  "a": 1,
  "b": "x"
})`
    );
  });

  it("POST with raw/non-JSON body: uses template literal and escapes backticks", () => {
    const body = "x`y`z";
    const out = genFetch("POST", "https://api.test", [], body);

    expect(out).toContain("body: `x\\`y\\`z`");
  });
});
