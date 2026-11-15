import { describe, expect, test } from "vitest";
import type { DataGridColumn } from "./data-grid-options";
import { nextSort, normalizeText, searchAndSortRows } from "./data-grid-rows";

type Product = { name: string; price: number | null; code: string };

const products: Product[] = [
  { name: "Pão de queijo", price: 9.5, code: "P10" },
  { name: "café", price: 7, code: "P9" },
  { name: "Água", price: null, code: "P100" },
  { name: "Bolo", price: 12, code: "P2" },
];

const columns: DataGridColumn<Product>[] = [
  {
    id: "name",
    header: "Product",
    cell: (product) => product.name,
    sortValue: (product) => product.name,
    searchValue: (product) => product.name,
  },
  {
    id: "price",
    header: "Price",
    cell: (product) => product.price,
    sortValue: (product) => product.price,
  },
  {
    id: "code",
    header: "Code",
    cell: (product) => product.code,
    sortValue: (product) => product.code,
    searchValue: (product) => product.code,
  },
];

const names = (rows: Product[]) => rows.map((product) => product.name);

describe("normalizeText", () => {
  test("removes capital letters, accents and the spaces around the text", () => {
    expect(normalizeText("  João  ")).toBe("joao");
    expect(normalizeText("ÁGUA")).toBe("agua");
  });
});

describe("searchAndSortRows", () => {
  test("with no search and no sort, the rows are in the order the app gave", () => {
    expect(names(searchAndSortRows(products, columns, "", null))).toEqual([
      "Pão de queijo",
      "café",
      "Água",
      "Bolo",
    ]);
  });

  test("the search ignores capital letters and accents, and looks in every column with searchValue", () => {
    expect(names(searchAndSortRows(products, columns, "PAO", null))).toEqual(["Pão de queijo"]);
    expect(names(searchAndSortRows(products, columns, "agua", null))).toEqual(["Água"]);
    expect(names(searchAndSortRows(products, columns, "p10", null))).toEqual(["Pão de queijo", "Água"]);
  });

  test("the search does not look in a column with no searchValue", () => {
    expect(searchAndSortRows(products, columns, "12", null)).toEqual([]);
  });

  test("sorts texts the way the language orders them, with no difference for capital letters and accents", () => {
    const sorted = searchAndSortRows(products, columns, "", { columnId: "name", descending: false }, "pt-BR");
    expect(names(sorted)).toEqual(["Água", "Bolo", "café", "Pão de queijo"]);
  });

  test("sorts numbers by their value, and a text with a number by the number", () => {
    const byPrice = searchAndSortRows(products, columns, "", { columnId: "price", descending: true });
    expect(names(byPrice)).toEqual(["Bolo", "Pão de queijo", "café", "Água"]);
    const byCode = searchAndSortRows(products, columns, "", { columnId: "code", descending: false }, "pt-BR");
    expect(byCode.map((product) => product.code)).toEqual(["P2", "P9", "P10", "P100"]);
  });

  test("a row with null goes to the end in both directions", () => {
    const ascending = searchAndSortRows(products, columns, "", { columnId: "price", descending: false });
    const descending = searchAndSortRows(products, columns, "", { columnId: "price", descending: true });
    expect(names(ascending).at(-1)).toBe("Água");
    expect(names(descending).at(-1)).toBe("Água");
  });

  test("a sort by a column that does not exist changes nothing, and the list of the app is not changed", () => {
    const copy = [...products];
    const sorted = searchAndSortRows(products, columns, "", { columnId: "missing", descending: false });
    expect(sorted).toEqual(copy);
    searchAndSortRows(products, columns, "", { columnId: "name", descending: false });
    expect(products).toEqual(copy);
  });
});

describe("nextSort", () => {
  test("a press goes from no sort to ascending, to descending, and back to no sort", () => {
    const ascending = nextSort(null, "name");
    expect(ascending).toEqual({ columnId: "name", descending: false });
    const descending = nextSort(ascending, "name");
    expect(descending).toEqual({ columnId: "name", descending: true });
    expect(nextSort(descending, "name")).toBeNull();
  });

  test("a press on another column starts with ascending", () => {
    expect(nextSort({ columnId: "name", descending: true }, "price")).toEqual({
      columnId: "price",
      descending: false,
    });
  });
});
