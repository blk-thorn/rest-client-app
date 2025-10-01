import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { render, screen } from "@testing-library/react";
import NotFoundPage from "@/app/[locale]/not-found";
import { useTranslations } from "next-intl";
import { ROUTES } from "@/constants/routes";

vi.mock("next-intl", () => ({
  useTranslations: vi.fn(),
}));

vi.mock("next/link", async () => {
  const actual = await vi.importActual("next/link");
  return {
    ...actual,
    default: ({
      children,
      href,
      className,
    }: {
      children: React.ReactNode;
      href: string;
      className?: string;
    }) => (
      <a href={href} className={className}>
        {children}
      </a>
    ),
  };
});

describe("NotFoundPage", () => {
  const mockUseTranslations = useTranslations as unknown as Mock;

  beforeEach(() => {
    vi.resetAllMocks();
    mockUseTranslations.mockReturnValue((key: string) => key);
  });

  const renderPage = () => render(<NotFoundPage />);

  it("renders the 404 number with correct classes", () => {
    renderPage();
    const number = screen.getByText("404");
    expect(number).toBeInTheDocument();
    expect(number).toHaveClass("text-6xl", "font-bold", "text-teal-500");
  });

  it("renders the message text with correct classes", () => {
    renderPage();
    const message = screen.getByText("text");
    expect(message).toBeInTheDocument();
    expect(message.tagName).toBe("P");
    expect(message).toHaveClass("text-gray-300", "text-lg", "text-center", "max-w-md");
  });

  it("renders the home link correctly", () => {
    renderPage();
    const link = screen.getByText("link");
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", ROUTES.HOME);
    expect(link.tagName).toBe("A");
  });

  it("renders the main container with correct classes", () => {
    renderPage();
    const container = screen.getByText("404").parentElement;
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass(
      "flex",
      "flex-1",
      "flex-col",
      "items-center",
      "justify-center",
      "bg-gray-900",
      "text-white",
      "p-6",
      "space-y-6"
    );
  });
});
