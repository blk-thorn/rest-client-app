import React, { JSX, PropsWithChildren } from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render } from "@testing-library/react";
import { useRequestQuerySync } from "./useRequestQuerySync";

const DEBOUNCE_MS = 300;

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
interface Header {
  id: string;
  key: string;
  value: string;
}
interface UseRequest {
  method: HttpMethod;
  url: string;
  body: string;
  headers: Header[];
  setMethod: (v: HttpMethod) => void;
  setUrl: (v: string) => void;
  setBody: (v: string) => void;
  removeBody: () => void;
  setHeaders: (v: Header[]) => void;
}

const store = {
  method: "GET" as HttpMethod,
  url: "",
  body: "",
  headers: [] as Header[],
  setMethod: vi.fn<(v: HttpMethod) => void>(),
  setUrl: vi.fn<(v: string) => void>(),
  setBody: vi.fn<(v: string) => void>(),
  removeBody: vi.fn<() => void>(),
  setHeaders: vi.fn<(v: Header[]) => void>(),
};

vi.mock("@/lib/stores/request", () => ({
  useRequest: (): UseRequest => store,
}));

vi.mock("@/lib/utils/base64", () => ({
  encodeBase64Url: (s: string): string => `ENC(${s})`,
  decodeBase64Url: (s: string): string => {
    if (s === "URL_ENC") return "https://example.dev/api";
    if (s === "BODY_ENC") return `{"q":"ok"}`;
    return s;
  },
}));

function HookHost({ children }: PropsWithChildren): JSX.Element {
  useRequestQuerySync();
  return <div>{children}</div>;
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.spyOn(window.history, "replaceState");
  store.method = "GET";
  store.url = "";
  store.body = "";
  store.headers = [];
  store.setMethod.mockReset();
  store.setUrl.mockReset();
  store.setBody.mockReset();
  store.removeBody.mockReset();
  store.setHeaders.mockReset();

  vi.stubGlobal("crypto", {
    randomUUID: vi.fn(() => "uuid-1"),
  });

  window.history.replaceState(null, "", "/app");
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("useRequestQuerySync", () => {
  it("на маунте восстанавливает method/url/body/headers из query", () => {
    window.history.replaceState(
      null,
      "",
      "/app?url=URL_ENC&body=BODY_ENC&method=patch&X-Auth=t0ken&Empty"
    );

    render(<HookHost />);

    expect(store.setUrl).toHaveBeenCalledWith("https://example.dev/api");
    expect(store.setBody).toHaveBeenCalledWith(`{"q":"ok"}`);

    expect(store.setMethod).toHaveBeenCalledWith("PATCH");

    expect(store.setHeaders).toHaveBeenCalledTimes(1);
    const arg = (store.setHeaders.mock.calls[0] ?? [])[0] as Header[];
    expect(Array.isArray(arg)).toBe(true);
    const record = arg.map(({ key, value }) => ({ key, value }));
    expect(record).toContainEqual({ key: "X-Auth", value: "t0ken" });
    expect(record).toContainEqual({ key: "Empty", value: "" });
    expect(arg.length).toBe(2);
  });

  it("с дебаунсом пишет текущее состояние стора в query и делает replaceState", () => {
    store.method = "POST";
    store.url = "   https://api.service/path   ";
    store.body = `{"ok":true}`;
    store.headers = [
      { id: "h1", key: "Auth", value: "t" },
      { id: "h2", key: "   ", value: "ignored" },
      { id: "h3", key: " X-Custom ", value: "  V " },
    ];

    render(<HookHost />);

    vi.advanceTimersByTime(DEBOUNCE_MS);

    expect(window.history.replaceState).toHaveBeenCalled();

    const lastCall = (
      window.history.replaceState as unknown as import("vitest").Mock
    ).mock.calls.at(-1);
    const urlArg = lastCall ? (lastCall[2] as string) : "";

    const u = new URL(urlArg, "http://dummy.local");
    const params = u.searchParams;

    expect(u.pathname).toBe("/app");
    expect(params.get("method")).toBe("POST");
    expect(params.get("url")).toBe("ENC(https://api.service/path)");
    expect(params.get("body")).toBe(`ENC({"ok":true})`);
    expect(params.get("Auth")).toBe("t");
    expect(params.get("X-Custom")).toBe("V");
    expect(params.has("")).toBe(false);
  });

  it("если body пустой — удаляет его из query; если url пуст — удаляет и его", () => {
    window.history.replaceState(null, "", "/app?url=foo&body=bar&method=GET");

    store.method = "GET";
    store.url = "   ";
    store.body = "";
    store.headers = [];

    render(<HookHost />);

    vi.advanceTimersByTime(DEBOUNCE_MS);

    const lastCall = (
      window.history.replaceState as unknown as import("vitest").Mock
    ).mock.calls.at(-1);
    const urlArg = lastCall ? (lastCall[2] as string) : "";
    const u = new URL(urlArg, "http://dummy.local");

    expect(u.searchParams.get("method")).toBe("GET");
    expect(u.searchParams.get("url")).toBeNull();
    expect(u.searchParams.get("body")).toBeNull();
  });

  it("если в query нет заголовков — выставляет дефолтный пустой header", () => {
    window.history.replaceState(null, "", "/app?method=get");

    render(<HookHost />);

    expect(store.setHeaders).toHaveBeenCalledTimes(1);
    const arg = (store.setHeaders.mock.calls[0] ?? [])[0] as Header[];
    expect(arg.length).toBe(1);
    expect(arg[0].key).toBe("");
    expect(arg[0].value).toBe("");
  });
});
