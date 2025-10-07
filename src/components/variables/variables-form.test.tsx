import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import VariablesForm from "./variables-form";
import { useVariablesStore } from "@/lib/stores/variables";
import { toast } from "sonner";

vi.mock("@/lib/stores/variables");
vi.mock("sonner");
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      "Variables.input-placeholder.name": "Name",
      "Variables.input-placeholder.value": "Value",
      "Variables.button.loading": "Adding...",
      "Variables.button.normal": "Add variable",
      "Variables.toast-success-message": "Variable {name} was added successfully",
      "Variables.toast-duplicate-message": "Variable {name} already exists!",
      "Variables.validation-error.name-required": "Name is required",
      "Variables.validation-error.name-spaces": "Name should not contain spaces",
      "Variables.validation-error.value-required": "Value is required",
      "Variables.validation-error.value-spaces": "Value should not contain spaces",
    };
    return translations[key] || key;
  },
}));

describe("VariablesForm", () => {
  const mockAddVariable = vi.fn();
  const mockVariables: Array<{ [key: string]: string }> = [];

  beforeEach(() => {
    vi.clearAllMocks();
    (useVariablesStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      variables: mockVariables,
      addVariable: mockAddVariable,
    });
  });

  it("renders the form with inputs and button", () => {
    render(<VariablesForm />);

    expect(screen.getByPlaceholderText("input-placeholder.name")).toBeTruthy();
    expect(screen.getByPlaceholderText("input-placeholder.value")).toBeTruthy();
    expect(screen.getByRole("button", { name: "button.normal" })).toBeTruthy();
  });

  it("validates fields", async () => {
    render(<VariablesForm />);
    const user = userEvent.setup();

    const nameInput = screen.getByPlaceholderText("input-placeholder.name");
    const valueInput = screen.getByPlaceholderText("input-placeholder.value");
    await user.type(nameInput, " ");
    await user.type(valueInput, " ");

    await waitFor(() => {
      expect(screen.queryByText("validation-error.name-spaces")).toBeTruthy();
    });
    expect(screen.queryByText("validation-error.value-spaces")).toBeTruthy();
  });

  it("submits the form with valid data", async () => {
    render(<VariablesForm />);
    const user = userEvent.setup();

    const nameInput = screen.getByPlaceholderText("input-placeholder.name");
    const valueInput = screen.getByPlaceholderText("input-placeholder.value");
    const submitButton = screen.getByRole("button", { name: "button.normal" });

    await user.type(nameInput, "var");
    await user.type(valueInput, "value");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockAddVariable).toHaveBeenCalledWith({ var: "value" });
    });
  });

  it("shows error for duplicate variable name", async () => {
    (useVariablesStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      variables: [{ var: "value1" }],
      addVariable: mockAddVariable,
    });

    render(<VariablesForm />);
    const user = userEvent.setup();

    const nameInput = screen.getByPlaceholderText("input-placeholder.name");
    const valueInput = screen.getByPlaceholderText("input-placeholder.value");
    const submitButton = screen.getByRole("button", { name: "button.normal" });

    await user.type(nameInput, "var");
    await user.type(valueInput, "value2");
    await user.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });
  });

  it("shows success message for successful submission", async () => {
    render(<VariablesForm />);
    const user = userEvent.setup();

    const nameInput = screen.getByPlaceholderText("input-placeholder.name");
    const valueInput = screen.getByPlaceholderText("input-placeholder.value");
    const submitButton = screen.getByRole("button", { name: "button.normal" });

    await user.type(nameInput, "var");
    await user.type(valueInput, "value");
    await user.click(submitButton);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalled();
    });
  });
});
