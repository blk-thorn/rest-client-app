import { vi, describe, it, beforeEach, expect, Mock } from "vitest";
import { FormState } from "@/types/types";

const authMock = {};
vi.mock("@/db/firebase", () => ({
  auth: authMock,
}));

vi.mock("firebase/auth", async () => {
  const actual = await vi.importActual<typeof import("firebase/auth")>("firebase/auth");
  return {
    ...actual,
    signInWithEmailAndPassword: vi.fn(async () => ({
      user: { getIdToken: vi.fn().mockResolvedValue("mock-token") },
    })),
    createUserWithEmailAndPassword: vi.fn(async () => ({
      user: { getIdToken: vi.fn().mockResolvedValue("mock-token") },
    })),
    updateProfile: vi.fn(async () => Promise.resolve()),
  };
});

vi.mock("@/lib/utils/parseError", () => ({
  parseError: (err: unknown) => (err instanceof Error ? err.message : "Unknown error"),
}));

global.fetch = vi.fn() as unknown as typeof fetch;

const createFormData = (data: Record<string, string>): FormData => {
  const fd = new FormData();
  for (const key in data) fd.set(key, data[key]);
  return fd;
};

describe("auth auth", () => {
  let signInAction: typeof import("./signin").signInAction;
  let signUpAction: typeof import("./signup").signUpAction;

  let mocks: {
    signInWithEmailAndPassword: Mock;
    createUserWithEmailAndPassword: Mock;
    updateProfile: Mock;
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const authModule = await import("firebase/auth");
    mocks = {
      signInWithEmailAndPassword: authModule.signInWithEmailAndPassword as Mock,
      createUserWithEmailAndPassword: authModule.createUserWithEmailAndPassword as Mock,
      updateProfile: authModule.updateProfile as Mock,
    };

    signInAction = (await import("./signin")).signInAction;
    signUpAction = (await import("./signup")).signUpAction;
  });

  describe("signin", () => {
    it("should return error if email or password missing", async () => {
      const fd = createFormData({ email: "", password: "" });
      const result: FormState = await signInAction({ error: null }, fd);
      expect(result.error).toBe("Email and password are required");
    });

    it("should sign in user and post token", async () => {
      const fd = createFormData({ email: "test@test.com", password: "123456" });
      const result: FormState = await signInAction({ error: null }, fd);

      expect(mocks.signInWithEmailAndPassword).toHaveBeenCalledWith(
        authMock,
        "test@test.com",
        "123456"
      );
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/session",
        expect.objectContaining({ method: "POST" })
      );
      expect(result.error).toBeNull();
    });

    it("should return error if signIn fails", async () => {
      const fd = createFormData({ email: "test@test.com", password: "123456" });
      mocks.signInWithEmailAndPassword.mockRejectedValue(new Error("Sign in failed"));

      const result: FormState = await signInAction({ error: null }, fd);
      expect(result.error).toBe("Sign in failed");
    });
  });

  describe("signup", () => {
    it("should return error if validation fails", async () => {
      const fd = createFormData({ email: "invalid", password: "123", confirmPassword: "1234" });
      const result: FormState = await signUpAction({ error: null }, fd);
      expect(result.error).toBeDefined();
    });

    it("should return error if signUp fails", async () => {
      const fd = createFormData({
        email: "test@test.com",
        password: "Password1!",
        confirmPassword: "Password1!",
      });
      mocks.createUserWithEmailAndPassword.mockRejectedValue(new Error("Sign up failed"));

      const result: FormState = await signUpAction({ error: null }, fd);
      expect(result.error).toBe("Sign up failed");
      expect(mocks.createUserWithEmailAndPassword).toHaveBeenCalledWith(
        authMock,
        "test@test.com",
        "Password1!"
      );
    });
  });
});
