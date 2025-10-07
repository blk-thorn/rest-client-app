export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
export type HeaderKV = { key: string; value: string };

type Args = {
  method: HttpMethod;
  url: string;
  headers: HeaderKV[];
  body: string;

  setRespStatus: (s: string | null) => void;
  setRespHeaders: (h: Array<[string, string]>) => void;
  setRespBody: (b: string) => void;
  setIsLoading: (v: boolean) => void;
  setErrorMsg: (m: string | null) => void;
};

export async function handleSend({
  method,
  url,
  headers,
  body,
  setRespStatus,
  setRespHeaders,
  setRespBody,
  setIsLoading,
  setErrorMsg,
}: Args) {
  if (!url.trim()) return;

  setIsLoading(true);
  setErrorMsg(null);
  setRespStatus(null);
  setRespHeaders([]);
  setRespBody("");

  const controller = new AbortController();

  try {
    const headersObj = Object.fromEntries(
      headers.filter((h) => h.key.trim()).map((h) => [h.key.trim(), h.value])
    );

    const hasBody = ["POST", "PUT", "PATCH", "DELETE"].includes(method);
    const init: RequestInit = {
      method,
      headers: headersObj,
      signal: controller.signal,
      ...(hasBody && body.trim().length ? { body } : {}),
    };

    const t0 = performance.now();
    const res = await fetch(url, init);
    const t1 = performance.now();

    setRespStatus(`${res.status} ${res.statusText} • ${Math.round(t1 - t0)} ms`);

    const hdrs: Array<[string, string]> = [];
    res.headers.forEach((v, k) => hdrs.push([k, v]));
    setRespHeaders(hdrs);

    const text = await res.text();
    setRespBody(text);

    await fetch("/api/history/route", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        method,
        url,
        headers: headersObj,
        body,
        responseStatus: res.status,
        requestSize: body.length,
        responseSize: text.length,
        duration: Math.round(t1 - t0),
        errorDetails: null,
      }),
    });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Network error";
    setErrorMsg(errorMsg);

    await fetch("/api/history/route", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        method,
        url,
        headers: Object.fromEntries(headers.map((h) => [h.key, h.value])),
        body,
        responseStatus: 0,
        requestSize: body.length,
        responseSize: 0,
        duration: 0,
        errorDetails: errorMsg,
      }),
    });
  } finally {
    setIsLoading(false);
  }
}
