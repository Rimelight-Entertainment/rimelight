import { describe, it, expect } from "vite-plus/test";

import { RLTableTheme } from "../src/components/table/table.theme";
import { RLTable } from "../src/components/table/RLTable";
import { renderSolid } from "./utils/normalize";
import type { TableApi, TableColumn, TableRow } from "../src/components/table/table.types";

describe("RLTable Theme & Logic Suite", () => {
  it("generates correct slot classes with default variants", () => {
    const classes = RLTableTheme({});
    expect(classes.root).toContain("relative");
    expect(classes.base).toContain("min-w-full");
    expect(classes.thead).toContain("relative");
    expect(classes.tbody).toContain("divide-y");
    expect(classes.tr).toContain("transition-colors");
    expect(classes.th).toContain("text-xs");
    expect(classes.td).toContain("text-sm");
    expect(classes.toolbar).toContain("flex");
    expect(classes.resizer).toContain("cursor-col-resize");
    expect(classes.dragHandle).toContain("cursor-grab");
  });

  it("applies sticky, striped, bordered, and hoverable variants", () => {
    const classes = RLTableTheme({
      sticky: true,
      striped: true,
      bordered: true,
      hoverable: true,
    });
    expect(classes.thead).toContain("sticky top-0");
    expect(classes.tfoot).toContain("sticky bottom-0");
    expect(classes.tbody).toContain("nth-child(even)");
    expect(classes.root).toContain("border-2");
    expect(classes.tr).toContain("hover:bg-muted/30");
  });

  it("applies loading variants and animations", () => {
    const classes = RLTableTheme({
      loading: true,
      loadingColor: "primary",
      loadingAnimation: "carousel",
    });
    expect(classes.thead).toContain("after:absolute");
    expect(classes.thead).toContain("after:bg-primary");
  });

  describe("RLTable Rendering & Features", () => {
    const sampleData = [
      { id: "1", name: "Alice", role: "Admin", score: 95, details: { team: "Core" } },
      { id: "2", name: "Bob", role: "Developer", score: 82, details: { team: "UI" } },
      { id: "3", name: "Charlie", role: "Developer", score: 88, details: { team: "UI" } },
    ];

    const columns: TableColumn<(typeof sampleData)[0]>[] = [
      { accessorKey: "id", header: "ID" },
      { accessorKey: "name", header: "Name" },
      { accessorKey: "role", header: "Role" },
      { accessorKey: "score", header: "Score" },
      {
        id: "team",
        header: "Team",
        accessorFn: (row) => row.details.team,
      },
    ];

    it("renders table data with auto-inferred and explicit columns", () => {
      const html = renderSolid(RLTable, {
        data: sampleData,
        columns,
      });

      expect(html).toContain("Alice");
      expect(html).toContain("Bob");
      expect(html).toContain("Charlie");
      expect(html).toContain("Core");
      expect(html).toContain("UI");
      expect(html).toContain("Score");
    });

    it("supports search filtering and empty states", () => {
      const filteredHtml = renderSolid(RLTable, {
        data: sampleData,
        columns,
        globalFilter: "Alice",
      });
      expect(filteredHtml).toContain("Alice");
      expect(filteredHtml).not.toContain("Bob");

      const emptyHtml = renderSolid(RLTable, {
        data: [],
        columns,
        empty: "Custom empty message",
      });
      expect(emptyHtml).toContain("Custom empty message");
    });

    it("supports multi-level grouping with nested depth", () => {
      const html = renderSolid(RLTable, {
        data: sampleData,
        columns,
        grouping: ["role", "name"],
      });

      expect(html).toContain("Admin");
      expect(html).toContain("Developer");
      expect(html).toContain('data-slot="tr-group"');
      expect(html).toContain('data-depth="0"');
      expect(html).toContain('data-depth="1"');
    });

    it("supports slot dictionary overrides for cells and headers", () => {
      const html = renderSolid(RLTable, {
        data: sampleData,
        columns,
        columnSlots: {
          "name-cell": ({ row }: { row: { original: { name: string } } }) =>
            `<span class="custom-name-slot">${row.original.name.toUpperCase()}</span>`,
        },
      });

      expect(html).toContain("custom-name-slot");
      expect(html).toContain("ALICE");
      expect(html).toContain("BOB");
    });

    it("supports tree/hierarchical sub-rows", () => {
      const treeData = [
        {
          id: "p1",
          name: "Parent 1",
          role: "Lead",
          score: 100,
          children: [{ id: "c1", name: "Child 1", role: "Dev", score: 80 }],
        },
      ];

      const html = renderSolid(RLTable, {
        data: treeData,
        columns: [
          { accessorKey: "id", header: "ID" },
          { accessorKey: "name", header: "Name" },
        ],
        expanded: { p1: true },
        getSubRows: (r: {
          children?: Array<{ id: string; name: string; role: string; score: number }>;
        }) => r.children,
      });

      expect(html).toContain("Parent 1");
      expect(html).toContain("Child 1");
    });

    it("supports CSV and JSON data export", () => {
      let api: TableApi | null = null;

      renderSolid(RLTable, {
        data: sampleData,
        columns,
        onApi: (a: TableApi) => {
          api = a;
        },
      });

      expect(api).not.toBeNull();

      // CSV Export
      const csv = api!.exportToCsv();
      expect(csv).toContain("ID,Name,Role,Score,Team");
      expect(csv).toContain("1,Alice,Admin,95,Core");
      expect(csv).toContain("2,Bob,Developer,82,UI");

      // JSON Export
      const json = api!.exportToJson();
      const parsed = JSON.parse(json);
      expect(parsed).toHaveLength(3);
      expect(parsed[0].name).toBe("Alice");
      expect(parsed[0].team).toBe("Core");
    });

    it("computes faceted unique value counts and min/max ranges", () => {
      let api: TableApi | null = null;

      renderSolid(RLTable, {
        data: sampleData,
        columns,
        onApi: (a: TableApi) => {
          api = a;
        },
      });

      expect(api).not.toBeNull();

      // Faceted Unique Values
      const roleMap = api!.getFacetedUniqueValues("role");
      expect(roleMap.get("Admin")).toBe(1);
      expect(roleMap.get("Developer")).toBe(2);

      // Faceted Min/Max
      const scoreRange = api!.getFacetedMinMaxValues("score");
      expect(scoreRange).toEqual([82, 95]);
    });

    it("renders dedicated drag handles for column and row reordering", () => {
      const htmlCols = renderSolid(RLTable, {
        data: sampleData,
        columns,
        enableColumnReordering: true,
      });
      expect(htmlCols).toContain('data-slot="drag-handle"');

      const htmlRows = renderSolid(RLTable, {
        data: sampleData,
        columns,
        enableRowReordering: true,
      });
      expect(htmlRows).toContain('data-col-id="reorder"');
      expect(htmlRows).toContain('data-slot="drag-handle"');
    });

    it("renders actions dropdown column cleanly from actions property", () => {
      const actionsCols: TableColumn<any>[] = [
        { accessorKey: "name", header: "Name" },
        {
          id: "actions",
          actions: (row) => [
            { label: "Edit", icon: "i-lucide-pencil", href: `/edit/${row.original.id}` },
            { type: "separator" },
            { label: "Delete", icon: "i-lucide-trash-2", color: "error" },
          ],
        },
      ];
      const html = renderSolid(RLTable, {
        data: sampleData,
        columns: actionsCols,
      });
      expect(html).toContain('data-col-id="actions"');
      expect(html).toContain('data-slot="trigger"');
    });

    it("auto-injects actions column when actions prop is passed to table", () => {
      const html = renderSolid(RLTable, {
        data: sampleData,
        columns: [{ accessorKey: "name", header: "Name" }],
        actions: (row: TableRow<{ id: number }>) => [
          { label: "View Profile", href: `/profile/${row.original.id}` },
        ],
      });
      expect(html).toContain('data-col-id="actions"');
      expect(html).toContain('data-slot="trigger"');
    });
  });
});
