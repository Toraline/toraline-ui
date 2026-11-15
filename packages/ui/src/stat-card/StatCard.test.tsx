// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, test } from "vitest";
import { StatCard, statCardTones } from "./index";

afterEach(cleanup);

/** A small icon component, with the props an icon of "lucide-react" accepts. */
function CartIcon(props: { className?: string; "aria-hidden"?: boolean | "true" | "false" }) {
  return (
    <svg {...props} data-testid="icon" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="8" />
    </svg>
  );
}

describe("StatCard", () => {
  test("is a <section> with the label as a heading of level 3 and the number", () => {
    const { container } = render(<StatCard label="Sales" value="R$ 1.200" />);
    const card = container.firstElementChild as HTMLElement;
    expect(card.tagName).toBe("SECTION");
    expect(card.getAttribute("data-tone")).toBe("default");
    expect(card.className.split(" ")).toEqual(
      expect.arrayContaining([
        "flex",
        "flex-col",
        "gap-3",
        "rounded-lg",
        "p-4",
        "shadow-card",
        "md:rounded-xl",
        "md:p-5",
        "bg-surface",
      ]),
    );
    const label = screen.getByRole("heading", { level: 3, name: "Sales" });
    expect(label.className.split(" ")).toEqual(
      expect.arrayContaining(["text-sm/5", "font-medium", "text-secondary"]),
    );
    const value = screen.getByText("R$ 1.200");
    expect(value.tagName).toBe("P");
    expect(value.className.split(" ")).toEqual(
      expect.arrayContaining([
        "font-heading",
        "text-2xl/8",
        "font-semibold",
        "text-primary",
        "tabular-nums",
        "md:text-3xl/10",
      ]),
    );
    // No icon and no trend: the card has only the header and the number.
    expect(card.children).toHaveLength(2);
    expect(card.querySelector('[data-slot="icon"]')).toBeNull();
    expect(card.querySelector('[data-slot="trend"]')).toBeNull();
  });

  test("has the 2 tones of Intraweb, and default is the default", () => {
    expect(statCardTones).toEqual(["default", "tinted"]);
  });

  test.each([
    ["default", "bg-surface", "bg-primary-subtle"],
    ["tinted", "bg-primary-subtle", "bg-surface"],
  ] as const)('the tone "%s": the card is %s and the box of the icon is %s', (tone, cardBackground, iconBackground) => {
    const { container } = render(<StatCard label="Sales" value={42} tone={tone} icon={CartIcon} />);
    const card = container.firstElementChild as HTMLElement;
    expect(card.getAttribute("data-tone")).toBe(tone);
    expect(card.className.split(" ")).toContain(cardBackground);
    expect(card.className.split(" ")).not.toContain(iconBackground);
    const iconBox = card.querySelector('[data-slot="icon"]') as HTMLElement;
    expect(iconBox.className.split(" ")).toEqual(
      expect.arrayContaining(["size-10", "shrink-0", "rounded-[10px]", iconBackground]),
    );
  });

  test("icon: the icon is before the label, and a screen reader skips it", () => {
    render(<StatCard label="Sales" value={42} icon={CartIcon} />);
    const icon = screen.getByTestId("icon");
    expect(icon.getAttribute("aria-hidden")).toBe("true");
    expect(icon.getAttribute("class")?.split(" ")).toEqual(["size-5", "text-icon-brand"]);
    expect(icon.parentElement?.nextElementSibling).toBe(screen.getByRole("heading", { name: "Sales" }));
  });

  test("the number can be a number or an element", () => {
    render(
      <>
        <StatCard label="Orders" value={42} />
        <StatCard label="Clients" value={<span data-testid="clients">7</span>} />
      </>,
    );
    expect(screen.getByText("42").getAttribute("data-slot")).toBe("value");
    expect(screen.getByTestId("clients").parentElement?.getAttribute("data-slot")).toBe("value");
  });

  test("trend up: the sign +, the value and what it is compared with, in green", () => {
    render(
      <StatCard label="Sales" value="R$ 1.200" trend={{ direction: "up", value: "12%", comparison: "vs. last month" }} />,
    );
    const trendValue = screen.getByText("+12%");
    expect(trendValue.getAttribute("data-direction")).toBe("up");
    expect(trendValue.getAttribute("data-meaning")).toBe("good");
    expect(trendValue.className.split(" ")).toEqual(expect.arrayContaining(["font-medium", "text-success"]));
    const icon = trendValue.querySelector('[data-slot="trend-icon"]') as SVGElement;
    expect(icon.getAttribute("aria-hidden")).toBe("true");
    const comparison = screen.getByText("vs. last month");
    expect(comparison.className).toBe("text-tertiary");
    expect(comparison.parentElement).toBe(trendValue.parentElement);
  });

  test("trend down: the minus sign, in red", () => {
    render(<StatCard label="Sales" value="R$ 1.200" trend={{ direction: "down", value: "8%" }} />);
    const trendValue = screen.getByText("−8%");
    expect(trendValue.getAttribute("data-direction")).toBe("down");
    expect(trendValue.getAttribute("data-meaning")).toBe("bad");
    expect(trendValue.className.split(" ")).toContain("text-danger");
    // No comparison: only the value.
    expect(trendValue.parentElement?.children).toHaveLength(1);
  });

  test("upIsGood false: a number that grows is bad, and a number that falls is good", () => {
    render(
      <>
        <StatCard label="Costs" value="R$ 300" trend={{ direction: "up", value: "5%", upIsGood: false }} />
        <StatCard label="Late orders" value={2} trend={{ direction: "down", value: "3", upIsGood: false }} />
      </>,
    );
    expect(screen.getByText("+5%").getAttribute("data-meaning")).toBe("bad");
    expect(screen.getByText("+5%").className.split(" ")).toContain("text-danger");
    expect(screen.getByText("−3").getAttribute("data-meaning")).toBe("good");
    expect(screen.getByText("−3").className.split(" ")).toContain("text-success");
  });

  test("the arrow points up or down with the direction", () => {
    render(
      <>
        <StatCard label="Sales" value={1} trend={{ direction: "up", value: "1%" }} />
        <StatCard label="Costs" value={1} trend={{ direction: "down", value: "2%" }} />
      </>,
    );
    const upPath = screen.getByText("+1%").querySelector("path")?.getAttribute("d");
    const downPath = screen.getByText("−2%").querySelector("path")?.getAttribute("d");
    expect(upPath).toBe("M16 7h6v6");
    expect(downPath).toBe("M16 17h6v-6");
  });

  test("it cannot get the focus", () => {
    const { container } = render(<StatCard label="Sales" value={42} />);
    expect((container.firstElementChild as HTMLElement).tabIndex).toBe(-1);
  });

  test("adds the app's className after the library's classes", () => {
    const { container } = render(<StatCard label="Sales" value={42} className="col-span-2 bg-subtle" />);
    const classes = (container.firstElementChild as HTMLElement).className.split(" ");
    expect(classes.slice(-2)).toEqual(["col-span-2", "bg-subtle"]);
    expect(classes).not.toContain("bg-surface");
    expect(classes).toContain("shadow-card");
  });

  test("passes other attributes to the <section>, and ref points to it", () => {
    const ref = createRef<HTMLElement>();
    const { container } = render(<StatCard ref={ref} label="Sales" value={42} id="sales" />);
    const card = container.firstElementChild as HTMLElement;
    expect(card.id).toBe("sales");
    expect(ref.current).toBe(card);
  });

  test("renders on the server, with an icon component given by a Server Component", () => {
    const html = renderToString(
      <StatCard label="Sales" value="R$ 1.200" tone="tinted" icon={CartIcon} trend={{ direction: "up", value: "12%" }} />,
    );
    expect(html).toMatch(/^<section class="[^"]+" data-tone="tinted">/);
    expect(html).toContain('data-slot="label">Sales</h3>');
    expect(html).toContain('data-slot="value">R$ 1.200</p>');
    expect(html).toContain("12%</span>");
  });
});
