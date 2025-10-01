import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { useResponse, type BodyKind, type ResponseHeader } from "./restore";

const ISO_T0 = "2024-01-02T03:04:05.678Z";

const initialState = {
  isLoading: false,
  status: null as number | null,
  statusText: null as string | null,
  headers: [] as ResponseHeader[],
  bodyRaw: null as string | null,
  bodyPretty: null as string | null,
  bodyKind: "unknown" as BodyKind,
  durationMs: null as number | null,
  responseSize: null as number | null,
  error: null as string | null,
  timestamp: null as string | null,
};

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(ISO_T0));
  useResponse.setState({ ...initialState });
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useResponse (zustand store)", () => {
  it("имеет корректное начальное состояние", () => {
    const s = useResponse.getState();
    expect(s).toMatchObject(initialState);
  });

  it("start: ставит isLoading=true, сбрасывает error и проставляет timestamp", () => {
    const { start } = useResponse.getState();

    useResponse.setState({ error: "boom" });

    start();

    const s = useResponse.getState();
    expect(s.isLoading).toBe(true);
    expect(s.error).toBeNull();
    expect(s.timestamp).toBe(ISO_T0);
    expect(s.status).toBeNull();
    expect(s.statusText).toBeNull();
    expect(s.headers).toEqual([]);
    expect(s.bodyRaw).toBeNull();
    expect(s.bodyPretty).toBeNull();
    expect(s.bodyKind).toBe("unknown");
    expect(s.durationMs).toBeNull();
    expect(s.responseSize).toBeNull();
  });

  it("success: переносит payload в стор, снимает isLoading, error=null и обновляет timestamp", () => {
    const { success } = useResponse.getState();

    const hdrs: ResponseHeader[] = [
      { name: "content-type", value: "application/json" },
      { name: "x-id", value: "42" },
    ];
    const payload = {
      status: 201,
      statusText: "Created",
      headers: hdrs,
      bodyRaw: `{"ok":true}`,
      bodyPretty: `{\n  "ok": true\n}`,
      bodyKind: "json" as BodyKind,
      durationMs: 123,
      responseSize: 456,
    };

    useResponse.setState({
      isLoading: true,
      status: 500,
      statusText: "Internal",
      error: "old",
      timestamp: "OLD",
    });

    success(payload);

    const s = useResponse.getState();
    expect(s.isLoading).toBe(false);
    expect(s.status).toBe(201);
    expect(s.statusText).toBe("Created");
    expect(s.headers).toBe(hdrs);
    expect(s.bodyRaw).toBe(payload.bodyRaw);
    expect(s.bodyPretty).toBe(payload.bodyPretty);
    expect(s.bodyKind).toBe("json");
    expect(s.durationMs).toBe(123);
    expect(s.responseSize).toBe(456);
    expect(s.error).toBeNull();
    expect(s.timestamp).toBe(ISO_T0);
  });

  it("fail: записывает ошибку, очищает остальные поля, isLoading=false, timestamp обновляется", () => {
    const { fail } = useResponse.getState();

    useResponse.setState({
      isLoading: true,
      status: 200,
      statusText: "OK",
      headers: [{ name: "x", value: "y" }],
      bodyRaw: "data",
      bodyPretty: "pretty",
      bodyKind: "text",
      durationMs: 10,
      responseSize: 20,
      error: null,
      timestamp: "OLD",
    });

    fail("network down");

    const s = useResponse.getState();
    expect(s.isLoading).toBe(false);
    expect(s.error).toBe("network down");
    expect(s.status).toBeNull();
    expect(s.statusText).toBeNull();
    expect(s.headers).toEqual([]);
    expect(s.bodyRaw).toBeNull();
    expect(s.bodyPretty).toBeNull();
    expect(s.bodyKind).toBe("unknown");
    expect(s.durationMs).toBeNull();
    expect(s.responseSize).toBeNull();
    expect(s.timestamp).toBe(ISO_T0);
  });

  it("reset: полностью возвращает стор к начальному состоянию (timestamp=null)", () => {
    const { reset, start } = useResponse.getState();

    start();
    useResponse.setState({
      status: 200,
      statusText: "OK",
      headers: [{ name: "a", value: "b" }],
      bodyRaw: "x",
      bodyPretty: "x",
      bodyKind: "text",
      durationMs: 5,
      responseSize: 10,
    });

    reset();

    const s = useResponse.getState();
    expect(s).toMatchObject(initialState);
  });
});
