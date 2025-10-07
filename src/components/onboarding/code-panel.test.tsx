import React from "react";
import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

const State = vi.hoisted(() => ({ calls: 0 }));

vi.mock("@/lib/utils/generate-code", () => ({
  generateCodeSnippets: () => {
    State.calls += 1;
    if (State.calls === 1) return { error: "Not enough details to generate code" };
    return { Go: "GO_CODE PLACE", Java: "JAVA_CODE" };
  },
}));

vi.mock("@/lib/ui/tabs", () => {
  const Tabs = (p: { children: React.ReactNode }) => <div data-testid="tabs">{p.children}</div>;
  const TabsList = (p: { children: React.ReactNode }) => (
    <div data-testid="tabs-list">{p.children}</div>
  );
  const TabsTrigger = (p: { value: string; children: React.ReactNode }) => (
    <button type="button" data-testid={`tab-${p.value}`}>
      {p.children}
    </button>
  );
  const TabsContent = (p: { value: string; children: React.ReactNode }) => (
    <div data-testid={`content-${p.value}`}>{p.children}</div>
  );
  return { Tabs, TabsList, TabsTrigger, TabsContent };
});

vi.mock("next-intl", () => ({
  useTranslations: (ns?: string) => (k: string) =>
    (({ "Client.code.copy": "Copy" }) as Record<string, string>)[`${ns}.${k}`] ?? k,
}));

vi.mock("@/lib/hooks/use-variable", () => ({
  useVariable: () => ({ replaceWithValue: (s: string) => s.replace(/PLACE/g, "REPLACED") }),
}));

import CodePanel from "./code-panel";

beforeEach(() => {
  Object.assign(navigator, {
    clipboard: { writeText: vi.fn<(_t: string) => Promise<void>>().mockResolvedValue() },
  });
});

describe("CodePanel", () => {
  it("displays error message when generateCodeSnippets returns an { error } object", () => {
    render(<CodePanel method="GET" url="" headers={[]} body="" />);
    expect(screen.getByText("Not enough details to generate code")).toBeInTheDocument();
    expect(screen.queryByTestId("tabs-list")).toBeNull();
  });

  it("renders language tabs, applies variable substitution to displayed code, and copies original (unsubstituted) code to clipboard", async () => {
    render(<CodePanel method="POST" url="https://api.example.dev" headers={[]} body='{"a":1}' />);

    expect(await screen.findByTestId("tabs-list")).toBeInTheDocument();
    expect(screen.getByTestId("tab-Go")).toBeInTheDocument();
    expect(screen.getByTestId("tab-Java")).toBeInTheDocument();

    const goContent = screen.getByTestId("content-Go");
    expect(goContent.textContent).toContain("GO_CODE REPLACED");

    const copyBtn = screen.getAllByRole("button", { name: "Copy" })[0];
    fireEvent.click(copyBtn);
    expect((navigator.clipboard.writeText as unknown as Mock).mock.calls[0]?.[0]).toContain(
      "GO_CODE PLACE"
    );
  });
});
