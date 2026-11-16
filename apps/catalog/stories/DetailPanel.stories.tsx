import { useState } from "react";
import type { ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { Button, DetailPanel, ListItem } from "@toraline.tech/ui";

/** A small mark of a status. The library has no badge yet (phase 8); "status" accepts any element. */
function Status({ children }: { children: ReactNode }) {
  return (
    <span className="inline-block rounded-md bg-primary-subtle px-2 py-0.5 text-xs/4 font-medium text-brand">
      {children}
    </span>
  );
}

const requestFields = [
  { label: "Type", value: "Vacation" },
  { label: "Period", value: "01/11/2026 to 10/11/2026" },
  { label: "Hours", value: "80 h" },
  { label: "Asked by", value: "Marina Lopes" },
  { label: "Manager", value: "Fernando Dias" },
];

/**
 * The detail of the selected record, shown next to a list. It is an <aside>
 * named by its title. It does not cover the page and does not keep the focus
 * inside: the list can still be used. From a screen 1280 pixels wide it is 360
 * pixels wide; below that it is as wide as its container.
 */
const meta = {
  title: "Components/DetailPanel",
  component: DetailPanel,
  args: {
    title: "Vacation of Marina Lopes",
    status: <Status>Waiting for approval</Status>,
    fields: requestFields,
    onClose: fn(),
  },
  argTypes: {
    status: { control: false },
    footer: { control: false },
    children: { control: false },
  },
} satisfies Meta<typeof DetailPanel>;

export default meta;

type Story = StoryObj<typeof meta>;

/** A title, a status, the fields of the record and the close button. */
export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("complementary", { name: "Vacation of Marina Lopes" })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Close" }));
    await expect(args.onClose).toHaveBeenCalledTimes(1);
  },
};

/** The actions of the record at the bottom, and more content after the fields. */
export const WithFooterAndContent: Story = {
  args: {
    footer: (
      <>
        <Button variant="secondary">Refuse</Button>
        <Button>Approve</Button>
      </>
    ),
    children: (
      <p className="text-sm/5 text-body">
        The team has 2 other people on vacation in the same period. The manager must approve it until
        25/10/2026.
      </p>
    ),
  },
};

/** Only the title: no status, no fields, no footer and no close button. */
export const OnlyATitle: Story = {
  args: { status: undefined, fields: undefined, onClose: undefined },
};

/** While the record loads, the app shows its own text as the content. The panel has aria-busy="true". */
export const Loading: Story = {
  args: {
    title: "Request",
    status: undefined,
    fields: undefined,
    "aria-busy": "true",
    children: <p className="text-sm/5 text-secondary">Loading the request…</p>,
  },
};

/**
 * A long title goes to the next lines, and a long value too. The app limits the
 * height of the panel (className="max-h-96"): the content scrolls, and it can
 * get the keyboard focus so the arrow keys scroll it.
 */
export const LongContentInALimitedHeight: Story = {
  args: {
    className: "max-h-96",
    title: "Request of extra hours for the inventory count of the end of the year in the two stores",
    fields: [
      ...requestFields,
      {
        label: "Reason",
        value:
          "The two stores close on 31/12/2026 for the count of every product. The team of the morning stays until the count ends, and the hours after 18:00 are extra hours.",
      },
      { label: "File", value: "inventory_count_of_the_end_of_the_year_2026_store_1_and_store_2_final_version.pdf" },
    ],
    footer: <Button>Approve</Button>,
  },
  render: (args) => (
    <div className="max-w-xs">
      <DetailPanel {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const body = await within(canvasElement).findByRole("group", {
      name: /Request of extra hours/,
    });
    await expect(body).toHaveAttribute("tabindex", "0");
    body.focus();
    await expect(body).toHaveFocus();
  },
};

const requests = [
  { id: 1, title: "Day off request", meta: "12/10/2026 · Ana Ribeiro", value: "8 h" },
  { id: 2, title: "Extra hours", meta: "14/10/2026 · Fernando Dias", value: "2,5 h" },
  { id: 3, title: "Vacation", meta: "01/11 to 10/11/2026 · Marina Lopes", value: "80 h" },
];

function ListWithDetail() {
  const [selectedId, setSelectedId] = useState<number | null>(2);
  const selected = requests.find((request) => request.id === selectedId);
  return (
    <div className="flex flex-col items-start gap-4 xl:flex-row">
      <ul aria-label="Requests" className="w-full min-w-0 flex-1 overflow-hidden rounded-xl bg-surface shadow-card">
        {requests.map((request) => (
          <li key={request.id} className="border-b border-subtle last:border-b-0">
            <ListItem
              title={request.title}
              meta={request.meta}
              value={request.value}
              selected={request.id === selectedId}
              onClick={() => setSelectedId(request.id)}
            />
          </li>
        ))}
      </ul>
      {selected ? (
        <DetailPanel
          title={selected.title}
          status={<Status>Open</Status>}
          onClose={() => setSelectedId(null)}
          fields={[
            { label: "Asked", value: selected.meta },
            { label: "Hours", value: selected.value },
          ]}
          footer={<Button>Approve</Button>}
        />
      ) : null}
    </div>
  );
}

/**
 * The panel next to a list of ListItem. A press on an item opens it in the
 * panel; the close button closes the panel. On a screen less than 1280 pixels
 * wide the panel goes under the list. The story opens the first item.
 */
export const NextToAList: Story = {
  render: () => <ListWithDetail />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /Day off request/ }));
    await expect(canvas.getByRole("complementary", { name: "Day off request" })).toBeVisible();
  },
};
