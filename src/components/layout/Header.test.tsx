import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

const h = vi.hoisted(() => ({
  user: null as unknown as import("firebase/auth").User | null,
  router: {
    push: vi.fn<(p: string) => void>(),
    replace: vi.fn<(p: string, o?: { locale?: string }) => void>(),
  },
  pathname: "/current",
  signedOutRef: { current: false },
  toast: { success: vi.fn<(m: string) => void>(), error: vi.fn<(m: string) => void>() },
}));

vi.mock("@/constants/routes", () => ({
  ROUTES: { HOME: "/", SIGN_IN: "/signin", SIGN_UP: "/signup" },
}));
vi.mock("@/db/firebase", () => ({ auth: {} as Record<string, never> }));

vi.mock("firebase/auth", () => ({
  onAuthStateChanged: (_auth: unknown, cb: (u: import("firebase/auth").User | null) => void) => {
    cb(h.user);
    return vi.fn();
  },
  signOut: vi.fn(async () => {}),
}));

vi.mock("sonner", () => ({
  toast: { success: (m: string) => h.toast.success(m), error: (m: string) => h.toast.error(m) },
}));

vi.mock("@/components/ui/Logo", () => ({
  __esModule: true as const,
  default: () => <div data-testid="logo" />,
}));

vi.mock("next/link", () => ({
  __esModule: true as const,
  default: (p: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={p.href} className={p.className} data-testid="link">
      {p.children}
    </a>
  ),
}));
vi.mock("@/i18n/navigation", () => ({ useRouter: () => h.router, usePathname: () => h.pathname }));
vi.mock("next-intl", () => ({
  useTranslations: (ns?: string) => (k: string) =>
    (
      ({
        "Header.button.sign-in": "Sign In",
        "Header.button.sign-up": "Sign Up",
        "Header.button.main": "Main",
        "Header.button.sign-out": "Sign Out",
        "Header.toast.success": "Signed out successfully",
        "Header.toast.error": "Sign out failed",
      }) as Record<string, string>
    )[`${ns}.${k}`] ?? k,
  useLocale: () => "en",
}));
vi.mock("@/lib/hooks/useAuthRedirect", () => ({
  useAuthRedirect: () => ({ signedOutRef: h.signedOutRef }),
}));

import Header from "./Header";
import { signOut } from "firebase/auth";

beforeEach(() => {
  vi.clearAllMocks();
  h.user = null;
  h.router.push.mockReset();
  h.router.replace.mockReset();
  h.signedOutRef.current = false;
  h.toast.success.mockReset();
  h.toast.error.mockReset();
  vi.spyOn(global, "fetch").mockResolvedValue({ ok: true } as unknown as Response);
});

describe("Header (compact)", () => {
  it("гость: показывает Sign In / Sign Up", () => {
    render(<Header />);
    expect(screen.getByTestId("logo")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Sign In" })).toHaveAttribute("href", "/signin");
    expect(screen.getByRole("link", { name: "Sign Up" })).toHaveAttribute("href", "/signup");
    expect(screen.queryByRole("link", { name: "Main" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Sign Out" })).toBeNull();
  });

  it("sign out (успех): пушит на /, ставит флаг, дергает тосты и DELETE /api/session", async () => {
    h.user = {} as unknown as import("firebase/auth").User;
    render(<Header />);

    fireEvent.click(screen.getByRole("button", { name: "Sign Out" }));

    await waitFor(() => expect(signOut).toHaveBeenCalled());
    expect(h.signedOutRef.current).toBe(true);
    expect(h.router.push).toHaveBeenCalledWith("/");
    expect(h.toast.success).toHaveBeenCalledWith("Signed out successfully");
    expect(global.fetch).toHaveBeenCalledWith("/api/session", { method: "DELETE" });
    expect(h.toast.success).toHaveBeenCalledWith("You have been signed out");
  });

  it("смена локали дергает router.replace с locale", () => {
    render(<Header />);
    const select = screen.getByRole("combobox") as HTMLSelectElement;

    expect(select.value).toBe("en");

    fireEvent.change(select, { target: { value: "ru" } });
    expect(h.router.replace).toHaveBeenCalledWith("/current", { locale: "ru" });
  });
});
