import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import GlobalError from "./global-errors";
import { useTranslations } from "next-intl";

vi.mock("next-intl", () => ({
  useTranslations: vi.fn(),
}));

vi.mock("next/navigation", () => ({}));

describe("GlobalError Component", () => {
  const mockReset = vi.fn();
  const mockTranslations = vi.fn();

  const createMockError = (message: string, digest?: string): Error & { digest?: string } => {
    const error = new Error(message) as Error & { digest?: string };
    if (digest) {
      error.digest = digest;
    }
    return error;
  };

  const mockError = createMockError("Test error message", "test-digest-123");

  beforeEach(() => {
    vi.clearAllMocks();
    (useTranslations as Mock).mockReturnValue(mockTranslations);
    mockTranslations.mockImplementation((key: string) => {
      const translations: Record<string, string> = {
        title: "Something went wrong!",
        button: "Try again",
      };
      return translations[key] || key;
    });
  });

  it("renders the error component with correct structure", () => {
    render(<GlobalError error={mockError} reset={mockReset} />);

    expect(document.querySelector("html")).toBeInTheDocument();
    expect(document.querySelector("body")).toBeInTheDocument();

    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading).toHaveTextContent("Something went wrong!");
    expect(heading).toHaveClass("text-3xl", "font-semibold");

    const errorMessage = screen.getByText("Test error message");
    expect(errorMessage).toBeInTheDocument();
    expect(errorMessage).toHaveClass("p-5");

    const button = screen.getByRole("button", { name: "Try again" });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass(
      "bg-gradient-to-r",
      "from-teal-600",
      "to-green-600/80",
      "hover:from-teal-700",
      "hover:to-green-700/80",
      "text-white",
      "px-6",
      "py-2",
      "rounded",
      "shadow-md",
      "transition"
    );
  });

  it("calls reset function when button is clicked", () => {
    render(<GlobalError error={mockError} reset={mockReset} />);

    const button = screen.getByRole("button", { name: "Try again" });
    fireEvent.click(button);

    expect(mockReset).toHaveBeenCalledTimes(1);
  });

  it("uses translations from useTranslations hook", () => {
    const customTranslations = {
      title: "Custom Error Title",
      button: "Retry Operation",
    };

    mockTranslations.mockImplementation(
      (key: string) => customTranslations[key as keyof typeof customTranslations]
    );

    render(<GlobalError error={mockError} reset={mockReset} />);

    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Custom Error Title");
    expect(screen.getByRole("button")).toHaveTextContent("Retry Operation");
  });

  it("handles error without digest property", () => {
    const errorWithoutDigest = createMockError("Error without digest");

    render(<GlobalError error={errorWithoutDigest} reset={mockReset} />);

    expect(screen.getByText("Error without digest")).toBeInTheDocument();
  });

  it("handles error with all Error properties", () => {
    const completeError = createMockError("Complete error", "complete-digest");
    completeError.name = "TypeError";
    completeError.stack = "Error stack trace";

    render(<GlobalError error={completeError} reset={mockReset} />);

    expect(screen.getByText("Complete error")).toBeInTheDocument();
    expect(screen.queryByText("TypeError")).not.toBeInTheDocument();
    expect(screen.queryByText("Error stack trace")).not.toBeInTheDocument();
  });
});
