import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

type HttpMethodType = "GET" | "POST" | "PUT" | "DELETE";

interface Header {
  id: string;
  key: string;
  value: string;
}
interface StoreState {
  method: HttpMethodType;
  url: string;
  body: string;
  headers: Header[];
}
interface UseRequest {
  method: HttpMethodType;
  url: string;
  body: string;
  headers: Header[];
  setMethod: (v: HttpMethodType) => void;
  setUrl: (v: string) => void;
  setBody: (v: string) => void;
  addHeader: () => void;
  updateHeader: (id: string, patch: Partial<Header>) => void;
  removeHeader: (id: string) => void;
}
interface HandleSendArgs {
  method: HttpMethodType;
  url: string;
  headers: Header[];
  body: string;
  setRespStatus: (s: string | null) => void;
  setRespHeaders: (h: Array<[string, string]>) => void;
  setRespBody: (b: string) => void;
  setIsLoading: (l: boolean) => void;
  setErrorMsg: (m: string | null) => void;
}

const h = vi.hoisted(() => {
  const initialState: StoreState = {
    method: "GET",
    url: "https://{{base}}/foo",
    body: `{"x":"{{base}}"}`,
    headers: [{ id: "1", key: "Auth", value: "{{base}}" }],
  };

  return {
    state: { ...initialState },
    initialState,
    setMethod: vi.fn<(v: HttpMethodType) => void>(),
    setUrl: vi.fn<(v: string) => void>(),
    setBody: vi.fn<(v: string) => void>(),
    addHeader: vi.fn<() => void>(),
    updateHeader: vi.fn<(id: string, patch: Partial<Header>) => void>(),
    removeHeader: vi.fn<(id: string) => void>(),

    handleSendSpy: vi.fn(async (args: HandleSendArgs): Promise<void> => {
      const {
        setRespStatus,
        setRespHeaders,
        setRespBody,
        setIsLoading,
        setErrorMsg,
        url,
        headers,
        body,
      } = args;

      setIsLoading(true);
      expect(url).toContain("ok");
      expect(JSON.stringify(headers)).toContain("ok");
      expect(String(body)).toContain("ok");
      setRespStatus("200");
      setRespHeaders([["content-type", "application/json"]]);
      setRespBody(`{"ok":true}`);
      setErrorMsg(null);
      setIsLoading(false);
    }),

    toastError: vi.fn<(msg: string) => void>(),
  };
});

vi.mock("@/lib/stores/request", () => {
  const HttpMethod = { GET: "GET", POST: "POST", PUT: "PUT", DELETE: "DELETE" } as const;
  const useRequest = (): UseRequest => ({
    method: h.state.method,
    url: h.state.url,
    body: h.state.body,
    headers: h.state.headers,
    setMethod: (v) => {
      h.state.method = v;
      h.setMethod(v);
    },
    setUrl: (v) => {
      h.state.url = v;
      h.setUrl(v);
    },
    setBody: (v) => {
      h.state.body = v;
      h.setBody(v);
    },
    addHeader: () => h.addHeader(),
    updateHeader: (id, patch) => h.updateHeader(id, patch),
    removeHeader: (id) => h.removeHeader(id),
  });
  return { HttpMethod, useRequest };
});

vi.mock("@/lib/hooks/useVariable", () => ({
  useVariable: () => ({
    replaceWithValue: (input: string): string => (input ?? "").replaceAll("{{base}}", "ok"),
  }),
}));

vi.mock("@/lib/hooks/useRequestQuerySync", () => ({
  useRequestQuerySync: (): void => {},
}));

const dict: Record<string, string> = {
  "Client.request-tabs.headers": "headers",
  "Client.request-tabs.body": "body",
  "Client.response-tabs.body": "body",
  "Client.response-tabs.headers": "headers",
  "Client.response-tabs.code": "code",
  "Client.button.loading": "Loading...",
  "Client.button.normal": "Send",
  "Client.headers.title": "Headers",
  "Client.headers.add": "Add header",
  "Client.headers.delete": "Delete",
  "Client.headers.input.key": "Key",
  "Client.headers.input.value": "Value",
  "Client.body.input": "Request body",
  "Client.body.prettify": "Prettify",
  "Client.body.error": "Invalid JSON",
  "Client.response.title": "Response",
  "Client.response.status": "Status",
  "Client.response.body": "(no body)",
  "Client.response.headers": "(no headers)",
  "Client.response.code": "(no code)",
};
vi.mock("next-intl", () => ({
  useTranslations:
    (ns?: string) =>
    (key: string): string =>
      dict[`${ns ?? ""}.${key}`] ?? dict[key] ?? key,
}));

import type { ButtonHTMLAttributes, InputHTMLAttributes, JSX } from "react";
vi.mock("@/lib/ui/button", () => ({
  Button: (props: ButtonHTMLAttributes<HTMLButtonElement>): JSX.Element => <button {...props} />,
}));
vi.mock("@/lib/ui/input", () => ({
  Input: (props: InputHTMLAttributes<HTMLInputElement>): JSX.Element => <input {...props} />,
}));
vi.mock("@/lib/ui/tabs", () => {
  const Tabs = ({ children }: { children: React.ReactNode }): JSX.Element => (
    <div data-testid="tabs">{children}</div>
  );
  const TabsList = (props: React.HTMLAttributes<HTMLDivElement>): JSX.Element => (
    <div data-testid="tabs-list" {...props} />
  );
  const TabsTrigger = (
    props: React.ButtonHTMLAttributes<HTMLButtonElement> & { value?: string }
  ): JSX.Element => <button data-testid="tab-trigger" {...props} />;
  const TabsContent = (props: React.HTMLAttributes<HTMLDivElement>): JSX.Element => (
    <div data-testid="tabs-content" {...props} />
  );
  return { Tabs, TabsList, TabsTrigger, TabsContent };
});

