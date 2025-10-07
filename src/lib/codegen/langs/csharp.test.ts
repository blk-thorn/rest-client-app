import { describe, it, expect, vi, beforeEach, Mock } from "vitest";

vi.mock("../helpers", () => {
  return {
    methodSupportsBody: vi.fn<(m: string) => boolean>(),
    normalizeHeaders: vi.fn(<T>(hs: T) => hs),
    tryParseJson: vi.fn<(s: string) => unknown>(),
    headersToObject: vi.fn<(hs: Array<{ key: string; value: string }>) => Record<string, string>>(
      (hs) =>
        hs.reduce<Record<string, string>>((acc, h) => {
          if (h.key) acc[h.key] = h.value;
          return acc;
        }, {})
    ),
  };
});

import { genCSharp } from "./csharp";
import { methodSupportsBody, normalizeHeaders, tryParseJson, headersToObject } from "../helpers";

type GenMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD";
type GenHeader = { key: string; value: string };

beforeEach(() => {
  vi.clearAllMocks();
});

describe("genCSharp", () => {
  it("GET without body: filters out Content-Type, creates no content, uses GetAsync", () => {
    (methodSupportsBody as unknown as Mock).mockReturnValue(false);
    (tryParseJson as unknown as Mock).mockReturnValue(null);

    const method: GenMethod = "GET";
    const url = "https://api.test/items";
    const headers: GenHeader[] = [
      { key: "X-Auth", value: "t" },
      { key: "Content-Type", value: "text/plain" },
    ];
    const body = "";

    const code = genCSharp(method, url, headers, body);

    expect(code).toContain('var url = "https://api.test/items";');

    expect(code).toContain('client.DefaultRequestHeaders.Add("X-Auth", "t");');
    expect(code).not.toContain('client.DefaultRequestHeaders.Add("Content-Type"');

    expect(code).toContain("HttpContent? content = null;");

    expect(code).toContain("await client.GetAsync(url)");

    expect(code).toContain("using System.Net.Http;");
    expect(code).toContain('Console.WriteLine("Status: " + (int)response.StatusCode);');
  });

  it("POST with JSON body and no Content-Type: creates StringContent with application/json and uses PostAsync", () => {
    (methodSupportsBody as unknown as Mock).mockReturnValue(true);
    (tryParseJson as unknown as Mock).mockReturnValue({ ok: true });

    const method: GenMethod = "POST";
    const url = "https://api.test/create";
    const headers: GenHeader[] = [{ key: "X-Req", value: "1" }];
    const body = `{"ok":true}`;

    const code = genCSharp(method, url, headers, body);

    expect(code).toContain("var json = ");
    expect(code).toContain(
      'var content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");'
    );

    expect(code).toContain('client.DefaultRequestHeaders.Add("X-Req", "1");');
    expect(code).not.toContain('client.DefaultRequestHeaders.Add("Content-Type"');

    expect(code).toContain("await client.PostAsync(url, content!)");
  });

  it("POST with text body and explicit Content-Type: uses provided media type in StringContent, avoids duplicating header", () => {
    (methodSupportsBody as unknown as Mock).mockReturnValue(true);
    (tryParseJson as unknown as Mock).mockReturnValue(null);

    const method: GenMethod = "POST";
    const url = "https://api.test/send";
    const headers: GenHeader[] = [{ key: "Content-Type", value: "text/plain; charset=utf-8" }];
    const body = "hello";

    const code = genCSharp(method, url, headers, body);

    expect(code).toContain(
      'var content = new StringContent("hello", System.Text.Encoding.UTF8, "text/plain; charset=utf-8");'
    );

    expect(code).not.toContain('client.DefaultRequestHeaders.Add("Content-Type"');

    expect(code).toContain("await client.PostAsync(url, content!)");
  });

  it("DELETE without body uses DeleteAsync; with body uses SendAsync(HttpMethod.Delete)", () => {
    (methodSupportsBody as unknown as Mock).mockReturnValue(true);
    (tryParseJson as unknown as Mock).mockReturnValue(null);

    const method: GenMethod = "DELETE";
    let code = genCSharp(method, "https://api.test/x", [], "");
    expect(code).toContain("HttpContent? content = null;");
    expect(code).toContain("await client.DeleteAsync(url)");

    code = genCSharp(method, "https://api.test/x", [], "payload");
    expect(code).toContain(
      "await client.SendAsync(new HttpRequestMessage(HttpMethod.Delete, url) { Content = content })"
    );
  });

  it("PATCH with body uses SendAsync with HttpMethod.Patch", () => {
    (methodSupportsBody as unknown as Mock).mockReturnValue(true);
    (tryParseJson as unknown as Mock).mockReturnValue(null);

    const method: GenMethod = "PATCH";
    const code = genCSharp(method, "https://api.test/p", [], "x");

    expect(code).toContain(
      "await client.SendAsync(new HttpRequestMessage(HttpMethod.Patch, url) { Content = content })"
    );
  });

  it("passes original headers to normalizeHeaders and headersToObject", () => {
    (methodSupportsBody as unknown as Mock).mockReturnValue(false);
    (tryParseJson as unknown as Mock).mockReturnValue(null);

    const headers: GenHeader[] = [
      { key: "A", value: "1" },
      { key: "B", value: "2" },
    ];

    genCSharp("GET", "https://api", headers, "");

    expect(normalizeHeaders).toHaveBeenCalledWith(headers);
    const passedToNormalize = (normalizeHeaders as unknown as Mock).mock.calls[0][0];
    const passedToHeadersObj = (headersToObject as unknown as Mock).mock.calls[0][0];
    expect(passedToHeadersObj).toBe(passedToNormalize);
  });
});
