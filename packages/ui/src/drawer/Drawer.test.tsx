// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, useState } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, test, vi } from "vitest";
import { Modal } from "../modal/index";
import { Drawer } from "./index";
import type { DrawerProps } from "./index";

afterEach(cleanup);

/** A page with a list and a button that opens the Drawer, as an app does it. */
function Page(drawerProps: Partial<DrawerProps>) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <button onClick={() => setIsOpen(true)}>Order 12</button>
      <button>Order 13</button>
      {isOpen ? (
        <Drawer
          title="Order 12"
          onClose={() => setIsOpen(false)}
          footer={<button>Save</button>}
          {...drawerProps}
        >
          <input aria-label="Client" />
        </Drawer>
      ) : null}
    </>
  );
}

const getOpener = () => screen.getByRole("button", { name: "Order 12" });
const getDrawer = () => screen.getByRole("dialog", { name: "Order 12" });
const queryDrawer = () => screen.queryByRole("dialog");

async function openDrawer() {
  const user = userEvent.setup();
  await user.click(getOpener());
  return user;
}

describe("Drawer", () => {
  test("is a dialog that leaves the page usable, with its title as its name, rendered in <body>", async () => {
    render(<Page />);
    await openDrawer();
    const drawer = getDrawer();
    expect(drawer.getAttribute("aria-modal")).toBe("false");
    expect(drawer.parentElement).toBe(document.body);
    expect(screen.getByRole("heading", { level: 2, name: "Order 12" })).toBeDefined();
  });

  test("the parts: the header, the content that scrolls, and the footer at the bottom", async () => {
    render(<Page />);
    await openDrawer();
    const slots = Array.from(getDrawer().children).map((element) => element.getAttribute("data-slot"));
    expect(slots).toEqual(["header", "body", "footer"]);
    const footer = getDrawer().querySelector('[data-slot="footer"]') as HTMLElement;
    expect(footer.contains(screen.getByRole("button", { name: "Save" }))).toBe(true);
    const body = getDrawer().querySelector('[data-slot="body"]') as HTMLElement;
    expect(body.className.split(" ")).toContain("overflow-y-auto");
    expect(body.contains(screen.getByRole("textbox", { name: "Client" }))).toBe(true);
  });

  test("without a footer, the panel has no footer element", async () => {
    render(<Page footer={undefined} />);
    await openDrawer();
    expect(getDrawer().querySelector('[data-slot="footer"]')).toBeNull();
  });

  test("is 512 pixels wide at most, and 896 pixels with wide", async () => {
    const { unmount } = render(<Page />);
    await openDrawer();
    expect(getDrawer().className.split(" ")).toContain("md:max-w-lg");
    expect(getDrawer().getAttribute("data-wide")).toBe("false");
    unmount();

    render(<Page wide />);
    await openDrawer();
    expect(getDrawer().className.split(" ")).toContain("md:max-w-4xl");
    expect(getDrawer().className.split(" ")).not.toContain("md:max-w-lg");
    expect(getDrawer().getAttribute("data-wide")).toBe("true");
  });

  test("while it is open, <body> says so, for the CSS of the app", async () => {
    const { unmount } = render(<Page />);
    const user = await openDrawer();
    expect(document.body.getAttribute("data-drawer-open")).toBe("narrow");
    await user.keyboard("{Escape}");
    expect(document.body.hasAttribute("data-drawer-open")).toBe(false);
    unmount();

    render(<Page wide />);
    await openDrawer();
    expect(document.body.getAttribute("data-drawer-open")).toBe("wide");
  });

  test("when it opens, the focus goes to the panel", async () => {
    render(<Page />);
    await openDrawer();
    expect(document.activeElement).toBe(getDrawer());
  });

  test("when it opens, the focus goes to the element with data-overlay-autofocus when there is one", async () => {
    render(<Page footer={<button data-overlay-autofocus="">Save</button>} />);
    await openDrawer();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Save" }));
  });

  test("the keyboard: Tab stays inside the panel and goes around, header, content, footer", async () => {
    render(<Page />);
    const user = await openDrawer();
    const close = screen.getByRole("button", { name: "Close" });
    const client = screen.getByRole("textbox", { name: "Client" });
    const save = screen.getByRole("button", { name: "Save" });

    await user.tab();
    expect(document.activeElement).toBe(close);
    await user.tab();
    expect(document.activeElement).toBe(client);
    await user.tab();
    expect(document.activeElement).toBe(save);
    // After the last element comes the first, not the page next to the panel.
    await user.tab();
    expect(document.activeElement).toBe(close);
  });

  test("the keyboard: Shift+Tab stays inside the panel and goes around", async () => {
    render(<Page />);
    const user = await openDrawer();
    await user.tab({ shift: true });
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Save" }));
    await user.tab({ shift: true });
    await user.tab({ shift: true });
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Close" }));
    await user.tab({ shift: true });
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Save" }));
  });

  test("content with only text is in the Tab order, so the keyboard can scroll it", async () => {
    const user = userEvent.setup();
    render(
      <Drawer title="Order 12" onClose={() => undefined}>
        A long text
      </Drawer>,
    );
    const body = getDrawer().querySelector('[data-slot="body"]') as HTMLElement;
    expect(body.getAttribute("tabindex")).toBe("0");
    await user.tab();
    await user.tab();
    expect(document.activeElement).toBe(body);
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Close" }));
  });

  test("content with a field or a button is not in the Tab order itself", async () => {
    render(<Page />);
    await openDrawer();
    const body = getDrawer().querySelector('[data-slot="body"]') as HTMLElement;
    expect(body.hasAttribute("tabindex")).toBe(false);
  });

  test("the page next to the panel can still be clicked, and keeps the focus it gets", async () => {
    render(<Page />);
    const user = await openDrawer();
    const other = screen.getByRole("button", { name: "Order 13" });
    await user.click(other);
    expect(document.activeElement).toBe(other);
    expect(queryDrawer()).not.toBeNull();
  });

  test("the keyboard: Escape closes the panel and gives the focus back to the button that opened it", async () => {
    render(<Page />);
    const user = await openDrawer();
    await user.tab();
    await user.tab();
    await user.keyboard("{Escape}");
    expect(queryDrawer()).toBeNull();
    expect(document.activeElement).toBe(getOpener());
  });

  test("the button with the cross closes the panel and gives the focus back", async () => {
    render(<Page closeLabel="Fechar" />);
    const user = await openDrawer();
    await user.click(screen.getByRole("button", { name: "Fechar" }));
    expect(queryDrawer()).toBeNull();
    expect(document.activeElement).toBe(getOpener());
  });

  test("Escape closes a Modal that is open above the Drawer first, then the Drawer", async () => {
    const user = userEvent.setup();
    const onCloseDrawer = vi.fn();
    const onCloseModal = vi.fn();
    const drawer = (
      <Drawer title="Product" onClose={onCloseDrawer}>
        The product
      </Drawer>
    );
    const { rerender } = render(drawer);
    rerender(
      <>
        {drawer}
        <Modal title="Recipe" onClose={onCloseModal}>
          The recipe
        </Modal>
      </>,
    );
    await user.keyboard("{Escape}");
    expect(onCloseModal).toHaveBeenCalledTimes(1);
    expect(onCloseDrawer).not.toHaveBeenCalled();

    rerender(drawer);
    expect(document.activeElement).toBe(screen.getByRole("dialog", { name: "Product" }));
    await user.keyboard("{Escape}");
    expect(onCloseDrawer).toHaveBeenCalledTimes(1);
  });

  test("actions are shown next to the title, before the button that closes", async () => {
    render(<Page actions={<a href="/orders/12">Open the full page</a>} />);
    await openDrawer();
    const actions = getDrawer().querySelector('[data-slot="actions"]') as HTMLElement;
    expect(actions.firstElementChild).toBe(screen.getByRole("link", { name: "Open the full page" }));
    expect(actions.lastElementChild).toBe(screen.getByRole("button", { name: "Close" }));
  });

  test("puts the app's className on the panel, after the library's classes", async () => {
    render(<Page className="md:max-w-xl shadow-lg" />);
    await openDrawer();
    const classes = getDrawer().className.split(" ");
    expect(classes.slice(-2)).toEqual(["md:max-w-xl", "shadow-lg"]);
    expect(classes).not.toContain("md:max-w-lg");
    expect(classes).not.toContain("shadow-2xl");
    expect(classes).toContain("bg-surface");
  });

  test("passes other attributes to the panel, and ref points to it", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Drawer title="Order 12" onClose={() => undefined} ref={ref} data-testid="drawer">
        The order
      </Drawer>,
    );
    expect(ref.current).toBe(screen.getByTestId("drawer"));
    expect(ref.current).toBe(getDrawer());
  });

  test("renders nothing on the server: the panel needs <body>", () => {
    expect(
      renderToString(
        <Drawer title="Order 12" onClose={() => undefined}>
          The order
        </Drawer>,
      ),
    ).toBe("");
  });
});
