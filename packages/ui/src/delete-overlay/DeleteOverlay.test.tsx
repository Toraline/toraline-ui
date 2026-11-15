// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, useState } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, test, vi } from "vitest";
import { DeleteOverlay } from "./index";
import type { DeleteOverlayProps } from "./index";

afterEach(cleanup);

/** The texts are the app's. These are in Portuguese, to show that none comes from the library. */
const texts = {
  title: "Excluir",
  cancelLabel: "Cancelar",
  deleteLabel: "Excluir",
  pendingLabel: "Excluindo…",
  closeLabel: "Fechar",
};
const question = 'Excluir o produto "Brownie"? Esta ação não pode ser desfeita.';

function renderOverlay(props: Partial<DeleteOverlayProps> = {}) {
  const onDelete = vi.fn();
  const onClose = vi.fn();
  const result = render(
    <DeleteOverlay {...texts} onDelete={onDelete} onClose={onClose} {...props}>
      {question}
    </DeleteOverlay>,
  );
  return { onDelete, onClose, ...result };
}

const getDialog = () => screen.getByRole("dialog");
const getCancel = () => screen.getByRole("button", { name: "Cancelar" });
const getDelete = (name = "Excluir") => screen.getByRole("button", { name });

describe("DeleteOverlay", () => {
  test("is a Modal in the size md, with its title as its name and the question as its content", () => {
    renderOverlay();
    const dialog = screen.getByRole("dialog", { name: "Excluir" });
    expect(dialog.getAttribute("aria-modal")).toBe("true");
    expect(dialog.getAttribute("data-size")).toBe("md");
    expect(dialog.querySelector('[data-slot="question"]')?.textContent).toBe(question);
  });

  test("every text comes from the app: the dialog shows only the texts it was given", () => {
    renderOverlay({ consequence: "Os preços saem junto.", error: "Não foi possível excluir." });
    expect(getDialog().textContent).toBe(
      `Excluir${question}Os preços saem junto.Não foi possível excluir.CancelarExcluir`,
    );
    expect(screen.getByRole("button", { name: "Fechar" })).toBeDefined();
    expect(screen.queryByRole("button", { name: "Close" })).toBeNull();
  });

  test("the types refuse a dialog with a text missing", () => {
    const withoutTexts = (
      // @ts-expect-error title, cancelLabel, deleteLabel and closeLabel are required.
      <DeleteOverlay onDelete={() => undefined} onClose={() => undefined}>
        {question}
      </DeleteOverlay>
    );
    expect(withoutTexts).toBeDefined();
  });

  test("the focus goes to the button that cancels, the safe choice", () => {
    renderOverlay();
    expect(document.activeElement).toBe(getCancel());
    expect(getCancel().getAttribute("data-variant")).toBe("ghost");
    expect(getDelete().getAttribute("data-variant")).toBe("danger");
  });

  test("the keyboard: Tab stays inside the dialog and goes around", async () => {
    const user = userEvent.setup();
    render(
      <>
        <button>A button of the page</button>
        <DeleteOverlay {...texts} onDelete={() => undefined} onClose={() => undefined}>
          {question}
        </DeleteOverlay>
      </>,
    );
    await user.tab();
    expect(document.activeElement).toBe(getDelete());
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Fechar" }));
    await user.tab();
    expect(document.activeElement).toBe(getCancel());
  });

  test("the button that deletes calls onDelete; the button that cancels, the cross and Escape call onClose", async () => {
    const user = userEvent.setup();
    const { onDelete, onClose } = renderOverlay();
    await user.click(getDelete());
    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();

    await user.click(getCancel());
    await user.click(screen.getByRole("button", { name: "Fechar" }));
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(3);
  });

  test("when it closes, the focus goes back to the button that opened it", async () => {
    const user = userEvent.setup();
    function Page() {
      const [isOpen, setIsOpen] = useState(false);
      return (
        <>
          <button onClick={() => setIsOpen(true)}>Delete the product</button>
          {isOpen ? (
            <DeleteOverlay {...texts} onDelete={() => setIsOpen(false)} onClose={() => setIsOpen(false)}>
              {question}
            </DeleteOverlay>
          ) : null}
        </>
      );
    }
    render(<Page />);
    const opener = screen.getByRole("button", { name: "Delete the product" });
    await user.click(opener);
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).toBe(opener);
  });

  test("pending: the button that deletes is busy, shows the pending text, keeps the focus, and a press does nothing", async () => {
    const user = userEvent.setup();
    const { onDelete, rerender, onClose } = renderOverlay();
    getDelete().focus();
    rerender(
      <DeleteOverlay {...texts} pending onDelete={onDelete} onClose={onClose}>
        {question}
      </DeleteOverlay>,
    );
    const button = getDelete("Excluindo…");
    expect(button.getAttribute("aria-busy")).toBe("true");
    expect(document.activeElement).toBe(button);
    await user.click(button);
    expect(onDelete).not.toHaveBeenCalled();
  });

  test("pending with no pendingLabel keeps the text of the button", () => {
    renderOverlay({ pending: true, pendingLabel: undefined });
    expect(getDelete().getAttribute("aria-busy")).toBe("true");
  });

  test("error: the message is an alert, so a screen reader says it", () => {
    renderOverlay({ error: "Não foi possível excluir." });
    expect(screen.getByRole("alert").textContent).toBe("Não foi possível excluir.");
  });

  test("without consequence and error, the dialog has no element for them", () => {
    renderOverlay();
    expect(getDialog().querySelector('[data-slot="consequence"]')).toBeNull();
    expect(screen.queryByRole("alert")).toBeNull();
  });

  test("blocked: the explanation replaces the question, with its own title and one button that closes", async () => {
    const user = userEvent.setup();
    const { onClose, onDelete } = renderOverlay({
      blockedTitle: "Não é possível excluir",
      blocked: <p>O produto está em 2 pedidos.</p>,
    });
    const dialog = screen.getByRole("dialog", { name: "Não é possível excluir" });
    expect(dialog.textContent).toContain("O produto está em 2 pedidos.");
    expect(dialog.textContent).not.toContain(question);
    expect(screen.queryByRole("button", { name: "Excluir" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Cancelar" })).toBeNull();

    // Two buttons close: the cross, and the button with the same text under the explanation.
    const closeButtons = screen.getAllByRole("button", { name: "Fechar" });
    expect(closeButtons).toHaveLength(2);
    await user.click(closeButtons[1] as HTMLElement);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onDelete).not.toHaveBeenCalled();
  });

  test("blocked with no blockedTitle keeps the title", () => {
    renderOverlay({ blocked: "O produto está em 2 pedidos." });
    expect(screen.getByRole("dialog", { name: "Excluir" })).toBeDefined();
  });

  test("puts the app's className on the dialog, passes other attributes, and ref points to it", () => {
    const ref = createRef<HTMLDivElement>();
    renderOverlay({ ref, className: "max-w-md", "data-testid": "delete" } as Partial<DeleteOverlayProps>);
    expect(ref.current).toBe(getDialog());
    expect(ref.current).toBe(screen.getByTestId("delete"));
    expect(getDialog().className.split(" ").at(-1)).toBe("max-w-md");
  });

  test("renders nothing on the server: the dialog needs <body>", () => {
    expect(
      renderToString(
        <DeleteOverlay {...texts} onDelete={() => undefined} onClose={() => undefined}>
          {question}
        </DeleteOverlay>,
      ),
    ).toBe("");
  });
});
