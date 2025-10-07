import { describe, it, expect, vi, beforeEach, afterEach, Mock } from "vitest";
import { handleSend } from "./handle-send";

type HeaderKV = { key: string; value: string };

interface Setters {
  setRespStatus: (s: string | null) => void;
  setRespHeaders: (h: Array<[string, string]>) => void;
  setRespBody: (b: string) => void;
  setIsLoading: (v: boolean) => void;
  setErrorMsg: (m: string | null) => void;
}

const makeSetters = (): { fns: Record<keyof Setters, ReturnType<typeof vi.fn>> } & Setters => {
  const setRespStatus = vi.fn<(s: string | null) => void>();
  const setRespHeaders = vi.fn<(h: Array<[string, string]>) => void>();
  const setRespBody = vi.fn<(b: string) => void>();
  const setIsLoading = vi.fn<(v: boolean) => void>();
  const setErrorMsg = vi.fn<(m: string | null) => void>();
  return {
    setRespStatus,
    setRespHeaders,
    setRespBody,
    setIsLoading,
    setErrorMsg,
    fns: { setRespStatus, setRespHeaders, setRespBody, setIsLoading, setErrorMsg },
  };
};

const mockPerf = (t0: number, t1: number) => {
  const spy = vi.spyOn(performance, "now");
  spy.mockReturnValueOnce(t0);
  spy.mockReturnValueOnce(t1);
  return spy;
};

