import { z } from "zod";

export const createAddVariableSchema = (t: (i: string) => string) => {
  return z.object({
    name: z
      .string()
      .min(1, t("validation-error.name-required"))
      .regex(/^\S*$/, t("validation-error.name-spaces")),
    value: z
      .string()
      .min(1, t("validation-error.value-required"))
      .regex(/^\S*$/, t("validation-error.value-spaces")),
  });
};

export type AddVariableData = z.infer<ReturnType<typeof createAddVariableSchema>>;
