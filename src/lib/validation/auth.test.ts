import { describe, it, expect } from "vitest";
import { signUpSchema, SignUpData } from "@/lib/validation/auth";

describe("signUpSchema", () => {
  const validData: SignUpData = {
    email: "test@example.com",
    password: "Password1!",
    confirmPassword: "Password1!",
  };

  it("validates correct data", () => {
    const result = signUpSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("requires email", () => {
    const result = signUpSchema.safeParse({
      ...validData,
      email: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Email is required");
    }
  });

  it("rejects invalid email format", () => {
    const result = signUpSchema.safeParse({
      ...validData,
      email: "invalid-email",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Invalid email format");
    }
  });

  it("requires password of at least 8 characters", () => {
    const result = signUpSchema.safeParse({
      ...validData,
      password: "A1!",
      confirmPassword: "A1!",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Password must be at least 8 characters");
    }
  });

  it("requires password to contain at least one letter", () => {
    const result = signUpSchema.safeParse({
      ...validData,
      password: "12345678!",
      confirmPassword: "12345678!",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some((e) => e.message === "Password must contain at least one letter")
      ).toBe(true);
    }
  });

  it("requires password to contain at least one digit", () => {
    const result = signUpSchema.safeParse({
      ...validData,
      password: "Password!",
      confirmPassword: "Password!",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some((e) => e.message === "Password must contain at least one digit")
      ).toBe(true);
    }
  });

  it("requires password to contain at least one special character", () => {
    const result = signUpSchema.safeParse({
      ...validData,
      password: "Password1",
      confirmPassword: "Password1",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some(
          (e) => e.message === "Password must contain at least one special character"
        )
      ).toBe(true);
    }
  });

  it("requires confirmPassword", () => {
    const result = signUpSchema.safeParse({
      ...validData,
      confirmPassword: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((e) => e.message === "Confirm password is required")).toBe(
        true
      );
    }
  });

  it("rejects when password and confirmPassword do not match", () => {
    const result = signUpSchema.safeParse({
      ...validData,
      confirmPassword: "Different1!",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((e) => e.message === "Passwords do not match")).toBe(true);
    }
  });
});
