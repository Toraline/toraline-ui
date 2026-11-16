import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { Button, DeleteOverlay } from "@toraline.tech/ui";
import type { DeleteOverlayProps } from "@toraline.tech/ui";

/** A button that opens the dialog, as an app does it: the app renders the dialog while it is open. */
function DeleteExample({ onClose, ...overlayProps }: DeleteOverlayProps) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <Button variant="danger" onClick={() => setIsOpen(true)}>
        Delete the product
      </Button>
      {isOpen ? (
        <DeleteOverlay
          {...overlayProps}
          onClose={() => {
            setIsOpen(false);
            onClose();
          }}
        />
      ) : null}
    </>
  );
}

/** The dialog is rendered in <body>, outside the element of the story. */
const getPage = (canvasElement: HTMLElement) => within(canvasElement.ownerDocument.body);

const open: Story["play"] = async ({ canvasElement }) => {
  const page = getPage(canvasElement);
  await userEvent.click(page.getByRole("button", { name: "Delete the product" }));
  await expect(page.getByRole("dialog")).toBeVisible();
};

/**
 * The dialog that asks before something is deleted. It is a Modal in the size
 * "md". Every text is a prop: the library has none of its own. The app does
 * the delete, and gives "pending", "error" and "blocked".
 */
const meta = {
  title: "Overlays/DeleteOverlay",
  component: DeleteOverlay,
  args: {
    title: "Delete",
    children: 'Delete the product "Brownie"? This cannot be undone.',
    cancelLabel: "Cancel",
    deleteLabel: "Delete",
    pendingLabel: "Deleting…",
    closeLabel: "Close",
    onDelete: fn(),
    onClose: fn(),
  },
  render: (args) => <DeleteExample {...args} />,
} satisfies Meta<typeof DeleteOverlay>;

export default meta;

type Story = StoryObj<typeof meta>;

/** The state "closed": only the button that opens the dialog is on the page. */
export const Closed: Story = {};

/** The state "open". The focus is on "Cancel", the safe choice. */
export const Open: Story = {
  play: async (context) => {
    await open(context);
    await expect(getPage(context.canvasElement).getByRole("button", { name: "Cancel" })).toHaveFocus();
  },
};

/** The keyboard: Tab stays inside the dialog, and Escape closes it and gives the focus back. */
export const Keyboard: Story = {
  play: async (context) => {
    await open(context);
    const page = getPage(context.canvasElement);
    await userEvent.tab();
    await expect(page.getByRole("button", { name: "Delete" })).toHaveFocus();
    await userEvent.tab();
    await expect(page.getByRole("button", { name: "Close" })).toHaveFocus();
    await userEvent.tab();
    await expect(page.getByRole("button", { name: "Cancel" })).toHaveFocus();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(page.queryByRole("dialog")).toBeNull());
    await expect(page.getByRole("button", { name: "Delete the product" })).toHaveFocus();
  },
};

/** What else is deleted with the record. */
export const WithConsequence: Story = {
  args: { consequence: "Its prices and its recipe are deleted too." },
  play: open,
};

/** The state "loading": the delete is running. The button shows a spinner, and a press does nothing. */
export const Pending: Story = {
  args: { pending: true },
  play: open,
};

/** The state "error": the delete failed. A screen reader says the message. */
export const WithError: Story = {
  args: { error: "The product could not be deleted. Try again." },
  play: open,
};

/** The record cannot be deleted. The explanation is in the place of the question, with one button that closes. */
export const Blocked: Story = {
  args: {
    blockedTitle: "It cannot be deleted",
    blocked: (
      <>
        <p className="text-body">The product is used by 2 orders. Remove it from them first.</p>
        <ul className="list-disc pl-5 text-body">
          <li>Order 12</li>
          <li>Order 15</li>
        </ul>
      </>
    ),
  },
  play: open,
};

/** The texts in another language, with a long name. */
export const TextsOfTheApp: Story = {
  args: {
    title: "Excluir",
    children:
      'Excluir o produto "Brownie de chocolate meio amargo com nozes e doce de leite, caixa com 12 unidades"? Esta ação não pode ser desfeita.',
    cancelLabel: "Cancelar",
    deleteLabel: "Excluir",
    closeLabel: "Fechar",
  },
  play: open,
};
