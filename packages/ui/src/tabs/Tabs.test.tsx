// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, useState } from "react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { Tabs } from "./index";
import type { TabItem } from "./index";

afterEach(cleanup);

const tabs: TabItem[] = [
  { id: "all", label: "All", content: <p>Every order</p> },
  { id: "orders", label: "Orders", content: <p>Open orders</p> },
  { id: "support", label: "Support", content: <p>Support requests</p> },
];

const getTab = (name: string) => screen.getByRole("tab", { name });
const selectedTabName = () => screen.getByRole("tab", { selected: true }).textContent;

describe("Tabs", () => {
  test("renders a row of tabs and the content of the first tab", () => {
    render(<Tabs tabs={tabs} aria-label="Orders by kind" />);

    expect(screen.getByRole("tablist", { name: "Orders by kind" })).toBeTruthy();
    expect(screen.getAllByRole("tab").map((tab) => tab.textContent)).toEqual([
      "All",
      "Orders",
      "Support",
    ]);
    expect(getTab("All").tagName).toBe("BUTTON");
    expect(getTab("All").getAttribute("type")).toBe("button");
    expect(screen.getByText("Every order")).toBeTruthy();
    expect(screen.queryByText("Open orders")).toBeNull();
  });

  test("tells a screen reader which tab is selected, and links the tab and its content", () => {
    render(<Tabs tabs={tabs} />);

    expect(getTab("All").getAttribute("aria-selected")).toBe("true");
    expect(getTab("Orders").getAttribute("aria-selected")).toBe("false");
    expect(getTab("Support").getAttribute("aria-selected")).toBe("false");

    const panel = screen.getByRole("tabpanel", { name: "All" });
    expect(panel.getAttribute("aria-labelledby")).toBe(getTab("All").id);
    expect(getTab("All").getAttribute("aria-controls")).toBe(panel.id);
    expect(getTab("Orders").hasAttribute("aria-controls")).toBe(false);
    expect(panel.tabIndex).toBe(0);
  });

  test("uncontrolled: defaultValue selects another tab at the start", () => {
    render(<Tabs tabs={tabs} defaultValue="support" />);
    expect(selectedTabName()).toBe("Support");
    expect(screen.getByText("Support requests")).toBeTruthy();
  });

  test("an id that no tab has selects the first tab", () => {
    render(<Tabs tabs={tabs} defaultValue="unknown" />);
    expect(selectedTabName()).toBe("All");
  });

  test("a click selects a tab and shows its content", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Tabs tabs={tabs} onChange={onChange} />);

    await user.click(getTab("Orders"));
    expect(selectedTabName()).toBe("Orders");
    expect(screen.getByRole("tabpanel", { name: "Orders" }).textContent).toBe("Open orders");
    expect(onChange).toHaveBeenCalledExactlyOnceWith("orders");

    await user.click(getTab("Orders"));
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  test("the keyboard: Tab goes to the selected tab, then to the content", async () => {
    const user = userEvent.setup();
    render(<Tabs tabs={tabs} defaultValue="orders" />);

    expect(getTab("All").tabIndex).toBe(-1);
    expect(getTab("Orders").tabIndex).toBe(0);
    expect(getTab("Support").tabIndex).toBe(-1);

    await user.tab();
    expect(document.activeElement).toBe(getTab("Orders"));
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("tabpanel"));
  });

  test("the keyboard: the arrow keys move between tabs and select them, and go around", async () => {
    const user = userEvent.setup();
    render(<Tabs tabs={tabs} />);
    await user.tab();

    await user.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(getTab("Orders"));
    expect(selectedTabName()).toBe("Orders");
    expect(screen.getByText("Open orders")).toBeTruthy();

    await user.keyboard("{ArrowRight}");
    expect(selectedTabName()).toBe("Support");

    await user.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(getTab("All"));
    expect(selectedTabName()).toBe("All");

    await user.keyboard("{ArrowLeft}");
    expect(document.activeElement).toBe(getTab("Support"));
    expect(selectedTabName()).toBe("Support");

    await user.keyboard("{ArrowLeft}");
    expect(selectedTabName()).toBe("Orders");
  });

  test("the keyboard: Home selects the first tab and End the last", async () => {
    const user = userEvent.setup();
    render(<Tabs tabs={tabs} defaultValue="orders" />);
    await user.tab();

    await user.keyboard("{End}");
    expect(document.activeElement).toBe(getTab("Support"));
    expect(selectedTabName()).toBe("Support");

    await user.keyboard("{Home}");
    expect(document.activeElement).toBe(getTab("All"));
    expect(selectedTabName()).toBe("All");
  });

  test("controlled: the app holds the state with value and onChange", async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [value, setValue] = useState("orders");
      return (
        <>
          <Tabs tabs={tabs} value={value} onChange={setValue} />
          <button onClick={() => setValue("all")}>Back to all</button>
        </>
      );
    }
    render(<Controlled />);
    expect(selectedTabName()).toBe("Orders");

    await user.click(getTab("Support"));
    expect(selectedTabName()).toBe("Support");

    await user.click(screen.getByText("Back to all"));
    expect(selectedTabName()).toBe("All");
  });

  test("with value and no change from the app, the selected tab stays", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Tabs tabs={tabs} value="all" onChange={onChange} />);
    await user.click(getTab("Orders"));
    expect(onChange).toHaveBeenCalledWith("orders");
    expect(selectedTabName()).toBe("All");
  });

  test("puts the app's className on the outermost element, after the library's classes", () => {
    const { container } = render(<Tabs tabs={tabs} className="mt-4" />);
    const classes = container.firstElementChild?.className.split(" ") ?? [];
    expect(classes.at(-1)).toBe("mt-4");
    expect(classes).toContain("font-body");
  });

  test("passes other attributes to the outermost <div>, and ref points to it", () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(<Tabs ref={ref} tabs={tabs} id="order-tabs" data-kind="orders" />);
    const root = container.firstElementChild as HTMLElement;
    expect(ref.current).toBe(root);
    expect(root.id).toBe("order-tabs");
    expect(root.getAttribute("data-kind")).toBe("orders");
  });

  test("with an empty list, it renders the row and no content", () => {
    render(<Tabs tabs={[]} />);
    expect(screen.getByRole("tablist")).toBeTruthy();
    expect(screen.queryByRole("tabpanel")).toBeNull();
  });

  test("has the segmented look: a track, and the selected tab is a raised piece", () => {
    render(<Tabs tabs={tabs} />);
    expect(screen.getByRole("tablist").className.split(" ")).toEqual(
      expect.arrayContaining(["inline-flex", "bg-muted", "p-1"]),
    );
    expect(getTab("All").className.split(" ")).toEqual(
      expect.arrayContaining([
        "text-secondary",
        "aria-selected:bg-surface",
        "aria-selected:text-primary",
        "aria-selected:shadow-sm",
      ]),
    );
  });

  test("tabs with no content: no panel, and the app reads the selected tab from value", async () => {
    const user = userEvent.setup();
    const modes = [
      { id: "write", label: "Write" },
      { id: "preview", label: "Preview" },
    ] as const;
    function Editor() {
      // The type of the state is the ids of the tabs: "write" | "preview".
      const [mode, setMode] = useState<(typeof modes)[number]["id"]>("write");
      return (
        <>
          <Tabs tabs={modes} value={mode} onChange={setMode} aria-label="Mode" />
          <p>Current mode: {mode}</p>
        </>
      );
    }
    render(<Editor />);
    expect(screen.queryByRole("tabpanel")).toBeNull();
    expect(getTab("Write").hasAttribute("aria-controls")).toBe(false);

    await user.click(getTab("Preview"));
    expect(screen.getByText("Current mode: preview")).toBeTruthy();
    await user.keyboard("{ArrowLeft}");
    expect(screen.getByText("Current mode: write")).toBeTruthy();
    expect(document.activeElement).toBe(getTab("Write"));
  });
});
