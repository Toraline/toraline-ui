// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, test } from "vitest";
import { Panel } from "./index";

afterEach(cleanup);

describe("Panel", () => {
  test("is a <section> with the look of a card, and shows its content", () => {
    const { container } = render(
      <Panel>
        <p>The data of the client.</p>
      </Panel>,
    );
    const panel = container.firstElementChild as HTMLElement;
    expect(panel.tagName).toBe("SECTION");
    expect(panel.className.split(" ")).toEqual(
      expect.arrayContaining([
        "scroll-mt-6",
        "space-y-4",
        "rounded-lg",
        "bg-surface",
        "p-4",
        "shadow-card",
        "md:rounded-xl",
        "md:p-6",
      ]),
    );
    expect(screen.getByText("The data of the client.").parentElement).toBe(panel);
  });

  test("empty: with no title and no actions it has no header", () => {
    const { container } = render(<Panel>Content</Panel>);
    expect(container.querySelector('[data-slot="header"]')).toBeNull();
    expect(screen.queryByRole("heading")).toBeNull();
  });

  test("title: a heading of level 2 at the top of the card", () => {
    render(<Panel title="Contract">Content</Panel>);
    const title = screen.getByRole("heading", { level: 2, name: "Contract" });
    expect(title.getAttribute("data-slot")).toBe("title");
    expect(title.className.split(" ")).toEqual(
      expect.arrayContaining(["font-heading", "text-lg/7", "font-medium", "text-primary"]),
    );
    const header = title.closest('[data-slot="header"]') as HTMLElement;
    expect(header.nextSibling?.textContent).toBe("Content");
  });

  test("subtitle: a quiet line under the title", () => {
    render(
      <Panel title="Contract" subtitle="Signed in March">
        Content
      </Panel>,
    );
    const subtitle = screen.getByText("Signed in March");
    expect(subtitle.tagName).toBe("P");
    expect(subtitle.getAttribute("data-slot")).toBe("subtitle");
    expect(subtitle.className.split(" ")).toEqual(expect.arrayContaining(["text-sm/5", "text-tertiary"]));
    expect(subtitle.previousElementSibling).toBe(screen.getByRole("heading", { name: "Contract" }));
  });

  test("a subtitle with no title is not shown", () => {
    render(<Panel subtitle="Signed in March">Content</Panel>);
    expect(screen.queryByText("Signed in March")).toBeNull();
  });

  test("actions: the buttons are after the title, in the header", () => {
    render(
      <Panel title="Contract" actions={<button type="button">Edit</button>}>
        Content
      </Panel>,
    );
    const actions = screen.getByRole("button", { name: "Edit" }).parentElement as HTMLElement;
    expect(actions.getAttribute("data-slot")).toBe("actions");
    const header = actions.parentElement as HTMLElement;
    expect(header.getAttribute("data-slot")).toBe("header");
    expect(header.firstElementChild?.getAttribute("data-slot")).toBe("titles");
    expect(header.lastElementChild).toBe(actions);
    expect(header.className.split(" ")).toEqual(
      expect.arrayContaining(["flex", "flex-wrap", "items-start", "justify-between", "gap-3"]),
    );
  });

  test("actions with no title: an empty element keeps the actions on the right", () => {
    render(<Panel actions={<button type="button">Edit</button>}>Content</Panel>);
    const header = screen.getByRole("button", { name: "Edit" }).parentElement?.parentElement as HTMLElement;
    expect(header.children).toHaveLength(2);
    expect(header.firstElementChild?.tagName).toBe("SPAN");
    expect(header.firstElementChild?.textContent).toBe("");
    expect(screen.queryByRole("heading")).toBeNull();
  });

  test("the title and the subtitle can be elements", () => {
    render(
      <Panel title={<em>Contract</em>} subtitle={<a href="/contract">Open the contract</a>}>
        Content
      </Panel>,
    );
    expect(screen.getByRole("heading", { name: "Contract" })).toBeDefined();
    expect(screen.getByRole("link", { name: "Open the contract" })).toBeDefined();
  });

  test("keyboard: the card does not get the focus; the focus goes to what is inside it", () => {
    const { container } = render(
      <Panel title="Contract" actions={<button type="button">Edit</button>}>
        <a href="/contract">Open</a>
      </Panel>,
    );
    expect((container.firstElementChild as HTMLElement).tabIndex).toBe(-1);
  });

  test("id: the card is the target of a link", () => {
    const { container } = render(<Panel id="contract">Content</Panel>);
    expect(container.querySelector("#contract")).toBe(container.firstElementChild);
  });

  test("adds the app's className after the library's classes", () => {
    const { container } = render(<Panel className="mt-4 p-0">Content</Panel>);
    const classes = (container.firstElementChild as HTMLElement).className.split(" ");
    expect(classes.slice(-2)).toEqual(["mt-4", "p-0"]);
    expect(classes).not.toContain("p-4");
    // A class with a breakpoint is another condition, so it stays.
    expect(classes).toContain("md:p-6");
    expect(classes).toContain("bg-surface");
  });

  test("passes other attributes to the <section>, and ref points to it", () => {
    const ref = createRef<HTMLElement>();
    render(
      <Panel ref={ref} aria-label="Contract of the client" data-testid="panel">
        Content
      </Panel>,
    );
    const panel = screen.getByRole("region", { name: "Contract of the client" });
    expect(panel.getAttribute("data-testid")).toBe("panel");
    expect(ref.current).toBe(panel);
  });

  test("renders on the server", () => {
    expect(renderToString(<Panel title="Contract">Content</Panel>)).toMatch(
      /^<section class="[^"]+"><div class="[^"]+" data-slot="header"><div class="[^"]+" data-slot="titles"><h2 class="[^"]+" data-slot="title">Contract<\/h2><\/div><\/div>Content<\/section>$/,
    );
  });
});
