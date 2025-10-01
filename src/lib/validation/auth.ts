import { z } from "zod";

export const signUpSchema = z
  .object({
    email: z
      .string()
      .min(1, "Email is required")
      .refine((val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(val), {
        message: "Invalid email format",
      }),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Za-z]/u, "Password must contain at least one letter")
      .regex(/\d/u, "Password must contain at least one digit")
      .regex(
        /[!@#$%^&*()_\-+=[\]{};':"\\|,.<>/?`~]/u,
        "Password must contain at least one special character"
      ),
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type SignUpData = z.infer<typeof signUpSchema>;
