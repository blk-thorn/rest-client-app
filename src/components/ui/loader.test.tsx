import React from "react";
import { describe, it, vi, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Loader from "@/components/ui/loader";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      loader: "Loading...",
    };
    return translations[key] ?? key;
  },
}));

describe("Loader", () => {
  it("renders all wave bars and loader text", () => {
    const { container } = render(<Loader />);

    const bars = container.querySelectorAll(".animate-wave");
    expect(bars.length).toBe(5);

    expect(bars[1].className).toContain("delay-100");
    expect(bars[2].className).toContain("delay-200");
    expect(bars[3].className).toContain("delay-300");
    expect(bars[4].className).toContain("delay-400");

    const loaderText = screen.getByText("Loading...");
    expect(loaderText).toBeDefined();
  });
});
