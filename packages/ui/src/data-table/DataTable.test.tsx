// @vitest-environment jsdom
import { act, cleanup, render, screen, within } from "@testing-library/react";
import { createRef } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, test, vi } from "vitest";
import {
  ActionsTh,
  DataTable,
  DataTableMessage,
  Td,
  Th,
  Tr,
  tableCellAlignments,
} from "./index";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const orders = [
  { id: 1, client: "Fernando Dias", total: "120,00" },
  { id: 2, client: "Marina Lopes", total: "89,50" },
];

function OrdersTable() {
  return (
    <DataTable caption="Orders">
      <thead>
        <tr>
          <Th>Client</Th>
          <Th align="right">Total</Th>
          <ActionsTh />
        </tr>
      </thead>
      <tbody>
        {orders.map((order) => (
          <Tr key={order.id} selected={order.id === 2} hoverable>
            <Td>{order.client}</Td>
            <Td align="right">{order.total}</Td>
            <Td>
              <button type="button">Edit {order.client}</button>
            </Td>
          </Tr>
        ))}
      </tbody>
    </DataTable>
  );
}

describe("DataTable", () => {
  test("is a real table whose accessible name is its caption", () => {
    render(<OrdersTable />);
    const table = screen.getByRole("table", { name: "Orders" });
    expect(table.tagName).toBe("TABLE");
    expect(table.querySelector("caption")?.className).toBe("sr-only");
    expect(within(table).getAllByRole("row")).toHaveLength(3);
    expect(within(table).getByRole("cell", { name: "Fernando Dias" })).toBeDefined();
  });

  test("is named by aria-label or aria-labelledby when it has no caption", () => {
    render(
      <>
        <h2 id="title">Stock</h2>
        <DataTable aria-label="Clients" />
        <DataTable aria-labelledby="title" />
      </>,
    );
    expect(screen.getByRole("table", { name: "Clients" }).querySelector("caption")).toBeNull();
    expect(screen.getByRole("table", { name: "Stock" })).toBeDefined();
  });

  test("the types refuse a table with no name", () => {
    // @ts-expect-error A table needs "caption", "aria-label" or "aria-labelledby".
    const withoutName = <DataTable />;
    expect(withoutName).toBeDefined();
  });

  test("the table is inside a card that scrolls sideways", () => {
    render(<OrdersTable />);
    const box = screen.getByRole("table").parentElement as HTMLElement;
    expect(box.getAttribute("data-slot")).toBe("box");
    expect(box.className.split(" ")).toEqual(
      expect.arrayContaining(["overflow-x-auto", "rounded-xl", "bg-surface", "shadow-card"]),
    );
    // A table that fits adds no stop for the Tab key.
    expect(box.hasAttribute("tabindex")).toBe(false);
    expect(box.hasAttribute("role")).toBe(false);
  });

  test("while the table is wider than its box, the box can get the focus and has the name of the table", () => {
    let resized: () => void = () => undefined;
    vi.stubGlobal(
      "ResizeObserver",
      class {
        constructor(callback: () => void) {
          resized = callback;
        }
        observe() {}
        disconnect() {}
      },
    );
    render(<OrdersTable />);
    const box = screen.getByRole("table").parentElement as HTMLElement;
    Object.defineProperty(box, "scrollWidth", { configurable: true, value: 900 });
    Object.defineProperty(box, "clientWidth", { configurable: true, value: 320 });
    act(() => resized());
    expect(box.getAttribute("tabindex")).toBe("0");
    expect(screen.getByRole("group", { name: "Orders" })).toBe(box);
    expect(box.className.split(" ")).toContain("focus-visible:outline-focus");

    Object.defineProperty(box, "clientWidth", { configurable: true, value: 900 });
    act(() => resized());
    expect(box.hasAttribute("tabindex")).toBe(false);
    expect(screen.queryByRole("group")).toBeNull();
  });

  test("a box that scrolls and a table named by aria-label have the same name", () => {
    let resized: () => void = () => undefined;
    vi.stubGlobal(
      "ResizeObserver",
      class {
        constructor(callback: () => void) {
          resized = callback;
        }
        observe() {}
        disconnect() {}
      },
    );
    render(<DataTable aria-label="Clients" />);
    const box = screen.getByRole("table").parentElement as HTMLElement;
    Object.defineProperty(box, "scrollWidth", { configurable: true, value: 900 });
    Object.defineProperty(box, "clientWidth", { configurable: true, value: 320 });
    act(() => resized());
    expect(screen.getByRole("group", { name: "Clients" })).toBe(box);
  });

  test('"stackOnMobile" marks the table and gives it the classes of a narrow screen', () => {
    render(
      <DataTable caption="Orders" stackOnMobile>
        <tbody>
          <tr>
            <Td data-label="Client">Fernando Dias</Td>
          </tr>
        </tbody>
      </DataTable>,
    );
    const table = screen.getByRole("table");
    expect(table.hasAttribute("data-stack-on-mobile")).toBe(true);
    expect(table.className.split(" ")).toContain("max-md:[&_td[data-label]]:flex");
    expect(screen.getByRole("cell").getAttribute("data-label")).toBe("Client");
  });

  test("without stackOnMobile the table has no class of a narrow screen", () => {
    render(<OrdersTable />);
    const table = screen.getByRole("table");
    expect(table.hasAttribute("data-stack-on-mobile")).toBe(false);
    expect(table.className).not.toContain("max-md:");
  });

  test("className goes to the box, after the library's classes, and replaces a class for the same property", () => {
    render(<DataTable caption="Orders" className="mt-4 rounded-none" />);
    const box = screen.getByRole("table").parentElement as HTMLElement;
    const classes = box.className.split(" ");
    expect(classes.slice(-2)).toEqual(["mt-4", "rounded-none"]);
    expect(classes).not.toContain("rounded-xl");
  });

  test("another attribute and ref go to the <table>", () => {
    const ref = createRef<HTMLTableElement>();
    render(<DataTable caption="Orders" ref={ref} id="orders" aria-busy="true" />);
    const table = screen.getByRole("table");
    expect(ref.current).toBe(table);
    expect(table.id).toBe("orders");
    expect(table.getAttribute("aria-busy")).toBe("true");
  });

  test("renders on the server", () => {
    const html = renderToString(<OrdersTable />);
    expect(html).toContain("<table");
    expect(html).toContain("Fernando Dias");
  });
});

