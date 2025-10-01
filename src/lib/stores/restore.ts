import { create } from "zustand";

export type ResponseHeader = { name: string; value: string };

export type BodyKind = "json" | "text" | "xml" | "blob" | "unknown";

type ResponseState = {
  isLoading: boolean;
  status: number | null;
  statusText: string | null;
  headers: ResponseHeader[];
  bodyRaw: string | null;
  bodyPretty: string | null;
  bodyKind: BodyKind;
  durationMs: number | null;
  responseSize: number | null;
  error: string | null;
  timestamp: string | null;
};

type ResponseActions = {
  reset: () => void;
  start: () => void;
  success: (payload: {
    status: number;
    statusText: string;
    headers: ResponseHeader[];
    bodyRaw: string;
    bodyPretty: string | null;
    bodyKind: BodyKind;
    durationMs: number;
    responseSize: number;
  }) => void;
  fail: (message: string) => void;
};

type ResponseStore = ResponseState & ResponseActions;

export const useResponse = create<ResponseStore>()((set) => ({
  isLoading: false,
  status: null,
  statusText: null,
  headers: [],
  bodyRaw: null,
  bodyPretty: null,
  bodyKind: "unknown",
  durationMs: null,
  responseSize: null,
  error: null,
  timestamp: null,

  reset: () =>
    set({
      isLoading: false,
      status: null,
      statusText: null,
      headers: [],
      bodyRaw: null,
      bodyPretty: null,
      bodyKind: "unknown",
      durationMs: null,
      responseSize: null,
      error: null,
      timestamp: null,
    }),

  start: () =>
    set({
      isLoading: true,
      error: null,
      timestamp: new Date().toISOString(),
    }),

  success: (payload) =>
    set({
      isLoading: false,
      status: payload.status,
      statusText: payload.statusText,
      headers: payload.headers,
      bodyRaw: payload.bodyRaw,
      bodyPretty: payload.bodyPretty,
      bodyKind: payload.bodyKind,
      durationMs: payload.durationMs,
      responseSize: payload.responseSize,
      error: null,
      timestamp: new Date().toISOString(),
    }),

  fail: (message) =>
    set({
      isLoading: false,
      error: message,
      status: null,
      statusText: null,
      headers: [],
      bodyRaw: null,
      bodyPretty: null,
      bodyKind: "unknown",
      durationMs: null,
      responseSize: null,
      timestamp: new Date().toISOString(),
    }),
}));
