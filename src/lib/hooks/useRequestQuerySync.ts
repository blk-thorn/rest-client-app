"use client";

import { useEffect, useRef } from "react";
import { useRequest, HttpMethod } from "@/store/request.store";
import { encodeBase64Url, decodeBase64Url } from "@/lib/utils/base64";

const DEBOUNCE_MS = 300;
const RESERVED = new Set(["method", "url", "body"]);

export function useRequestQuerySync() {
  const { method, url, body, headers, setMethod, setUrl, setBody, removeBody, setHeaders } =
    useRequest();
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const encUrl = params.get("url");
    if (encUrl) {
      const decoded = decodeBase64Url(encUrl);
      if (decoded !== "") setUrl(decoded);
    }

    const encBody = params.get("body");
    if (encBody !== null) {
      setBody(decodeBase64Url(encBody));
    } else {
      removeBody();
    }

    const m = params.get("method");
    if (m) {
      const up = m.toUpperCase();
      if (["GET", "POST", "PUT", "DELETE", "PATCH"].includes(up)) {
        setMethod(up as HttpMethod);
      }
    }

    const restoredHeaders: { id: string; key: string; value: string }[] = [];
    params.forEach((value, key) => {
      if (!RESERVED.has(key)) {
        restoredHeaders.push({ id: crypto.randomUUID(), key, value });
      }
    });
    setHeaders(
      restoredHeaders.length ? restoredHeaders : [{ id: crypto.randomUUID(), key: "", value: "" }]
    );
  }, [setUrl, setBody, setMethod, setHeaders, removeBody]);

  useEffect(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
    }

    timerRef.current = window.setTimeout(() => {
      const next = new URLSearchParams();

      next.set("method", method);

      const trimmedUrl = url.trim();
      if (trimmedUrl.length) {
        next.set("url", encodeBase64Url(trimmedUrl));
      }

      if (body.length) {
        next.set("body", encodeBase64Url(body));
      }

      headers.forEach((h) => {
        const k = h.key.trim();
        if (k.length) {
          next.set(k, h.value.trim());
        }
      });

      const qs = next.toString();
      const nextHref = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;

      if (nextHref !== window.location.pathname + window.location.search) {
        window.history.replaceState(null, "", nextHref);
      }
    }, DEBOUNCE_MS) as unknown as number;

    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, [method, url, body, headers]);
}
