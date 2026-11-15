import { useState } from "react";
import type { ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { CalendarDays, Clock, Receipt } from "lucide-react";
import { expect, fn, userEvent, within } from "storybook/test";
import { ListItem } from "@toraline.tech/ui";

/** A list inside a card, the place a ListItem is shown in an app: a <ul> with one <li> for each item. */
function ListCard({ children, label }: { children: ReactNode; label: string }) {
  return (
    <ul aria-label={label} className="max-w-md overflow-hidden rounded-xl bg-surface shadow-card">
      {children}
    </ul>
  );
}

function ListRow({ children }: { children: ReactNode }) {
  return <li className="border-b border-subtle last:border-b-0">{children}</li>;
}

/** A small mark of a status. The library has no badge yet (phase 8); "status" accepts any element. */
function Status({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-md bg-primary-subtle px-2 py-0.5 text-xs/4 font-medium text-brand">{children}</span>
  );
}

const requests = [
  { id: 1, title: "Day off request", meta: "12/10/2026 · Ana Ribeiro", value: "8 h", status: "Open" },
  { id: 2, title: "Extra hours", meta: "14/10/2026 · Fernando Dias", value: "2,5 h", status: "Approved" },
  { id: 3, title: "Vacation", meta: "01/11 to 10/11/2026 · Marina Lopes", value: "80 h", status: "Open" },
];

/**
 * One row of a list of records: an icon, a title and a second line, and a
 * value and a status on the right. With "href" it is a link, with only
 * "onClick" it is a button, and with neither it cannot be pressed.
 */
const meta = {
  title: "Components/ListItem",
  component: ListItem,
  args: {
    title: "Day off request",
    meta: "12/10/2026 · Ana Ribeiro",
    value: "8 h",
    icon: CalendarDays,
    href: "#request-1",
  },
  argTypes: {
    icon: { control: false },
    status: { control: false },
    linkComponent: { control: false },
  },
  render: (args) => (
    <ListCard label="Requests">
      <ListRow>
        <ListItem {...args} />
      </ListRow>
    </ListCard>
  ),
} satisfies Meta<typeof ListItem>;

export default meta;

type Story = StoryObj<typeof meta>;

/** A link with an icon, a second line and a value. */
export const Default: Story = {};

/** A list: the item that is open has "selected" (aria-current="true"), and each item has a status under its value. */
export const ListWithASelectedItem: Story = {
  render: (args) => (
    <ListCard label="Requests">
      {requests.map((request) => (
        <ListRow key={request.id}>
          <ListItem
            {...args}
            title={request.title}
            meta={request.meta}
            value={request.value}
            status={<Status>{request.status}</Status>}
            href={`#request-${request.id}`}
            selected={request.id === 2}
          />
        </ListRow>
      ))}
    </ListCard>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("link", { name: /Extra hours/ })).toHaveAttribute("aria-current", "true");
    await expect(canvas.getByRole("link", { name: /Vacation/ })).not.toHaveAttribute("aria-current");
  },
};

function ListThatSelects() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  return (
    <ListCard label="Requests">
      {requests.map((request) => (
        <ListRow key={request.id}>
          <ListItem
            title={request.title}
            meta={request.meta}
            value={request.value}
            icon={Clock}
            selected={request.id === selectedId}
            onClick={() => setSelectedId(request.id)}
          />
        </ListRow>
      ))}
    </ListCard>
  );
}

/** With only "onClick" the item is a button. The story presses the second item, which becomes the selected one. */
export const Buttons: Story = {
  render: () => <ListThatSelects />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /Extra hours/ }));
    await expect(canvas.getByRole("button", { name: /Extra hours/ })).toHaveAttribute("aria-current", "true");
  },
};

/** With no "href" and no "onClick" the item cannot be pressed: no arrow and no background under the pointer. */
export const NotInteractive: Story = {
  args: { href: undefined, icon: Receipt, title: "Invoice 2026-118", meta: "Paid on 03/11/2026", value: "R$ 1.310,90" },
};

/** Only the title: no icon, no second line, no value and no status. */
export const OnlyATitle: Story = {
  args: { meta: undefined, value: undefined, icon: undefined },
};

/** The state with the keyboard focus. The focus ring is drawn inside the item. */
export const Focused: Story = {
  args: { onClick: fn() },
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole("link");
    link.focus();
    await expect(link).toHaveFocus();
  },
};

/** A long title and a long second line in a narrow container end with "…". The value keeps its width. */
export const LongText: Story = {
  args: {
    title: "Request of extra hours for the inventory count of the end of the year in the two stores",
    meta: "Asked on 12/10/2026 by Ana Carolina Ribeiro de Albuquerque, approved by Fernando Dias",
    value: "R$ 12.480,00",
    status: <Status>Waiting for the manager</Status>,
  },
  render: (args) => (
    <div className="max-w-xs">
      <ListCard label="Requests">
        <ListRow>
          <ListItem {...args} />
        </ListRow>
      </ListCard>
    </div>
  ),
};
