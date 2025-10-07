import { describe, it, expect } from "vitest";
import { genNode } from "./node";

describe("genNode", () => {
  it("GET: trims URL, normalizes headers, sets data = null, uses native http/https", () => {
    const out = genNode(
      "GET",
      "   https://api.example.dev/items   ",
      [
        { key: "  Content-Type: ", value: " application/json " },
        { key: "X-Auth", value: " t " },
        { key: "   ", value: "ignored" },
      ],
      ""
    );

    expect(out).toContain('const url = new URL("https://api.example.dev/items");');
    expect(out).toContain('const options = { method: "GET", headers: {');
    expect(out).toContain('"Content-Type": "application/json"');
    expect(out).toContain('"X-Auth": "t"');
    expect(out).toContain("const data = null;");
    expect(out).not.toContain("JSON.stringify(");
    expect(out).not.toContain("`");
  });

  it("POST with valid JSON body: pretty-prints JSON via JSON.stringify and assigns to data", () => {
    const out = genNode("POST", "https://api.example.dev/create", [], `{"a":1,"b":"x"}`);

    expect(out).toContain('const options = { method: "POST", headers: {');
    expect(out).toContain(
      `const data = JSON.stringify({
  "a": 1,
  "b": "x"
});`
    );
    expect(out).toContain("if (data) req.write(data);");
  });

  it("POST with raw/non-JSON body: uses template literal with properly escaped backticks", () => {
    const body = "x`y`z";
    const out = genNode("POST", "https://api.example.dev/send", [], body);

    expect(out).toContain('const options = { method: "POST", headers: {');
    expect(out).toContain("const data = `x\\`y\\`z`;");
  });
});
