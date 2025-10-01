import { Variable } from "@/components/variables/VariablesTable";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type Variables = {
  variables: Variable[];
  addVariable: (variable: Variable) => void;
  deleteVariable: (name: string) => void;
  getVariable: (name: string) => string | undefined;
};

export const useVariablesStore = create<Variables>()(
  persist(
    (set, get) => ({
      variables: [],
      addVariable: (variable) => set((state) => ({ variables: [...state.variables, variable] })),
      deleteVariable: (key) =>
        set((state) => ({ variables: state.variables.filter((item) => !(key in item)) })),
      getVariable: (key) => {
        const variable = get().variables.find((item) => key in item);
        return variable ? variable[key] : undefined;
      },
    }),
    {
      name: "rc-variables",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
