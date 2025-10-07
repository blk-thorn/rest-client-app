import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateCodeSnippets } from "./generate-code";

vi.mock("@/lib/codegen/langs/curl", () => ({ genCurl: vi.fn(() => "curl-snippet") }));
vi.mock("@/lib/codegen/langs/fetch", () => ({ genFetch: vi.fn(() => "fetch-snippet") }));
vi.mock("@/lib/codegen/langs/xhr", () => ({ genXhr: vi.fn(() => "xhr-snippet") }));
vi.mock("@/lib/codegen/langs/node", () => ({ genNode: vi.fn(() => "node-snippet") }));
vi.mock("@/lib/codegen/langs/python", () => ({ genPython: vi.fn(() => "python-snippet") }));
vi.mock("@/lib/codegen/langs/java", () => ({ genJava: vi.fn(() => "java-snippet") }));
vi.mock("@/lib/codegen/langs/csharp", () => ({ genCSharp: vi.fn(() => "csharp-snippet") }));
vi.mock("@/lib/codegen/langs/go", () => ({ genGo: vi.fn(() => "go-snippet") }));

import { genCurl } from "@/lib/codegen/langs/curl";
import { genFetch } from "@/lib/codegen/langs/fetch";
import { genXhr } from "@/lib/codegen/langs/xhr";
import { genNode } from "@/lib/codegen/langs/node";
import { genPython } from "@/lib/codegen/langs/python";
import { genJava } from "@/lib/codegen/langs/java";
import { genCSharp } from "@/lib/codegen/langs/csharp";
import { genGo } from "@/lib/codegen/langs/go";

describe("generateCodeSnippets", () => {
  const method = "GET";
  const url = "https://api.test";
  const headers = [{ key: "Auth", value: "token" }];
  const body = `{"a":1}`;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns an error if URL is empty or whitespace", () => {
    const res = generateCodeSnippets(method, "   ", headers, body);
    expect(res).toEqual({ error: "Not enough details to generate code" });
  });

  it("calls all language generators and returns their snippets", () => {
    const res = generateCodeSnippets(method, url, headers, body);

    expect(genCurl).toHaveBeenCalledWith(method, url, headers, body);
    expect(genFetch).toHaveBeenCalledWith(method, url, headers, body);
    expect(genXhr).toHaveBeenCalledWith(method, url, headers, body);
    expect(genNode).toHaveBeenCalledWith(method, url, headers, body);
    expect(genPython).toHaveBeenCalledWith(method, url, headers, body);
    expect(genJava).toHaveBeenCalledWith(method, url, headers, body);
    expect(genCSharp).toHaveBeenCalledWith(method, url, headers, body);
    expect(genGo).toHaveBeenCalledWith(method, url, headers, body);

    expect(res).toEqual({
      cURL: "curl-snippet",
      "JavaScript (Fetch)": "fetch-snippet",
      "JavaScript (XHR)": "xhr-snippet",
      "Node.js": "node-snippet",
      Python: "python-snippet",
      Java: "java-snippet",
      "C#": "csharp-snippet",
      Go: "go-snippet",
    });
  });
});
