import { renderHook, act } from "@testing-library/react";
import { vi, describe, it, beforeEach, expect } from "vitest";
import type { User } from "firebase/auth";

const mockOnIdTokenChanged = vi.fn();
const mockGetIdTokenResult = vi.fn();

vi.mock("firebase/auth", async () => {
  const actual = await vi.importActual<typeof import("firebase/auth")>("firebase/auth");
  return {
    ...actual,
    onIdTokenChanged: mockOnIdTokenChanged,
    getIdTokenResult: mockGetIdTokenResult,
  };
});

vi.mock("@/db/firebase", () => ({
  auth: {},
}));

const createUser = (uid: string): User => ({ uid }) as unknown as User;

describe("useAuthToken", () => {
  let useAuthToken: () => { user: User | null; loading: boolean };

  beforeEach(async () => {
    vi.clearAllMocks();
    const mod = await import("./use-auth-token");
    useAuthToken = mod.useAuthToken;
  });

  it("should set user when logged in", async () => {
    const user = createUser("user-1");
    mockGetIdTokenResult.mockResolvedValue({
      token: "mock-token",
      expirationTime: new Date().toISOString(),
    });

    let callback: ((u: User | null) => void) | null = null;
    mockOnIdTokenChanged.mockImplementation((_auth, cb) => {
      callback = cb;
      return () => {};
    });

    const { result } = renderHook(() => useAuthToken());
    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(true);

    await act(async () => {
      callback?.(user);
    });

    expect(result.current.user).toEqual(user);
    expect(result.current.loading).toBe(false);
    expect(mockGetIdTokenResult).toHaveBeenCalledWith(user);
  });

  it("should set user to null when logged out", async () => {
    let callback: ((u: User | null) => void) | null = null;
    mockOnIdTokenChanged.mockImplementation((_auth, cb) => {
      callback = cb;
      return () => {};
    });

    const { result } = renderHook(() => useAuthToken());

    await act(async () => {
      callback?.(null);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(mockGetIdTokenResult).not.toHaveBeenCalled();
  });

  it("should set user to null if getIdTokenResult throws an error", async () => {
    const user = createUser("user-2");
    mockGetIdTokenResult.mockRejectedValue(new Error("Token error"));

    let callback: ((u: User | null) => void) | null = null;
    mockOnIdTokenChanged.mockImplementation((_auth, cb) => {
      callback = cb;
      return () => {};
    });

    const { result } = renderHook(() => useAuthToken());

    await act(async () => {
      callback?.(user);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(false);
  });
});
