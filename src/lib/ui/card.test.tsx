import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
} from "./card";

describe("Card components", () => {
  it("renders Card with default classes and data-slot", () => {
    render(<Card>Content</Card>);
    const card = screen.getByText("Content");
    expect(card).toBeInTheDocument();
    expect(card.dataset.slot).toBe("card");
    expect(card.className).toContain("bg-card");
    expect(card.className).toContain("rounded-xl");
  });

  it("renders CardHeader with data-slot and classes", () => {
    render(<CardHeader>Header</CardHeader>);
    const header = screen.getByText("Header");
    expect(header).toBeInTheDocument();
    expect(header.dataset.slot).toBe("card-header");
    expect(header.className).toContain("grid");
  });

  it("renders CardTitle", () => {
    render(<CardTitle>Title</CardTitle>);
    const title = screen.getByText("Title");
    expect(title).toBeInTheDocument();
    expect(title.dataset.slot).toBe("card-title");
    expect(title.className).toContain("font-semibold");
  });

  it("renders CardDescription", () => {
    render(<CardDescription>Description</CardDescription>);
    const desc = screen.getByText("Description");
    expect(desc).toBeInTheDocument();
    expect(desc.dataset.slot).toBe("card-description");
    expect(desc.className).toContain("text-muted-foreground");
  });

  it("renders CardAction", () => {
    render(<CardAction>Action</CardAction>);
    const action = screen.getByText("Action");
    expect(action).toBeInTheDocument();
    expect(action.dataset.slot).toBe("card-action");
    expect(action.className).toContain("col-start-2");
  });

  it("renders CardContent", () => {
    render(<CardContent>ContentArea</CardContent>);
    const content = screen.getByText("ContentArea");
    expect(content).toBeInTheDocument();
    expect(content.dataset.slot).toBe("card-content");
    expect(content.className).toContain("px-6");
  });

  it("renders CardFooter", () => {
    render(<CardFooter>Footer</CardFooter>);
    const footer = screen.getByText("Footer");
    expect(footer).toBeInTheDocument();
    expect(footer.dataset.slot).toBe("card-footer");
    expect(footer.className).toContain("flex");
  });

  it("applies custom className to Card", () => {
    render(<Card className="custom-class">Styled</Card>);
    const card = screen.getByText("Styled");
    expect(card.className).toContain("custom-class");
  });

  it("forwards extra props to Card", () => {
    render(<Card id="test-card">PropTest</Card>);
    const card = screen.getByText("PropTest");
    expect(card).toHaveAttribute("id", "test-card");
  });
});
