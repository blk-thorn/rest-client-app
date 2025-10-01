import { describe, it, expect, beforeEach, vi } from "vitest";
import * as firebaseAdmin from "@/db/firebase-admin";
import * as headers from "next/headers";
import { GET } from "./route";

interface CheckTokenResponse {
  valid: boolean;
}

vi.mock("@/db/firebase-admin", () => ({
  adminAuth: {
    verifyIdToken: vi.fn(),
  },
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

describe("check-token API", () => {
  let mockCookiesGet: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockCookiesGet = vi.fn();
    (headers.cookies as unknown as () => Promise<{ get: typeof mockCookiesGet }>) = async () => ({
      get: mockCookiesGet,
    });
  });

  it("GET: returns valid true if token is valid", async () => {
    mockCookiesGet.mockReturnValue({ value: "valid-token" });
    (
      firebaseAdmin.adminAuth.verifyIdToken as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue({});

    const res = await GET();
    const json: CheckTokenResponse = await res.json();

    expect(json.valid).toBe(true);
  });

  it("GET: returns valid false if token missing", async () => {
    mockCookiesGet.mockReturnValue(undefined);

    const res = await GET();
    const json: CheckTokenResponse = await res.json();

    expect(res.status).toBe(401);
    expect(json.valid).toBe(false);
  });

  it("GET: returns valid false if token invalid", async () => {
    mockCookiesGet.mockReturnValue({ value: "invalid-token" });
    (
      firebaseAdmin.adminAuth.verifyIdToken as unknown as ReturnType<typeof vi.fn>
    ).mockRejectedValue(new Error("invalid"));

    const res = await GET();
    const json: CheckTokenResponse = await res.json();

    expect(res.status).toBe(401);
    expect(json.valid).toBe(false);
  });
});
