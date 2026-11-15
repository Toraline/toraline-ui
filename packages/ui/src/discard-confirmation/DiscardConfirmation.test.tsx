// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, useState } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, test, vi } from "vitest";
import { Drawer } from "../drawer/index";
import { Modal } from "../modal/index";
import { DiscardConfirmation } from "./index";
import type { DiscardConfirmationTexts } from "./index";

afterEach(cleanup);

/** The texts are the app's. These are in Portuguese, to show that none comes from the library. */
const texts: DiscardConfirmationTexts = {
  title: "Descartar alterações?",
  description: "Você digitou algo que ainda não foi salvo.",
  discardLabel: "Descartar",
  keepEditingLabel: "Continuar editando",
};

const getQuestion = () => screen.getByRole("alertdialog", { name: "Descartar alterações?" });
const queryQuestion = () => screen.queryByRole("alertdialog");
const getDiscard = () => screen.getByRole("button", { name: "Descartar" });
const getKeepEditing = () => screen.getByRole("button", { name: "Continuar editando" });

describe("DiscardConfirmation", () => {
  test("is an alert dialog with its title as its name and its text as its description, rendered in <body>", () => {
    render(<DiscardConfirmation {...texts} onDiscard={() => undefined} onKeepEditing={() => undefined} />);
    const question = getQuestion();
    expect(question.getAttribute("aria-modal")).toBe("true");
    const description = document.getElementById(question.getAttribute("aria-describedby") ?? "");
    expect(description?.textContent).toBe("Você digitou algo que ainda não foi salvo.");
    expect(question.parentElement?.parentElement).toBe(document.body);
    // The dark layer counts as part of the open overlays: a click on it is not a click behind a panel.
    expect(question.parentElement?.hasAttribute("data-overlay-panel")).toBe(true);
  });

  test("every text comes from the app: the dialog shows only the 4 texts it was given", () => {
    render(<DiscardConfirmation {...texts} onDiscard={() => undefined} onKeepEditing={() => undefined} />);
    expect(getQuestion().textContent).toBe(
      "Descartar alterações?Você digitou algo que ainda não foi salvo.DescartarContinuar editando",
    );
  });

  test("the types refuse a question with a text missing", () => {
    const withoutTexts = (
      // @ts-expect-error The 4 texts are required.
      <DiscardConfirmation onDiscard={() => undefined} onKeepEditing={() => undefined} />
    );
    expect(withoutTexts).toBeDefined();
  });

  test("the focus goes to the button that keeps editing, and the buttons call their functions", async () => {
    const user = userEvent.setup();
    const onDiscard = vi.fn();
    const onKeepEditing = vi.fn();
    render(<DiscardConfirmation {...texts} onDiscard={onDiscard} onKeepEditing={onKeepEditing} />);
    expect(document.activeElement).toBe(getKeepEditing());
    expect(getDiscard().getAttribute("data-variant")).toBe("danger");

    await user.keyboard("{Enter}");
    expect(onKeepEditing).toHaveBeenCalledTimes(1);
    await user.click(getDiscard());
    expect(onDiscard).toHaveBeenCalledTimes(1);
  });

  test("the keyboard: Tab stays inside the question, and Escape keeps editing", async () => {
    const user = userEvent.setup();
    const onDiscard = vi.fn();
    const onKeepEditing = vi.fn();
    render(
      <>
        <button>A button of the page</button>
        <DiscardConfirmation {...texts} onDiscard={onDiscard} onKeepEditing={onKeepEditing} />
      </>,
    );
    await user.tab();
    expect(document.activeElement).toBe(getDiscard());
    await user.tab();
    expect(document.activeElement).toBe(getKeepEditing());
    await user.tab({ shift: true });
    await user.tab({ shift: true });
    expect(document.activeElement).toBe(getKeepEditing());

    await user.keyboard("{Escape}");
    expect(onKeepEditing).toHaveBeenCalledTimes(1);
    expect(onDiscard).not.toHaveBeenCalled();
  });

  test("a click on the dark layer does nothing: the person must choose", async () => {
    const user = userEvent.setup();
    const onDiscard = vi.fn();
    const onKeepEditing = vi.fn();
    render(<DiscardConfirmation {...texts} onDiscard={onDiscard} onKeepEditing={onKeepEditing} />);
    await user.click(getQuestion().parentElement as HTMLElement);
    expect(onDiscard).not.toHaveBeenCalled();
    expect(onKeepEditing).not.toHaveBeenCalled();
  });

  test("when it closes, the focus goes back to the element that had it", async () => {
    const user = userEvent.setup();
    function Page() {
      const [isAsking, setIsAsking] = useState(false);
      return (
        <>
          <button onClick={() => setIsAsking(true)}>Leave the page</button>
          {isAsking ? (
            <DiscardConfirmation
              {...texts}
              onDiscard={() => setIsAsking(false)}
              onKeepEditing={() => setIsAsking(false)}
            />
          ) : null}
        </>
      );
    }
    render(<Page />);
    await user.click(screen.getByRole("button", { name: "Leave the page" }));
    await user.click(getKeepEditing());
    expect(queryQuestion()).toBeNull();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Leave the page" }));
  });

  test("puts the app's className on the dialog, passes other attributes, and ref points to it", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <DiscardConfirmation
        {...texts}
        ref={ref}
        className="max-w-md"
        data-testid="question"
        onDiscard={() => undefined}
        onKeepEditing={() => undefined}
      />,
    );
    expect(ref.current).toBe(getQuestion());
    expect(ref.current).toBe(screen.getByTestId("question"));
    expect(getQuestion().className.split(" ").at(-1)).toBe("max-w-md");
    expect(getQuestion().className.split(" ")).not.toContain("max-w-sm");
  });

  test("renders nothing on the server: the dialog needs <body>", () => {
    expect(
      renderToString(
        <DiscardConfirmation {...texts} onDiscard={() => undefined} onKeepEditing={() => undefined} />,
      ),
    ).toBe("");
  });
});

