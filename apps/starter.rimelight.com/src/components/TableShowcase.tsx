import { createSignal, createMemo, Show } from "solid-js"
import RLSTable from "@rimelight/ui/components/table/RLSTable.tsx"
import type { TableColumn, TableApi, TableRow } from "@rimelight/ui/components/table/table.ts"
import RLSButton from "@rimelight/ui/components/button/RLSButton.tsx"
import RLSBadge from "@rimelight/ui/components/badge/RLSBadge.tsx"
import RLSCheckbox from "@rimelight/ui/components/checkbox/RLSCheckbox.tsx"
import RLSDropdownMenu from "@rimelight/ui/components/dropdown-menu/RLSDropdownMenu.tsx"
import {
  SHOWCASE_PAYMENTS_DATA,
  formatShowcaseDate,
  formatShowcaseCurrency,
  type PaymentItem
} from "./showcase-table-data"

export default function TableShowcase() {
  const [tableRef, setTableRef] = createSignal<TableApi<PaymentItem> | null>(null)
  const [data, setData] = createSignal<PaymentItem[]>(SHOWCASE_PAYMENTS_DATA)
  const [loading, setLoading] = createSignal<boolean>(false)
  const [striped, setStriped] = createSignal<boolean>(true)
  const [bordered, setBordered] = createSignal<boolean>(false)
  const [hoverable, setHoverable] = createSignal<boolean>(true)
  const [grouping, setGrouping] = createSignal<string[]>(["category"])
  const [selectedRows, setSelectedRows] = createSignal<Record<string, boolean>>({})
  const [lastClickedRow, setLastClickedRow] = createSignal<string>("None")
  const [loadingAnimation, setLoadingAnimation] = createSignal<
    "carousel" | "carousel-inverse" | "swing" | "elastic"
  >("carousel")

  const columns = createMemo<TableColumn<PaymentItem>[]>(() => [
    {
      id: "select",
      size: 44,
      header: ({ table }: { table: TableApi<PaymentItem> }) => {
        const total = () => table?.getFilteredRows().length || 0
        const selCount = () => Object.values(selectedRows()).filter(Boolean).length
        const allSelected = () => total() > 0 && selCount() === total()
        return (
          <RLSCheckbox
            checked={allSelected()}
            onChange={(e: { currentTarget: HTMLInputElement }) => {
              const checked = e.currentTarget.checked
              const next: Record<string, boolean> = {}
              if (checked) {
                table?.getFilteredRows().forEach((r: TableRow<PaymentItem>) => (next[r.id] = true))
              }
              setSelectedRows(next)
            }}
          />
        )
      },
      cell: ({ row }: { row: TableRow<PaymentItem> }) => (
        <RLSCheckbox
          checked={!!selectedRows()[row.id]}
          onChange={(e: { currentTarget: HTMLInputElement }) => {
            setSelectedRows({ ...selectedRows(), [row.id]: e.currentTarget.checked })
          }}
        />
      ),
      enableSorting: false,
      enableHiding: false
    },
    {
      accessorKey: "id",
      header: "Payment ID",
      size: 140,
      cell: ({ row }: { row: TableRow<PaymentItem> }) => (
        <div class="flex items-center gap-2">
          <Show when={row.getCanExpand()}>
            <button
              type="button"
              class="size-5 rounded border border-default flex items-center justify-center text-muted hover:text-highlighted bg-muted/20"
              onClick={(e) => {
                e.stopPropagation()
                row.toggleExpanded()
              }}
            >
              <span
                class={`size-3 transition-transform ${row.getIsExpanded() ? "i-lucide-chevron-down" : "i-lucide-chevron-right"}`}
              />
            </button>
          </Show>
          <span class="font-mono text-xs font-bold text-highlighted">{row.getValue("id")}</span>
        </div>
      )
    },
    {
      accessorKey: "category",
      header: "Category",
      size: 140,
      cell: ({ row }: { row: TableRow<PaymentItem> }) => (
        <span class="text-xs text-toned font-medium">{row.getValue("category")}</span>
      )
    },
    {
      accessorKey: "date",
      header: "Date",
      size: 150,
      cell: ({ row }: { row: TableRow<PaymentItem> }) => (
        <span class="font-mono text-xs text-muted">{formatShowcaseDate(row.getValue("date"))}</span>
      )
    },
    {
      accessorKey: "email",
      header: "Customer Email",
      size: 220,
      cell: ({ row }: { row: TableRow<PaymentItem> }) => (
        <span class="text-xs text-toned truncate block max-w-[200px]" title={row.getValue("email")}>
          {row.getValue("email")}
        </span>
      )
    },
    {
      accessorKey: "status",
      header: "Status",
      size: 110,
      cell: ({ row }: { row: TableRow<PaymentItem> }) => {
        const st = row.getValue("status")
        const color = st === "paid" ? "success" : st === "failed" ? "error" : "neutral"
        return (
          <RLSBadge variant="soft" color={color} size="sm" class="capitalize">
            {st}
          </RLSBadge>
        )
      }
    },
    {
      accessorKey: "amount",
      header: "Amount",
      size: 130,
      meta: {
        class: {
          th: "text-right",
          td: "text-right font-mono font-bold text-highlighted"
        }
      },
      cell: ({ row }: { row: TableRow<PaymentItem> }) =>
        formatShowcaseCurrency(Number(row.getValue("amount"))),
      footer: ({ table }: { table: TableApi<PaymentItem> }) => {
        const total = (table?.getFilteredRows() || []).reduce(
          (acc: number, r: TableRow<PaymentItem>) => acc + (Number(r.getValue("amount")) || 0),
          0
        )
        return (
          <span class="font-mono font-bold text-xs text-highlighted block text-right">
            Total: {formatShowcaseCurrency(total)}
          </span>
        )
      }
    },
    {
      id: "actions",
      header: "Actions",
      size: 90,
      enableSorting: false,
      enableHiding: false,
      meta: {
        class: {
          th: "text-center",
          td: "text-center"
        }
      },
      cell: ({ row }: { row: TableRow<PaymentItem> }) => {
        const dropdownItems = [
          [
            {
              label: "Payment Details",
              icon: "info",
              onSelect: () => alert(`Payment ${row.id}: $${row.getValue("amount")}`)
            },
            {
              label: row.getIsExpanded() ? "Collapse Row" : "Expand Row",
              icon: row.getIsExpanded() ? "chevronUp" : "chevronDown",
              onSelect: () => row.toggleExpanded()
            }
          ],
          [
            {
              label: row.getIsPinned() ? "Unpin Row" : "Pin to Top",
              icon: "pin",
              onSelect: () => row.pin(row.getIsPinned() ? false : "top")
            }
          ],
          [
            {
              label: "Delete Payment",
              icon: "trash",
              color: "error" as const,
              onSelect: () => {
                setData(data().filter((item) => item.id !== row.id))
              }
            }
          ]
        ]

        return (
          <RLSDropdownMenu
            items={dropdownItems as any}
            size="xs"
            color="neutral"
            content={{ align: "end" }}
          />
        )
      }
    }
  ])

  return (
    <div class="flex flex-col gap-6 w-full">
      {/* Controls Bar */}
      <div class="flex flex-wrap items-center gap-3 p-4 rounded-xl border border-default bg-muted/20">
        <RLSButton
          size="sm"
          color={striped() ? "primary" : "neutral"}
          variant={striped() ? "solid" : "outline"}
          onClick={() => setStriped(!striped())}
        >
          {striped() ? "Striped: ON" : "Striped: OFF"}
        </RLSButton>

        <RLSButton
          size="sm"
          color={bordered() ? "primary" : "neutral"}
          variant={bordered() ? "solid" : "outline"}
          onClick={() => setBordered(!bordered())}
        >
          {bordered() ? "Bordered: ON" : "Bordered: OFF"}
        </RLSButton>

        <RLSButton
          size="sm"
          color={hoverable() ? "primary" : "neutral"}
          variant={hoverable() ? "solid" : "outline"}
          onClick={() => setHoverable(!hoverable())}
        >
          {hoverable() ? "Hoverable: ON" : "Hoverable: OFF"}
        </RLSButton>

        <RLSButton
          size="sm"
          color={grouping().length > 0 ? "primary" : "neutral"}
          variant={grouping().length > 0 ? "solid" : "outline"}
          onClick={() => setGrouping(grouping().length > 0 ? [] : ["category"])}
        >
          {grouping().length > 0 ? "Grouping: ON (Category)" : "Grouping: OFF"}
        </RLSButton>

        <RLSButton
          size="sm"
          color="neutral"
          variant="outline"
          onClick={() => {
            setLoading(true)
            setTimeout(() => setLoading(false), 2000)
          }}
        >
          Test Loading Bar
        </RLSButton>

        <div class="flex items-center gap-2 ml-auto">
          <span class="text-xs text-muted">Anim:</span>
          <select
            class="text-xs bg-muted/20 border border-default rounded px-2 py-1 text-toned"
            value={loadingAnimation()}
            onChange={(e) =>
              setLoadingAnimation(
                e.currentTarget.value as "carousel" | "carousel-inverse" | "swing" | "elastic"
              )
            }
          >
            <option value="carousel">Carousel</option>
            <option value="carousel-inverse">Carousel-Inverse</option>
            <option value="swing">Swing</option>
            <option value="elastic">Elastic</option>
          </select>
        </div>

        <RLSButton
          size="sm"
          color="neutral"
          variant="outline"
          onClick={() => {
            if (data().length > 0) setData([])
            else setData(SHOWCASE_PAYMENTS_DATA)
          }}
        >
          {data().length === 0 ? "Restore Data" : "Clear (Test Empty State)"}
        </RLSButton>
      </div>

      {/* Solid Table Component */}
      <RLSTable<PaymentItem>
        ref={(api: TableApi<PaymentItem>) => {
          setTableRef(api)
        }}
        data={data()}
        columns={columns()}
        searchable={true}
        showColumnsToggle={true}
        striped={striped()}
        bordered={bordered()}
        hoverable={hoverable()}
        grouping={grouping()}
        loading={loading()}
        loadingAnimation={loadingAnimation()}
        rowSelection={selectedRows()}
        onRowSelectionChange={setSelectedRows}
        columnPinning={{ left: ["select", "id"], right: ["actions"] }}
        pagination={{ pageIndex: 0, pageSize: 6 }}
        getSubRows={(row: PaymentItem) => row.children}
        onSelect={(_e: Event, row: TableRow<PaymentItem>) => {
          setLastClickedRow(`${row.id} (${row.original.email})`)
          row.toggleExpanded()
        }}
        expandedContent={(row: TableRow<PaymentItem>) => (
          <div class="p-4 rounded bg-muted/40 text-xs font-mono flex flex-col gap-1 border border-default/50">
            <span class="font-bold text-highlighted uppercase tracking-wider">
              Sub-row Detail Inspector:
            </span>
            <pre class="overflow-x-auto text-toned">{JSON.stringify(row.original, null, 2)}</pre>
          </div>
        )}
      />

      {/* Event state readouts */}
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
        <div class="p-3 rounded-lg border border-default bg-muted/10">
          <span class="text-muted block">Selected rows:</span>
          <span class="font-bold text-highlighted">
            {tableRef()?.getFilteredRows().length ?? data().length} rows |{" "}
            {Object.values(selectedRows()).filter(Boolean).length} selected
          </span>
        </div>
        <div class="p-3 rounded-lg border border-default bg-muted/10">
          <span class="text-muted block">Last clicked row (onSelect):</span>
          <span class="font-bold text-highlighted">{lastClickedRow()}</span>
        </div>
      </div>
    </div>
  )
}
