import { describe, it, expect } from "vite-plus/test";
import { flush } from "solid-js";
import { mountComponent } from "./utils/browser-render";
import { RLTable } from "../src/components/table/RLTable";
import type { TableApi, TableColumn } from "../src/components/table/table.types";

describe("RLTable — DOM & TableApi interactions", () => {
  const sampleData = [
    { id: "1", name: "Alice", role: "Admin", score: 95, details: { team: "Core" } },
    { id: "2", name: "Bob", role: "Developer", score: 82, details: { team: "UI" } },
    { id: "3", name: "Charlie", role: "Developer", score: 88, details: { team: "UI" } },
  ];

  const columns: TableColumn<any>[] = [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "name", header: "Name" },
    { accessorKey: "role", header: "Role" },
    { accessorKey: "score", header: "Score" },
    { id: "team", accessorFn: (r) => r.details.team, header: "Team" },
  ];

  it("exposes TableApi with row count and selection helpers", () => {
    let api: TableApi | null = null;

    mountComponent(() => (
      <RLTable
        data={sampleData}
        columns={columns}
        onApi={(a: TableApi) => {
          api = a;
        }}
      />
    ));

    expect(api).not.toBeNull();
    expect(api!.getFilteredRows().length).toBe(3);
    expect(api!.getAllColumns().length).toBe(5);
    expect(api!.getIsAllPageRowsSelected()).toBe(false);
    expect(api!.getIsSomePageRowsSelected()).toBe(false);

    api!.toggleAllPageRowsSelected(true);
    flush();
    expect(api!.getState().rowSelection["1"]).toBe(true);
    expect(api!.getState().rowSelection["2"]).toBe(true);
    expect(api!.getState().rowSelection["3"]).toBe(true);
  });

  it("propagates row selection to sub-rows recursively", () => {
    let api: TableApi | null = null;
    const treeData = [
      {
        id: "p1",
        name: "Parent 1",
        children: [
          { id: "c1", name: "Child 1" },
          { id: "c2", name: "Child 2" },
        ],
      },
      {
        id: "p2",
        name: "Parent 2",
      },
    ];

    mountComponent(() => (
      <RLTable
        data={treeData}
        columns={[{ accessorKey: "id" }, { accessorKey: "name" }]}
        getSubRows={(r) => (r as { children?: { id: string; name: string }[] }).children}
        onApi={(a: TableApi) => {
          api = a;
        }}
      />
    ));

    expect(api!.getFilteredRows().length).toBe(2);
    expect(api!.getFlatRows().length).toBe(4);

    const rootRows = api!.getFilteredRows();
    const parentRow = rootRows[0]!;

    // Select parent row -> cascades to children
    parentRow.toggleSelected(true);
    flush();
    expect(api!.getState().rowSelection["p1"]).toBe(true);
    expect(api!.getState().rowSelection["c1"]).toBe(true);
    expect(api!.getState().rowSelection["c2"]).toBe(true);
    expect(parentRow.getIsSelected()).toBe(true);

    // Toggle all rows
    api!.toggleAllRowsSelected(true);
    flush();
    expect(api!.getIsAllRowsSelected()).toBe(true);
    expect(api!.getSelectedRows().length).toBe(4);
  });

  it("supports column sizing, column ordering, and editing state via TableApi", () => {
    let api: TableApi | null = null;

    mountComponent(() => (
      <RLTable
        data={sampleData}
        columns={columns}
        onApi={(a: TableApi) => {
          api = a;
        }}
      />
    ));

    expect(api).not.toBeNull();

    // Column sizing
    api!.setColumnSizing("name", 250);
    flush();
    expect(api!.getState().columnSizing["name"]).toBe(250);
    api!.resetColumnSizing();
    flush();
    expect(api!.getState().columnSizing["name"]).toBeUndefined();

    // Column ordering
    api!.setColumnOrder(["role", "name", "id", "score", "team"]);
    flush();
    expect(api!.getState().columnOrder).toEqual(["role", "name", "id", "score", "team"]);
    expect(api!.getAllColumns()[0]!.accessorKey).toBe("role");

    // Cell editing state
    api!.setEditingCell({ rowId: "1", columnId: "name" });
    flush();
    expect(api!.getEditingCell()).toEqual({ rowId: "1", columnId: "name" });
    api!.setEditingCell(null);
    flush();
    expect(api!.getEditingCell()).toBeNull();
  });
});