describe("Th and ActionsTh", () => {
  test("a header cell names its column, and scope can be changed", () => {
    render(
      <DataTable caption="Orders">
        <thead>
          <tr>
            <Th>Client</Th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <Th scope="row">Fernando Dias</Th>
          </tr>
        </tbody>
      </DataTable>,
    );
    expect(screen.getByRole("columnheader", { name: "Client" }).getAttribute("scope")).toBe("col");
    expect(screen.getByRole("rowheader", { name: "Fernando Dias" }).getAttribute("scope")).toBe("row");
  });

  test("has the alignments left, center and right", () => {
    expect(tableCellAlignments).toEqual(["left", "center", "right"]);
  });

  test.each([
    ["left", "text-left"],
    ["center", "text-center"],
    ["right", "text-right"],
  ] as const)('a header cell with align "%s" has the class "%s"', (align, alignClass) => {
    render(
      <table>
        <thead>
          <tr>
            <Th align={align}>Total</Th>
          </tr>
        </thead>
      </table>,
    );
    const cell = screen.getByRole("columnheader");
    expect(cell.getAttribute("data-align")).toBe(align);
    expect(cell.className.split(" ")).toContain(alignClass);
  });

  test("a header cell with no align has no alignment class", () => {
    render(<OrdersTable />);
    const cell = screen.getByRole("columnheader", { name: "Client" });
    expect(cell.hasAttribute("data-align")).toBe(false);
    expect(cell.className).not.toMatch(/text-(left|center|right)/);
  });

  test("the header of the actions column has a name only a screen reader says", () => {
    render(<OrdersTable />);
    const cell = screen.getByRole("columnheader", { name: "Actions" });
    expect(cell.querySelector("span")?.className).toBe("sr-only");
    expect(cell.className.split(" ")).toContain("bg-subtle");
  });

  test("the app gives the name of the actions column", () => {
    render(
      <table>
        <thead>
          <tr>
            <ActionsTh label="Ações" className="w-12" />
          </tr>
        </thead>
      </table>,
    );
    const cell = screen.getByRole("columnheader", { name: "Ações" });
    expect(cell.className.split(" ")).toContain("w-12");
  });

  test("className replaces a class of the library, and ref points to the <th>", () => {
    const ref = createRef<HTMLTableCellElement>();
    render(
      <table>
        <thead>
          <tr>
            <Th ref={ref} className="w-24 px-0" colSpan={2}>
              Total
            </Th>
          </tr>
        </thead>
      </table>,
    );
    const cell = screen.getByRole("columnheader");
    expect(ref.current).toBe(cell);
    expect(cell.getAttribute("colspan")).toBe("2");
    expect(cell.className.split(" ").slice(-2)).toEqual(["w-24", "px-0"]);
    expect(cell.className.split(" ")).not.toContain("px-3");
  });
});

