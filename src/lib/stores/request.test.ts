import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { useRequest } from "./request";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";
type Header = { id: string; key: string; value: string };

const makeInitial = () => ({
  method: "GET" as HttpMethod,
  url: "",
  params: [] as Array<{ key: string; value: string }>,
  headers: [{ id: "id-1", key: "", value: "" }] as Header[],
  body: "",
});

let idCounter = 1;

beforeEach(() => {
  idCounter = 1;
  vi.stubGlobal("crypto", {
    randomUUID: () => `id-${++idCounter}`,
  });

  useRequest.setState(makeInitial());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useRequest (zustand store)", () => {
  it("инициализируется ожидаемым состоянием", () => {
    const s = useRequest.getState();
    expect(s.method).toBe("GET");
    expect(s.url).toBe("");
    expect(s.params).toEqual([]);
    expect(s.headers).toEqual([{ id: "id-1", key: "", value: "" }]);
    expect(s.body).toBe("");
  });

  it("setMethod / setUrl / setBody / removeBody работают", () => {
    const { setMethod, setUrl, setBody, removeBody } = useRequest.getState();

    setMethod("POST");
    setUrl("https://api.example.com");
    setBody(`{"x":1}`);

    let s = useRequest.getState();
    expect(s.method).toBe("POST");
    expect(s.url).toBe("https://api.example.com");
    expect(s.body).toBe(`{"x":1}`);

    removeBody();
    s = useRequest.getState();
    expect(s.body).toBe("");
  });

  it("addHeader добавляет пустой заголовок с новым id", () => {
    const { addHeader } = useRequest.getState();

    const before = useRequest.getState().headers;
    expect(before).toHaveLength(1);
    expect(before[0].id).toBe("id-1");

    addHeader();

    const after = useRequest.getState().headers;
    expect(after).toHaveLength(2);
    expect(after[1]).toEqual({ id: "id-2", key: "", value: "" });
    expect(after).not.toBe(before);
  });

  it("updateHeader меняет только нужный хедер по id", () => {
    const { addHeader, updateHeader } = useRequest.getState();
    addHeader();

    const before = useRequest.getState().headers;
    updateHeader("id-2", { key: "Auth" });
    updateHeader("id-2", { value: "token" });

    const after = useRequest.getState().headers;
    expect(after.find((h) => h.id === "id-2")).toEqual({
      id: "id-2",
      key: "Auth",
      value: "token",
    });

    expect(after.find((h) => h.id === "id-1")).toEqual({ id: "id-1", key: "", value: "" });

    expect(after).not.toBe(before);
    const beforeItem2 = before.find((h) => h.id === "id-2");
    const afterItem2 = after.find((h) => h.id === "id-2");
    expect(afterItem2).not.toBe(beforeItem2);
  });

  it("removeHeader удаляет по id", () => {
    const { addHeader, removeHeader } = useRequest.getState();
    addHeader();
    addHeader();

    let s = useRequest.getState();
    expect(s.headers.map((h) => h.id)).toEqual(["id-1", "id-2", "id-3"]);

    removeHeader("id-2");
    s = useRequest.getState();
    expect(s.headers.map((h) => h.id)).toEqual(["id-1", "id-3"]);
  });

  it("setHeaders полностью заменяет коллекцию", () => {
    const { setHeaders } = useRequest.getState();
    const next: Header[] = [
      { id: "A", key: "X-One", value: "1" },
      { id: "B", key: "X-Two", value: "2" },
    ];
    const before = useRequest.getState().headers;

    setHeaders(next);

    const after = useRequest.getState().headers;
    expect(after).toEqual(next);
    expect(after).not.toBe(before);
  });
});
