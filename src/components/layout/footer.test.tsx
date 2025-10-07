import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/image", () => ({
  __esModule: true as const,
  default: (props: { alt: string; src: string }) => (
    <div data-testid="next-image" data-src={props.src} data-alt={props.alt} />
  ),
}));
vi.mock("next/link", () => ({
  __esModule: true as const,
  default: (props: { href: string; children: React.ReactNode }) => (
    <a href={props.href} data-testid="next-link">
      {props.children}
    </a>
  ),
}));

import Footer from "./footer";

describe("Footer", () => {
  it("renders footer with GitHub link, current year, and RS School logo", () => {
    render(<Footer />);

    const githubLink = screen.getByRole("link", { name: /github/i });
    expect(githubLink).toHaveAttribute(
      "href",
      "https://github.com/Belifegor/rest-client-app/tree/develop"
    );
    expect(githubLink).toHaveAttribute("target", "_blank");
    expect(githubLink).toHaveAttribute("rel", "noopener noreferrer");

    const year = new Date().getFullYear().toString();
    expect(screen.getByText(year)).toBeInTheDocument();

    const rsLink = screen.getByTestId("next-link");
    expect(rsLink).toHaveAttribute("href", "https://rs.school/courses/reactjs");

    const img = screen.getByTestId("next-image");
    expect(img).toHaveAttribute("data-src", "/rsschool-logo.svg");
    expect(img).toHaveAttribute("data-alt", "RS School Logo");
  });

  it("applies correct Tailwind base classes to footer and inner container", () => {
    const { container } = render(<Footer />);
    const footer = container.querySelector("footer") as HTMLElement;
    expect(footer).toHaveClass("border-t", "border-gray-700", "bg-gray-900", "py-4");

    const inner = footer.firstElementChild as HTMLElement;
    expect(inner).toHaveClass(
      "container",
      "mx-auto",
      "flex",
      "flex-col",
      "md:flex-row",
      "items-center",
      "justify-between",
      "px-6",
      "gap-2",
      "text-sm",
      "text-gray-400"
    );
  });
});
