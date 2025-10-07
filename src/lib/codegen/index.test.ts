import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateCodeSnippets } from "./index";

vi.mock("./langs/curl", () => ({ genCurl: vi.fn(() => "curl-out") }));
vi.mock("./langs/fetch", () => ({ genFetch: vi.fn(() => "fetch-out") }));
vi.mock("./langs/xhr", () => ({ genXhr: vi.fn(() => "xhr-out") }));
vi.mock("./langs/node", () => ({ genNode: vi.fn(() => "node-out") }));
vi.mock("./langs/python", () => ({ genPython: vi.fn(() => "python-out") }));
vi.mock("./langs/java", () => ({ genJava: vi.fn(() => "java-out") }));
vi.mock("./langs/csharp", () => ({ genCSharp: vi.fn(() => "csharp-out") }));
vi.mock("./langs/go", () => ({ genGo: vi.fn(() => "go-out") }));

import { genCurl } from "./langs/curl";
import { genFetch } from "./langs/fetch";
import { genXhr } from "./langs/xhr";
import { genNode } from "./langs/node";
import { genPython } from "./langs/python";
import { genJava } from "./langs/java";
import { genCSharp } from "./langs/csharp";
import { genGo } from "./langs/go";

type GenMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
type GenHeader = { key: string; value: string };

describe("codegen/index.generateCodeSnippets", () => {
  const input = {
    method: "POST" as GenMethod,
    url: "https://api.test/endpoint",
    headers: [{ key: "Auth", value: "t" }] as GenHeader[],
    body: `{"ok":true}`,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls all language generators with the same arguments and returns their outputs", () => {
    const out = generateCodeSnippets(input);

    expect(genCurl).toHaveBeenCalledWith(input.method, input.url, input.headers, input.body);
    expect(genFetch).toHaveBeenCalledWith(input.method, input.url, input.headers, input.body);
    expect(genXhr).toHaveBeenCalledWith(input.method, input.url, input.headers, input.body);
    expect(genNode).toHaveBeenCalledWith(input.method, input.url, input.headers, input.body);
    expect(genPython).toHaveBeenCalledWith(input.method, input.url, input.headers, input.body);
    expect(genJava).toHaveBeenCalledWith(input.method, input.url, input.headers, input.body);
    expect(genCSharp).toHaveBeenCalledWith(input.method, input.url, input.headers, input.body);
    expect(genGo).toHaveBeenCalledWith(input.method, input.url, input.headers, input.body);

    expect(out).toEqual({
      curl: "curl-out",
      fetch: "fetch-out",
      xhr: "xhr-out",
      node: "node-out",
      python: "python-out",
      java: "java-out",
      csharp: "csharp-out",
      go: "go-out",
    });
  });

  it("handles empty or missing values and still generates all snippets", () => {
    const empty = generateCodeSnippets({
      method: "GET",
      url: "",
      headers: [],
      body: "",
    });

    expect(empty).toHaveProperty("curl");
    expect(empty).toHaveProperty("fetch");
    expect(empty).toHaveProperty("xhr");
    expect(empty).toHaveProperty("node");
    expect(empty).toHaveProperty("python");
    expect(empty).toHaveProperty("java");
    expect(empty).toHaveProperty("csharp");
    expect(empty).toHaveProperty("go");
  });
});
