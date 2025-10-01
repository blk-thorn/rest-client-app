import { create } from "zustand";

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

export type Header = { id: string; key: string; value: string };

type State = {
  method: HttpMethod;
  url: string;
  params: { key: string; value: string }[];
  headers: Header[];
  body: string;
  setMethod: (m: HttpMethod) => void;
  setUrl: (u: string) => void;
  setBody: (b: string) => void;
  removeBody: () => void;
  addHeader: () => void;
  updateHeader: (id: string, patch: Partial<Header>) => void;
  removeHeader: (id: string) => void;
  setHeaders: (headers: Header[]) => void;
};

export const useRequest = create<State>()((set) => ({
  method: "GET",
  url: "",
  params: [],
  headers: [{ id: crypto.randomUUID(), key: "", value: "" }],
  body: "",
  setMethod: (m) => set({ method: m }),
  setUrl: (u) => set({ url: u }),
  setBody: (b) => set({ body: b }),
  removeBody: () => set({ body: "" }),
  addHeader: () =>
    set((s) => ({ headers: [...s.headers, { id: crypto.randomUUID(), key: "", value: "" }] })),
  updateHeader: (id, patch) =>
    set((s) => ({ headers: s.headers.map((h) => (h.id === id ? { ...h, ...patch } : h)) })),
  removeHeader: (id) => set((s) => ({ headers: s.headers.filter((h) => h.id !== id) })),
  setHeaders: (headers) => set({ headers }),
}));
