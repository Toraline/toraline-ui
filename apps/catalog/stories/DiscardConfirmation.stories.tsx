import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { Button, DiscardConfirmation, Drawer, Field, TextInput } from "@toraline.tech/ui";
import type { DiscardConfirmationProps } from "@toraline.tech/ui";

/** The 4 texts. The library has none of its own: an app gives them in its language. */
const texts = {
  title: "Discard the changes?",
  description: "You typed something that is not saved yet. If you leave now, these changes are lost.",
  discardLabel: "Discard",
  keepEditingLabel: "Keep editing",
};

/** A button that shows the question, as an app does it before a page with a form is left. */
function QuestionExample({ onDiscard, onKeepEditing, ...questionProps }: DiscardConfirmationProps) {
  const [isAsking, setIsAsking] = useState(false);
  return (
    <>
      <Button variant="secondary" onClick={() => setIsAsking(true)}>
        Leave the page
      </Button>
      {isAsking ? (
        <DiscardConfirmation
          {...questionProps}
          onDiscard={() => {
            setIsAsking(false);
            onDiscard();
          }}
          onKeepEditing={() => {
            setIsAsking(false);
            onKeepEditing();
          }}
        />
      ) : null}
    </>
  );
}

/** The question is rendered in <body>, outside the element of the story. */
const getPage = (canvasElement: HTMLElement) => within(canvasElement.ownerDocument.body);

/**
 * The question a person gets before something they typed is lost. Every text
 * is a prop. Modal and Drawer show it by themselves when they get the prop
 * "discardConfirmation" (the story "In A Drawer").
 */
const meta = {
  title: "Overlays/DiscardConfirmation",
  component: DiscardConfirmation,
  args: {
    ...texts,
    onDiscard: fn(),
    onKeepEditing: fn(),
  },
  render: (args) => <QuestionExample {...args} />,
} satisfies Meta<typeof DiscardConfirmation>;

export default meta;

type Story = StoryObj<typeof meta>;

/** The state "closed": only the button that asks is on the page. */
export const Closed: Story = {};

/** The state "open". The focus is on "Keep editing", the safe choice. */
export const Open: Story = {
  play: async ({ canvasElement }) => {
    const page = getPage(canvasElement);
    await userEvent.click(page.getByRole("button", { name: "Leave the page" }));
    await expect(page.getByRole("alertdialog", { name: "Discard the changes?" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Keep editing" })).toHaveFocus();
  },
};

/** The keyboard: Tab stays inside the question, and Escape means "keep editing" and gives the focus back. */
export const Keyboard: Story = {
  play: async ({ canvasElement, args }) => {
    const page = getPage(canvasElement);
    const opener = page.getByRole("button", { name: "Leave the page" });
    await userEvent.click(opener);
    await userEvent.tab();
    await expect(page.getByRole("button", { name: "Discard" })).toHaveFocus();
    await userEvent.tab();
    await expect(page.getByRole("button", { name: "Keep editing" })).toHaveFocus();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(page.queryByRole("alertdialog")).toBeNull());
    await expect(args.onKeepEditing).toHaveBeenCalled();
    await expect(opener).toHaveFocus();
  },
};

/** The texts in another language, and longer. */
export const TextsOfTheApp: Story = {
  args: {
    title: "Descartar alterações?",
    description: "Você digitou algo que ainda não foi salvo. Se sair agora, essas alterações se perdem.",
    discardLabel: "Descartar",
    keepEditingLabel: "Continuar editando",
  },
  play: async ({ canvasElement }) => {
    const page = getPage(canvasElement);
    await userEvent.click(page.getByRole("button", { name: "Leave the page" }));
    await expect(page.getByRole("alertdialog", { name: "Descartar alterações?" })).toBeVisible();
  },
};

function DrawerWithQuestion(questionTexts: typeof texts) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Order 12</Button>
      {isOpen ? (
        <Drawer title="Order 12" discardConfirmation={questionTexts} onClose={() => setIsOpen(false)}>
          <Field label="Client">
            <TextInput name="client" />
          </Field>
        </Drawer>
      ) : null}
    </>
  );
}

/**
 * A Drawer with the prop "discardConfirmation". The story types in the field
 * and presses Escape: the Drawer asks before it closes.
 */
export const InADrawer: Story = {
  render: ({ title, description, discardLabel, keepEditingLabel }) => (
    <DrawerWithQuestion
      title={title as string}
      description={description as string}
      discardLabel={discardLabel as string}
      keepEditingLabel={keepEditingLabel as string}
    />
  ),
  play: async ({ canvasElement }) => {
    const page = getPage(canvasElement);
    await userEvent.click(page.getByRole("button", { name: "Order 12" }));
    await userEvent.type(page.getByRole("textbox", { name: "Client" }), "Ana");
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(page.getByRole("alertdialog", { name: "Discard the changes?" })).toBeVisible());
    await expect(page.getByRole("dialog", { name: "Order 12" })).toBeVisible();
  },
};
