import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { Button, Drawer, Field, TextInput } from "@toraline.tech/ui";
import type { DrawerProps } from "@toraline.tech/ui";

/** A button that opens the Drawer, as an app does it: the app renders the Drawer while it is open. */
function DrawerExample({ children, onClose, footer, ...drawerProps }: Partial<DrawerProps>) {
  const [isOpen, setIsOpen] = useState(false);
  const close = () => {
    setIsOpen(false);
    onClose?.();
  };
  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Order 12</Button>
      {isOpen ? (
        <Drawer
          title="Order 12"
          {...drawerProps}
          onClose={close}
          footer={
            footer === undefined ? (
              <>
                <Button variant="ghost" onClick={close}>
                  Cancel
                </Button>
                <Button type="submit" form="order-form">
                  Save
                </Button>
              </>
            ) : (
              footer
            )
          }
        >
          {children ?? (
            <form
              id="order-form"
              className="flex flex-col gap-4"
              onSubmit={(event) => {
                event.preventDefault();
                close();
              }}
            >
              <Field label="Client">
                <TextInput name="client" />
              </Field>
              <Field label="Note" optional>
                <TextInput name="note" />
              </Field>
            </form>
          )}
        </Drawer>
      ) : null}
    </>
  );
}

/** The panel is rendered in <body>, outside the element of the story. */
const getPage = (canvasElement: HTMLElement) => within(canvasElement.ownerDocument.body);

/**
 * A panel on the right side of the screen that leaves the page next to it
 * visible and usable. Its footer stays at the bottom, outside the part that
 * scrolls. The focus goes into the panel, the Tab key stays inside, Escape
 * closes it, and the focus goes back to the button that opened it.
 */
const meta = {
  title: "Overlays/Drawer",
  component: Drawer,
  args: {
    title: "Order 12",
    onClose: fn(),
  },
  argTypes: {
    actions: { control: false },
    footer: { control: false },
  },
  render: (args) => <DrawerExample {...args} />,
} satisfies Meta<typeof Drawer>;

export default meta;

type Story = StoryObj<typeof meta>;

/** The state "closed": only the button that opens the panel is on the page. */
export const Closed: Story = {};

/** The state "open". The story presses the button by itself. The focus is on the panel. */
export const Open: Story = {
  play: async ({ canvasElement }) => {
    const page = getPage(canvasElement);
    await userEvent.click(page.getByRole("button", { name: "Order 12" }));
    const drawer = page.getByRole("dialog", { name: "Order 12" });
    await expect(drawer).toBeVisible();
    await expect(drawer).toHaveFocus();
  },
};

/** The keyboard: Tab stays inside the panel, and Escape closes it and gives the focus back. */
export const Keyboard: Story = {
  play: async ({ canvasElement }) => {
    const page = getPage(canvasElement);
    const opener = page.getByRole("button", { name: "Order 12" });
    await userEvent.click(opener);
    await userEvent.tab();
    await expect(page.getByRole("button", { name: "Close" })).toHaveFocus();
    // Shift+Tab from the first element goes to the last one, in the footer.
    await userEvent.tab({ shift: true });
    await expect(page.getByRole("button", { name: "Save" })).toHaveFocus();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(page.queryByRole("dialog")).toBeNull());
    await expect(opener).toHaveFocus();
  },
};

/** The wide panel, for a form with a table: 896 pixels at most. */
export const Wide: Story = {
  args: { wide: true },
  play: Open.play,
};

/** Without a footer. */
export const WithoutFooter: Story = {
  args: { footer: null },
  play: Open.play,
};

/** Actions next to the title, before the button that closes the panel. */
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

/** Long content: the content scrolls, and the header and the footer stay in place. */
export const LongContent: Story = {
  args: {
    title: "Order 12 of the wholesale channel with a delivery address in another state",
    children: (
      <div className="flex flex-col gap-3 text-sm/5 text-body">
        {Array.from({ length: 40 }, (_unused, index) => (
          <p key={index}>Line {index + 1} of a long text that makes the content taller than the panel.</p>
        ))}
      </div>
    ),
  },
  play: async ({ canvasElement }) => {
    const page = getPage(canvasElement);
    await userEvent.click(page.getByRole("button", { name: "Order 12" }));
    await expect(page.getByRole("dialog")).toBeVisible();
  },
};
