import React from "react";
import { describe, it, vi, expect, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { UserButtons } from "@/components/ui/user-buttons";
import { ROUTES } from "@/constants/routes";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      "buttons.client": "Client",
      "buttons.history": "History",
      "buttons.variables": "Variables",
    };
    return translations[key] ?? key;
  },
}));

vi.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe("UserButtons", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders all buttons with correct text and links", () => {
    render(<UserButtons />);

    const clientButton = screen.getByText("Client");
    const historyButton = screen.getByText("History");
    const variablesButton = screen.getByText("Variables");

    expect(clientButton.closest("a")).toHaveAttribute("href", ROUTES.CLIENT);
    expect(historyButton.closest("a")).toHaveAttribute("href", ROUTES.HISTORY);
    expect(variablesButton.closest("a")).toHaveAttribute("href", ROUTES.VARIABLES);
  });
});