vi.mock("@/components/CodePanel", () => ({
  __esModule: true as const,
  default: ({ method, url }: { method: string; url: string }): JSX.Element => (
    <div data-testid="code-panel">{`${method}:${url}`}</div>
  ),
}));

vi.mock("sonner", () => ({
  toast: { error: (msg: string): void => h.toastError(msg) },
}));

vi.mock("@/lib/utils/handleSend", () => ({ handleSend: h.handleSendSpy }));

import RestClient from "./RestClient";

const renderClient = () => render(<RestClient />);

beforeEach(() => {
  h.state.method = h.initialState.method;
  h.state.url = h.initialState.url;
  h.state.body = h.initialState.body;
  h.state.headers = JSON.parse(JSON.stringify(h.initialState.headers)) as Header[];

  h.setMethod.mockReset();
  h.setUrl.mockReset();
  h.setBody.mockReset();
  h.addHeader.mockReset();
  h.updateHeader.mockReset();
  h.removeHeader.mockReset();
  h.handleSendSpy.mockClear();
  h.toastError.mockReset();
});

describe("RestClient", () => {
  it("отправляет запрос с подстановкой переменных и показывает ответ", async () => {
    renderClient();

    const sendBtn = screen.getByRole("button", { name: "Send" });
    expect(sendBtn).toBeEnabled();

    fireEvent.click(sendBtn);

    await waitFor(() => {
      expect(h.handleSendSpy).toHaveBeenCalledTimes(1);
    });

    expect(screen.getByText("Status:")).toBeInTheDocument();
    expect(screen.getByText("200")).toBeInTheDocument();
    expect(screen.getByText(`{"ok":true}`)).toBeInTheDocument();

    expect(screen.getByText(/content-type/i)).toBeInTheDocument();
    expect(screen.getByText(/application\/json/i)).toBeInTheDocument();

    expect(screen.getByTestId("code-panel")).toHaveTextContent("GET:https://{{base}}/foo");
  });

  it("Prettify форматирует валидный JSON и не показывает ошибку", async () => {
    renderClient();
    const prettifyBtn = screen.getByRole("button", { name: "Prettify" });
    fireEvent.click(prettifyBtn);

    await waitFor(() => {
      expect(h.setBody).toHaveBeenCalledTimes(1);
    });

    const firstCall = h.setBody.mock.calls[0];
    const prettyArg: string | undefined = firstCall ? firstCall[0] : undefined;
    expect(prettyArg).toBeDefined();
    expect(prettyArg as string).toMatch(/\n\s{2}/);
    expect(h.toastError).not.toHaveBeenCalled();
  });

  it("Prettify на некорректном JSON вызывает toast.error", async () => {
    h.state.body = `{invalid`;
    renderClient();
    const prettifyBtn = screen.getByRole("button", { name: "Prettify" });
    fireEvent.click(prettifyBtn);

    await waitFor(() => {
      expect(h.toastError).toHaveBeenCalledWith("Invalid JSON");
    });
  });

  it("кнопка Send дизейблится при пустом URL", () => {
    h.state.url = `   `;
    renderClient();
    const sendBtn = screen.getByRole("button", { name: "Send" });
    expect(sendBtn).toBeDisabled();
  });

  it("add/delete header вызывают экшены стора", () => {
    renderClient();

    const addBtn = screen.getByRole("button", { name: "Add header" });
    fireEvent.click(addBtn);
    expect(h.addHeader).toHaveBeenCalledTimes(1);

    const delBtn = screen.getByRole("button", { name: "Delete" });
    fireEvent.click(delBtn);
    expect(h.removeHeader).toHaveBeenCalledWith("1");
  });

  it("переключение табов кликается, плейсхолдеры присутствуют", () => {
    renderClient();
    const triggers = screen.getAllByTestId("tab-trigger");
    expect(triggers.length).toBeGreaterThan(0);

    expect(screen.getByText("Response")).toBeInTheDocument();
    expect(screen.getByText("Status:")).toBeInTheDocument();
    expect(screen.getAllByText(/body/i).length).toBeGreaterThan(0);
  });

  it("смена метода запроса вызывает setMethod", () => {
    renderClient();
    const select = screen.getByDisplayValue("GET") as HTMLSelectElement;
    fireEvent.change(select, { target: { value: "POST" } });
    expect(h.setMethod).toHaveBeenCalledWith("POST");
  });

  it("ввод URL вызывает setUrl", () => {
    renderClient();
    const input = screen.getByPlaceholderText("https://api.example.com");
    fireEvent.change(input, { target: { value: "https://api.dev" } });
    expect(h.setUrl).toHaveBeenCalledWith("https://api.dev");
  });
});
