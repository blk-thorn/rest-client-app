import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { useVariablesStore } from "./variables";
import { Variable } from "@/components/variables/variables-table";

vi.mock("zustand/middleware", () => {
  const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  };

  return {
    persist: vi.fn((config) => config),
    createJSONStorage: vi.fn(() => localStorageMock),
  };
});

describe("Variables", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useVariablesStore.setState({
      variables: [],
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("should add a variable to the store", () => {
    const { addVariable } = useVariablesStore.getState();
    const newVariable: Variable = { var: "value" };

    addVariable(newVariable);

    const { variables } = useVariablesStore.getState();
    expect(variables).toHaveLength(1);
    expect(variables[0]).toEqual(newVariable);
  });

  it("should delete a variable from the store", () => {
    const { addVariable, deleteVariable } = useVariablesStore.getState();
    const variable1: Variable = { key: "12345" };
    const variable2: Variable = { url: "//localhost" };

    addVariable(variable1);
    addVariable(variable2);
    deleteVariable("key");

    const { variables } = useVariablesStore.getState();

    expect(variables).toHaveLength(1);
    expect(variables[0]).toEqual(variable2);
  });

  it("should not delete anything if variable name does not exist", () => {
    const { addVariable, deleteVariable } = useVariablesStore.getState();
    const variable: Variable = { key: "12345" };

    addVariable(variable);
    deleteVariable("env");

    const { variables } = useVariablesStore.getState();

    expect(variables).toHaveLength(1);
    expect(variables[0]).toEqual(variable);
  });

  it("should get a variable value by name", () => {
    const { addVariable, getVariable } = useVariablesStore.getState();
    const variable: Variable = { key: "12345" };

    addVariable(variable);
    const value = getVariable("key");

    expect(value).toBe("12345");
  });

  it("should return undefined for non-existent variable", () => {
    const { getVariable } = useVariablesStore.getState();
    const value = getVariable("env");

    expect(value).toBeUndefined();
  });

  it("should handle multiple variables with getVariable", () => {
    const { addVariable, getVariable } = useVariablesStore.getState();
    const variable1: Variable = { key: "12345" };
    const variable2: Variable = { url: "//localhost" };

    addVariable(variable1);
    addVariable(variable2);

    expect(getVariable("key")).toBe("12345");
    expect(getVariable("url")).toBe("//localhost");
    expect(getVariable("env")).toBeUndefined();
  });

  it("should maintain order of variables when adding and deleting", () => {
    const { addVariable, deleteVariable } = useVariablesStore.getState();
    const var1: Variable = { first: "1" };
    const var2: Variable = { second: "2" };
    const var3: Variable = { third: "3" };

    addVariable(var1);
    addVariable(var2);
    addVariable(var3);
    deleteVariable("second");

    const { variables } = useVariablesStore.getState();

    expect(variables).toEqual([var1, var3]);
  });
});
