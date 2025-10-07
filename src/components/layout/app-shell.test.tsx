import { JSX } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";

vi.mock("../../lib/ui/sonner", () => ({
  Toaster: (): JSX.Element => <div data-testid="toaster">toaster</div>,
}));

vi.mock("./header", () => ({
  __esModule: true as const,
  default: (): JSX.Element => <header data-testid="header">header</header>,
}));

vi.mock("./footer", () => ({
  __esModule: true as const,
  default: (): JSX.Element => <footer data-testid="footer">footer</footer>,
}));

import AppShell from "./app-shell";

describe("app-shell", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders Header, main with children, Toaster, and Footer", () => {
    render(
      <AppShell>
        <div data-testid="content">content</div>
      </AppShell>
    );

    const header = screen.getByTestId("header");
    const main =
      screen.getByRole("main", { hidden: true }) ?? screen.getByTestId("content").closest("main");
    const toaster = screen.getByTestId("toaster");
    const footer = screen.getByTestId("footer");

    expect(header).toBeInTheDocument();
    expect(main).toBeInTheDocument();
    expect(toaster).toBeInTheDocument();
    expect(footer).toBeInTheDocument();

    const content = screen.getByTestId("content");
    expect(within(main as HTMLElement).getByTestId("content")).toBe(content);
  });

  it("applies expected Tailwind classes to root container and main element", () => {
    const { container } = render(<AppShell>ok</AppShell>);

    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveClass("flex", "min-h-dvh", "flex-col", "bg-gray-900", "text-white");

    const main = root.querySelector("main") as HTMLElement;
    expect(main).toHaveClass("flex", "flex-col", "flex-1", "bg-gray-900");
  });

  it("renders children in correct order: header → main → toaster → footer", () => {
    const { container } = render(<AppShell>ok</AppShell>);

    const root = container.firstElementChild as HTMLElement;
    const children = Array.from(root.children).map((el) => el.tagName.toLowerCase());

    expect(children[0]).toBe("header");
    expect(children[1]).toBe("main");

    const third = root.children[2] as HTMLElement;
    expect(third).toHaveAttribute("data-testid", "toaster");

    expect(children[3]).toBe("footer");
  });
});
