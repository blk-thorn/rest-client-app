import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./tabs";

describe("Tabs components", () => {
  it("renders Tabs root with data-slot", () => {
    const { container } = render(<Tabs />);
    const tabs = container.querySelector("[data-slot='tabs']");
    expect(tabs).toBeInTheDocument();
  });

  it("renders TabsList inside Tabs with custom className", () => {
    const { container } = render(
      <Tabs>
        <TabsList className="custom-list" />
      </Tabs>
    );
    const list = container.querySelector("[data-slot='tabs-list']");
    expect(list).toBeInTheDocument();
    expect(list?.className).toContain("custom-list");
  });

  it("renders TabsTrigger inside TabsList with children and custom className", () => {
    const { container } = render(
      <Tabs>
        <TabsList>
          <TabsTrigger className="custom-trigger" value={""}>
            Tab 1
          </TabsTrigger>
        </TabsList>
      </Tabs>
    );
    const trigger = container.querySelector("[data-slot='tabs-trigger']");
    expect(trigger).toBeInTheDocument();
    expect(trigger?.className).toContain("custom-trigger");
    expect(trigger?.textContent).toBe("Tab 1");
  });

  it("renders TabsContent inside Tabs with children and custom className", () => {
    const { container } = render(
      <Tabs>
        <TabsContent className="custom-content" value={""}>
          Content 1
        </TabsContent>
      </Tabs>
    );
    const content = container.querySelector("[data-slot='tabs-content']");
    expect(content).toBeInTheDocument();
    expect(content?.className).toContain("custom-content");
    expect(content?.textContent).toBe("Content 1");
  });

  it("renders a full Tabs structure", () => {
    const { container } = render(
      <Tabs>
        <TabsList>
          <TabsTrigger value={""}>Tab A</TabsTrigger>
          <TabsTrigger value={""}>Tab B</TabsTrigger>
        </TabsList>
        <TabsContent value={""}>Content A</TabsContent>
        <TabsContent value={""}>Content B</TabsContent>
      </Tabs>
    );

    const tabs = container.querySelector("[data-slot='tabs']");
    const firstTrigger = container.querySelector("[data-slot='tabs-trigger']");
    const firstContent = container.querySelector("[data-slot='tabs-content']");

    expect(tabs).toBeInTheDocument();
    expect(firstTrigger?.textContent).toBe("Tab A");
    expect(firstContent?.textContent).toBe("Content A");
  });
});
