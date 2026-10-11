import { createSignal, createMemo, Show, For } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLTable } from "@rimelight/ui/components/table/RLTable.tsx";
import type {
  TableColumn,
  TableApi,
  TableRow,
} from "@rimelight/ui/components/table/table.types.ts";
import { RLButton } from "@rimelight/ui/components/button/RLButton.tsx";
import { RLBadge } from "@rimelight/ui/components/badge/RLBadge.tsx";
import { RLCheckbox } from "@rimelight/ui/components/checkbox/RLCheckbox.tsx";
import { RLDropdownMenu } from "@rimelight/ui/components/dropdown-menu/RLDropdownMenu.tsx";
import {
  SHOWCASE_PAYMENTS_DATA,
  formatShowcaseDate,
  formatShowcaseCurrency,
  type PaymentItem,
} from "./table-showcase-data";
import type { ComponentAuditDefinition } from "./types";

interface SimpleUser {
  id: number;
  name: string;
  role: string;
  department: string;
  status: "active" | "invited" | "suspended";
}

const SAMPLE_USERS: SimpleUser[] = [
  { id: 1, name: "Alice Morgan", role: "Design Lead", department: "Product", status: "active" },
  {
    id: 2,
    name: "David Kim",
    role: "Software Architect",
    department: "Engineering",
    status: "active",
  },
  {
    id: 3,
    name: "Elena Rostova",
    role: "Product Manager",
    department: "Product",
    status: "invited",
  },
  {
    id: 4,
    name: "Marcus Vance",
    role: "Security Engineer",
    department: "Infrastructure",
    status: "suspended",
  },
  { id: 5, name: "Sophia Chen", role: "Frontend Dev", department: "Engineering", status: "active" },
];

