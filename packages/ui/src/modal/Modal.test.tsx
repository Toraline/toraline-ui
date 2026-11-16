// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, useState } from "react";
import type { ReactNode } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, test, vi } from "vitest";
import { Modal, modalSizes } from "./index";
import type { ModalProps } from "./index";

afterEach(cleanup);

/** A page with a button that opens the Modal, as an app does it. */
function Page({
  children = (
    <>
      <input aria-label="Name" />
      <button>Save</button>
    </>
  ),
  ...modalProps
}: Partial<ModalProps> & { children?: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <button onClick={() => setIsOpen(true)}>New client</button>
      <button>Another button of the page</button>
      {isOpen ? (
        <Modal title="New client" onClose={() => setIsOpen(false)} {...modalProps}>
          {children}
        </Modal>
      ) : null}
    </>
  );
}

const getOpener = () => screen.getByRole("button", { name: "New client" });
const getDialog = () => screen.getByRole("dialog", { name: "New client" });
const queryDialog = () => screen.queryByRole("dialog");

async function openModal() {
  const user = userEvent.setup();
  await user.click(getOpener());
  return user;
}

describe("Modal", () => {
  test("is a dialog with its title as its name, rendered in <body>", () => {
    render(
      <Modal title="New client" onClose={() => undefined}>
        The form
      </Modal>,
    );
    const dialog = getDialog();
    expect(dialog.getAttribute("aria-modal")).toBe("true");
    expect(dialog.textContent).toContain("The form");
    expect(screen.getByRole("heading", { level: 2, name: "New client" })).toBeDefined();
    expect(dialog.parentElement?.parentElement).toBe(document.body);
    expect(dialog.parentElement?.getAttribute("data-slot")).toBe("backdrop");
  });

  test("has the sizes of the app Intraweb, and lg when the size is missing", () => {
    expect(modalSizes).toEqual(["md", "lg", "xl", "full"]);
    render(
      <Modal title="New client" onClose={() => undefined}>
        The form
      </Modal>,
    );
    expect(getDialog().getAttribute("data-size")).toBe("lg");
    expect(getDialog().className.split(" ")).toContain("max-w-2xl");
  });

  test.each([
    ["md", "max-w-lg"],
    ["lg", "max-w-2xl"],
    ["xl", "max-w-4xl"],
    ["full", "max-w-6xl"],
  ] as const)('has the size "%s": the class "%s"', (size, widthClass) => {
    render(
      <Modal title="New client" size={size} onClose={() => undefined}>
        The form
      </Modal>,
    );
    expect(getDialog().getAttribute("data-size")).toBe(size);
    expect(getDialog().className.split(" ")).toContain(widthClass);
  });

  test("when it opens, the focus goes to the dialog", async () => {
    render(<Page />);
    await openModal();
    expect(document.activeElement).toBe(getDialog());
  });

  test("when it opens, the focus goes to the element with data-overlay-autofocus when there is one", async () => {
    render(
      <Page>
        <button>Delete</button>
        <button data-overlay-autofocus="">Cancel</button>
      </Page>,
    );
    await openModal();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Cancel" }));
  });

  test("the keyboard: Tab stays inside the dialog and goes around", async () => {
    render(<Page />);
    const user = await openModal();
    const close = screen.getByRole("button", { name: "Close" });
    const name = screen.getByRole("textbox", { name: "Name" });
    const save = screen.getByRole("button", { name: "Save" });

    await user.tab();
    expect(document.activeElement).toBe(close);
    await user.tab();
    expect(document.activeElement).toBe(name);
    await user.tab();
    expect(document.activeElement).toBe(save);
    // After the last element comes the first, not the page behind.
    await user.tab();
    expect(document.activeElement).toBe(close);
  });

  test("the keyboard: Shift+Tab stays inside the dialog and goes around", async () => {
    render(<Page />);
    const user = await openModal();
    const close = screen.getByRole("button", { name: "Close" });
    const save = screen.getByRole("button", { name: "Save" });

    // From the dialog itself, right after it opened.
    await user.tab({ shift: true });
    expect(document.activeElement).toBe(save);
    await user.tab({ shift: true });
    await user.tab({ shift: true });
    expect(document.activeElement).toBe(close);
    await user.tab({ shift: true });
    expect(document.activeElement).toBe(save);
  });

  test("the keyboard: Tab skips a disabled element and an element with tabindex -1", async () => {
    render(
      <Page>
        <button disabled>Disabled</button>
        <button tabIndex={-1}>Not in the Tab order</button>
        <a href="/help">Help</a>
      </Page>,
    );
    const user = await openModal();
    await user.tab();
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("link", { name: "Help" }));
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Close" }));
  });

  test("the focus that lands on the page behind is brought back to the dialog", async () => {
    render(<Page />);
    const user = await openModal();
    screen.getByRole("button", { name: "Another button of the page" }).focus();
    expect(document.activeElement).toBe(getDialog());

    // After a click on the dark layer the focus is on no element: Tab goes into the dialog.
    (document.activeElement as HTMLElement).blur();
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Close" }));
  });

  test("the keyboard: Escape closes the dialog and gives the focus back to the button that opened it", async () => {
    render(<Page />);
    const user = await openModal();
    await user.tab();
    await user.keyboard("{Escape}");
    expect(queryDialog()).toBeNull();
    expect(document.activeElement).toBe(getOpener());
  });

  test("the button with the cross closes the dialog and gives the focus back", async () => {
    render(<Page />);
    const user = await openModal();
    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(queryDialog()).toBeNull();
    expect(document.activeElement).toBe(getOpener());
  });

  test("closeLabel is the name of the button with the cross", async () => {
    render(<Page closeLabel="Fechar" />);
    await openModal();
    expect(screen.getByRole("button", { name: "Fechar" })).toBeDefined();
  });

  test("Escape closes only the newest of two open dialogs", async () => {
    const user = userEvent.setup();
    const onCloseFirst = vi.fn();
    const onCloseSecond = vi.fn();
    const { rerender } = render(
      <Modal title="Product" onClose={onCloseFirst}>
        The product
      </Modal>,
    );
    rerender(
      <>
        <Modal title="Product" onClose={onCloseFirst}>
          The product
        </Modal>
        <Modal title="Recipe" onClose={onCloseSecond}>
          The recipe
        </Modal>
      </>,
    );
    expect(document.activeElement).toBe(screen.getByRole("dialog", { name: "Recipe" }));

    await user.keyboard("{Escape}");
    expect(onCloseSecond).toHaveBeenCalledTimes(1);
    expect(onCloseFirst).not.toHaveBeenCalled();

    rerender(
      <Modal title="Product" onClose={onCloseFirst}>
        The product
      </Modal>,
    );
    // The focus is back in the first dialog, where it was.
    expect(document.activeElement).toBe(screen.getByRole("dialog", { name: "Product" }));
    await user.keyboard("{Escape}");
    expect(onCloseFirst).toHaveBeenCalledTimes(1);
  });

  test("a click on the dark layer closes the dialog; a click inside does not", async () => {
    render(<Page />);
    const user = await openModal();
    await user.click(screen.getByRole("textbox", { name: "Name" }));
    expect(queryDialog()).not.toBeNull();

    await user.click(getDialog().parentElement as HTMLElement);
    expect(queryDialog()).toBeNull();
  });

  test("a press that starts inside the dialog and ends on the dark layer does not close it", async () => {
    render(<Page />);
    await openModal();
    const backdrop = getDialog().parentElement as HTMLElement;
    // A person selects text in the field and lets go outside the dialog.
    fireEvent.mouseDown(screen.getByRole("textbox", { name: "Name" }));
    fireEvent.click(backdrop);
    expect(queryDialog()).not.toBeNull();
  });

  test("the page behind does not scroll while the dialog is open", async () => {
    document.body.style.overflow = "auto";
    render(<Page />);
    const user = await openModal();
    expect(document.body.style.overflow).toBe("hidden");
    await user.keyboard("{Escape}");
    expect(document.body.style.overflow).toBe("auto");
    document.body.style.overflow = "";
  });

  test("actions are shown next to the title, before the button that closes", async () => {
    render(<Page actions={<a href="/clients/new">Open the full page</a>} />);
    await openModal();
    const actions = getDialog().querySelector('[data-slot="actions"]') as HTMLElement;
    expect(actions.firstElementChild).toBe(screen.getByRole("link", { name: "Open the full page" }));
    expect(actions.lastElementChild).toBe(screen.getByRole("button", { name: "Close" }));
  });

  test("the inner parts have data-slot", async () => {
    render(<Page />);
    await openModal();
    const slots = Array.from(getDialog().querySelectorAll("[data-slot]")).map((element) =>
      element.getAttribute("data-slot"),
    );
    expect(slots).toEqual(["handle", "header", "title", "actions", "body"]);
    expect(getDialog().querySelector('[data-slot="handle"]')?.getAttribute("aria-hidden")).toBe("true");
  });

  test("puts the app's className on the dialog, after the library's classes", async () => {
    render(<Page className="max-w-md rounded-none" />);
    await openModal();
    const classes = getDialog().className.split(" ");
    expect(classes.slice(-2)).toEqual(["max-w-md", "rounded-none"]);
    expect(classes).not.toContain("max-w-2xl");
    expect(classes).toContain("bg-surface");
  });

  test("passes other attributes to the dialog, and ref points to it", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Modal title="New client" onClose={() => undefined} ref={ref} data-testid="modal" aria-describedby="help">
        The form
      </Modal>,
    );
    expect(ref.current).toBe(screen.getByTestId("modal"));
    expect(ref.current).toBe(getDialog());
    expect(getDialog().getAttribute("aria-describedby")).toBe("help");
  });

  test("renders nothing on the server: the dialog needs <body>", () => {
    expect(
      renderToString(
        <Modal title="New client" onClose={() => undefined}>
          The form
        </Modal>,
      ),
    ).toBe("");
  });
});
