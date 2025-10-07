import { describe, it, expect } from "vitest";
import { parseError } from "./parse-error";

describe("parseError", () => {
  it("returns the message when error is an instance of Error", () => {
    const err = new Error("boom");
    expect(parseError(err)).toBe("boom");
  });

  it("extracts message from custom Error subclasses", () => {
    class CustomError extends Error {
      constructor() {
        super("custom error happened");
      }
    }
    const err = new CustomError();
    expect(parseError(err)).toBe("custom error happened");
  });

  it("returns fallback message for string values", () => {
    expect(parseError("fail")).toBe("Something went wrong");
  });

  it("returns fallback message for number values", () => {
    expect(parseError(123)).toBe("Something went wrong");
  });

  it("returns fallback message for null or undefined", () => {
    expect(parseError(null)).toBe("Something went wrong");
    expect(parseError(undefined)).toBe("Something went wrong");
  });

  it("returns fallback message for plain objects", () => {
    expect(parseError({ msg: "x" })).toBe("Something went wrong");
  });
});
