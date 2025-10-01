import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import * as firebaseAdmin from "@/db/firebase-admin";
import type { DocumentReference } from "firebase-admin/firestore";
import type { MockedFunction } from "vitest";

vi.mock("@/db/firebase-admin", () => {
  const verifyIdToken = vi.fn();
  const add = vi.fn();

  const db = {
    collection: vi.fn(() => ({ add })),
  };

  return {
    adminAuth: { verifyIdToken },
    db,
  };
});

describe("history POST API", () => {
  const mockVerifyIdToken = firebaseAdmin.adminAuth.verifyIdToken as unknown as MockedFunction<
    (token: string) => Promise<{ uid: string }>
  >;

  const mockAdd = firebaseAdmin.db.collection("history").add as unknown as MockedFunction<
    (doc: Record<string, unknown>) => Promise<DocumentReference>
  >;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 if token missing", async () => {
    const req = {
      cookies: new Map<string, { value: string }>(),
      json: async () => ({}),
    } as unknown as Parameters<typeof POST>[0];

    const res = await POST(req);
    const data: { ok: boolean; message?: string } = await res.json();

    expect(res.status).toBe(401);
    expect(data.ok).toBe(false);
    expect(data.message).toBe("Unauthorized");
  });

  it("returns 200 if token valid", async () => {
    mockVerifyIdToken.mockResolvedValue({ uid: "user123" });
    mockAdd.mockResolvedValue({} as DocumentReference);

    const req = {
      cookies: new Map([["token", { value: "valid-token" }]]),
      json: async () => ({
        method: "GET",
        url: "/test",
        headers: {},
        body: "body",
        responseStatus: 200,
      }),
    } as unknown as Parameters<typeof POST>[0];

    const res = await POST(req);
    const data: { ok: boolean } = await res.json();

    expect(data.ok).toBe(true);
    expect(mockVerifyIdToken).toHaveBeenCalled();
    expect(mockAdd).toHaveBeenCalled();
  });

  it("returns 500 if verifyIdToken fails", async () => {
    mockVerifyIdToken.mockRejectedValue(new Error("invalid"));

    const req = {
      cookies: new Map([["token", { value: "invalid-token" }]]),
      json: async () => ({}),
    } as unknown as Parameters<typeof POST>[0];

    const res = await POST(req);
    const data: { ok: boolean; message?: string } = await res.json();

    expect(res.status).toBe(500);
    expect(data.ok).toBe(false);
    expect(data.message).toBe("invalid");
  });
});