beforeEach(() => {
  vi.restoreAllMocks();
  vi.clearAllMocks();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("handleSend", () => {
  it("возвращается сразу при пустом URL (ничего не делает)", async () => {
    const { setRespStatus, setRespHeaders, setRespBody, setIsLoading, setErrorMsg, fns } =
      makeSetters();

    global.fetch = vi.fn();

    await handleSend({
      method: "GET",
      url: "   ",
      headers: [],
      body: "",
      setRespStatus,
      setRespHeaders,
      setRespBody,
      setIsLoading,
      setErrorMsg,
    });

    expect((global.fetch as unknown as import("vitest").Mock).mock.calls.length).toBe(0);
    expect(fns.setIsLoading).not.toHaveBeenCalled();
    expect(fns.setRespStatus).not.toHaveBeenCalled();
    expect(fns.setRespHeaders).not.toHaveBeenCalled();
    expect(fns.setRespBody).not.toHaveBeenCalled();
    expect(fns.setErrorMsg).not.toHaveBeenCalled();
  });

  it("successful GET: sends headers, omits body, parses response, and logs history", async () => {
    const { setRespStatus, setRespHeaders, setRespBody, setIsLoading, setErrorMsg } = makeSetters();

    const t0 = 100;
    const t1 = 260;
    const perfSpy = mockPerf(t0, t1);

    const resHeaders = new Headers([["x-test", "v"]]);
    const firstResponse: {
      status: number;
      statusText: string;
      headers: Headers;
      text: () => Promise<string>;
    } = {
      status: 200,
      statusText: "OK",
      headers: resHeaders,
      text: async () => "hello",
    };
    const historyResponse: { ok: boolean } = { ok: true };

    const fetchMock = vi
      .spyOn(global, "fetch")
      .mockResolvedValueOnce(firstResponse as unknown as Response)
      .mockResolvedValueOnce(historyResponse as unknown as Response);

    const headers: HeaderKV[] = [
      { key: "Auth", value: "token" },
      { key: "   ", value: "ignored" },
    ];
    const bodyStr = `{"a":1}`;

    await handleSend({
      method: "GET",
      url: "https://api.test/ok",
      headers,
      body: bodyStr,
      setRespStatus,
      setRespHeaders,
      setRespBody,
      setIsLoading,
      setErrorMsg,
    });

    expect(setIsLoading).toHaveBeenNthCalledWith(1, true);
    expect(setIsLoading).toHaveBeenLastCalledWith(false);

    expect(setRespStatus).toHaveBeenCalledWith("200 OK • 160 ms");
    expect(perfSpy).toHaveBeenCalledTimes(2);

    expect(setRespHeaders).toHaveBeenCalledWith([["x-test", "v"]]);

    expect(setRespBody).toHaveBeenCalledWith("hello");

    const [url1, init1] = (fetchMock.mock.calls[0] ?? []) as [string, RequestInit];
    expect(url1).toBe("https://api.test/ok");
    expect(init1.method).toBe("GET");
    expect(init1.headers).toEqual({ Auth: "token" });
    expect("body" in init1 ? (init1 as Required<RequestInit>).body : undefined).toBeUndefined();

    const [url2, init2] = (fetchMock.mock.calls[1] ?? []) as [string, RequestInit];
    expect(url2).toBe("/api/history/route");
    expect(init2.method).toBe("POST");
    expect(init2.headers).toEqual({ "Content-Type": "application/json" });
    const payload = JSON.parse(String((init2 as Required<RequestInit>).body));
    expect(payload).toMatchObject({
      method: "GET",
      url: "https://api.test/ok",
      headers: { Auth: "token" },
      body: bodyStr,
      responseStatus: 200,
      requestSize: bodyStr.length,
      responseSize: "hello".length,
      duration: 160,
      errorDetails: null,
    });

    expect(setErrorMsg).toHaveBeenCalledTimes(1);
    expect(setErrorMsg).toHaveBeenCalledWith(null);
    const nonNull = (setErrorMsg as Mock).mock.calls.filter(([m]) => m !== null);
    expect(nonNull.length).toBe(0);
  });

  it("POST includes body and successfully logs history", async () => {
    const { setRespStatus, setRespHeaders, setRespBody, setIsLoading, setErrorMsg } = makeSetters();

    mockPerf(0, 10);

    const firstResponse = {
      status: 201,
      statusText: "Created",
      headers: new Headers([]),
      text: async () => "",
    };
    const fetchMock = vi
      .spyOn(global, "fetch")
      .mockResolvedValueOnce(firstResponse as unknown as Response)
      .mockResolvedValueOnce({ ok: true } as unknown as Response);

    const bodyStr = `{"k":"v"}`;

    await handleSend({
      method: "POST",
      url: "https://api.test/post",
      headers: [{ key: "Content-Type", value: "application/json" }],
      body: bodyStr,
      setRespStatus,
      setRespHeaders,
      setRespBody,
      setIsLoading,
      setErrorMsg,
    });

    const [, init1] = (fetchMock.mock.calls[0] ?? []) as unknown as [string, RequestInit];
    expect(init1.method).toBe("POST");
    expect((init1 as Required<RequestInit>).body).toBe(bodyStr);

    expect(setRespStatus).toHaveBeenCalledWith("201 Created • 10 ms");
    expect(setRespBody).toHaveBeenCalledWith("");
    expect(setRespHeaders).toHaveBeenCalledWith([]);

    expect(setErrorMsg).toHaveBeenCalledTimes(1);
    expect(setErrorMsg).toHaveBeenCalledWith(null);
    const nonNull = (setErrorMsg as Mock).mock.calls.filter(([m]) => m !== null);
    expect(nonNull.length).toBe(0);
  });

  it("network error: sets error message, logs error in history, and clears loading", async () => {
    const { setRespStatus, setRespHeaders, setRespBody, setIsLoading, setErrorMsg } = makeSetters();

    const fetchMock = vi
      .spyOn(global, "fetch")
      .mockRejectedValueOnce(new Error("fail"))
      .mockResolvedValueOnce({ ok: true } as unknown as Response);
    const bodyStr = `{"b":2}`;
    const headers: HeaderKV[] = [{ key: "Auth", value: "t" }];

    await handleSend({
      method: "DELETE",
      url: "https://api.test/fail",
      headers,
      body: bodyStr,
      setRespStatus,
      setRespHeaders,
      setRespBody,
      setIsLoading,
      setErrorMsg,
    });

    expect(setErrorMsg).toHaveBeenCalledWith("fail");

    const [, init2] = (fetchMock.mock.calls[1] ?? []) as [string, RequestInit];
    const payload = JSON.parse(String((init2 as Required<RequestInit>).body));
    expect(payload).toMatchObject({
      method: "DELETE",
      url: "https://api.test/fail",
      headers: { Auth: "t" },
      body: bodyStr,
      responseStatus: 0,
      requestSize: bodyStr.length,
      responseSize: 0,
      duration: 0,
      errorDetails: "fail",
    });

    expect(setIsLoading).toHaveBeenNthCalledWith(1, true);
    expect(setIsLoading).toHaveBeenLastCalledWith(false);

    expect(setRespBody).toHaveBeenCalledWith("");
    expect(setRespHeaders).toHaveBeenCalledWith([]);
    expect(setRespStatus).toHaveBeenCalledWith(null);
  });
});
