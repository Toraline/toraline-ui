import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { Button, Field, Modal, TextInput, modalSizes } from "@toraline.tech/ui";
import type { ModalProps } from "@toraline.tech/ui";
import { optionList } from "./shared/option-list";

/** A button that opens the Modal, as an app does it: the app renders the Modal while it is open. */
function ModalExample({ children, onClose, ...modalProps }: Partial<ModalProps>) {
  const [isOpen, setIsOpen] = useState(false);
  const close = () => {
    setIsOpen(false);
    onClose?.();
  };
  return (
    <>
      <Button onClick={() => setIsOpen(true)}>New client</Button>
      {isOpen ? (
        <Modal title="New client" {...modalProps} onClose={close}>
          {children ?? (
            <form
              className="flex flex-col gap-4"
              onSubmit={(event) => {
                event.preventDefault();
                close();
              }}
            >
              <Field label="Name">
                <TextInput name="name" />
              </Field>
              <Field label="E-mail" optional>
                <TextInput name="email" type="email" />
              </Field>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={close}>
                  Cancel
                </Button>
                <Button type="submit">Save</Button>
              </div>
            </form>
          )}
        </Modal>
      ) : null}
    </>
  );
}

/** The dialog is rendered in <body>, outside the element of the story. */
const getPage = (canvasElement: HTMLElement) => within(canvasElement.ownerDocument.body);

/**
 * A dialog above the page, for a task that needs the whole attention. The app
 * renders it while it is open. The focus goes into the dialog, the Tab key
 * stays inside, Escape closes it, and the focus goes back to the button that
 * opened it. The story "Sizes" reads the list modalSizes of the library.
 */
const meta = {
  title: "Overlays/Modal",
  component: Modal,
  args: {
    title: "New client",
    onClose: fn(),
  },
  argTypes: {
    size: optionList(modalSizes, "inline-radio"),
    actions: { control: false },
  },
  render: (args) => <ModalExample {...args} />,
} satisfies Meta<typeof Modal>;

export default meta;

type Story = StoryObj<typeof meta>;

/** The state "closed": only the button that opens the dialog is on the page. */
export const Closed: Story = {};

/** The state "open". The story presses the button by itself. The focus is on the dialog. */
export const Open: Story = {
  play: async ({ canvasElement }) => {
    const page = getPage(canvasElement);
    await userEvent.click(page.getByRole("button", { name: "New client" }));
    const dialog = page.getByRole("dialog", { name: "New client" });
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveFocus();
  },
};

/** The keyboard: Tab stays inside the dialog, and Escape closes it and gives the focus back. */
export const Keyboard: Story = {
  play: async ({ canvasElement }) => {
    const page = getPage(canvasElement);
    const opener = page.getByRole("button", { name: "New client" });
    await userEvent.click(opener);
    await userEvent.tab();
    await expect(page.getByRole("button", { name: "Close" })).toHaveFocus();
    // Shift+Tab from the first element goes to the last one, not to the page behind.
    await userEvent.tab({ shift: true });
    await expect(page.getByRole("button", { name: "Save" })).toHaveFocus();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(page.queryByRole("dialog")).toBeNull());
    await expect(opener).toHaveFocus();
  },
};

/** Every size, from the list modalSizes: the widest the dialog gets. The story opens the size "md". */
export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-wrap gap-3">
      {modalSizes.map((size) => (
        <SizeExample key={size} {...args} size={size} />
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const page = getPage(canvasElement);
    await userEvent.click(page.getByRole("button", { name: "Open the size md" }));
    await expect(page.getByRole("dialog", { name: "The size md" })).toBeVisible();
  },
};

function SizeExample({ size, onClose, ...modalProps }: Partial<ModalProps>) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <Button variant="secondary" onClick={() => setIsOpen(true)}>
        Open the size {size}
      </Button>
      {isOpen ? (
        <Modal
          {...modalProps}
          title={`The size ${size}`}
          size={size}
          onClose={() => {
            setIsOpen(false);
            onClose?.();
          }}
        >
          <p className="text-sm/5 text-body">The dialog is never wider than the size allows.</p>
        </Modal>
      ) : null}
    </>
  );
}

/** Actions next to the title, before the button that closes the dialog. */
export const WithActions: Story = {
  args: {
    actions: (
      <Button variant="ghost" size="sm">
        Open the full page
      </Button>
    ),
  },
  play: Open.play,
};

/** Long content and a long title: the dialog scrolls with the dark layer, and the title wraps. */
export const LongContent: Story = {
  args: {
    title: "New client of the wholesale channel with a delivery address in another state",
    children: (
      <div className="flex flex-col gap-3 text-sm/5 text-body">
        {Array.from({ length: 30 }, (_unused, index) => (
          <p key={index}>Line {index + 1} of a long text that makes the dialog taller than the screen.</p>
        ))}
      </div>
    ),
  },
  play: async ({ canvasElement }) => {
    const page = getPage(canvasElement);
    await userEvent.click(page.getByRole("button", { name: "New client" }));
    await expect(page.getByRole("dialog")).toBeVisible();
  },
};
