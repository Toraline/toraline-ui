import { CalendarDays, Pencil } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  ActionsTh,
  DataTable,
  DataTableMessage,
  DetailPanel,
  IconButton,
  ListItem,
  Td,
  Th,
  Tr,
} from "@toraline.tech/ui";
import { ThemeToggle } from "@toraline.tech/ui/theme";
import { ProductsGrid } from "./ProductsGrid";
import type { Product } from "./ProductsGrid";

/**
 * The page of the data components of phase 10 (TOR-1126). This file is a
 * Server Component: DataTable and its parts render on the server. DataGrid
 * holds state, so it is used through the Client Component ProductsGrid.
 */

const orders = [
  { id: 1041, date: "12/11/2026", client: "Fernando Dias", channel: "Counter", total: "R$ 86,50" },
  { id: 1042, date: "12/11/2026", client: "Marina Lopes", channel: "Delivery", total: "R$ 24,00" },
  { id: 1043, date: "13/11/2026", client: "Rafael Souza", channel: "Counter", total: "R$ 1.310,90" },
];

const productNames = ["Pão de queijo", "Espresso coffee", "Orange juice", "Carrot cake", "Chicken pie"];
const products: Product[] = Array.from({ length: 23 }, (_, index) => ({
  id: index + 1,
  name: `${productNames[index % productNames.length]} ${index + 1}`,
  category: index % 2 === 0 ? "Bakery" : "Drinks",
  stock: (index * 37) % 120,
  price: 4.5 + index,
}));

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="font-heading text-xl font-semibold">{title}</h2>
      <div className="mt-3 space-y-4">{children}</div>
    </section>
  );
}

export default function DataPage() {
  return (
    <main className="mx-auto max-w-4xl p-8">
      <h1 className="font-heading text-3xl font-semibold text-brand">Data components</h1>
      <p className="mt-2">
        <Link className="text-brand underline" href="/">
          Back to the first page
        </Link>
      </p>
      <p className="mt-2">
        <Link className="text-brand underline" href="/data/grid-parts">
          The parts of the DataGrid: the filter, the menu of the columns, cell editing, rows inside a row, another view
        </Link>
      </p>
      <p className="mt-2">
        <Link className="text-brand underline" href="/data/address">
          The state of a DataGrid kept in the address of the page
        </Link>
      </p>
      <ThemeToggle className="mt-4" />

      <Section title="DataTable">
        <DataTable caption="Orders" data-testid="orders-table">
          <thead>
            <tr>
              <Th>Date</Th>
              <Th>Client</Th>
              <Th>Channel</Th>
              <Th align="right">Total</Th>
              <ActionsTh />
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <Tr key={order.id} hoverable selected={order.id === 1042}>
                <Td className="whitespace-nowrap">{order.date}</Td>
                <Td className="font-medium text-primary">{order.client}</Td>
                <Td>{order.channel}</Td>
                <Td align="right">{order.total}</Td>
                <Td className="w-12" align="right">
                  <IconButton icon={Pencil} size="sm" aria-label={`Edit the order of ${order.client}`} />
                </Td>
              </Tr>
            ))}
          </tbody>
        </DataTable>

        <DataTable caption="Orders of a client with no order">
          <thead>
            <tr>
              <Th>Date</Th>
              <Th>Client</Th>
              <Th align="right">Total</Th>
            </tr>
          </thead>
          <tbody>
            <DataTableMessage colSpan={3}>No orders yet.</DataTableMessage>
          </tbody>
        </DataTable>

        <div className="max-w-sm">
          <DataTable caption="Orders in a narrow container">
            <thead>
              <tr>
                <Th>Date</Th>
                <Th>Client</Th>
                <Th>Channel</Th>
                <Th align="right">Total</Th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <Td className="whitespace-nowrap">{order.date}</Td>
                  <Td className="whitespace-nowrap">{order.client}</Td>
                  <Td>{order.channel}</Td>
                  <Td align="right" className="whitespace-nowrap">
                    {order.total}
                  </Td>
                </tr>
              ))}
            </tbody>
          </DataTable>
        </div>

        <DataTable caption="Orders, as blocks on a narrow screen" stackOnMobile>
          <thead>
            <tr>
              <Th>Date</Th>
              <Th>Client</Th>
              <Th align="right">Total</Th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <Td data-label="Date">{order.date}</Td>
                <Td data-label="Client">{order.client}</Td>
                <Td data-label="Total" align="right">
                  {order.total}
                </Td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      </Section>

      <Section title="DataGrid">
        <ProductsGrid products={products} />
      </Section>

      <Section title="ListItem">
        <ul className="max-w-md overflow-hidden rounded-xl bg-surface shadow-card">
          <li className="border-b border-subtle">
            <ListItem
              title="Day off request"
              meta="12/10/2026 · Ana Ribeiro"
              value="8 h"
              icon={CalendarDays}
              href="/data"
              linkComponent={Link}
            />
          </li>
          <li className="border-b border-subtle">
            <ListItem
              title="Extra hours"
              meta="14/10/2026 · Fernando Dias"
              value="2,5 h"
              icon={CalendarDays}
              href="/data"
              linkComponent={Link}
              selected
            />
          </li>
          <li>
            <ListItem title="Vacation" meta="An item that cannot be pressed" value="80 h" />
          </li>
        </ul>
      </Section>

      <Section title="DetailPanel">
        <DetailPanel
          title="Vacation of Marina Lopes"
          fields={[
            { label: "Period", value: "01/11/2026 to 10/11/2026" },
            { label: "Hours", value: "80 h" },
            { label: "Manager", value: "Fernando Dias" },
          ]}
        >
          <p className="text-sm/5 text-body">This panel is rendered by a Server Component, so it has no close button.</p>
        </DetailPanel>
      </Section>
    </main>
  );
}