describe("Td", () => {
  test('a cell with align "right" also gives its digits the same width', () => {
    render(<OrdersTable />);
    const cell = screen.getByRole("cell", { name: "120,00" });
    expect(cell.getAttribute("data-align")).toBe("right");
    expect(cell.className.split(" ")).toEqual(expect.arrayContaining(["text-right", "tabular-nums"]));
  });

  test("className replaces a class of the library, and ref and another attribute go to the <td>", () => {
    const ref = createRef<HTMLTableCellElement>();
    render(
      <table>
        <tbody>
          <tr>
            <Td ref={ref} className="font-medium text-primary" colSpan={3} data-label="Client">
              Fernando Dias
            </Td>
          </tr>
        </tbody>
      </table>,
    );
    const cell = screen.getByRole("cell");
    expect(ref.current).toBe(cell);
    expect(cell.getAttribute("colspan")).toBe("3");
    expect(cell.getAttribute("data-label")).toBe("Client");
    expect(cell.className.split(" ")).toContain("text-primary");
    expect(cell.className.split(" ")).not.toContain("text-body");
  });
});

describe("Tr", () => {
  test("the selected row has aria-current, and the other rows do not", () => {
    render(<OrdersTable />);
    const [, firstRow, secondRow] = screen.getAllByRole("row");
    expect(firstRow?.hasAttribute("aria-current")).toBe(false);
    expect(secondRow?.getAttribute("aria-current")).toBe("true");
    expect(secondRow?.className.split(" ")).toContain("aria-[current=true]:bg-selected");
  });

  test('"hoverable" gives the row a background under the pointer', () => {
    render(
      <table>
        <tbody>
          <Tr data-testid="plain" />
          <Tr data-testid="hoverable" hoverable />
        </tbody>
      </table>,
    );
    expect(screen.getByTestId("plain").className).not.toContain("hover:bg-subtle");
    expect(screen.getByTestId("hoverable").className.split(" ")).toContain("hover:bg-subtle");
  });

  test("className, another attribute and ref go to the <tr>", () => {
    const ref = createRef<HTMLTableRowElement>();
    render(
      <table>
        <tbody>
          <Tr ref={ref} className="bg-warning" id="row-1" />
        </tbody>
      </table>,
    );
    const row = screen.getByRole("row");
    expect(ref.current).toBe(row);
    expect(row.id).toBe("row-1");
    expect(row.className.split(" ").at(-1)).toBe("bg-warning");
  });
});

describe("DataTableMessage", () => {
  test("is one row with one cell as wide as the table", () => {
    render(
      <DataTable caption="Orders">
        <thead>
          <tr>
            <Th>Client</Th>
            <Th>Total</Th>
          </tr>
        </thead>
        <tbody>
          <DataTableMessage colSpan={2}>No orders yet.</DataTableMessage>
        </tbody>
      </DataTable>,
    );
    const cell = screen.getByRole("cell", { name: "No orders yet." });
    expect(cell.getAttribute("colspan")).toBe("2");
    expect(cell.className.split(" ")).toEqual(
      expect.arrayContaining(["py-8", "text-center", "text-secondary"]),
    );
    expect(cell.className.split(" ")).not.toContain("py-2.5");
    expect(cell.parentElement?.getAttribute("data-slot")).toBe("message");
  });
});
