import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { render, screen } from "@testing-library/react";
import SignInPage from "@/app/[locale]/signin/page";
import * as hooks from "@/lib/hooks/useAuthRedirect";
import { useTranslations } from "next-intl";

vi.mock("@/lib/auth/signin", () => ({
  signInAction: vi.fn(),
}));

vi.mock("@/lib/hooks/useAuthRedirect", () => ({
  useAuthRedirect: vi.fn(),
}));

vi.mock("next-intl", () => ({
  useTranslations: vi.fn(),
}));

vi.mock("next/link", async () => {
  const actual = await vi.importActual("next/link");
  return {
    ...actual,
    default: ({ children, href }: { children: React.ReactNode; href: string }) => (
      <a href={href}>{children}</a>
    ),
  };
});

describe("SignInPage", () => {
  const mockUseTranslations = useTranslations as unknown as Mock;
  const mockUseAuthRedirect = hooks.useAuthRedirect as unknown as Mock;

  beforeEach(() => {
    vi.resetAllMocks();
    mockUseTranslations.mockReturnValue((key: string) => key);
    mockUseAuthRedirect.mockReturnValue({
      checkingAuth: false,
      user: null,
      signedOutRef: { current: false },
    });
  });

  const renderPage = () => render(<SignInPage />);

  it("renders the sign-in form with all fields and button", () => {
    renderPage();
    expect(screen.getByText("title")).toBeInTheDocument();
    expect(screen.getByLabelText("email-label")).toBeInTheDocument();
    expect(screen.getByLabelText("password.label")).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("submit button is enabled by default", () => {
    renderPage();
    const button = screen.getByRole("button");
    expect(button).not.toBeDisabled();
  });
});
