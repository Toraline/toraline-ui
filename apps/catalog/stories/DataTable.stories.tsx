import type { Meta, StoryObj } from "@storybook/react-vite";
import { Pencil, Trash2 } from "lucide-react";
import { expect, within } from "storybook/test";
import {
  ActionsTh,
  DataTable,
  DataTableMessage,
  IconButton,
  Td,
  Th,
  Tr,
  tableCellAlignments,
} from "@toraline.tech/ui";

type Order = {
  id: number;
  date: string;
  client: string;
  channel: string;
  items: number;
  total: string;
};

const orders: Order[] = [
  { id: 1041, date: "12/11/2026", client: "Fernando Dias", channel: "Counter", items: 3, total: "R$ 86,50" },
  { id: 1042, date: "12/11/2026", client: "Marina Lopes", channel: "Delivery", items: 1, total: "R$ 24,00" },
  { id: 1043, date: "13/11/2026", client: "Rafael Souza", channel: "Counter", items: 12, total: "R$ 1.310,90" },
  { id: 1044, date: "13/11/2026", client: "Beatriz Nogueira", channel: "Delivery", items: 2, total: "R$ 57,80" },
];

function OrderRows({ selectedId, hoverable = false }: { selectedId?: number; hoverable?: boolean }) {
  return orders.map((order) => (
    <Tr key={order.id} selected={order.id === selectedId} hoverable={hoverable}>
      <Td className="whitespace-nowrap">{order.date}</Td>
      <Td className="font-medium text-primary">{order.client}</Td>
      <Td>{order.channel}</Td>
      <Td align="right">{order.items}</Td>
      <Td align="right">{order.total}</Td>
      <Td className="w-0 whitespace-nowrap" align="right">
        <IconButton icon={Pencil} size="sm" aria-label={`Edit the order of ${order.client}`} />
        <IconButton icon={Trash2} size="sm" aria-label={`Delete the order of ${order.client}`} />
      </Td>
    </Tr>
  ));
}

function OrdersHeader() {
  return (
    <thead>
      <tr>
        <Th>Date</Th>
        <Th>Client</Th>
        <Th>Channel</Th>
        <Th align="right">Items</Th>
        <Th align="right">Total</Th>
        <ActionsTh />
      </tr>
    </thead>
  );
}

/**
 * A table of data inside a card. It is a real <table>: the header cells are
 * Th (scope="col"), the cells are Td, and the name of the table is its caption,
 * which only a screen reader says. The last column holds the buttons of each
 * row; its header, ActionsTh, has a name only a screen reader says.
 */
const meta = {
  title: "Components/DataTable",
  component: DataTable,
  args: {
    caption: "Orders",
  },
  argTypes: {
    children: { control: false },
  },
  render: (args) => (
    <DataTable {...args}>
      <OrdersHeader />
      <tbody>
        <OrderRows />
      </tbody>
    </DataTable>
  ),
} satisfies Meta<typeof DataTable>;

export default meta;

type Story = StoryObj<typeof meta>;

/** A table with a column of numbers aligned to the right and a column of actions. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("table", { name: "Orders" })).toBeVisible();
    await expect(canvas.getByRole("columnheader", { name: "Actions" })).toBeInTheDocument();
    await expect(canvas.getAllByRole("row")).toHaveLength(5);
  },
};

/** Every value of the list tableCellAlignments, on a header cell and on a cell. "right" also gives the digits the same width. */
export const Alignments: Story = {
  render: (args) => (
    <DataTable {...args} caption="The alignments of a cell">
      <thead>
        <tr>
          {tableCellAlignments.map((align) => (
            <Th key={align} align={align} className="w-1/3">
              {align}
            </Th>
          ))}
        </tr>
      </thead>
      <tbody>
        {["1.310,90", "86,50", "7,00"].map((value) => (
          <tr key={value}>
            {tableCellAlignments.map((align) => (
              <Td key={align} align={align}>
                {value}
              </Td>
            ))}
          </tr>
        ))}
      </tbody>
    </DataTable>
  ),
};

/**
 * Rows with "hoverable" get a quiet background under the pointer. The row with
 * "selected" is the record that is open, for example in a panel next to the
 * table: it has aria-current="true", the background of a selected part and a
 * line in the brand color on its left.
 */
export const HoverAndSelectedRow: Story = {
  render: (args) => (
    <DataTable {...args}>
      <OrdersHeader />
      <tbody>
        <OrderRows selectedId={1042} hoverable />
      </tbody>
    </DataTable>
  ),
  play: async ({ canvasElement }) => {
    const rows = within(canvasElement).getAllByRole("row");
    await expect(rows[2]).toHaveAttribute("aria-current", "true");
    await expect(rows[1]).not.toHaveAttribute("aria-current");
  },
};

/** A table with no rows: DataTableMessage is one row with a message as wide as the table. */
export const Empty: Story = {
  render: (args) => (
    <DataTable {...args}>
      <OrdersHeader />
      <tbody>
        <DataTableMessage colSpan={6}>No orders yet.</DataTableMessage>
      </tbody>
    </DataTable>
  ),
};

