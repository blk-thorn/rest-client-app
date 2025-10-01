import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from "./table";

describe("Table components", () => {
  it("renders Table container and table element", () => {
    render(
      <Table>
        <tbody />
      </Table>
    );
    const container = screen.getByRole("table").parentElement;
    const table = screen.getByRole("table");

    expect(container).toHaveAttribute("data-slot", "table-container");
    expect(container).toHaveClass("relative w-full overflow-x-auto");

    expect(table).toHaveAttribute("data-slot", "table");
    expect(table).toHaveClass("w-full caption-bottom text-sm");
  });

  it("renders TableHeader", () => {
    render(
      <table>
        <TableHeader>
          <tr />
        </TableHeader>
      </table>
    );
    const header = screen.getByRole("rowgroup", { name: "" });
    expect(header.dataset.slot).toBe("table-header");
    expect(header.className).toContain("border-b");
  });

  it("renders TableBody", () => {
    render(
      <table>
        <TableBody>
          <tr />
        </TableBody>
      </table>
    );
    const body = screen.getByRole("rowgroup", { name: "" });
    expect(body.dataset.slot).toBe("table-body");
    expect(body.className).toContain("border-0");
  });

  it("renders TableFooter", () => {
    render(
      <table>
        <TableFooter>
          <tr />
        </TableFooter>
      </table>
    );
    const footer = screen.getByRole("rowgroup", { name: "" });
    expect(footer.dataset.slot).toBe("table-footer");
    expect(footer.className).toContain("bg-muted/50");
  });

  it("renders TableRow", () => {
    render(
      <table>
        <tbody>
          <TableRow>Row</TableRow>
        </tbody>
      </table>
    );
    const row = screen.getByText("Row");
    expect(row.dataset.slot).toBe("table-row");
    expect(row.className).toContain("hover:bg-muted/50");
  });

  it("renders TableHead", () => {
    render(
      <table>
        <thead>
          <tr>
            <TableHead>Head</TableHead>
          </tr>
        </thead>
      </table>
    );
    const head = screen.getByText("Head");
    expect(head.dataset.slot).toBe("table-head");
    expect(head.className).toContain("text-foreground");
  });

  it("renders TableCell", () => {
    render(
      <table>
        <tbody>
          <tr>
            <TableCell>Cell</TableCell>
          </tr>
        </tbody>
      </table>
    );
    const cell = screen.getByText("Cell");
    expect(cell.dataset.slot).toBe("table-cell");
    expect(cell.className).toContain("p-2");
  });

  it("renders TableCaption", () => {
    render(
      <table>
        <TableCaption>Caption</TableCaption>
      </table>
    );
    const caption = screen.getByText("Caption");
    expect(caption.dataset.slot).toBe("table-caption");
    expect(caption.className).toContain("text-muted-foreground");
  });

  it("forwards custom className", () => {
    render(
      <Table className="custom-class">
        <tbody />
      </Table>
    );
    const table = screen.getByRole("table");
    expect(table.className).toContain("custom-class");
  });

  it("forwards extra props", () => {
    render(
      <Table id="table-test" aria-label="test-table">
        <tbody />
      </Table>
    );
    const table = screen.getByRole("table");
    expect(table).toHaveAttribute("id", "table-test");
    expect(table).toHaveAttribute("aria-label", "test-table");
  });
});
