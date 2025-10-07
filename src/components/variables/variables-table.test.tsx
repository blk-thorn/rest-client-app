import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import VariablesTable from "./variables-table";
import { useVariablesStore } from "@/lib/stores/variables";

vi.mock("@/lib/stores/variables");
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      "Variables.table.name": "Name",
      "Variables.table.value": "Value",
      "Variables.table.delete": "Delete",
      "Variables.no-variables-message": "No variables here!",
      "Variables.no-variables-hint": "Add your first variable to get started.",
    };
    return translations[key] || key;
  },
}));

describe("VariablesTable", () => {
  const mockDeleteVariable = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders empty state when no variables", () => {
    (useVariablesStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      variables: [],
      deleteVariable: mockDeleteVariable,
    });

    render(<VariablesTable />);

    expect(screen.getByText("no-variables-message")).toBeTruthy();
    expect(screen.getByText("no-variables-hint")).toBeTruthy();
  });

  it("renders table with variables", () => {
    const mockVariables = [{ key: "12345" }, { url: "//localhost:5432" }];

    (useVariablesStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      variables: mockVariables,
      deleteVariable: mockDeleteVariable,
    });

    render(<VariablesTable />);

    expect(screen.getByText("key")).toBeTruthy();
    expect(screen.getByText("12345")).toBeTruthy();
    expect(screen.getByText("url")).toBeTruthy();
    expect(screen.getByText("//localhost:5432")).toBeTruthy();
  });

  it("calls deleteVariable when delete button is clicked", async () => {
    const mockVariables = [{ var: "value" }];

    (useVariablesStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      variables: mockVariables,
      deleteVariable: mockDeleteVariable,
    });

    render(<VariablesTable />);
    const user = userEvent.setup();

    const deleteButton = screen.getByRole("button", { name: /delete/i });
    await user.click(deleteButton);

    expect(mockDeleteVariable).toHaveBeenCalledWith("var");
  });

  it("renders correct table headers", () => {
    const mockVariables = [{ var: "value" }];

    (useVariablesStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      variables: mockVariables,
      deleteVariable: mockDeleteVariable,
    });

    render(<VariablesTable />);

    expect(screen.getByText("table.name")).toBeTruthy();
    expect(screen.getByText("table.value")).toBeTruthy();
  });
});