/** A table whose rows are loading: the table has aria-busy="true", and DataTableMessage shows the text the app gives. */
export const Loading: Story = {
  render: (args) => (
    <DataTable {...args} aria-busy="true">
      <OrdersHeader />
      <tbody>
        <DataTableMessage colSpan={6}>Loading the orders…</DataTableMessage>
      </tbody>
    </DataTable>
  ),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("table")).toHaveAttribute("aria-busy", "true");
  },
};

/** A footer row with a total: a <tfoot> with classes the app gives. */
export const WithFooter: Story = {
  render: (args) => (
    <DataTable {...args}>
      <OrdersHeader />
      <tbody>
        <OrderRows />
      </tbody>
      <tfoot>
        <tr className="bg-subtle font-medium">
          <Td className="border-t border-default text-strong" colSpan={3}>
            Total
          </Td>
          <Td className="border-t border-default text-strong" align="right">
            18
          </Td>
          <Td className="border-t border-default text-strong" align="right">
            R$ 1.479,20
          </Td>
          <Td className="border-t border-default" />
        </tr>
      </tfoot>
    </DataTable>
  ),
};

/** Long text in a cell goes to the next line. A header cell stays on one line. */
export const LongText: Story = {
  render: (args) => (
    <div className="max-w-xl">
      <DataTable {...args} caption="Tickets">
        <thead>
          <tr>
            <Th>Ticket</Th>
            <Th>Description</Th>
            <Th align="right">Hours</Th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <Td className="whitespace-nowrap">#218</Td>
            <Td>
              The report of the month does not show the orders of the last day when the month ends on a
              Sunday, and the total of the page differs from the total of the exported file by the value of
              those orders.
            </Td>
            <Td align="right">12,5</Td>
          </tr>
          <tr>
            <Td className="whitespace-nowrap">#219</Td>
            <Td>Averyveryverylongwordwithnospacesthatcannotbreakatanypointofthecolumn_2026_11_15.pdf</Td>
            <Td align="right">0,5</Td>
          </tr>
        </tbody>
      </DataTable>
    </div>
  ),
};

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const regimes = [
  { name: "CLT", hours: [168, 160, 176, 168, 168, 160, 184, 168, 176, 176, 160, 168] },
  { name: "Contractor", hours: [120, 96, 130, 110, 125, 90, 140, 115, 128, 132, 101, 87] },
  { name: "Intern", hours: [80, 80, 88, 84, 84, 80, 92, 84, 88, 88, 80, 84] },
];

/**
 * Many columns in a narrow container: the box scrolls sideways. While the table
 * is wider than its box, the box can get the keyboard focus, so the arrow keys
 * scroll it, and it has the name of the table.
 */
export const ManyColumnsInANarrowContainer: Story = {
  render: (args) => (
    <div className="max-w-sm">
      <DataTable {...args} caption="Hours of the year by regime">
        <thead>
          <tr>
            <Th>Regime</Th>
            {months.map((month) => (
              <Th key={month} align="right">
                {month}
              </Th>
            ))}
          </tr>
        </thead>
        <tbody>
          {regimes.map((regime) => (
            <tr key={regime.name}>
              <Th scope="row" className="border-subtle bg-surface text-sm/5 text-primary">
                {regime.name}
              </Th>
              {regime.hours.map((hours, index) => (
                <Td key={months[index]} align="right">
                  {hours}
                </Td>
              ))}
            </tr>
          ))}
        </tbody>
      </DataTable>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const box = await within(canvasElement).findByRole("group", { name: "Hours of the year by regime" });
    await expect(box).toHaveAttribute("tabindex", "0");
    box.focus();
    await expect(box).toHaveFocus();
  },
};

/**
 * "stackOnMobile": on a screen less than 768 pixels wide, each row is a block
 * and each cell is one line, with the name of its column ("data-label") on the
 * left. Make the window narrow to see it. On a wide screen it is a normal table.
 */
export const StackOnMobile: Story = {
  args: { stackOnMobile: true },
  render: (args) => (
    <DataTable {...args}>
      <OrdersHeader />
      <tbody>
        {orders.map((order) => (
          <tr key={order.id}>
            <Td data-label="Date" className="whitespace-nowrap">
              {order.date}
            </Td>
            <Td data-label="Client">{order.client}</Td>
            <Td data-label="Channel">{order.channel}</Td>
            <Td data-label="Items" align="right">
              {order.items}
            </Td>
            <Td data-label="Total" align="right">
              {order.total}
            </Td>
            <Td align="right">
              <IconButton icon={Pencil} size="sm" aria-label={`Edit the order of ${order.client}`} />
            </Td>
          </tr>
        ))}
      </tbody>
    </DataTable>
  ),
};

/** A table named by "aria-label", with no caption. */
export const NamedByAriaLabel: Story = {
  args: { caption: undefined, "aria-label": "Orders of the week" },
};
