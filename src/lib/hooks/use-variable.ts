import { useVariablesStore } from "@/lib/stores/variables";

export const useVariable = () => {
  const { getVariable } = useVariablesStore();

  const replaceWithValue = (value: string): string => {
    const variablePattern = /\{\{([^}]*)\}\}/g;
    let result = value;

    const matches = value.matchAll(variablePattern);

    for (const match of matches) {
      const fullMatch = match[0];
      const variableName = match[1].trim();
      const variableValue = getVariable(variableName);

      if (variableValue) {
        result = result.replace(fullMatch, variableValue);
      }
    }
    return result;
  };

  return {
    replaceWithValue,
  };
};
