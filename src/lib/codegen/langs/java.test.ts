import { describe, it, expect } from "vitest";
import { genJava } from "./java";

describe("genJava", () => {
  it("generates GET request without body using .get()", () => {
    const out = genJava("GET", "https://api.example.dev/data", [], "");
    expect(out).toContain('.url("https://api.example.dev/data")');
    expect(out).toContain(".get()");
    expect(out).toContain("OkHttpClient client = new OkHttpClient();");
  });

  it("generates POST with JSON body: uses .post() and RequestBody with escaped JSON", () => {
    const body = '{"a":1}';
    const out = genJava("POST", "https://api.example.dev/add", [], body);
    expect(out).toContain('.url("https://api.example.dev/add")');
    expect(out).toContain(".post(body)");
    expect(out).toContain('RequestBody body = RequestBody.create("{\\"a\\":1}", mediaType);');
  });

  it("generates PUT with raw body: uses .put() and properly escaped string", () => {
    const body = "plain text";
    const out = genJava("PUT", "https://api.example.dev/update", [], body);
    expect(out).toContain(".put(body)");
    expect(out).toContain('RequestBody body = RequestBody.create("plain text", mediaType);');
  });

  it("uses .patch() for PATCH requests with body", () => {
    const out = genJava("PATCH", "https://api.example.dev/patch", [], '{"k":2}');
    expect(out).toContain(".patch(body)");
  });

  it("generates DELETE without body using .delete()", () => {
    const out = genJava("DELETE", "https://api.example.dev/remove", [], "");
    expect(out).toContain(".delete()");
  });

  it("generates DELETE with body: uses .delete(body), respects explicit Content-Type, escapes quotes", () => {
    const out = genJava(
      "DELETE",
      "https://api.example.dev/remove",
      [
        { key: "Content-Type", value: "text/plain; charset=utf-8" },
        { key: "X-Token", value: "t" },
      ],
      'raw "quoted" text'
    );

    expect(out).toContain('MediaType mediaType = MediaType.parse("text/plain; charset=utf-8");');
    expect(out).toContain(
      'RequestBody body = RequestBody.create("raw \\"quoted\\" text", mediaType);'
    );
    expect(out).toContain(".delete(body)");
    expect(out).toContain('.addHeader("X-Token", "t")');
  });
});
