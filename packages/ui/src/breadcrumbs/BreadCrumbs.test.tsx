// @vitest-environment jsdom
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import type { ComponentProps } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, test } from "vitest";
import { BreadCrumbs } from "./index";
import type { Crumb } from "./index";

afterEach(cleanup);

const crumbs: Crumb[] = [
  { label: "Clients", href: "/clients" },
  { label: "Orders", href: "/clients/orders" },
  { label: "Fernando Dias", href: "/clients/orders/12" },
];

describe("BreadCrumbs", () => {
  test("is a navigation region named Breadcrumb, with an ordered list of the steps", () => {
    render(<BreadCrumbs crumbs={crumbs} />);
    const nav = screen.getByRole("navigation", { name: "Breadcrumb" });
    expect(nav.tagName).toBe("NAV");

    const list = within(nav).getByRole("list");
    expect(list.tagName).toBe("OL");
    expect(within(list).getAllByRole("listitem")).toHaveLength(3);
  });

  test("every step before the last is a link to its page", () => {
    render(<BreadCrumbs crumbs={crumbs} />);
    const links = screen.getAllByRole("link");
    expect(links.map((link) => link.textContent)).toEqual(["Clients", "Orders"]);
    expect(links.map((link) => link.getAttribute("href"))).toEqual(["/clients", "/clients/orders"]);
    expect(links.every((link) => !link.hasAttribute("aria-current"))).toBe(true);
  });

  test("the last step is the current page: text, not a link, marked for a screen reader", () => {
    render(<BreadCrumbs crumbs={crumbs} />);
    const current = screen.getByText("Fernando Dias");
    expect(current.tagName).toBe("SPAN");
    expect(current.getAttribute("aria-current")).toBe("page");
    expect(current.getAttribute("data-slot")).toBe("current");
    expect(screen.queryByRole("link", { name: "Fernando Dias" })).toBeNull();
  });

  test("the separators are hidden from a screen reader, and there is none after the current page", () => {
    const { container } = render(<BreadCrumbs crumbs={crumbs} />);
    const separators = [...container.querySelectorAll('[data-slot="separator"]')];
    expect(separators).toHaveLength(2);
    expect(separators.every((separator) => separator.getAttribute("aria-hidden") === "true")).toBe(
      true,
    );
    expect(container.querySelector('li:last-child [data-slot="separator"]')).toBeNull();
  });

  test("with one step, that step is the current page", () => {
    render(<BreadCrumbs crumbs={[{ label: "Clients", href: "/clients" }]} />);
    expect(screen.getByText("Clients").getAttribute("aria-current")).toBe("page");
    expect(screen.queryByRole("link")).toBeNull();
  });

  test("a step with no href is text", () => {
    render(<BreadCrumbs crumbs={[{ label: "Clients" }, { label: "Orders", href: "/orders" }]} />);
    const step = screen.getByText("Clients");
    expect(step.tagName).toBe("SPAN");
    expect(step.hasAttribute("aria-current")).toBe(false);
  });

  test("the keyboard: Tab goes through the links, and not to the current page", async () => {
    const user = userEvent.setup();
    render(<BreadCrumbs crumbs={crumbs} />);
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("link", { name: "Clients" }));
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("link", { name: "Orders" }));
    await user.tab();
    expect(document.activeElement).toBe(document.body);
  });

  test("linkComponent renders the links with the app's link component", () => {
    function AppLink({ href, ...anchorProps }: ComponentProps<"a">) {
      return <a {...anchorProps} href={`/app${href}`} data-app-link="" />;
    }
    render(<BreadCrumbs crumbs={crumbs} linkComponent={AppLink} />);
    const link = screen.getByRole("link", { name: "Clients" });
    expect(link.getAttribute("href")).toBe("/app/clients");
    expect(link.hasAttribute("data-app-link")).toBe(true);
    // The app's link component receives the classes of the library's link.
    expect(link.getAttribute("data-slot")).toBe("link");
    expect(link.className.split(" ")).toContain("hover:underline");
  });

  test("puts the app's className on the <nav>, after the library's classes", () => {
    render(<BreadCrumbs crumbs={crumbs} className="mt-4 font-heading" />);
    const classes = screen.getByRole("navigation").className.split(" ");
    expect(classes.slice(-2)).toEqual(["mt-4", "font-heading"]);
    // The app's "font-heading" replaces the library's "font-body".
    expect(classes).not.toContain("font-body");
  });

  test("passes other attributes to the <nav>, the app can change its name, and ref points to it", () => {
    const ref = createRef<HTMLElement>();
    render(<BreadCrumbs ref={ref} crumbs={crumbs} aria-label="You are here" id="path" />);
    const nav = screen.getByRole("navigation", { name: "You are here" });
    expect(ref.current).toBe(nav);
    expect(nav.id).toBe("path");
  });

  test("renders on the server", () => {
    const html = renderToString(<BreadCrumbs crumbs={crumbs} />);
    expect(html).toMatch(/<nav aria-label="Breadcrumb" class="[^"]+">/);
    expect(html).toContain('aria-current="page"');
  });
});
