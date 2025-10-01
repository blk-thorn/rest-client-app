import React from "react";
import { describe, it, vi, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Logo from "@/components/ui/Logo";
import { ROUTES } from "@/constants/routes";

vi.mock("next/link", () => ({
  __esModule: true,
  default: ({
    children,
    ...props
  }: { children: React.ReactNode } & React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a {...props}>{children}</a>
  ),
}));

describe("Logo", () => {
  it("renders a link with the correct href and contains an SVG with proper classes", () => {
    render(<Logo />);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", ROUTES.HOME);

    expect(link.className).toContain("font-bold");
    expect(link.className).toContain("text-lg");
    expect(link.className).toContain("hover:opacity-80");
    expect(link.className).toContain("transition");

    const svg = link.querySelector("svg");
    expect(svg).toBeDefined();

    expect(svg?.classList.contains("hover:opacity-80")).toBe(true);
    expect(svg?.classList.contains("transition")).toBe(true);
  });
});
