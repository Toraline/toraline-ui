// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import type { ComponentProps } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, test, vi } from "vitest";
import { Button, ButtonLink, buttonSizes, buttonVariants } from "./index";

afterEach(cleanup);

/** A small icon component, with the props an icon of "lucide-react" accepts. */
function PlusIcon(props: { className?: string; "aria-hidden"?: boolean | "true" | "false" }) {
  return (
    <svg {...props} data-testid="icon" viewBox="0 0 24 24">
      <path d="M5 12h14M12 5v14" />
    </svg>
  );
}

/**
 * A link component of an app, like the Link of "next/link": it renders an <a>,
 * and has one prop of its own ("prefetch") that must not reach the <a>.
 */
function AppLink({ prefetch, ...anchorProps }: ComponentProps<"a"> & { prefetch?: boolean }) {
  return <a {...anchorProps} data-app-link={String(prefetch ?? "auto")} />;
}

describe("ButtonLink", () => {
  test("is a real link with its text as the accessible name", () => {
    render(<ButtonLink href="/orders/new">New order</ButtonLink>);
    const link = screen.getByRole("link", { name: "New order" });
    expect(link.tagName).toBe("A");
    expect(link.getAttribute("href")).toBe("/orders/new");
    expect(link.getAttribute("data-variant")).toBe("primary");
    expect(link.getAttribute("data-size")).toBe("md");
  });

  test.each(buttonVariants)('has the variant "%s"', (variant) => {
    render(
      <ButtonLink href="/orders" variant={variant}>
        Orders
      </ButtonLink>,
    );
    expect(screen.getByRole("link").getAttribute("data-variant")).toBe(variant);
  });

  test.each(buttonSizes)('has the size "%s"', (size) => {
    render(
      <ButtonLink href="/orders" size={size}>
        Orders
      </ButtonLink>,
    );
    expect(screen.getByRole("link").getAttribute("data-size")).toBe(size);
  });

  test.each(buttonVariants)('has the classes of the Button with the variant "%s"', (variant) => {
    render(
      <>
        <Button variant={variant} size="lg">
          Orders
        </Button>
        <ButtonLink href="/orders" variant={variant} size="lg">
          Orders
        </ButtonLink>
      </>,
    );
    expect(screen.getByRole("link").className).toBe(screen.getByRole("button").className);
  });

  test("icon: the icon is before the text, and a screen reader skips it", () => {
    render(
      <ButtonLink href="/orders/new" icon={PlusIcon}>
        New order
      </ButtonLink>,
    );
    const link = screen.getByRole("link", { name: "New order" });
    const icon = screen.getByTestId("icon");
    expect(link.firstElementChild).toBe(icon);
    expect(icon.getAttribute("aria-hidden")).toBe("true");
    expect(icon.getAttribute("class")).toBe("size-4 shrink-0");
  });

  test("linkComponent: the app's link component renders the link, with its own props", () => {
    render(
      <ButtonLink linkComponent={AppLink} href="/orders" prefetch={false} variant="secondary">
        Orders
      </ButtonLink>,
    );
    const link = screen.getByRole("link", { name: "Orders" });
    expect(link.getAttribute("data-app-link")).toBe("false");
    expect(link.getAttribute("href")).toBe("/orders");
    expect(link.getAttribute("data-variant")).toBe("secondary");
    expect(link.className.split(" ")).toContain("bg-surface");
  });

  test("adds the app's className after the library's classes", () => {
    render(
      <ButtonLink href="/orders" className="mt-4 rounded-full">
        Orders
      </ButtonLink>,
    );
    const classes = screen.getByRole("link").className.split(" ");
    expect(classes.slice(-2)).toEqual(["mt-4", "rounded-full"]);
    expect(classes).not.toContain("rounded-md");
    expect(classes).toContain("bg-primary");
  });

  test("passes other attributes to the <a>, and ref points to it", () => {
    const ref = createRef<HTMLAnchorElement>();
    render(
      <ButtonLink ref={ref} href="https://example.com" target="_blank" rel="noreferrer">
        Site
      </ButtonLink>,
    );
    const link = screen.getByRole("link");
    expect(ref.current).toBe(link);
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toBe("noreferrer");
  });

  test("the Tab key moves the focus to it, and the Enter key follows it", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn((event: { preventDefault: () => void }) => event.preventDefault());
    render(
      <ButtonLink href="/orders" onClick={onClick}>
        Orders
      </ButtonLink>,
    );
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("link"));
    await user.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test("renders on the server", () => {
    const html = renderToString(
      <ButtonLink href="/orders" icon={PlusIcon}>
        Orders
      </ButtonLink>,
    );
    expect(html).toMatch(/^<a [^>]*href="\/orders"/);
    expect(html).toContain('data-testid="icon"');
  });
});
