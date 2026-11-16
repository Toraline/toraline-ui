// @vitest-environment jsdom
import { act, cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, test, vi } from "vitest";
import { DetailPanel } from "./index";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const fields = [
  { label: "Type", value: "Vacation" },
  { label: "Period", value: "01/11 to 10/11" },
];

describe("DetailPanel", () => {
  test("is a complementary region named by its title, which is a heading of level 2", () => {
    render(<DetailPanel title="Request #12" />);
    const panel = screen.getByRole("complementary", { name: "Request #12" });
    expect(panel.tagName).toBe("ASIDE");
    expect(within(panel).getByRole("heading", { level: 2, name: "Request #12" })).toBeDefined();
  });

  test("the fields are a description list: each name with its value", () => {
    render(<DetailPanel title="Request #12" fields={fields} />);
    const terms = screen.getAllByRole("term");
    const definitions = screen.getAllByRole("definition");
    expect(terms.map((term) => term.textContent)).toEqual(["Type", "Period"]);
    expect(definitions.map((definition) => definition.textContent)).toEqual(["Vacation", "01/11 to 10/11"]);
    expect(terms[0]?.parentElement).toBe(definitions[0]?.parentElement);
  });

  test("the status is shown under the title, and children after the fields", () => {
    render(
      <DetailPanel title="Request #12" status={<span data-testid="status">Open</span>} fields={fields}>
        <p data-testid="note">A note of the manager.</p>
      </DetailPanel>,
    );
    const title = screen.getByRole("heading");
    expect(title.nextElementSibling).toBe(screen.getByTestId("status"));
    const body = screen.getByTestId("note").parentElement as HTMLElement;
    expect(body.getAttribute("data-slot")).toBe("body");
    expect(body.firstElementChild?.tagName).toBe("DL");
  });

  test("with onClose it has a close button, and a press calls it", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<DetailPanel title="Request #12" onClose={onClose} />);
    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("the close button works with the keyboard, and the app gives its name", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<DetailPanel title="Pedido #12" onClose={onClose} closeLabel="Fechar" />);
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Fechar" }));
    await user.keyboard("{Enter}");
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("without onClose it has no close button", () => {
    render(<DetailPanel title="Request #12" />);
    expect(screen.queryByRole("button")).toBeNull();
  });

  test("the footer holds the actions of the record", () => {
    render(<DetailPanel title="Request #12" footer={<button type="button">Approve</button>} />);
    const button = screen.getByRole("button", { name: "Approve" });
    expect(button.parentElement?.getAttribute("data-slot")).toBe("footer");
  });

  test("with only a title it has no list of fields and no footer", () => {
    render(<DetailPanel title="Request #12" fields={[]} />);
    const panel = screen.getByRole("complementary");
    expect(panel.querySelector("dl")).toBeNull();
    expect(panel.querySelector('[data-slot="footer"]')).toBeNull();
    expect(panel.querySelector('[data-slot="body"]')?.childElementCount).toBe(0);
  });

  test("the content cannot get the focus while it fits", () => {
    render(<DetailPanel title="Request #12" fields={fields} />);
    const body = screen.getByRole("complementary").querySelector('[data-slot="body"]') as HTMLElement;
    expect(body.hasAttribute("tabindex")).toBe(false);
  });

  test("while the content is higher than its box, the box can get the focus and has the name of the panel", () => {
    let resized: () => void = () => undefined;
    vi.stubGlobal(
      "ResizeObserver",
      class {
        constructor(callback: () => void) {
          resized = callback;
        }
        observe() {}
        disconnect() {}
      },
    );
    render(<DetailPanel title="Request #12" fields={fields} />);
    const body = screen.getByRole("complementary").querySelector('[data-slot="body"]') as HTMLElement;
    Object.defineProperty(body, "scrollHeight", { configurable: true, value: 900 });
    Object.defineProperty(body, "clientHeight", { configurable: true, value: 200 });
    act(() => resized());
    expect(body.getAttribute("tabindex")).toBe("0");
    expect(screen.getByRole("group", { name: "Request #12" })).toBe(body);
  });

  test("className comes after the library's classes and replaces a class for the same property", () => {
    render(<DetailPanel title="Request #12" className="max-h-96 xl:w-96" />);
    const classes = screen.getByRole("complementary").className.split(" ");
    expect(classes.slice(-2)).toEqual(["max-h-96", "xl:w-96"]);
    expect(classes).not.toContain("xl:w-90");
    expect(classes).toContain("w-full");
  });

  test("another attribute and ref go to the <aside>", () => {
    const ref = createRef<HTMLElement>();
    render(<DetailPanel title="Request #12" ref={ref} id="detail" data-testid="panel" />);
    expect(ref.current).toBe(screen.getByTestId("panel"));
    expect(ref.current?.id).toBe("detail");
  });

  test("renders on the server", () => {
    const html = renderToString(<DetailPanel title="Request #12" fields={fields} />);
    expect(html).toContain("<aside");
    expect(html).toContain("Vacation");
  });
});
