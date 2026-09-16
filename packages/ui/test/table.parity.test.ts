import { describe, it, expect, vi } from "vite-plus/test"

vi.mock("virtual:rimelight/ui", () => ({
  default: {
    unstyled: false,
    components: { themes: {} },
    icons: {}
  }
}))

import { tableTheme } from "../src/components/table/table.theme"
import RLSTable from "../src/components/table/RLSTable"
import { renderSolid } from "./utils/normalize"
import type { TableApi, TableColumn } from "../src/components/table/table"

describe("RLTable Theme & Logic Parity", () => {
  it("generates correct slot classes with default variants", () => {
    const classes = tableTheme({})
    expect(classes.root).toContain("relative")
    expect(classes.base).toContain("min-w-full")
    expect(classes.thead).toContain("relative")
    expect(classes.tbody).toContain("divide-y")
    expect(classes.tr).toContain("transition-colors")
    expect(classes.th).toContain("text-xs")
    expect(classes.td).toContain("text-sm")
    expect(classes.toolbar).toContain("flex")
    expect(classes.resizer).toContain("cursor-col-resize")
    expect(classes.dragHandle).toContain("cursor-grab")
  })

  it("applies sticky, striped, bordered, and hoverable variants", () => {
    const classes = tableTheme({
      sticky: true,
      striped: true,
      bordered: true,
      hoverable: true
    })
    expect(classes.thead).toContain("sticky top-0")
    expect(classes.tfoot).toContain("sticky bottom-0")
    expect(classes.tbody).toContain("nth-child(even)")
    expect(classes.root).toContain("border-2")
    expect(classes.tr).toContain("hover:bg-muted/30")
  })

  it("applies loading variants and animations", () => {
    const classes = tableTheme({
      loading: true,
      loadingColor: "primary",
      loadingAnimation: "carousel"
    })
    expect(classes.thead).toContain("after:absolute")
    expect(classes.thead).toContain("after:bg-primary")
  })

  describe("RLSTable Rendering & Features", () => {
    const sampleData = [
      { id: "1", name: "Alice", role: "Admin", score: 95, details: { team: "Core" } },
      { id: "2", name: "Bob", role: "Developer", score: 82, details: { team: "UI" } },
      { id: "3", name: "Charlie", role: "Developer", score: 88, details: { team: "UI" } }
    ]

    const columns: TableColumn<(typeof sampleData)[0]>[] = [
      { accessorKey: "id", header: "ID" },
      { accessorKey: "name", header: "Name" },
      { accessorKey: "role", header: "Role" },
      { accessorKey: "score", header: "Score" },
      {
        id: "team",
        header: "Team",
        accessorFn: (row) => row.details.team
      }
    ]

    it("renders table data with auto-inferred and explicit columns", () => {
      const html = renderSolid(RLSTable, {
        data: sampleData,
        columns
      })

      expect(html).toContain("Alice")
      expect(html).toContain("Bob")
      expect(html).toContain("Charlie")
      expect(html).toContain("Core")
      expect(html).toContain("UI")
      expect(html).toContain("Score")
    })

    it("supports search filtering and empty states", () => {
      const filteredHtml = renderSolid(RLSTable, {
        data: sampleData,
        columns,
        globalFilter: "Alice"
      })
      expect(filteredHtml).toContain("Alice")
      expect(filteredHtml).not.toContain("Bob")

      const emptyHtml = renderSolid(RLSTable, {
        data: [],
        columns,
        empty: "Custom empty message"
      })
      expect(emptyHtml).toContain("Custom empty message")
    })

    it("supports multi-level grouping with nested depth", () => {
      const html = renderSolid(RLSTable, {
        data: sampleData,
        columns,
        grouping: ["role", "name"]
      })

      expect(html).toContain("Admin")
      expect(html).toContain("Developer")
      expect(html).toContain('data-slot="tr-group"')
      expect(html).toContain('data-depth="0"')
      expect(html).toContain('data-depth="1"')
    })

    it("supports slot dictionary overrides for cells and headers", () => {
      const html = renderSolid(RLSTable, {
        data: sampleData,
        columns,
        slots: {
          "name-cell": ({ row }: { row: { original: { name: string } } }) =>
            `<span class="custom-name-slot">${row.original.name.toUpperCase()}</span>`
        }
      })

      expect(html).toContain("custom-name-slot")
      expect(html).toContain("ALICE")
      expect(html).toContain("BOB")
    })

    it("supports tree/hierarchical sub-rows", () => {
      const treeData = [
        {
          id: "p1",
          name: "Parent 1",
          role: "Lead",
          score: 100,
          children: [{ id: "c1", name: "Child 1", role: "Dev", score: 80 }]
        }
      ]

      const html = renderSolid(RLSTable, {
        data: treeData,
        columns: [
          { accessorKey: "id", header: "ID" },
          { accessorKey: "name", header: "Name" }
        ],
        expanded: { p1: true },
        getSubRows: (r: {
          children?: Array<{ id: string; name: string; role: string; score: number }>
        }) => r.children
      })

      expect(html).toContain("Parent 1")
      expect(html).toContain("Child 1")
    })

    it("exposes TableApi with row count and selection helpers", () => {
      let api: TableApi | null = null

      renderSolid(RLSTable, {
        data: sampleData,
        columns,
        ref: (a: TableApi) => {
          api = a
        }
      })

      expect(api).not.toBeNull()
      expect(api!.getFilteredRows().length).toBe(3)
      expect(api!.getAllColumns().length).toBe(5)
      expect(api!.getIsAllPageRowsSelected()).toBe(false)
      expect(api!.getIsSomePageRowsSelected()).toBe(false)

      api!.toggleAllPageRowsSelected(true)
      expect(api!.getState().rowSelection["1"]).toBe(true)
      expect(api!.getState().rowSelection["2"]).toBe(true)
      expect(api!.getState().rowSelection["3"]).toBe(true)
    })

    it("propagates row selection to sub-rows recursively", () => {
      let api: TableApi | null = null
      const treeData = [
        {
          id: "p1",
          name: "Parent 1",
          children: [
            { id: "c1", name: "Child 1" },
            { id: "c2", name: "Child 2" }
          ]
        },
        {
          id: "p2",
          name: "Parent 2"
        }
      ]

      renderSolid(RLSTable, {
        data: treeData,
        columns: [{ accessorKey: "id" }, { accessorKey: "name" }],
        getSubRows: (r: { children?: Array<{ id: string; name: string }> }) => r.children,
        ref: (a: TableApi) => {
          api = a
        }
      })

      expect(api!.getFilteredRows().length).toBe(2)
      expect(api!.getFlatRows().length).toBe(4)

      const rootRows = api!.getFilteredRows()
      const parentRow = rootRows[0]!

      // Select parent row -> cascades to children
      parentRow.toggleSelected(true)
      expect(api!.getState().rowSelection["p1"]).toBe(true)
      expect(api!.getState().rowSelection["c1"]).toBe(true)
      expect(api!.getState().rowSelection["c2"]).toBe(true)
      expect(parentRow.getIsSelected()).toBe(true)

      // Toggle all rows
      api!.toggleAllRowsSelected(true)
      expect(api!.getIsAllRowsSelected()).toBe(true)
      expect(api!.getSelectedRows().length).toBe(4)
    })

    it("supports column sizing, column ordering, and editing state via TableApi", () => {
      let api: TableApi | null = null

      renderSolid(RLSTable, {
        data: sampleData,
        columns,
        ref: (a: TableApi) => {
          api = a
        }
      })

      expect(api).not.toBeNull()

      // Column sizing
      api!.setColumnSizing("name", 250)
      expect(api!.getState().columnSizing["name"]).toBe(250)
      api!.resetColumnSizing()
      expect(api!.getState().columnSizing["name"]).toBeUndefined()

      // Column ordering
      api!.setColumnOrder(["role", "name", "id", "score", "team"])
      expect(api!.getState().columnOrder).toEqual(["role", "name", "id", "score", "team"])
      expect(api!.getAllColumns()[0]!.accessorKey).toBe("role")

      // Cell editing state
      api!.setEditingCell({ rowId: "1", columnId: "name" })
      expect(api!.getEditingCell()).toEqual({ rowId: "1", columnId: "name" })
      api!.setEditingCell(null)
      expect(api!.getEditingCell()).toBeNull()
    })

    it("supports CSV and JSON data export", () => {
      let api: TableApi | null = null

      renderSolid(RLSTable, {
        data: sampleData,
        columns,
        ref: (a: TableApi) => {
          api = a
        }
      })

      expect(api).not.toBeNull()

      // CSV Export
      const csv = api!.exportToCsv()
      expect(csv).toContain("ID,Name,Role,Score,Team")
      expect(csv).toContain("1,Alice,Admin,95,Core")
      expect(csv).toContain("2,Bob,Developer,82,UI")

      // JSON Export
      const json = api!.exportToJson()
      const parsed = JSON.parse(json)
      expect(parsed).toHaveLength(3)
      expect(parsed[0].name).toBe("Alice")
      expect(parsed[0].team).toBe("Core")
    })

    it("computes faceted unique value counts and min/max ranges", () => {
      let api: TableApi | null = null

      renderSolid(RLSTable, {
        data: sampleData,
        columns,
        ref: (a: TableApi) => {
          api = a
        }
      })

      expect(api).not.toBeNull()

      // Faceted Unique Values
      const roleMap = api!.getFacetedUniqueValues("role")
      expect(roleMap.get("Admin")).toBe(1)
      expect(roleMap.get("Developer")).toBe(2)

      // Faceted Min/Max
      const scoreRange = api!.getFacetedMinMaxValues("score")
      expect(scoreRange).toEqual([82, 95])
    })

    it("renders dedicated drag handles for column and row reordering", () => {
      const htmlCols = renderSolid(RLSTable, {
        data: sampleData,
        columns,
        enableColumnReordering: true
      })
      expect(htmlCols).toContain('data-slot="drag-handle"')

      const htmlRows = renderSolid(RLSTable, {
        data: sampleData,
        columns,
        enableRowReordering: true
      })
      expect(htmlRows).toContain('data-col-id="reorder"')
      expect(htmlRows).toContain('data-slot="drag-handle"')
    })
  })
})
