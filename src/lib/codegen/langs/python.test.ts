import { describe, it, expect } from "vitest";
import { genPython } from "./python";

describe("genPython", () => {
  it("GET without body: only headers and calls requests.get", () => {
    const out = genPython(
      "GET",
      " https://api.example.dev/list ",
      [{ key: "X-Auth", value: "t" }],
      ""
    );

    expect(out).toContain('url = "https://api.example.dev/list"');
    expect(out).toContain("headers = {\n  'X-Auth': 't'\n}");
    expect(out).toContain("response = requests.get(url, headers=headers)");
    expect(out).not.toContain("payload =");
  });

  it("POST with valid JSON body: generates Python dict as payload and uses json=payload", () => {
    const body = '{"a":1,"b":"x"}';
    const out = genPython("POST", "https://api.example.dev/add", [], body);

    expect(out).toContain('payload = {\n  "a": 1,');
    expect(out).toContain("response = requests.post(url, json=payload, headers=headers)");
  });

  it("PUT with raw/non-JSON body: assigns string to payload and uses data=payload", () => {
    const out = genPython("PUT", "https://api.example.dev/upd", [], "raw text");

    expect(out).toContain('payload = "raw text"');
    expect(out).toContain("response = requests.put(url, json=payload, headers=headers)");
  });
});
