import { renderHook, act } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import type { User } from "firebase/auth";
import { ROUTES } from "@/constants/routes";
import React from "react";

const mockPush = vi.fn();
const mockUsePathname = vi.fn();

vi.mock("firebase/auth", async () => {
  const actual = await vi.importActual<typeof import("firebase/auth")>("firebase/auth");

  const onIdTokenChanged =
    vi.fn<(auth: unknown, callback: (user: User | null) => void) => () => void>();
  const getIdTokenResult =
    vi.fn<(user: User) => Promise<{ token: string; expirationTime: string }>>();

  const getAuth = vi.fn(() => ({}));
  const auth = {};

  return {
    ...actual,
    onIdTokenChanged,
    getIdTokenResult,
    getAuth,
    auth,
  };
});

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: mockUsePathname,
}));

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), message: vi.fn() },
}));

global.fetch = vi.fn() as unknown as typeof fetch;

const createUser = (uid: string): User => ({ uid }) as unknown as User;

describe("useAuthRedirect", () => {
  let useAuthRedirect: () => {
    checkingAuth: boolean;
    user: User | null;
    signedOutRef: React.RefObject<boolean>;
  };
  let mockOnIdTokenChanged: ReturnType<typeof vi.fn>;
  let mockGetIdTokenResult: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.clearAllMocks();

    const authModule = await import("firebase/auth");
    mockOnIdTokenChanged = authModule.onIdTokenChanged as typeof mockOnIdTokenChanged;
    mockGetIdTokenResult = authModule.getIdTokenResult as typeof mockGetIdTokenResult;

    mockOnIdTokenChanged.mockImplementation(() => {
      return () => {};
    });

    mockUsePathname.mockReturnValue("/");

    const mod = await import("./use-auth-redirect");
    useAuthRedirect = mod.useAuthRedirect;
  });

  it("should handle user sign in and save user", async () => {
    const user = createUser("user-1");
    const exp = new Date(Date.now() + 60 * 1000).toISOString();
    mockGetIdTokenResult.mockResolvedValue({ token: "mock-token", expirationTime: exp });

    let callback: ((u: User | null) => void) | null = null;
    mockOnIdTokenChanged.mockImplementation((_auth: unknown, cb: (u: User | null) => void) => {
      callback = cb;
      return () => {};
    });

    const { result } = renderHook(() => useAuthRedirect());
    expect(result.current.user).toBeNull();

    await act(async () => {
      callback?.(user);
    });

    expect(result.current.user).toEqual(user);
    expect(fetch).toHaveBeenCalledWith("/api/session", expect.any(Object));
  });

  it("should handle user sign out and redirect to HOME", async () => {
    let callback: ((u: User | null) => void) | null = null;

    mockOnIdTokenChanged.mockImplementation((_auth: unknown, cb: (u: User | null) => void) => {
      callback = cb;
      return () => {};
    });

    const { result } = renderHook(() => useAuthRedirect());

    result.current.signedOutRef.current = true;

    await act(async () => {
      callback?.(null);
    });

    expect(result.current.user).toBeNull();
    expect(mockPush).toHaveBeenCalledWith(ROUTES.HOME);
  });

  it("should handle error while getting token", async () => {
    const user = createUser("user-2");
    mockGetIdTokenResult.mockRejectedValue(new Error("Token error"));

    let callback: ((u: User | null) => void) | null = null;
    mockOnIdTokenChanged.mockImplementation((_auth: unknown, cb: (u: User | null) => void) => {
      callback = cb;
      return () => {};
    });

    renderHook(() => useAuthRedirect());

    await act(async () => {
      callback?.(user);
    });

    expect(mockPush).not.toHaveBeenCalled();
  });
});
