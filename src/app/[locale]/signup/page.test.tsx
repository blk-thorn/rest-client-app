import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { render, screen } from "@testing-library/react";
import SignUpPage from "@/app/[locale]/signup/page";
import * as actions from "@/lib/auth/sign-up-action";
import * as hooks from "@/lib/hooks/use-auth-redirect";
import { useTranslations } from "next-intl";
import { passwordSchema } from "@/lib/validation/password";
import { ROUTES } from "@/constants/routes";

const setupMocks = () => {
  vi.mock("@/lib/auth/sign-up-action", () => ({ signUpAction: vi.fn() }));
  vi.mock("@/lib/hooks/use-auth-redirect", () => ({ useAuthRedirect: vi.fn() }));
  vi.mock("next-intl", () => ({ useTranslations: vi.fn() }));
  vi.mock("next/link", async () => {
    const actual = await vi.importActual("next/link");
    return {
      ...actual,
      default: ({ children, href }: { children: React.ReactNode; href: string }) => (
        <a href={href}>{children}</a>
      ),
    };
  });
};

setupMocks();

describe("SignUpPage", () => {
  const mockUseTranslations = useTranslations as unknown as Mock;
  const mockUseAuthRedirect = hooks.useAuthRedirect as unknown as Mock;
  const mockSignUpAction = actions.signUpAction as unknown as Mock;

  beforeEach(() => {
    vi.resetAllMocks();
    mockUseTranslations.mockReturnValue((key: string) => key);
    mockUseAuthRedirect.mockReturnValue({
      checkingAuth: false,
      user: null,
      signedOutRef: { current: false },
    });
    mockSignUpAction.mockReturnValue(() => {});
  });

  const renderPage = () => render(<SignUpPage />);

  it("renders the sign-up form correctly", () => {
    renderPage();
    expect(screen.getByText("title")).toBeInTheDocument();
    expect(screen.getByLabelText("email-label")).toBeInTheDocument();
    expect(screen.getByLabelText("password.label")).toBeInTheDocument();
    expect(screen.getByLabelText("confirm-password.label")).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeInTheDocument();
    expect(screen.getByText("link-si")).toHaveAttribute("href", ROUTES.SIGN_IN);
  });

  it("submit button is enabled by default", () => {
    renderPage();
    expect(screen.getByRole("button")).not.toBeDisabled();
  });

  it("renders all password requirements", () => {
    renderPage();
    passwordSchema.forEach((req) => {
      expect(screen.getByText((content) => content.includes(req.label))).toBeInTheDocument();
    });
  });
});
