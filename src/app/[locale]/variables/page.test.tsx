import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import VariablesPage from "./page";

vi.mock("@/components/variables/variables-form", () => ({
  default: () => <div data-testid="variables-form">Variables Form</div>,
}));

vi.mock("@/components/variables/variables-table", () => ({
  default: () => <div data-testid="variables-table">Variables Table</div>,
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      "Variables.title": "Variables",
    };
    return translations[key] || key;
  },
}));

describe("VariablesPage", () => {
  it("renders the page with title and components", async () => {
    render(<VariablesPage />);

    expect(screen.getByText("title")).toBeTruthy();
    await waitFor(() => {
      expect(screen.getByTestId("variables-form")).toBeTruthy();
      expect(screen.getByTestId("variables-table")).toBeTruthy();
    });
  });
});
