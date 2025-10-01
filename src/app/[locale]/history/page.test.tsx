import { describe, it, expect, vi, beforeEach } from "vitest";
import { cookies } from "next/headers";
import { adminAuth, db } from "@/db/firebase-admin";
import HistoryPage from "./page";
import { HistoryItem } from "./page";
import React, { JSX } from "react";
import { render, screen } from "@testing-library/react";

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

vi.mock("@/db/firebase-admin", () => ({
  adminAuth: {
    verifyIdToken: vi.fn(),
  },
  db: {
    collection: vi.fn(),
  },
}));

vi.mock("@/components/history/HistoryClient", () => ({
  default: ({ history }: { history: HistoryItem[] }) => (
    <div data-testid="history-client">
      {history.map((item) => (
        <div key={item.id}>{item.url}</div>
      ))}
    </div>
  ),
}));

vi.mock("@/components/ui/Loader", () => ({
  default: () => <div data-testid="loader">Loading...</div>,
}));

describe("HistoryPage", () => {
  const mockToken = "mock-token";
  const mockUserId = "user-123";
  const mockDecodedToken = {
    uid: mockUserId,
    aud: "firebase-project-id",
    auth_time: 1609459200,
    exp: 1609462800,
    firebase: {
      identities: {},
      sign_in_provider: "password",
    },
    iat: 1609459200,
    iss: "https://securetoken.google.com/firebase-project-id",
    sub: mockUserId,
  };

  const mockHistoryData: HistoryItem[] = [
    {
      id: "1",
      method: "GET",
      url: "https://api.example.com/users",
      headers: { "Content-Type": "application/json" },
      body: "",
      createdAt: "2023-01-01T00:00:00.000Z",
      duration: 150,
      responseStatus: 200,
      requestSize: 100,
      responseSize: 500,
      errorDetails: null,
    },
    {
      id: "2",
      method: "POST",
      url: "https://api.example.com/posts",
      headers: { "Content-Type": "application/json" },
      body: "{`title`:`Test`}",
      createdAt: "2023-01-02T00:00:00.000Z",
      duration: 200,
      responseStatus: 201,
      requestSize: 150,
      responseSize: 300,
      errorDetails: null,
    },
  ];

  const mockCollection = {
    where: vi.fn(),
    orderBy: vi.fn(),
    get: vi.fn(),
  };

  const mockQuery = {
    orderBy: vi.fn(),
  };

  const mockSnapshot = {
    docs: mockHistoryData.map((item) => ({
      id: item.id,
      data: () => ({
        method: item.method,
        url: item.url,
        headers: item.headers,
        body: item.body,
        createdAt: {
          toDate: () => new Date(item.createdAt),
        },
        duration: item.duration,
        responseStatus: item.responseStatus,
        requestSize: item.requestSize,
        responseSize: item.responseSize,
        errorDetails: item.errorDetails,
        userId: mockUserId,
      }),
    })),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(cookies).mockResolvedValue({
      get: vi.fn().mockReturnValue({ value: mockToken }),
    } as unknown as Awaited<ReturnType<typeof cookies>>);

    vi.mocked(adminAuth.verifyIdToken).mockResolvedValue(mockDecodedToken);

    vi.mocked(db.collection).mockReturnValue(mockCollection as never);
    vi.mocked(mockCollection.where).mockReturnValue(mockQuery as never);
    vi.mocked(mockQuery.orderBy).mockReturnValue(mockCollection as never);
    vi.mocked(mockCollection.get).mockResolvedValue(mockSnapshot as never);
  });

  it("should throw an error when no token is present", async () => {
    vi.mocked(cookies).mockResolvedValue({
      get: vi.fn().mockReturnValue(undefined),
    } as unknown as Awaited<ReturnType<typeof cookies>>);

    await expect(HistoryPage()).rejects.toThrow("Unauthorized");
  });

  it("should verify the token and fetch user history", async () => {
    await HistoryPage();

    expect(cookies).toHaveBeenCalled();
    expect(adminAuth.verifyIdToken).toHaveBeenCalledWith(mockToken);
    expect(db.collection).toHaveBeenCalledWith("history");
    expect(mockCollection.where).toHaveBeenCalledWith("userId", "==", mockUserId);
    expect(mockQuery.orderBy).toHaveBeenCalledWith("createdAt", "desc");
    expect(mockCollection.get).toHaveBeenCalled();
  });

  it("should transform Firestore data correctly", async () => {
    await HistoryPage();

    const transformedData = mockSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        method: data.method,
        url: data.url,
        headers: data.headers,
        body: data.body,
        createdAt: data.createdAt.toDate().toISOString(),
        duration: data.duration,
        responseStatus: data.responseStatus,
        requestSize: data.requestSize,
        responseSize: data.responseSize,
        errorDetails: data.errorDetails,
      };
    });

    expect(transformedData).toEqual(mockHistoryData);
  });

  it("should render HistoryClient with correct history data", async () => {
    const result = await HistoryPage();

    expect(result).toBeDefined();
    expect(result.props.history).toEqual(mockHistoryData);
  });

  it("should handle empty history data", async () => {
    const emptySnapshot = {
      docs: [],
    };

    vi.mocked(mockCollection.get).mockResolvedValue(emptySnapshot as never);

    const result = await HistoryPage();

    expect(result.props.history).toEqual([]);
    expect(Array.isArray(result.props.history)).toBe(true);
    expect(result.props.history.length).toBe(0);
  });

  it("should verify the query is ordered by createdAt in descending order", async () => {
    await HistoryPage();

    expect(mockQuery.orderBy).toHaveBeenCalledWith("createdAt", "desc");
    expect(mockQuery.orderBy).toHaveBeenCalledTimes(1);
  });

  it("should handle errorDetails field correctly when present", async () => {
    const mockDocWithError = {
      id: "4",
      data: () => ({
        method: "GET",
        url: "https://api.example.com/error",
        headers: {},
        body: "",
        createdAt: {
          toDate: () => new Date("2023-01-03T00:00:00.000Z"),
        },
        duration: 500,
        responseStatus: 500,
        requestSize: 50,
        responseSize: 100,
        errorDetails: "Internal Server Error",
        userId: mockUserId,
      }),
    };

    const errorSnapshot = {
      docs: [mockDocWithError],
    };

    vi.mocked(mockCollection.get).mockResolvedValue(errorSnapshot as never);

    const result = await HistoryPage();

    expect(result.props.history[0].errorDetails).toBe("Internal Server Error");
    expect(result.props.history[0].responseStatus).toBe(500);
  });

  it("should handle null headers field", async () => {
    const mockDocWithNullHeaders = {
      id: "6",
      data: () => ({
        method: "GET",
        url: "https://api.example.com/test",
        headers: null,
        body: "",
        createdAt: {
          toDate: () => new Date("2023-01-05T00:00:00.000Z"),
        },
        duration: 100,
        responseStatus: 200,
        requestSize: 50,
        responseSize: 150,
        errorDetails: null,
        userId: mockUserId,
      }),
    };

    const nullHeadersSnapshot = {
      docs: [mockDocWithNullHeaders],
    };

    vi.mocked(mockCollection.get).mockResolvedValue(nullHeadersSnapshot as never);

    const result = await HistoryPage();

    expect(result.props.history[0].headers).toEqual({});
  });

  it("should call the Loader while HistoryClient is loading", async () => {
    vi.doMock("next/dynamic", () => {
      return {
        default: (_: unknown, { loading }: { loading: () => JSX.Element }) => loading,
      };
    });

    const { default: HistoryPageWithLoader } = await import("./page");

    vi.mocked(cookies).mockResolvedValue({
      get: vi.fn().mockReturnValue({ value: mockToken }),
    } as unknown as Awaited<ReturnType<typeof cookies>>);
    vi.mocked(adminAuth.verifyIdToken).mockResolvedValue(mockDecodedToken);
    vi.mocked(db.collection).mockReturnValue(mockCollection as never);
    vi.mocked(mockCollection.where).mockReturnValue(mockQuery as never);
    vi.mocked(mockQuery.orderBy).mockReturnValue(mockCollection as never);
    vi.mocked(mockCollection.get).mockResolvedValue(mockSnapshot as never);

    const result = await HistoryPageWithLoader();

    render(result);

    expect(screen.getByTestId("loader")).toBeInTheDocument();
  });
});
