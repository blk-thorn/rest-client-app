import { vi, describe, beforeEach, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import HistoryClient from "./history-client";
import type { HistoryItem } from "@/app/[locale]/history/page";
import { useTranslations } from "next-intl";
import { encodeBase64Url } from "@/lib/utils/base64";
import { generateLink } from "./history-client";

vi.mock("next-intl", () => ({
  useTranslations: vi.fn(),
}));

const mockT = (key: string) => {
  const dict: Record<string, string> = {
    title: "History",
    "no-requests": "No requests yet. Go to ",
    client: "client",
    date: "en-US",
    status: "Status",
    duration: "Duration",
    ms: "ms",
    "req-size": "Req Size",
    "resp-size": "Resp Size",
    bytes: "bytes",
    error: "Error:",
  };
  return dict[key] || key;
};

describe("HistoryClient", () => {
  beforeEach(() => {
    (useTranslations as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockT);
  });

  it("renders empty state when no history is provided", () => {
    render(<HistoryClient history={[]} />);

    expect(screen.getByText("History")).toBeInTheDocument();
    expect(screen.getByText(/No requests yet/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "client" })).toHaveAttribute("href", "/rest");
  });

  it("renders history items", () => {
    const history: HistoryItem[] = [
      {
        id: "1",
        method: "GET",
        url: "https://api.test.com",
        headers: { Authorization: "Bearer 123" },
        body: "",
        createdAt: "September 14, 2025 at 10:54:20PM UTC+3",
        responseStatus: 200,
        duration: 120,
        requestSize: 512,
        responseSize: 1024,
      },
    ];

    render(<HistoryClient history={history} />);

    expect(screen.getByText("GET")).toBeInTheDocument();
    expect(screen.getByText("https://api.test.com")).toBeInTheDocument();
    expect(screen.getByText("200")).toHaveClass("text-green-500");
    expect(screen.getByText(/Duration/)).toHaveTextContent("120ms");
    expect(screen.getByText(/Req Size/)).toHaveTextContent("512 bytes");
    expect(screen.getByText(/Resp Size/)).toHaveTextContent("1024 bytes");
  });

  it("renders error details when present", () => {
    const history: HistoryItem[] = [
      {
        id: "2",
        method: "POST",
        url: "https://api.error.com",
        headers: {},
        body: "",
        createdAt: "September 16, 2025 at 10:54:20PM UTC+3",
        responseStatus: 500,
        errorDetails: "Internal Server Error",
      },
    ];

    render(<HistoryClient history={history} />);

    expect(screen.getByText("500")).toHaveClass("text-red-400");
    expect(screen.getByText(/Error:/)).toHaveTextContent("Error: Internal Server Error");
  });

  it("generateLink encodes method and url", () => {
    const item: HistoryItem = {
      id: "1",
      method: "GET",
      url: "https://example.com",
      headers: {},
      body: "",
      createdAt: new Date().toISOString(),
    };

    const link = generateLink(item);
    expect(link).toContain("method=GET");
    expect(link).toContain(`url=${encodeBase64Url(item.url)}`);
  });

  it("generateLink includes body if present", () => {
    const item: HistoryItem = {
      id: "2",
      method: "POST",
      url: "https://example.com",
      body: "{`foo`:`bar`}",
      headers: {},
      createdAt: new Date().toISOString(),
    };

    const link = generateLink(item);
    expect(link).toContain(`body=${encodeBase64Url(item.body!)}`);
  });

  it("generateLink includes headers", () => {
    const item: HistoryItem = {
      id: "3",
      method: "GET",
      url: "https://example.com",
      headers: { Authorization: "Bearer 123" },
      body: "",
      createdAt: new Date().toISOString(),
    };

    const link = generateLink(item);
    expect(link).toContain("Authorization=Bearer+123");
  });
});