/** A Modal or a Drawer with a form, opened by a button, next to a button of the page. */
function Page({ overlay, onPageClick }: { overlay: "modal" | "drawer"; onPageClick?: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const Overlay = overlay === "modal" ? Modal : Drawer;
  return (
    <>
      <button onClick={() => setIsOpen(true)}>New client</button>
      <button onClick={onPageClick}>Another row of the list</button>
      {isOpen ? (
        <Overlay title="New client" discardConfirmation={texts} onClose={() => setIsOpen(false)}>
          <form onSubmit={(event) => event.preventDefault()}>
            <input aria-label="Name" />
            <input aria-label="Search" data-overlay-ignore-dirty="" />
            <button type="submit">Save</button>
          </form>
        </Overlay>
      ) : null}
    </>
  );
}

const getOpener = () => screen.getByRole("button", { name: "New client" });
const queryOverlay = () => screen.queryByRole("dialog", { name: "New client" });

describe.each(["modal", "drawer"] as const)("the question before unsaved changes are lost, in a %s", (overlay) => {
  async function openAndType() {
    const user = userEvent.setup();
    render(<Page overlay={overlay} />);
    await user.click(getOpener());
    await user.type(screen.getByRole("textbox", { name: "Name" }), "Ana");
    return user;
  }

  test("with nothing typed, it closes with no question", async () => {
    const user = userEvent.setup();
    render(<Page overlay={overlay} />);
    await user.click(getOpener());
    await user.keyboard("{Escape}");
    expect(queryQuestion()).toBeNull();
    expect(queryOverlay()).toBeNull();
  });

  test("Escape asks; a second Escape keeps editing, and the focus is back in the field", async () => {
    const user = await openAndType();
    await user.keyboard("{Escape}");
    expect(getQuestion()).toBeDefined();
    expect(queryOverlay()).not.toBeNull();
    expect(document.activeElement).toBe(getKeepEditing());

    await user.keyboard("{Escape}");
    expect(queryQuestion()).toBeNull();
    expect(queryOverlay()).not.toBeNull();
    expect(document.activeElement).toBe(screen.getByRole("textbox", { name: "Name" }));
  });

  test("the button with the cross asks; discard closes, and the focus goes back to the button that opened it", async () => {
    const user = await openAndType();
    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(getQuestion()).toBeDefined();

    await user.click(getDiscard());
    expect(queryQuestion()).toBeNull();
    expect(queryOverlay()).toBeNull();
    expect(document.activeElement).toBe(getOpener());
  });

  test("it does not ask after the form is sent", async () => {
    const user = await openAndType();
    await user.click(screen.getByRole("button", { name: "Save" }));
    await user.keyboard("{Escape}");
    expect(queryQuestion()).toBeNull();
    expect(queryOverlay()).toBeNull();
  });

  test("a field with data-overlay-ignore-dirty does not count as a change", async () => {
    const user = userEvent.setup();
    render(<Page overlay={overlay} />);
    await user.click(getOpener());
    await user.type(screen.getByRole("textbox", { name: "Search" }), "brownie");
    await user.keyboard("{Escape}");
    expect(queryQuestion()).toBeNull();
    expect(queryOverlay()).toBeNull();
  });

  test("without discardConfirmation, it never asks", async () => {
    const user = userEvent.setup();
    const Overlay = overlay === "modal" ? Modal : Drawer;
    const onClose = vi.fn();
    render(
      <Overlay title="New client" onClose={onClose}>
        <input aria-label="Name" />
      </Overlay>,
    );
    await user.type(screen.getByRole("textbox", { name: "Name" }), "Ana");
    await user.keyboard("{Escape}");
    expect(queryQuestion()).toBeNull();
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe("the question before unsaved changes are lost: a click outside", () => {
  test("Modal: a click on the dark layer asks, and discard closes the dialog", async () => {
    const user = userEvent.setup();
    render(<Page overlay="modal" />);
    await user.click(getOpener());
    await user.type(screen.getByRole("textbox", { name: "Name" }), "Ana");

    await user.click(screen.getByRole("dialog", { name: "New client" }).parentElement as HTMLElement);
    expect(getQuestion()).toBeDefined();
    expect(queryOverlay()).not.toBeNull();

    await user.click(getDiscard());
    expect(queryOverlay()).toBeNull();
  });

  test("Drawer: a click on the page is stopped and asks; discard does that click again", async () => {
    const user = userEvent.setup();
    const onPageClick = vi.fn();
    render(<Page overlay="drawer" onPageClick={onPageClick} />);
    await user.click(getOpener());
    await user.type(screen.getByRole("textbox", { name: "Name" }), "Ana");

    await user.click(screen.getByRole("button", { name: "Another row of the list" }));
    expect(onPageClick).not.toHaveBeenCalled();
    expect(getQuestion()).toBeDefined();

    await user.click(getKeepEditing());
    expect(onPageClick).not.toHaveBeenCalled();
    expect(queryOverlay()).not.toBeNull();

    await user.click(screen.getByRole("button", { name: "Another row of the list" }));
    await user.click(getDiscard());
    expect(onPageClick).toHaveBeenCalledTimes(1);
    expect(queryQuestion()).toBeNull();
  });

  test("Drawer: with nothing typed, a click on the page is done at once", async () => {
    const user = userEvent.setup();
    const onPageClick = vi.fn();
    render(<Page overlay="drawer" onPageClick={onPageClick} />);
    await user.click(getOpener());
    await user.click(screen.getByRole("button", { name: "Another row of the list" }));
    expect(onPageClick).toHaveBeenCalledTimes(1);
    expect(queryQuestion()).toBeNull();
  });
});
