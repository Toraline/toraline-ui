// @vitest-environment jsdom
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, test, vi } from "vitest";
import { DataGrid } from "./index";
import type { DataGridColumn, DataGridProps } from "./index";

afterEach(cleanup);

type Event = { id: number; title: string; kind: string; place: string };

const events: Event[] = [
  { id: 1, title: "Tasting", kind: "public", place: "Shop" },
  { id: 2, title: "Team meeting", kind: "internal", place: "Office" },
  { id: 3, title: "Coffee class", kind: "public", place: "Office" },
];

const columns: DataGridColumn<Event>[] = [
  {
    id: "title",
    header: "Event",
    required: true,
    cell: (event) => event.title,
    sortValue: (event) => event.title,
    searchValue: (event) => event.title,
  },
  {
    id: "kind",
    header: "Kind",
    cell: (event) => event.kind,
    filter: {
      type: "options",
      options: [
        { value: "public", label: "Public" },
        { value: "internal", label: "Internal" },
      ],
      value: (event) => event.kind,
    },
  },
  {
    id: "place",
    header: "Place",
    cell: (event) => event.place,
    filter: { type: "text", value: (event) => event.place },
  },
];

/** The view of the tests: a list with the titles of the rows it receives. */
function renderList(rows: Event[]) {
  return (
    <ul aria-label="Calendar">
      {rows.map((event) => (
        <li key={event.id}>{event.title}</li>
      ))}
    </ul>
  );
}

function renderGrid(props: Partial<DataGridProps<Event>> = {}) {
  return render(
    <DataGrid
      caption="Events"
      columns={columns}
      rows={events}
      getRowKey={(event) => event.id}
      getRowLabel={(event) => event.title}
      search={{ placeholder: "Search the events" }}
      renderView={renderList}
      {...props}
    />,
  );
}

const titles = () => within(screen.getByRole("list", { name: "Calendar" })).getAllByRole("listitem").map((item) => item.textContent);

describe("DataGrid: another view in the place of the table", () => {
  test("the view is shown in the place of the table, with every row", () => {
    renderGrid();
    expect(screen.queryByRole("table")).toBeNull();
    expect(titles()).toEqual(["Tasting", "Team meeting", "Coffee class"]);
  });

  test("without renderView the table is shown, so an app switches by giving it or not", () => {
    renderGrid({ renderView: undefined });
    expect(screen.getByRole("table", { name: "Events" })).toBeDefined();
    expect(screen.queryByRole("list", { name: "Calendar" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Kind" })).toBeNull();
  });

  test("the search field stays above the view and filters its rows", async () => {
    const user = userEvent.setup();
    renderGrid();
    await user.type(screen.getByRole("searchbox", { name: "Search the events" }), "coffee");
    expect(titles()).toEqual(["Coffee class"]);
  });

  test("the filters of the columns are buttons with the name of their column in the toolbar, and filter the view", async () => {
    const user = userEvent.setup();
    const onStateChange = vi.fn();
    renderGrid({ onStateChange });
    const toolbar = document.querySelector("[data-slot=toolbar]") as HTMLElement;
    const kindButton = within(toolbar).getByRole("button", { name: "Filter Kind" });
    expect(kindButton.textContent).toBe("Kind");
    expect(within(toolbar).getByRole("button", { name: "Filter Place" }).textContent).toBe("Place");
    await user.click(kindButton);
    await user.click(screen.getByRole("checkbox", { name: "Public" }));
    expect(titles()).toEqual(["Tasting", "Coffee class"]);
    expect(onStateChange).toHaveBeenLastCalledWith(expect.objectContaining({ filters: { kind: ["public"] } }));
    expect(within(toolbar).getByRole("button", { name: "Filter Kind (filter on)" }).hasAttribute("data-active")).toBe(
      true,
    );
  });

  test("the search and the filters stay when the app changes between the table and the view", async () => {
    const user = userEvent.setup();
    const { rerender } = renderGrid();
    await user.click(screen.getByRole("button", { name: "Filter Place" }));
    await user.type(screen.getByRole("textbox", { name: "Filter Place" }), "office");
    await user.keyboard("{Escape}");
    expect(titles()).toEqual(["Team meeting", "Coffee class"]);
    rerender(
      <DataGrid
        caption="Events"
        columns={columns}
        rows={events}
        getRowKey={(event) => event.id}
        getRowLabel={(event) => event.title}
        search={{ placeholder: "Search the events" }}
      />,
    );
    const body = screen.getByRole("table").querySelector("tbody") as HTMLElement;
    expect([...body.querySelectorAll("tr")].map((row) => row.querySelector("td")?.textContent)).toEqual([
      "Team meeting",
      "Coffee class",
    ]);
    expect(screen.getByRole("button", { name: "Filter Place (filter on)" })).toBeDefined();
  });

  test('"Clear filters" works above the view', async () => {
    const user = userEvent.setup();
    renderGrid({ defaultState: { search: "class", filters: { kind: ["public"] } } });
    expect(titles()).toEqual(["Coffee class"]);
    await user.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(titles()).toHaveLength(3);
  });

  test("the view receives the rows in the order of the sort", () => {
    renderGrid({ defaultState: { sort: { columnId: "title", descending: false } }, locale: "en" });
    expect(titles()).toEqual(["Coffee class", "Tasting", "Team meeting"]);
  });

  test("with a view there is no selection, no pages and no menu of the columns, and the view gets every page", () => {
    renderGrid({
      pageSize: 2,
      columnsMenu: true,
      selection: { actions: () => <button type="button">Archive</button> },
    });
    expect(titles()).toHaveLength(3);
    expect(screen.queryByRole("navigation", { name: "Pagination" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Columns" })).toBeNull();
    expect(screen.queryByRole("checkbox")).toBeNull();
  });

  test("the filter of a hidden column is not in the toolbar", () => {
    renderGrid({ hiddenColumns: ["place"] });
    expect(screen.getByRole("button", { name: "Filter Kind" })).toBeDefined();
    expect(screen.queryByRole("button", { name: "Filter Place" })).toBeNull();
  });
});
