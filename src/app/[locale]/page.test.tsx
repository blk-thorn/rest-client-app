import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@/db/firebase", () => ({
  auth: {
    signInWithEmailAndPassword: vi.fn(),
    onIdTokenChanged: vi.fn(),
    getIdTokenResult: vi.fn(),
    signOut: vi.fn(),
  },
}));

vi.mock("@/components/WelcomeMessage", () => ({
  default: ({ isAuthenticated, username }: { isAuthenticated: boolean; username: string }) => (
    <div>
      WelcomeMessage-{isAuthenticated ? "auth" : "guest"}-{username}
    </div>
  ),
}));
vi.mock("@/components/GeneraInfo", () => ({ default: () => <div>GeneralInfo</div> }));
vi.mock("@/components/ui/UserButtons", () => ({
  UserButtons: () => <div>UserButtons</div>,
}));
vi.mock("@/components/ui/Loader", () => ({ default: () => <div>Loader</div> }));

import * as useAuthHook from "@/lib/hooks/useAuthToken";
vi.mock("@/lib/hooks/useAuthToken");

import HomePage from "@/app/[locale]/page";

describe("HomePage", () => {
  const mockUseAuthToken = vi.fn();
  beforeEach(() => {
    vi.resetAllMocks();
    (useAuthHook.useAuthToken as unknown) = mockUseAuthToken;
  });

  it("renders Loader when loading is true", () => {
    mockUseAuthToken.mockReturnValue({ user: null, loading: true });
    render(<HomePage />);
    expect(screen.getByText("Loader")).toBeInTheDocument();
  });

  it("renders welcome message and general info for guest user", () => {
    mockUseAuthToken.mockReturnValue({ user: null, loading: false });
    render(<HomePage />);
    expect(screen.getByText("WelcomeMessage-guest-Jacob Schmidt")).toBeInTheDocument();
    expect(screen.getByText("GeneralInfo")).toBeInTheDocument();
    expect(screen.queryByText("UserButtons")).not.toBeInTheDocument();
  });

  it("renders welcome message, general info, and user buttons for authenticated user", () => {
    mockUseAuthToken.mockReturnValue({ user: { displayName: "Alice" }, loading: false });
    render(<HomePage />);
    expect(screen.getByText("WelcomeMessage-auth-Alice")).toBeInTheDocument();
    expect(screen.getByText("GeneralInfo")).toBeInTheDocument();
    expect(screen.getByText("UserButtons")).toBeInTheDocument();
  });
});
