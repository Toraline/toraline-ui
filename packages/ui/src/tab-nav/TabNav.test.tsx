// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import type { ComponentProps } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, test, vi } from "vitest";
import { TabNav, tabNavVariants } from "./index";

afterEach(cleanup);

const items = [
  { href: "/sales", label: "Overview", exact: true },
  { href: "/sales/orders", label: "Orders" },
  { href: "/sales/clients", label: "Clients" },
];

/** A link component of an app, like the Link of "next/link": it renders an <a> and marks it. */
function AppLink(props: ComponentProps<"a">) {
  return <a {...props} data-app-link="true" />;
}

describe("TabNav", () => {
  test("is a navigation region with a name, and one link for each tab", () => {
    render(<TabNav items={items} currentPath="/sales" aria-label="Sales" />);
    const nav = screen.getByRole("navigation", { name: "Sales" });
    expect(nav.tagName).toBe("NAV");
    expect(nav.getAttribute("data-variant")).toBe("primary");
    const links = screen.getAllByRole("link");
    expect(links.map((link) => link.textContent)).toEqual(["Overview", "Orders", "Clients"]);
    expect(links.map((link) => link.getAttribute("href"))).toEqual([
      "/sales",
      "/sales/orders",
      "/sales/clients",
    ]);
    expect(links.every((link) => link.getAttribute("data-slot") === "link")).toBe(true);
    // The tabs are links to pages, so they do not have the roles of in-page tabs.
    expect(screen.queryByRole("tablist")).toBeNull();
    expect(screen.queryByRole("tab")).toBeNull();
  });

  test("the types refuse a TabNav with no aria-label", () => {
    // @ts-expect-error "aria-label" is required.
    const withoutName = <TabNav items={items} currentPath="/sales" />;
    expect(withoutName).toBeDefined();
  });

  test('has the two looks of the app Intraweb: "primary" and "secondary"', () => {
    expect(tabNavVariants).toEqual(["primary", "secondary"]);
  });

  test.each(tabNavVariants)('has the variant "%s", and announces the current tab', (variant) => {
    render(<TabNav items={items} currentPath="/sales/orders" aria-label="Sales" variant={variant} />);
    expect(screen.getByRole("navigation").getAttribute("data-variant")).toBe(variant);
    expect(screen.getByRole("link", { name: "Orders" }).getAttribute("aria-current")).toBe("page");
    expect(screen.getByRole("link", { name: "Overview" }).hasAttribute("aria-current")).toBe(false);
    expect(screen.getByRole("link", { name: "Clients" }).hasAttribute("aria-current")).toBe(false);
  });

  test('"primary" is a row with a line, and the current tab has the brand color', () => {
    render(<TabNav items={items} currentPath="/sales" aria-label="Sales" />);
    expect(screen.getByRole("navigation").className.split(" ")).toEqual(
      expect.arrayContaining(["border-b", "border-default"]),
    );
    expect(screen.getByRole("link", { name: "Overview" }).className.split(" ")).toEqual(
      expect.arrayContaining(["h-11", "aria-[current=page]:border-brand", "aria-[current=page]:text-brand"]),
    );
  });

  test('"secondary" is the segmented look, and the current tab is a raised piece', () => {
    render(<TabNav items={items} currentPath="/sales" aria-label="Sales" variant="secondary" />);
    expect(screen.getByRole("navigation").className.split(" ")).toEqual(
      expect.arrayContaining(["bg-muted", "p-1"]),
    );
    expect(screen.getByRole("link", { name: "Overview" }).className.split(" ")).toEqual(
      expect.arrayContaining([
        "aria-[current=page]:bg-surface",
        "aria-[current=page]:text-primary",
        "aria-[current=page]:shadow-sm",
      ]),
    );
  });

  test("a tab is the current one on its own route and on the routes under it", () => {
    render(<TabNav items={items} currentPath="/sales/orders/12" aria-label="Sales" />);
    expect(screen.getByRole("link", { name: "Orders" }).getAttribute("aria-current")).toBe("page");
    // "Overview" has exact: its route is the start of the others.
    expect(screen.getByRole("link", { name: "Overview" }).hasAttribute("aria-current")).toBe(false);
  });

  test("a route that only starts with the same letters is not under the tab", () => {
    render(<TabNav items={items} currentPath="/sales/orders-archive" aria-label="Sales" />);
    expect(screen.getByRole("link", { name: "Orders" }).hasAttribute("aria-current")).toBe(false);
  });

  test("no tab is the current one on another route", () => {
    render(<TabNav items={items} currentPath="/stock" aria-label="Sales" />);
    expect(screen.getAllByRole("link").some((link) => link.hasAttribute("aria-current"))).toBe(false);
  });

  test("with no item it renders nothing", () => {
    const { container } = render(<TabNav items={[]} currentPath="/sales" aria-label="Sales" />);
    expect(container.innerHTML).toBe("");
  });

  test("linkComponent: the app's link component renders each link", () => {
    render(
      <TabNav items={items} currentPath="/sales/clients" aria-label="Sales" linkComponent={AppLink} />,
    );
    const links = screen.getAllByRole("link");
    expect(links.every((link) => link.getAttribute("data-app-link") === "true")).toBe(true);
    expect(screen.getByRole("link", { name: "Clients" }).getAttribute("aria-current")).toBe("page");
    expect(screen.getByRole("link", { name: "Clients" }).getAttribute("href")).toBe("/sales/clients");
  });

  test("adds the app's className after the library's classes", () => {
    render(<TabNav items={items} currentPath="/sales" aria-label="Sales" className="mt-4 gap-4" />);
    const classes = screen.getByRole("navigation").className.split(" ");
    expect(classes.slice(-2)).toEqual(["mt-4", "gap-4"]);
    expect(classes).not.toContain("gap-1");
  });

  test("passes other attributes to the <nav>, and ref points to it", () => {
    const ref = createRef<HTMLElement>();
    render(<TabNav ref={ref} items={items} currentPath="/sales" aria-label="Sales" id="sales-tabs" />);
    const nav = screen.getByRole("navigation");
    expect(ref.current).toBe(nav);
    expect(nav.id).toBe("sales-tabs");
  });

  test("the Tab key goes through the links, and the Enter key follows one", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn((event: { preventDefault: () => void }) => event.preventDefault());
    render(
      <TabNav
        items={items}
        currentPath="/sales"
        aria-label="Sales"
        linkComponent={(props: ComponentProps<"a">) => <a {...props} onClick={onClick} />}
      />,
    );
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("link", { name: "Overview" }));
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("link", { name: "Orders" }));
    await user.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test("renders on the server", () => {
    const html = renderToString(<TabNav items={items} currentPath="/sales/orders" aria-label="Sales" />);
    expect(html).toMatch(/^<nav [^>]*aria-label="Sales"/);
    expect(html).toMatch(/<a href="\/sales\/orders"[^>]*aria-current="page"/);
  });
});