export const TableSandbox = (): JSX.Element => {
  const [data, setData] = createSignal<PaymentItem[]>(SHOWCASE_PAYMENTS_DATA);
  const [loading, setLoading] = createSignal<boolean>(false);
  const [striped, setStriped] = createSignal<boolean>(true);
  const [bordered, setBordered] = createSignal<boolean>(false);
  const [hoverable, setHoverable] = createSignal<boolean>(true);
  const [groupingLevel, setGroupingLevel] = createSignal<"none" | "category" | "multi">("category");
  const [enableResizing, setEnableResizing] = createSignal<boolean>(true);
  const [enableColumnReordering, setEnableColumnReordering] = createSignal<boolean>(true);
  const [enableRowReordering, setEnableRowReordering] = createSignal<boolean>(false);
  const [selectedRows, setSelectedRows] = createSignal<Record<string, boolean>>({});
  const [lastClickedRow, setLastClickedRow] = createSignal<string>("None");
  const [isVirtual, setIsVirtual] = createSignal<boolean>(false);
  const [loadingAnimation, setLoadingAnimation] = createSignal<
    "carousel" | "carousel-inverse" | "swing" | "elastic"
  >("carousel");

  const grouping = createMemo(() => {
    if (groupingLevel() === "multi") return ["category", "status"];
    if (groupingLevel() === "category") return ["category"];
    return [];
  });

  const facetedStatusCounts = createMemo(() => {
    const map = new Map<string, number>();
    const scan = (items: PaymentItem[]) => {
      for (const item of items) {
        map.set(item.status, (map.get(item.status) ?? 0) + 1);
        if (item.children) scan(item.children);
      }
    };
    scan(data());
    return Array.from(map.entries());
  });

  const facetedAmountRange = createMemo(() => {
    let min = Infinity;
    let max = -Infinity;
    const scan = (items: PaymentItem[]) => {
      for (const item of items) {
        const val = Number(item.amount) || 0;
        if (val < min) min = val;
        if (val > max) max = val;
        if (item.children) scan(item.children);
      }
    };
    scan(data());
    if (min === Infinity) return "N/A";
    return `$${min} - $${max}`;
  });

  const totalRowCount = createMemo(() => {
    let count = 0;
    const scan = (items: PaymentItem[]) => {
      for (const item of items) {
        count += 1;
        if (item.children) scan(item.children);
      }
    };
    scan(data());
    return count;
  });

  const selectedCount = createMemo(() => {
    return Object.values(selectedRows()).filter(Boolean).length;
  });

  const largeDataset: PaymentItem[] = Array.from({ length: 500 }, (_, i) => ({
    id: `PAY-VIRT-${2000 + i}`,
    date: "2026-03-12T12:00:00",
    status: (i % 3 === 0 ? "paid" : i % 3 === 1 ? "failed" : "refunded") as
      | "paid"
      | "failed"
      | "refunded",
    category: (i % 3 === 0 ? "Subscriptions" : i % 3 === 1 ? "Infrastructure" : "Hardware") as
      | "Subscriptions"
      | "Infrastructure"
      | "Hardware",
    email: `customer.${i + 1}@example.com`,
    amount: 100 + ((i * 17) % 900),
  }));

  const toggleVirtualize = () => {
    if (!isVirtual()) {
      setIsVirtual(true);
      setData(largeDataset);
      setGroupingLevel("none");
    } else {
      setIsVirtual(false);
      setData(SHOWCASE_PAYMENTS_DATA);
      setGroupingLevel("category");
    }
  };

  const columns = createMemo<TableColumn<PaymentItem>[]>(() => [
    {
      id: "select",
      size: 44,
      header: ({ table }: { table: TableApi<PaymentItem> }) => {
        const isAll = () => table?.getIsAllRowsSelected() ?? false;
        const isSome = () => table?.getIsSomeRowsSelected() ?? false;

        return (
          <RLCheckbox
            checked={isAll()}
            indeterminate={isSome()}
            onChange={() => {
              table?.toggleAllRowsSelected();
            }}
          />
        );
      },
      cell: ({ row }: { row: TableRow<PaymentItem> }) => (
        <RLCheckbox
          checked={row.getIsSelected()}
          indeterminate={row.getIsSomeSelected()}
          onChange={() => row.toggleSelected()}
        />
      ),
      enableSorting: false,
      enableHiding: false,
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
                e.stopPropagation();
                row.toggleExpanded();
              }}
            >
              <span
                class={`size-3 transition-transform ${row.getIsExpanded() ? "i-lucide-chevron-down" : "i-lucide-chevron-right"}`}
              />
            </button>
          </Show>
          <span class="font-mono text-xs font-bold text-highlighted">{row.getValue("id")}</span>
        </div>
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
      size: 140,
      cell: ({ row }: { row: TableRow<PaymentItem> }) => (
        <span class="text-xs text-toned font-medium">{row.getValue("category")}</span>
      ),
    },
    {
      accessorKey: "date",
      header: "Date",
      size: 150,
      cell: ({ row }: { row: TableRow<PaymentItem> }) => (
        <span class="text-xs font-mono text-muted">{formatShowcaseDate(row.getValue("date"))}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      size: 120,
      cell: ({ row }: { row: TableRow<PaymentItem> }) => {
        const val = row.getValue("status");
        const badgeColor = val === "paid" ? "success" : val === "failed" ? "error" : "warning";
        return (
          <RLBadge size="sm" color={badgeColor} variant="soft" class="capitalize">
            {val}
          </RLBadge>
        );
      },
    },
    {
      accessorKey: "email",
      header: "Customer",
      size: 200,
      cell: ({ row }: { row: TableRow<PaymentItem> }) => (
        <span class="text-xs text-highlighted truncate">{row.getValue("email")}</span>
      ),
    },
    {
      accessorKey: "amount",
      header: "Amount",
      size: 110,
      meta: {
        class: {
          th: "text-right",
          td: "text-right font-mono font-semibold",
        },
      },
      cell: ({ row }: { row: TableRow<PaymentItem> }) => (
        <span>{formatShowcaseCurrency(row.getValue("amount"))}</span>
      ),
      footer: ({ table }: { table: TableApi<PaymentItem> }) => {
        const total = () =>
          table
            ?.getFilteredRows()
            .reduce(
              (sum: number, r: TableRow<PaymentItem>) => sum + (Number(r.getValue("amount")) || 0),
              0,
            ) ?? 0;
        return (
          <div class="text-right font-mono font-bold text-highlighted">
            {formatShowcaseCurrency(total())}
          </div>
        );
      },
    },
    {
      id: "actions",
      size: 60,
      header: "",
      enableSorting: false,
      enableHiding: false,
      meta: {
        class: {
          th: "text-center",
          td: "text-center",
        },
      },
      cell: ({ row }: { row: TableRow<PaymentItem> }) => {
        const dropdownItems = [
          [
            {
              label: "Copy ID",
              icon: "copy",
              onSelect: () => navigator.clipboard.writeText(row.id),
            },
            ...(row.getCanExpand()
              ? [
                  {
                    label: row.getIsExpanded() ? "Collapse Sub-rows" : "Expand Sub-rows",
                    icon: row.getIsExpanded() ? "chevron-up" : "chevron-down",
                    onSelect: () => row.toggleExpanded(),
                  },
                ]
              : []),
          ],
          [
            {
              label: row.getIsPinned() ? "Unpin Row" : "Pin to Top",
              icon: "pin",
              onSelect: () => row.pin(row.getIsPinned() ? false : "top"),
            },
          ],
          [
            {
              label: "Delete Payment",
              icon: "trash",
              color: "error" as const,
              onSelect: () => {
                setData(data().filter((item) => item.id !== row.id));
              },
            },
          ],
        ];

        return (
          <RLDropdownMenu
            items={dropdownItems as any}
            size="xs"
            color="neutral"
            content={{ align: "end" }}
          />
        );
      },
    },
  ]);

  return (
    <div class="flex flex-col gap-6 w-full">
      {/* Controls Bar */}
      <div class="flex flex-wrap items-center gap-2.5 p-4 rounded-xl border border-default bg-elevated/20">
        <RLButton
          size="sm"
          color={striped() ? "primary" : "neutral"}
          variant={striped() ? "solid" : "outline"}
          onClick={() => setStriped(!striped())}
        >
          {striped() ? "Striped: ON" : "Striped: OFF"}
        </RLButton>

        <RLButton
          size="sm"
          color={bordered() ? "primary" : "neutral"}
          variant={bordered() ? "solid" : "outline"}
          onClick={() => setBordered(!bordered())}
        >
          {bordered() ? "Bordered: ON" : "Bordered: OFF"}
        </RLButton>

        <RLButton
          size="sm"
          color={hoverable() ? "primary" : "neutral"}
          variant={hoverable() ? "solid" : "outline"}
          onClick={() => setHoverable(!hoverable())}
        >
          {hoverable() ? "Hoverable: ON" : "Hoverable: OFF"}
        </RLButton>

        <RLButton
          size="sm"
          color={groupingLevel() !== "none" ? "primary" : "neutral"}
          variant={groupingLevel() !== "none" ? "solid" : "outline"}
          onClick={() =>
            setGroupingLevel(
              groupingLevel() === "category"
                ? "multi"
                : groupingLevel() === "multi"
                  ? "none"
                  : "category",
            )
          }
        >
          {groupingLevel() === "multi"
            ? "Grouping: Category + Status"
            : groupingLevel() === "category"
              ? "Grouping: Category"
              : "Grouping: OFF"}
        </RLButton>

        <RLButton
          size="sm"
          color={enableResizing() ? "primary" : "neutral"}
          variant={enableResizing() ? "solid" : "outline"}
          onClick={() => setEnableResizing(!enableResizing())}
        >
          {enableResizing() ? "Column Resizing: ON" : "Column Resizing: OFF"}
        </RLButton>

        <RLButton
          size="sm"
          color={enableColumnReordering() ? "primary" : "neutral"}
          variant={enableColumnReordering() ? "solid" : "outline"}
          onClick={() => setEnableColumnReordering(!enableColumnReordering())}
        >
          {enableColumnReordering() ? "Column Reorder: ON" : "Column Reorder: OFF"}
        </RLButton>

        <RLButton
          size="sm"
          color={enableRowReordering() ? "primary" : "neutral"}
          variant={enableRowReordering() ? "solid" : "outline"}
          onClick={() => setEnableRowReordering(!enableRowReordering())}
        >
          {enableRowReordering() ? "Row Reorder: ON" : "Row Reorder: OFF"}
        </RLButton>

        <RLButton
          size="sm"
          color={isVirtual() ? "primary" : "neutral"}
          variant={isVirtual() ? "solid" : "outline"}
          onClick={toggleVirtualize}
        >
          {isVirtual() ? "Virtualization: 500 Rows" : "Virtualize (500 rows)"}
        </RLButton>

        <RLButton
          size="sm"
          color="neutral"
          variant="outline"
          onClick={() => {
            setLoading(true);
            setTimeout(() => setLoading(false), 2000);
          }}
        >
          Test Loading Bar
        </RLButton>

        <div class="flex items-center gap-2 ml-auto">
          <span class="text-xs text-muted">Anim:</span>
          <select
            class="text-xs bg-muted/20 border border-default rounded px-2 py-1 text-toned"
            value={loadingAnimation()}
            onChange={(e) =>
              setLoadingAnimation(
                e.currentTarget.value as "carousel" | "carousel-inverse" | "swing" | "elastic",
              )
            }
          >
            <option value="carousel">Carousel</option>
            <option value="carousel-inverse">Carousel-Inverse</option>
            <option value="swing">Swing</option>
            <option value="elastic">Elastic</option>
          </select>
        </div>
      </div>

      {/* Solid Table Component */}
      <RLTable<PaymentItem>
        data={data()}
        columns={columns()}
        searchable={true}
        showColumnsToggle={true}
        exportable={true}
        exportFilename="rimelight-payments-export"
        striped={striped()}
        bordered={bordered()}
        hoverable={hoverable()}
        grouping={grouping()}
        enableColumnResizing={enableResizing()}
        enableColumnReordering={enableColumnReordering()}
        enableRowReordering={enableRowReordering()}
        onRowReorder={(reordered) => setData(reordered)}
        loading={loading()}
        loadingAnimation={loadingAnimation()}
        virtualize={isVirtual()}
        rowSelection={selectedRows()}
        onRowSelectionChange={setSelectedRows}
        columnPinning={{ left: ["select", "id"], right: ["actions"] }}
        pagination={isVirtual() ? undefined : { pageIndex: 0, pageSize: 6 }}
        getSubRows={(row: PaymentItem) => row.children}
        onSelect={(_e: Event, row: TableRow<PaymentItem>) => {
          setLastClickedRow(`${row.id} (${row.original.email})`);
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

      {/* Faceted Statistics & Event state readouts */}
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
        <div class="p-3 rounded-lg border border-default bg-elevated/20">
          <span class="text-muted block">Selected rows:</span>
          <span class="font-bold text-highlighted">
            {totalRowCount()} total rows ({data().length} root) | {selectedCount()} selected
          </span>
        </div>
        <div class="p-3 rounded-lg border border-default bg-elevated/20">
          <span class="text-muted block">Last clicked (onSelect):</span>
          <span class="font-bold text-highlighted truncate block">{lastClickedRow()}</span>
        </div>
        <div class="p-3 rounded-lg border border-default bg-elevated/20">
          <span class="text-muted block">Faceted Status Counts:</span>
          <div class="flex items-center gap-2 mt-1">
            <For each={facetedStatusCounts()}>
              {([status, count]) => (
                <span class="px-1.5 py-0.5 rounded bg-muted/30 text-highlighted font-bold">
                  {status}: {count}
                </span>
              )}
            </For>
          </div>
        </div>
        <div class="p-3 rounded-lg border border-default bg-elevated/20">
          <span class="text-muted block">Amount Range (Min / Max):</span>
          <span class="font-bold text-highlighted">{facetedAmountRange()}</span>
        </div>
      </div>
    </div>
  );
};

export const tableAudit: ComponentAuditDefinition = {
  id: "table",
  name: "Table",
  category: "Data Display",
  status: "Passed",
  description:
    "Reactive high-performance table component supporting virtualization, multi-sort, global/column filtering, column resizing & reordering, row pinning, grouping, sub-rows, and export.",
  importPath: "@rimelight/ui/components/table/RLTable.tsx",
  renderSandbox: () => <TableSandbox />,
  testScenarios: [
    {
      id: "basic-inferred-columns",
      title: "Basic Inferred Columns",
      description:
        "Auto-infers column headers and formatters directly from data objects without manual column definitions.",
      render: () => {
        return (
          <RLTable
            data={[
              { id: 101, name: "Project Alpha", budget: "$12,000", lead: "Alice M." },
              { id: 102, name: "Project Beta", budget: "$45,000", lead: "Bob T." },
              { id: 103, name: "Project Gamma", budget: "$8,500", lead: "Clara K." },
            ]}
          />
        );
      },
    },
    {
      id: "selection-and-pagination",
      title: "Selection & Pagination",
      description:
        "Multi-row checkbox selection with synchronized header master-checkbox and client-side pagination.",
      render: () => {
        const [selected, setSelected] = createSignal<Record<string, boolean>>({});
        const columns: TableColumn<SimpleUser>[] = [
          {
            id: "select",
            size: 40,
            header: ({ table }) => (
              <RLCheckbox
                checked={table?.getIsAllRowsSelected() ?? false}
                indeterminate={table?.getIsSomeRowsSelected() ?? false}
                onChange={() => table?.toggleAllRowsSelected()}
              />
            ),
            cell: ({ row }) => (
              <RLCheckbox
                checked={row.getIsSelected()}
                indeterminate={row.getIsSomeSelected()}
                onChange={() => row.toggleSelected()}
              />
            ),
          },
          { accessorKey: "name", header: "Name" },
          { accessorKey: "role", header: "Role" },
          { accessorKey: "department", header: "Department" },
          {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
              const s = row.getValue("status");
              return (
                <RLBadge
                  size="sm"
                  color={s === "active" ? "success" : s === "invited" ? "info" : "error"}
                  variant="soft"
                >
                  {s}
                </RLBadge>
              );
            },
          },
        ];

        return (
          <div class="flex flex-col gap-2">
            <RLTable<SimpleUser>
              data={SAMPLE_USERS}
              columns={columns}
              rowSelection={selected()}
              onRowSelectionChange={setSelected}
              pagination={{ pageIndex: 0, pageSize: 3 }}
            />
            <div class="text-xs font-mono text-muted">
              Selected count: {Object.values(selected()).filter(Boolean).length}
            </div>
          </div>
        );
      },
    },
    {
      id: "striped-bordered-hoverable",
      title: "Striped, Bordered & Hoverable States",
      description:
        "Visual appearance variations with alternating row backgrounds and cell borders.",
      render: () => (
        <RLTable data={SAMPLE_USERS.slice(0, 3)} striped={true} bordered={true} hoverable={true} />
      ),
    },
    {
      id: "empty-and-loading-states",
      title: "Empty & Loading Feedback",
      description: "Empty placeholder slot and animated top loading progress indicator.",
      render: () => {
        const [loading, setLoading] = createSignal(true);
        return (
          <div class="flex flex-col gap-3">
            <div class="flex gap-2">
              <RLButton size="xs" variant="outline" onClick={() => setLoading(!loading())}>
                Toggle Loading Bar: {loading() ? "ON" : "OFF"}
              </RLButton>
            </div>
            <RLTable
              data={[]}
              loading={loading()}
              empty="No audit records found matching the query."
            />
          </div>
        );
      },
    },
  ],
  checklist: [
    {
      criterion: "Reactive SolidJS Architecture",
      status: "pass",
      notes:
        "Pure SolidJS reactive primitives with fine-grained reactivity, 0 TanStack/external table runtime dependencies.",
    },
    {
      criterion: "Virtualization & Large Dataset Scaling",
      status: "pass",
      notes: "High-performance windowing virtualization supporting 500+ items smoothly.",
    },
    {
      criterion: "Full WAI-ARIA and Accessibility",
      status: "pass",
      notes:
        "Accessible semantic <table>, <thead>, <tbody>, <tfoot> elements with aria-sort, aria-selected, and accessible keyboard navigation.",
    },
    {
      criterion: "Interactive Features Parity",
      status: "pass",
      notes:
        "Supports sorting, global filtering, column filtering, column reorder/resize, row grouping, sub-rows expansion, and CSV/JSON export.",
    },
    {
      criterion: "Theming & Styling Token Compliance",
      status: "pass",
      notes:
        "Consistent styling token usage matching design system (bg-elevated, border-default, text-highlighted).",
    },
  ],
};
