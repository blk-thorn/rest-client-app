import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useVariable } from "./useVariable";
import { useVariablesStore } from "@/lib/stores/variables";

vi.mock("@/lib/stores/variables");

describe("useVariable", () => {
  const mockGetVariable = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useVariablesStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      getVariable: mockGetVariable,
    });
  });

  it("should return the original string when no variables are present", () => {
    mockGetVariable.mockReturnValue(undefined);

    const { result } = renderHook(() => useVariable());
    const output = result.current.replaceWithValue("simple string");

    expect(output).toBe("simple string");
    expect(mockGetVariable).not.toHaveBeenCalled();
  });

  it("should replace a single variable with its value", () => {
    mockGetVariable.mockImplementation((name: string) => {
      if (name === "key") return "12345";
      return undefined;
    });

    const { result } = renderHook(() => useVariable());
    const output = result.current.replaceWithValue("Your API key is {{key}}");

    expect(output).toBe("Your API key is 12345");
    expect(mockGetVariable).toHaveBeenCalledWith("key");
  });

  it("should replace multiple variables with their values", () => {
    mockGetVariable.mockImplementation((name: string) => {
      if (name === "key") return "12345";
      if (name === "endpoint") return "https://api.example.com";
      return undefined;
    });

    const { result } = renderHook(() => useVariable());
    const output = result.current.replaceWithValue("Call {{endpoint}} with key {{key}}");

    expect(output).toBe("Call https://api.example.com with key 12345");
    expect(mockGetVariable).toHaveBeenCalledWith("endpoint");
    expect(mockGetVariable).toHaveBeenCalledWith("key");
  });

  it("should leave variables unchanged when they are not found", () => {
    mockGetVariable.mockReturnValue(undefined);

    const { result } = renderHook(() => useVariable());
    const output = result.current.replaceWithValue("Unknown {{none}} variable");

    expect(output).toBe("Unknown {{none}} variable");
    expect(mockGetVariable).toHaveBeenCalledWith("none");
  });

  it("should handle multiple occurrences of the same variable", () => {
    mockGetVariable.mockImplementation((name: string) => {
      if (name === "repeat") return "same";
      return undefined;
    });

    const { result } = renderHook(() => useVariable());
    const output = result.current.replaceWithValue("{{repeat}} and {{repeat}} again");

    expect(output).toBe("same and same again");
    expect(mockGetVariable).toHaveBeenCalledWith("repeat");
    expect(mockGetVariable).toHaveBeenCalledTimes(2);
  });

  it("should handle complex strings with mixed content", () => {
    mockGetVariable.mockImplementation((name: string) => {
      if (name === "Host") return "example.com";
      if (name === "Port") return "8080";
      return undefined;
    });

    const { result } = renderHook(() => useVariable());
    const input = "Server: {{Host}}:{{Port}} with unknown {{Unknown}}";
    const output = result.current.replaceWithValue(input);

    expect(output).toBe("Server: example.com:8080 with unknown {{Unknown}}");
    expect(mockGetVariable).toHaveBeenCalledWith("Host");
    expect(mockGetVariable).toHaveBeenCalledWith("Port");
    expect(mockGetVariable).toHaveBeenCalledWith("Unknown");
  });

  it("should handle variables with numbers and underscores", () => {
    mockGetVariable.mockImplementation((name: string) => {
      if (name === "var_123") return "value_456";
      return undefined;
    });

    const { result } = renderHook(() => useVariable());
    const output = result.current.replaceWithValue("Number: {{var_123}}");

    expect(output).toBe("Number: value_456");
    expect(mockGetVariable).toHaveBeenCalledWith("var_123");
  });

  it("should handle malformed variable syntax (missing closing brace)", () => {
    mockGetVariable.mockReturnValue(undefined);

    const { result } = renderHook(() => useVariable());
    const output = result.current.replaceWithValue("Not {{Var");

    expect(output).toBe("Not {{Var");
    expect(mockGetVariable).not.toHaveBeenCalled();
  });

  it("should handle malformed variable syntax (missing opening brace)", () => {
    mockGetVariable.mockReturnValue(undefined);

    const { result } = renderHook(() => useVariable());
    const output = result.current.replaceWithValue("notVar}}");

    expect(output).toBe("notVar}}");
    expect(mockGetVariable).not.toHaveBeenCalled();
  });
});
