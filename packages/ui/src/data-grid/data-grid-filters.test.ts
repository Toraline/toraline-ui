import { describe, expect, test } from "vitest";
import type { DataGridColumn } from "./data-grid-options";
import {
  checkedFilterValues,
  filterText,
  isFilterOn,
  searchAndSortRows,
  withFilterValue,
} from "./data-grid-rows";

type Person = { name: string; role: string; teams: string[] };

const people: Person[] = [
  { name: "Ana", role: "admin", teams: ["sales"] },
  { name: "João", role: "staff", teams: ["sales", "kitchen"] },
  { name: "Rui", role: "staff", teams: [] },
];

const nameColumn: DataGridColumn<Person> = {
  id: "name",
  header: "Name",
  cell: (person) => person.name,
  filter: { type: "text", value: (person) => person.name },
};

const roleColumn: DataGridColumn<Person> = {
  id: "role",
  header: "Role",
  cell: (person) => person.role,
  filter: {
    type: "options",
    options: [
      { value: "admin", label: "Admin" },
      { value: "staff", label: "Staff" },
    ],
    value: (person) => person.role,
    defaultValues: ["staff"],
  },
};

const teamsColumn: DataGridColumn<Person> = {
  id: "teams",
  header: "Teams",
  cell: (person) => person.teams.join(", "),
  filter: {
    type: "options",
    options: [
      { value: "sales", label: "Sales" },
      { value: "kitchen", label: "Kitchen" },
    ],
    value: (person) => person.teams,
  },
};

const columns = [nameColumn, roleColumn, teamsColumn];
const names = (rows: Person[]) => rows.map((person) => person.name);

describe("the filters of the columns", () => {
  test("a column that is not in the filters has its default choices", () => {
    expect(checkedFilterValues(roleColumn, {})).toEqual(["staff"]);
    expect(checkedFilterValues(teamsColumn, {})).toEqual([]);
    expect(isFilterOn(roleColumn, {})).toBe(true);
    expect(isFilterOn(teamsColumn, {})).toBe(false);
  });

  test("an empty list means that a person unchecked the defaults", () => {
    expect(checkedFilterValues(roleColumn, { role: [] })).toEqual([]);
    expect(isFilterOn(roleColumn, { role: [] })).toBe(false);
  });

  test("the text of a text filter", () => {
    expect(filterText(nameColumn, {})).toBe("");
    expect(filterText(nameColumn, { name: "an" })).toBe("an");
    expect(isFilterOn(nameColumn, { name: "an" })).toBe(true);
    expect(filterText(roleColumn, { role: ["admin"] })).toBe("");
  });

  test("a value that is the default of the column is taken out of the filters", () => {
    expect(withFilterValue(roleColumn, {}, ["admin"])).toEqual({ role: ["admin"] });
    expect(withFilterValue(roleColumn, { role: ["admin"] }, ["staff"])).toEqual({});
    expect(withFilterValue(roleColumn, {}, [])).toEqual({ role: [] });
    expect(withFilterValue(teamsColumn, { teams: ["sales"] }, [])).toEqual({});
    expect(withFilterValue(nameColumn, { name: "a" }, "")).toEqual({});
    expect(withFilterValue(nameColumn, { role: [] }, "a")).toEqual({ role: [], name: "a" });
  });

  test("the checked choices are kept in the order of the choices of the column", () => {
    expect(withFilterValue(teamsColumn, {}, ["kitchen", "sales"])).toEqual({ teams: ["sales", "kitchen"] });
  });

  test("the rows pass the filter of every column given", () => {
    expect(names(searchAndSortRows(people, columns, "", null, "en"))).toEqual(["João", "Rui"]);
    expect(names(searchAndSortRows(people, columns, "", null, "en", { role: [] }))).toEqual(["Ana", "João", "Rui"]);
    expect(names(searchAndSortRows(people, columns, "", null, "en", { role: [], teams: ["kitchen"] }))).toEqual([
      "João",
    ]);
    expect(names(searchAndSortRows(people, columns, "", null, "en", { role: [], name: "JOAO" }))).toEqual(["João"]);
  });

  test("a column that is not given does not filter", () => {
    expect(names(searchAndSortRows(people, [nameColumn], "", null, "en", { role: ["admin"] }))).toEqual([
      "Ana",
      "João",
      "Rui",
    ]);
  });
});
