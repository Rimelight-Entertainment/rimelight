import type {
  RLTableProps,
  TableColumn,
  TableRow,
  TableGroup,
  TableApi,
  SortingState,
  ColumnFiltersState,
  TableColumnPinningState,
  TableRowPinningState,
  TablePaginationState,
  TableVirtualizeOptions,
  TableColumnSizingState,
  TableColumnOrderState,
  TableEditingCellState,
  TableExportOptions,
  AnyData,
  GroupedItem,
} from "./table.types";
import { RLTableTheme } from "./table.theme";
import { createMemo, createSignal, For, onSettled, Show, untrack } from "solid-js";
import { isServer, type JSX } from "@solidjs/web";
import { RLDropdownMenuTheme } from "../dropdown-menu/dropdown-menu.theme";
import { RLInput } from "../input/RLInput";
import { RLDropdownMenu } from "../dropdown-menu/RLDropdownMenu";
import { RLIcon } from "../icon/RLIcon";
import { uiT } from "../../locale";
export * from "./table.types";

function getNestedValue(obj: AnyData, key: string): any {
  if (!obj || typeof obj !== "object") return undefined;
  if (key.includes(".")) {
    return key.split(".").reduce((acc: any, k) => acc?.[k], obj);
  }
  return obj[key];
}

export const RLTable = <T = any,>(props: RLTableProps<T>): JSX.Element => {
  let tableElementRef: HTMLTableElement | null = null;
  let containerRef: HTMLDivElement | null = null;

  // ─── Controlled / Uncontrolled State Store ──────────────────────────────────
  const [internalSorting, setInternalSorting] = createSignal<SortingState>(
    untrack(() => props.sorting ?? []),
  );
  const [internalGlobalFilter, setInternalGlobalFilter] = createSignal<string>(
    untrack(() => props.globalFilter ?? ""),
  );
  const [internalColumnFilters, setInternalColumnFilters] = createSignal<ColumnFiltersState>(
    untrack(() => props.columnFilters ?? []),
  );
  const [internalColumnVisibility, setInternalColumnVisibility] = createSignal<
    Record<string, boolean>
  >(untrack(() => props.columnVisibility ?? {}));
  const [internalColumnPinning, setInternalColumnPinning] = createSignal<TableColumnPinningState>(
    untrack(() => props.columnPinning ?? {}),
  );
  const [internalRowSelection, setInternalRowSelection] = createSignal<Record<string, boolean>>(
    untrack(() => props.rowSelection ?? {}),
  );
  const [internalExpanded, setInternalExpanded] = createSignal<Record<string, boolean>>(
    untrack(() => props.expanded ?? {}),
  );
  const [internalRowPinning, setInternalRowPinning] = createSignal<TableRowPinningState>(
    untrack(() => props.rowPinning ?? {}),
  );
  const [internalPagination, setInternalPagination] = createSignal<
    TablePaginationState | undefined
  >(untrack(() => props.pagination));
  const [internalColumnSizing, setInternalColumnSizing] = createSignal<TableColumnSizingState>(
    untrack(() => props.columnSizing ?? {}),
  );
  const [internalColumnOrder, setInternalColumnOrder] = createSignal<TableColumnOrderState>(
    untrack(() => props.columnOrder ?? []),
  );
  const [internalEditingCell, setInternalEditingCell] = createSignal<TableEditingCellState>(
    untrack(() => props.editingCell ?? null),
  );

  // Drag & drop indicator states
  const [draggedColId, setDraggedColId] = createSignal<string | null>(null);
  const [dropTargetCol, setDropTargetCol] = createSignal<{
    id: string;
    position: "left" | "right";
  } | null>(null);

  const [draggedRowIndex, setDraggedRowIndex] = createSignal<number | null>(null);
  const [dropTargetRow, setDropTargetRow] = createSignal<{
    id: string;
    index: number;
    position: "top" | "bottom";
  } | null>(null);

  // Reactive state readers
  const currentSorting = () => (props.sorting !== undefined ? props.sorting : internalSorting());
  const currentGlobalFilter = () =>
    props.globalFilter !== undefined ? props.globalFilter : internalGlobalFilter();
  const currentColumnFilters = () =>
    props.columnFilters !== undefined ? props.columnFilters : internalColumnFilters();
  const currentColumnVisibility = () =>
    props.columnVisibility !== undefined ? props.columnVisibility : internalColumnVisibility();
  const currentColumnPinning = () =>
    props.columnPinning !== undefined ? props.columnPinning : internalColumnPinning();
  const currentRowSelection = () =>
    props.rowSelection !== undefined ? props.rowSelection : internalRowSelection();
  const currentExpanded = () =>
    props.expanded !== undefined ? props.expanded : internalExpanded();
  const currentRowPinning = () =>
    props.rowPinning !== undefined ? props.rowPinning : internalRowPinning();
  const currentPagination = () =>
    props.pagination !== undefined ? props.pagination : internalPagination();
  const currentColumnSizing = () =>
    props.columnSizing !== undefined ? props.columnSizing : internalColumnSizing();
  const currentColumnOrder = () =>
    props.columnOrder !== undefined ? props.columnOrder : internalColumnOrder();
  const currentEditingCell = () =>
    props.editingCell !== undefined ? props.editingCell : internalEditingCell();

  const updateSorting = (next: SortingState) => {
    setInternalSorting(next);
    props.onSortingChange?.(next);
  };
  const updateGlobalFilter = (val: string) => {
    setInternalGlobalFilter(val);
    props.onGlobalFilterChange?.(val);
  };
  const updateColumnFilters = (next: ColumnFiltersState) => {
    setInternalColumnFilters(next);
    props.onColumnFiltersChange?.(next);
  };
  const updateColumnVisibility = (next: Record<string, boolean>) => {
    setInternalColumnVisibility(next);
    props.onColumnVisibilityChange?.(next);
  };
  const updateRowSelection = (next: Record<string, boolean>) => {
    setInternalRowSelection(next);
    props.onRowSelectionChange?.(next);
  };
  const updateExpanded = (next: Record<string, boolean>) => {
    setInternalExpanded(next);
    props.onExpandedChange?.(next);
  };
  const updateColumnPinning = (next: TableColumnPinningState) => {
    setInternalColumnPinning(next);
    props.onColumnPinningChange?.(next);
  };
  const updateRowPinning = (next: TableRowPinningState) => {
    setInternalRowPinning(next);
    props.onRowPinningChange?.(next);
  };
  const updatePagination = (next: TablePaginationState) => {
    setInternalPagination(next);
    props.onPaginationChange?.(next);
  };
  const updateColumnSizing = (next: TableColumnSizingState) => {
    setInternalColumnSizing(next);
    props.onColumnSizingChange?.(next);
  };
  const updateColumnOrder = (next: TableColumnOrderState) => {
    setInternalColumnOrder(next);
    props.onColumnOrderChange?.(next);
  };
  const updateEditingCell = (next: TableEditingCellState) => {
    setInternalEditingCell(next);
    props.onEditingCellChange?.(next);
  };

  // ─── Column resolution & ordering ───────────────────────────────────────────
  const rawResolvedColumns = createMemo<TableColumn<T>[]>(() => {
    let cols: TableColumn<T>[] = [];
    if (props.columns && props.columns.length > 0) {
      cols = [...props.columns];
    } else {
      const d = props.data;
      if (d && d.length > 0 && typeof d[0] === "object" && d[0] !== null) {
        const firstRow = d[0] as AnyData;
        cols = Object.keys(firstRow).map((key) => ({
          id: key,
          accessorKey: key as any,
          header: key.charAt(0).toUpperCase() + key.slice(1),
          enableSorting: true,
        }));
      }
    }

    // If row reordering is enabled and no dedicated reorder column exists, auto-prepend a grip column
    if (
      props.enableRowReordering &&
      !cols.some((c) => c.id === "reorder" || c.id === "dragHandle")
    ) {
      const reorderCol: TableColumn<T> = {
        id: "reorder",
        size: 36,
        minSize: 36,
        maxSize: 36,
        enableSorting: false,
        enableHiding: false,
        header: "",
        cell: ({ row }) => (
          <div class="flex items-center justify-center">
            <span
              class={classes().dragHandle}
              data-slot="drag-handle"
              draggable="true"
              onDragStart={(e) => {
                setDraggedRowIndex(row.index);
                e.dataTransfer?.setData("text/plain", String(row.index));
                if (e.dataTransfer) {
                  e.dataTransfer.effectAllowed = "move";
                }
              }}
              onDragEnd={() => {
                setDraggedRowIndex(null);
                setDropTargetRow(null);
              }}
            >
              <span class="i-lucide-grip-vertical size-4" />
            </span>
          </div>
        ),
      };
      return [reorderCol, ...cols];
    }

    // Auto-inject rowActions / actions column if defined on table props and not in columns
    const actionsDef = props.actions || props.rowActions;
    if (actionsDef && !cols.some((c) => c.id === "actions")) {
      cols.push({
        id: "actions",
        header: "",
        size: 80,
        minSize: 60,
        enableSorting: false,
        enableHiding: false,
        meta: {
          class: {
            th: "text-right",
            td: "text-right",
          },
        },
        actions: actionsDef,
      });
    }

    // Normalize actions column defaults
    for (const c of cols) {
      if (c.id === "actions" || c.actions || c.items) {
        if (c.enableSorting === undefined) c.enableSorting = false;
        if (c.header === undefined && c.id === "actions") c.header = "";
        if (c.size === undefined && c.id === "actions") c.size = 60;
        if (c.minSize === undefined && c.id === "actions") c.minSize = 60;
        if (!c.meta?.class?.td && c.id === "actions") {
          c.meta = {
            ...c.meta,
            class: {
              ...c.meta?.class,
              th: c.meta?.class?.th || "text-right",
              td: c.meta?.class?.td || "text-right",
            },
          };
        }
      }
    }

    return cols;
  });

  function getCellActions(row: TableRow<T>, col: TableColumn<T>) {
    const actionsFn =
      col.actions ??
      col.items ??
      (col.id === "actions" ? props.actions || props.rowActions : undefined);
    if (actionsFn) {
      return typeof actionsFn === "function" ? (actionsFn as any)(row) : actionsFn;
    }
    return undefined;
  }

  const actionsDropdownMenuTheme = createMemo(() =>
    RLDropdownMenuTheme({ size: "xs", color: "neutral" }),
  );

  function renderCellContent(
    row: TableRow<T>,
    col: TableColumn<T>,
    cellValue: () => any,
    isEditing: () => boolean,
    setEditing: (e: boolean) => void,
  ) {
    const actions = getCellActions(row, col);
    if (Array.isArray(actions) && actions.length > 0) {
      const dmClasses = actionsDropdownMenuTheme();
      return (
        <div class="flex items-center justify-end">
          <div class={dmClasses.root} data-slot="root" data-dropdown-menu>
            <button
              type="button"
              class={`${dmClasses.trigger} aspect-square !px-1.5 !py-1.5 inline-flex items-center justify-center shrink-0`}
              data-slot="trigger"
              data-dropdown-trigger
            >
              <span class="i-lucide-ellipsis-vertical size-4" />
            </button>
          </div>
        </div>
      );
    }
    if (typeof col.cell === "function") {
      const rendered = col.cell({
        row,
        getValue: cellValue,
        renderValue: cellValue,
        isEditing,
        setEditing,
        column: col,
        table: tableApi,
      });
      if (Array.isArray(rendered) && rendered.length > 0) {
        const dmClasses = actionsDropdownMenuTheme();
        return (
          <div class="flex items-center justify-end">
            <div class={dmClasses.root} data-slot="root" data-dropdown-menu>
              <button
                type="button"
                class={`${dmClasses.trigger} aspect-square !px-1.5 !py-1.5 inline-flex items-center justify-center shrink-0`}
                data-slot="trigger"
                data-dropdown-trigger
              >
                <span class="i-lucide-ellipsis-vertical size-4" />
              </button>
            </div>
          </div>
        );
      }
      return rendered;
    }
    return cellValue() !== undefined && cellValue() !== null ? String(cellValue()) : "—";
  }

  const resolvedColumns = (): TableColumn<T>[] => {
    const raw = rawResolvedColumns();
    const order = currentColumnOrder();
    if (!order || order.length === 0) return raw;

    const ordered: TableColumn<T>[] = [];
    const rawMap = new Map<string, TableColumn<T>>();
    for (const col of raw) {
      const id = String(col.id || col.accessorKey || "");
      rawMap.set(id, col);
    }

    for (const id of order) {
      if (rawMap.has(id)) {
        ordered.push(rawMap.get(id)!);
        rawMap.delete(id);
      }
    }
    // Append any columns not explicitly in order
    for (const remaining of rawMap.values()) {
      ordered.push(remaining);
    }
    return ordered;
  };

  const visibleColumns = createMemo(() => {
    const visibility = currentColumnVisibility();
    return resolvedColumns().filter((col) => {
      const id = (col.id || col.accessorKey || "") as string;
      if (!id) return true;
      if (col.enableHiding === false) return true;
      return visibility[id] !== false;
    });
  });

  // ─── Column Resizing Handler ────────────────────────────────────────────────
  const [resizingColId, setResizingColId] = createSignal<string | null>(null);

  const startResize = (
    e: PointerEvent,
    colId: string,
    minSize?: number | string,
    maxSize?: number | string,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const thElement = (e.target as HTMLElement).closest("th");
    const initialWidth = currentColumnSizing()[colId] ?? thElement?.offsetWidth ?? 150;
    const minW = typeof minSize === "number" ? minSize : 40;
    const maxW = typeof maxSize === "number" ? maxSize : 2000;
    setResizingColId(colId);

    let liveWidth = initialWidth;

    const onPointerMove = (moveEv: PointerEvent) => {
      const deltaX = moveEv.clientX - startX;
      liveWidth = Math.max(minW, Math.min(maxW, initialWidth + deltaX));
      if (props.columnResizeMode !== "onEnd") {
        updateColumnSizing({
          ...currentColumnSizing(),
          [colId]: liveWidth,
        });
      }
    };

    const onPointerUp = () => {
      if (props.columnResizeMode === "onEnd") {
        updateColumnSizing({
          ...currentColumnSizing(),
          [colId]: liveWidth,
        });
      }
      setResizingColId(null);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  };

  // ─── Row Hierarchy Building ──────────────────────────────────────────────────
  const getAllRowDescendants = (row: TableRow<T>): TableRow<T>[] => {
    if (!row.subRows || row.subRows.length === 0) return [];
    const res: TableRow<T>[] = [];
    for (const child of row.subRows) {
      res.push(child);
      res.push(...getAllRowDescendants(child));
    }
    return res;
  };

  const getAllFlatRows = (rows: TableRow<T>[]): TableRow<T>[] => {
    const flat: TableRow<T>[] = [];
    for (const r of rows) {
      flat.push(r);
      if (r.subRows && r.subRows.length > 0) {
        flat.push(...getAllFlatRows(r.subRows));
      }
    }
    return flat;
  };

  const buildRowTree = (rawItems: T[], parentDepth = 0): TableRow<T>[] => {
    return rawItems.map((item, idx) => {
      const rId = props.getRowId
        ? props.getRowId(item, idx)
        : (item as any)?.id !== undefined
          ? String((item as any).id)
          : String(idx);

      let subRowsList: TableRow<T>[] | undefined = undefined;
      if (props.getSubRows) {
        const children = props.getSubRows(item, idx);
        if (children && children.length > 0) {
          subRowsList = buildRowTree(children, parentDepth + 1);
        }
      } else if (Array.isArray((item as any)?.children) && (item as any).children.length > 0) {
        subRowsList = buildRowTree((item as any).children, parentDepth + 1);
      }

      const rowObj: TableRow<T> = {
        id: rId,
        original: item,
        index: idx,
        depth: parentDepth,
        getValue: (key: string) => {
          const colDef = resolvedColumns().find((c) => (c.id || c.accessorKey) === key);
          if (colDef && typeof colDef.accessorFn === "function") {
            return colDef.accessorFn(item);
          }
          return getNestedValue(item as AnyData, key);
        },
        getIsSelected: () => {
          const sel = currentRowSelection();
          if (subRowsList && subRowsList.length > 0) {
            const descendants = getAllRowDescendants(rowObj);
            if (descendants.length > 0) {
              return descendants.every((d) => !!sel[d.id]);
            }
          }
          return !!sel[rId];
        },
        getIsSomeSelected: () => {
          if (!subRowsList || subRowsList.length === 0) return false;
          const sel = currentRowSelection();
          const descendants = getAllRowDescendants(rowObj);
          if (descendants.length === 0) return false;
          const count = descendants.filter((d) => !!sel[d.id]).length;
          return count > 0 && count < descendants.length;
        },
        toggleSelected: (val?: boolean) => {
          const isCurrentlySelected = rowObj.getIsSelected();
          const nextVal = val !== undefined ? val : !isCurrentlySelected;
          const nextMap = { ...currentRowSelection(), [rId]: nextVal };
          if (subRowsList) {
            const descendants = getAllRowDescendants(rowObj);
            for (const d of descendants) {
              nextMap[d.id] = nextVal;
            }
          }
          updateRowSelection(nextMap);
        },
        getIsExpanded: () => !!currentExpanded()[rId],
        toggleExpanded: (val?: boolean) => {
          const nextVal = val !== undefined ? val : !currentExpanded()[rId];
          updateExpanded({ ...currentExpanded(), [rId]: nextVal });
        },
        getToggleExpandedHandler: () => (e?: Event) => {
          e?.stopPropagation?.();
          rowObj.toggleExpanded();
        },
        getToggleSelectedHandler: () => (e?: Event) => {
          e?.stopPropagation?.();
          rowObj.toggleSelected();
        },
        getIsPinned: () => {
          const pin = currentRowPinning();
          if (pin.top?.includes(rId)) return "top";
          if (pin.bottom?.includes(rId)) return "bottom";
          return false;
        },
        pin: (position: boolean | "top" | "bottom") => {
          const current = currentRowPinning();
          const nextTop = (current.top || []).filter((id) => id !== rId);
          const nextBottom = (current.bottom || []).filter((id) => id !== rId);
          if (position === "top") nextTop.push(rId);
          else if (position === "bottom") nextBottom.push(rId);
          updateRowPinning({ top: nextTop, bottom: nextBottom });
        },
        getIsGrouped: () => false,
        getCanExpand: () => {
          if (typeof props.getRowCanExpand === "function") {
            return props.getRowCanExpand(rowObj);
          }
          return !!(subRowsList && subRowsList.length > 0);
        },
        ...(subRowsList ? { subRows: subRowsList } : {}),
      };
      return rowObj;
    });
  };

  // ─── Filter pipeline ─────────────────────────────────────────────────────────
  const filteredRows = createMemo(() => {
    let rows = buildRowTree(props.data ?? []);
    const q = currentGlobalFilter().toLowerCase().trim();
    if (q) {
      rows = rows.filter((r) => {
        if (typeof r.original !== "object" || !r.original) {
          return String(r.original).toLowerCase().includes(q);
        }
        return (
          Object.values(r.original as AnyData).some((val) =>
            String(val ?? "")
              .toLowerCase()
              .includes(q),
          ) ||
          resolvedColumns().some((col) => {
            const v = col.accessorFn
              ? col.accessorFn(r.original)
              : r.getValue((col.id || col.accessorKey || "") as string);
            return String(v ?? "")
              .toLowerCase()
              .includes(q);
          })
        );
      });
    }

    const colFilters = currentColumnFilters();
    if (colFilters && colFilters.length > 0) {
      for (const filter of colFilters) {
        if (
          !filter.id ||
          filter.value === undefined ||
          filter.value === null ||
          filter.value === ""
        )
          continue;
        const fVal = String(filter.value).toLowerCase();
        rows = rows.filter((r) =>
          String(r.getValue(filter.id) ?? "")
            .toLowerCase()
            .includes(fVal),
        );
      }
    }
    return rows;
  });

  // ─── Sort pipeline ───────────────────────────────────────────────────────────
  const sortedRows = createMemo(() => {
    const sorts = currentSorting();
    if (!sorts || sorts.length === 0) return filteredRows();

    return [...filteredRows()].sort((a, b) => {
      for (const { id, desc } of sorts) {
        const valA = a.getValue(id);
        const valB = b.getValue(id);
        if (valA === valB) continue;
        if (valA === undefined || valA === null) return 1;
        if (valB === undefined || valB === null) return -1;
        let cmp: number;
        if (typeof valA === "number" && typeof valB === "number") {
          cmp = valA - valB;
        } else if (valA instanceof Date && valB instanceof Date) {
          cmp = valA.getTime() - valB.getTime();
        } else {
          const numA = Number(valA);
          const numB = Number(valB);
          if (!isNaN(numA) && !isNaN(numB)) {
            cmp = numA - numB;
          } else {
            cmp = String(valA).localeCompare(String(valB));
          }
        }
        return desc ? -cmp : cmp;
      }
      return 0;
    });
  });

  // ─── Multi-level Grouping pipeline ──────────────────────────────────────────
  function groupRowsRecursively(
    rows: TableRow<T>[],
    groupCols: string[],
    depth = 0,
    parentPath = "",
  ): GroupedItem[] {
    if (depth >= groupCols.length || rows.length === 0) {
      return rows.map((r) => ({ type: "row", row: r }));
    }

    const colId = groupCols[depth]!;
    const groupMap = new Map<string, TableRow<T>[]>();
    const groupOrder: string[] = [];

    for (const row of rows) {
      const val = String(row.getValue(colId) ?? "");
      if (!groupMap.has(val)) {
        groupMap.set(val, []);
        groupOrder.push(val);
      }
      row.groupingColumnId = colId;
      row.groupingValue = val;
      groupMap.get(val)!.push(row);
    }

    const result: GroupedItem[] = [];
    for (const val of groupOrder) {
      const subRows = groupMap.get(val)!;
      const groupId = `group-${parentPath}${colId}-${val}`;
      const group: TableGroup<T> = {
        id: groupId,
        columnId: colId,
        value: val,
        depth,
        rows: subRows,
      };
      result.push({ type: "group", group, depth });
      result.push(...groupRowsRecursively(subRows, groupCols, depth + 1, `${groupId}/`));
    }
    return result;
  }

  const groupedItems = createMemo<GroupedItem[]>(() => {
    const sRows = sortedRows();
    const grp = props.grouping;
    if (!grp || grp.length === 0) {
      return sRows.map((r) => ({ type: "row", row: r }));
    }
    return groupRowsRecursively(sRows, grp, 0, "");
  });

  // ─── Row Pinning ─────────────────────────────────────────────────────────────
  const pinnedItems = createMemo<GroupedItem[]>(() => {
    const items = groupedItems();
    const pin = currentRowPinning();
    if ((!pin.top || pin.top.length === 0) && (!pin.bottom || pin.bottom.length === 0)) {
      return items;
    }

    const topItems: GroupedItem[] = [];
    const midItems: GroupedItem[] = [];
    const botItems: GroupedItem[] = [];

    for (const item of items) {
      if (item.type === "row") {
        if (pin.top?.includes(item.row.id)) topItems.push(item);
        else if (pin.bottom?.includes(item.row.id)) botItems.push(item);
        else midItems.push(item);
      } else {
        midItems.push(item);
      }
    }
    return [...topItems, ...midItems, ...botItems];
  });

  // ─── Pagination ──────────────────────────────────────────────────────────────
  const paginatedItems = createMemo<GroupedItem[]>(() => {
    const items = pinnedItems();
    const pag = currentPagination();
    if (!pag) return items;

    const { pageIndex, pageSize } = pag;
    const rowItems = items.filter((i) => i.type === "row") as { type: "row"; row: TableRow<T> }[];
    const pageRows = rowItems.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);
    const pageRowIds = new Set(pageRows.map((i) => i.row.id));

    if (props.grouping && props.grouping.length > 0) {
      const result: GroupedItem[] = [];
      for (const item of items) {
        if (item.type === "group") {
          if (item.group.rows.some((r: TableRow<T>) => pageRowIds.has(r.id))) result.push(item);
        } else if (pageRowIds.has(item.row.id)) {
          result.push(item);
        }
      }
      return result;
    }
    return pageRows;
  });

  // ─── Virtualization Windowing ────────────────────────────────────────────────
  const [scrollTop, setScrollTop] = createSignal(0);
  const isVirtual = () => !!props.virtualize;
  const virtualOpts = (): TableVirtualizeOptions =>
    typeof props.virtualize === "object" ? props.virtualize : {};

  const estimateRowHeight = () => {
    const opt = virtualOpts().estimateSize;
    if (typeof opt === "number") return opt;
    return 48;
  };

  const overscan = () => virtualOpts().overscan ?? 8;

  const virtualizedView = createMemo(() => {
    const items = paginatedItems();
    if (!isVirtual()) {
      return {
        items,
        padTop: 0,
        padBottom: 0,
        startIndex: 0,
      };
    }

    const rowH = estimateRowHeight();
    const scrollPos = scrollTop();
    const containerHeight = containerRef?.clientHeight || 400;
    const totalCount = items.length;

    const rawStart = Math.floor(scrollPos / rowH);
    const startIndex = Math.max(0, rawStart - overscan());
    const visibleCount = Math.ceil(containerHeight / rowH) + overscan() * 2;
    const endIndex = Math.min(totalCount, startIndex + visibleCount);

    const padTop = startIndex * rowH;
    const padBottom = Math.max(0, (totalCount - endIndex) * rowH);
    const sliced = items.slice(startIndex, endIndex);

    return {
      items: sliced,
      padTop,
      padBottom,
      startIndex,
    };
  });

  if (!isServer) {
    onSettled(() => {
      if (isVirtual()) {
        const scrollEl = virtualOpts().getScrollElement?.() || containerRef;
        if (scrollEl) {
          const handleScroll = () => setScrollTop(scrollEl.scrollTop);
          scrollEl.addEventListener("scroll", handleScroll, { passive: true });
          return () => scrollEl.removeEventListener("scroll", handleScroll);
        }
      }
      return undefined;
    });
  }

  // ─── Column offsets ──────────────────────────────────────────────────────────
  const getColSizeNumber = (col: TableColumn<T>): number => {
    const colId = String(col.id || col.accessorKey || "");
    const sized = currentColumnSizing()[colId];
    if (typeof sized === "number") return sized;
    if (typeof col.size === "number") return col.size;
    return 150;
  };

  const columnOffsets = createMemo(() => {
    const cols = resolvedColumns();
    const pin = currentColumnPinning();
    const left: Record<string, number> = {};
    const right: Record<string, number> = {};

    if (pin.left && pin.left.length > 0) {
      let offset = 0;
      for (const colId of pin.left) {
        left[colId] = offset;
        const col = cols.find((c) => (c.id || c.accessorKey) === colId);
        offset += col ? getColSizeNumber(col) : 150;
      }
    }

    if (pin.right && pin.right.length > 0) {
      let offset = 0;
      for (const colId of [...pin.right].reverse()) {
        right[colId] = offset;
        const col = cols.find((c) => (c.id || c.accessorKey) === colId);
        offset += col ? getColSizeNumber(col) : 150;
      }
    }

    return { left, right };
  });

  const toggleSort = (colId: string, isMulti = false) => {
    const current = currentSorting();
    const existing = current.find((s) => s.id === colId);

    let next: SortingState;
    if (!existing) {
      const newItem = { id: colId, desc: false };
      next = isMulti ? [...current, newItem] : [newItem];
    } else if (!existing.desc) {
      const updated = { id: colId, desc: true };
      next = isMulti ? current.map((s) => (s.id === colId ? updated : s)) : [updated];
    } else {
      next = isMulti ? current.filter((s) => s.id !== colId) : [];
    }
    updateSorting(next);
  };

  // ─── Expose TableApi ─────────────────────────────────────────────────────────
  const getPageRows = () => {
    return paginatedItems()
      .filter((i) => i.type === "row")
      .map((i) => (i as { type: "row"; row: TableRow<T> }).row);
  };

  const tableApi: TableApi<T> = {
    get tableRef() {
      return tableElementRef;
    },
    getFilteredRows: () => filteredRows(),
    getFlatRows: () => getAllFlatRows(filteredRows()),
    getSortedRows: () => sortedRows(),
    getSelectedRows: () => getAllFlatRows(filteredRows()).filter((r) => r.getIsSelected()),
    getFilteredSelectedRowModel: () => {
      const flatSelected = getAllFlatRows(filteredRows()).filter((r) => r.getIsSelected());
      return {
        rows: filteredRows().filter((r) => r.getIsSelected()),
        flatRows: flatSelected,
      };
    },
    getFilteredRowModel: () => ({
      rows: filteredRows(),
      flatRows: getAllFlatRows(filteredRows()),
    }),
    getAllColumns: () => resolvedColumns(),
    getColumn: (id: string) => resolvedColumns().find((c) => (c.id || c.accessorKey) === id),
    getIsAllRowsSelected: () => {
      const flat = getAllFlatRows(filteredRows());
      if (flat.length === 0) return false;
      return flat.every((r) => r.getIsSelected());
    },
    getIsSomeRowsSelected: () => {
      const flat = getAllFlatRows(filteredRows());
      if (flat.length === 0) return false;
      const selCount = flat.filter((r) => r.getIsSelected()).length;
      return selCount > 0 && selCount < flat.length;
    },
    toggleAllRowsSelected: (selected?: boolean) => {
      const flat = getAllFlatRows(filteredRows());
      const isAll = flat.length > 0 && flat.every((r) => r.getIsSelected());
      const targetState = selected !== undefined ? selected : !isAll;
      const nextMap = { ...currentRowSelection() };
      for (const r of flat) {
        nextMap[r.id] = targetState;
      }
      updateRowSelection(nextMap);
    },
    getIsAllPageRowsSelected: () => {
      const rows = getPageRows();
      const flat = getAllFlatRows(rows);
      if (flat.length === 0) return false;
      return flat.every((r) => r.getIsSelected());
    },
    getIsSomePageRowsSelected: () => {
      const rows = getPageRows();
      const flat = getAllFlatRows(rows);
      if (flat.length === 0) return false;
      const selCount = flat.filter((r) => r.getIsSelected()).length;
      return selCount > 0 && selCount < flat.length;
    },
    toggleAllPageRowsSelected: (selected?: boolean) => {
      const rows = getPageRows();
      const flat = getAllFlatRows(rows);
      const isAll = flat.length > 0 && flat.every((r) => r.getIsSelected());
      const targetState = selected !== undefined ? selected : !isAll;
      const nextMap = { ...currentRowSelection() };
      for (const r of flat) {
        nextMap[r.id] = targetState;
      }
      updateRowSelection(nextMap);
    },
    setGlobalFilter: (val: string) => updateGlobalFilter(val),
    setColumnFilter: (id: string, val: any) => {
      const current = currentColumnFilters().filter((f) => f.id !== id);
      if (val !== undefined && val !== null && val !== "") {
        current.push({ id, value: val });
      }
      updateColumnFilters(current);
    },
    setColumnVisibility: (id: string, visible: boolean) => {
      updateColumnVisibility({ ...currentColumnVisibility(), [id]: visible });
    },
    setColumnPinning: (pinning: TableColumnPinningState) => updateColumnPinning(pinning),
    setRowPinning: (pinning: TableRowPinningState) => updateRowPinning(pinning),
    setSorting: (st: SortingState) => updateSorting(st),
    setPagination: (pag: TablePaginationState) => updatePagination(pag),
    setPageIndex: (pageIndex: number) => {
      const cur = currentPagination() || { pageIndex: 0, pageSize: 10 };
      updatePagination({ ...cur, pageIndex });
    },
    setPageSize: (pageSize: number) => {
      const cur = currentPagination() || { pageIndex: 0, pageSize: 10 };
      updatePagination({ ...cur, pageSize });
    },
    // Resizing & Ordering
    setColumnSizing: (id: string, size: number) => {
      updateColumnSizing({ ...currentColumnSizing(), [id]: size });
    },
    resetColumnSizing: () => updateColumnSizing({}),
    setColumnOrder: (order: TableColumnOrderState) => updateColumnOrder(order),
    resetColumnOrder: () => updateColumnOrder([]),
    // Exporting
    exportToCsv: (options?: TableExportOptions) => {
      const targetRows = options?.selectedOnly
        ? tableApi.getSelectedRows()
        : tableApi.getFlatRows();
      const colsToExport = resolvedColumns().filter((col) => {
        const id = String(col.id || col.accessorKey || "");
        if (id === "select" || id === "actions" || id === "reorder" || id === "dragHandle")
          return false;
        if (options?.columns && options.columns.length > 0) {
          return options.columns.includes(id);
        }
        return currentColumnVisibility()[id] !== false;
      });

      const escapeCsv = (val: any): string => {
        if (val === undefined || val === null) return "";
        const str = String(val);
        if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      const headers = colsToExport.map((c) => {
        const label = typeof c.header === "string" ? c.header : String(c.id || c.accessorKey || "");
        return escapeCsv(label);
      });

      const lines: string[] = [headers.join(",")];

      for (const row of targetRows) {
        const rowVals = colsToExport.map((col) => {
          let val: any;
          if (typeof col.accessorFn === "function") {
            val = col.accessorFn(row.original);
          } else {
            const key = String(col.accessorKey || col.id || "");
            val = row.getValue(key);
          }
          return escapeCsv(val);
        });
        lines.push(rowVals.join(","));
      }

      const csvContent = lines.join("\r\n");

      if (!isServer && options?.filename) {
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = options.filename.endsWith(".csv")
          ? options.filename
          : `${options.filename}.csv`;
        link.click();
        URL.revokeObjectURL(url);
      }

      return csvContent;
    },
    exportToJson: (options?: TableExportOptions) => {
      const targetRows = options?.selectedOnly
        ? tableApi.getSelectedRows()
        : tableApi.getFlatRows();
      const colsToExport = resolvedColumns().filter((col) => {
        const id = String(col.id || col.accessorKey || "");
        if (id === "select" || id === "actions" || id === "reorder" || id === "dragHandle")
          return false;
        if (options?.columns && options.columns.length > 0) {
          return options.columns.includes(id);
        }
        return currentColumnVisibility()[id] !== false;
      });

      const jsonArray = targetRows.map((row) => {
        const obj: Record<string, any> = {};
        for (const col of colsToExport) {
          const key = String(col.id || col.accessorKey || "");
          let val: any;
          if (typeof col.accessorFn === "function") {
            val = col.accessorFn(row.original);
          } else {
            val = row.getValue(key);
          }
          obj[key] = val;
        }
        return obj;
      });

      const jsonContent = JSON.stringify(jsonArray, null, 2);

      if (!isServer && options?.filename) {
        const blob = new Blob([jsonContent], { type: "application/json;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = options.filename.endsWith(".json")
          ? options.filename
          : `${options.filename}.json`;
        link.click();
        URL.revokeObjectURL(url);
      }

      return jsonContent;
    },
    // Faceted statistics
    getFacetedUniqueValues: (columnId: string) => {
      const map = new Map<any, number>();
      const rows = getAllFlatRows(filteredRows());
      for (const r of rows) {
        const val = r.getValue(columnId);
        map.set(val, (map.get(val) || 0) + 1);
      }
      return map;
    },
    getFacetedMinMaxValues: (columnId: string) => {
      const rows = getAllFlatRows(filteredRows());
      let min: number | undefined;
      let max: number | undefined;
      for (const r of rows) {
        const val = r.getValue(columnId);
        if (typeof val === "number" && !isNaN(val)) {
          if (min === undefined || val < min) min = val;
          if (max === undefined || val > max) max = val;
        }
      }
      return min !== undefined && max !== undefined ? [min, max] : undefined;
    },
    // Inline editing support
    setEditingCell: (cell: TableEditingCellState) => updateEditingCell(cell),
    getEditingCell: () => currentEditingCell(),
    getState: () => ({
      sorting: currentSorting(),
      globalFilter: currentGlobalFilter(),
      columnFilters: currentColumnFilters(),
      columnVisibility: currentColumnVisibility(),
      columnPinning: currentColumnPinning(),
      columnSizing: currentColumnSizing(),
      columnOrder: currentColumnOrder(),
      rowSelection: currentRowSelection(),
      expanded: currentExpanded(),
      rowPinning: currentRowPinning(),
      pagination: currentPagination() || { pageIndex: 0, pageSize: 10 },
      editingCell: currentEditingCell(),
    }),
  };

  if (typeof props.ref === "function") {
    props.ref(tableApi);
  }

  // ─── Theme Resolution ────────────────────────────────────────────────────────
  const { classes } = RLTableTheme.setup(props, {
    variants: () => ({ externalScroll: false, pinned: false }),
  });

  const showToolbar = createMemo(
    () =>
      props.searchable ||
      props.showColumnsToggle ||
      props.exportable ||
      !!props.toolbar ||
      !!props.slots?.["toolbar"],
  );

  const columnDropdownItems = createMemo(() =>
    resolvedColumns()
      .filter((col) => col.enableHiding !== false && col.id !== "reorder")
      .map((col) => {
        const colId = (col.id || col.accessorKey || "") as string;
        const rawLabel = typeof col.header === "string" ? col.header : colId;
        return {
          id: colId,
          label: rawLabel.charAt(0).toUpperCase() + rawLabel.slice(1),
          type: "checkbox" as const,
          checked: currentColumnVisibility()[colId] !== false,
          onCheckedChange: (checked: boolean) => {
            tableApi.setColumnVisibility(colId, checked);
          },
        };
      }),
  );

  const exportDropdownItems = createMemo(() => [
    {
      id: "csv",
      label: "Export as CSV",
      icon: "i-lucide-file-spreadsheet",
      onSelect: () => {
        tableApi.exportToCsv({ filename: props.exportFilename ?? "export" });
      },
    },
    {
      id: "json",
      label: "Export as JSON",
      icon: "i-lucide-file-json",
      onSelect: () => {
        tableApi.exportToJson({ filename: props.exportFilename ?? "export" });
      },
    },
  ]);

  const hasFooters = createMemo(() =>
    visibleColumns().some(
      (col) =>
        typeof col.footer === "function" ||
        col.footer ||
        props.slots?.[`${String(col.id || col.accessorKey || "")}-footer`],
    ),
  );

  return (
    <div class={classes().root} data-slot="root">
      <Show when={showToolbar()}>
        <div class={classes().toolbar} data-slot="toolbar">
          <Show when={props.searchable}>
            <RLInput
              type="search"
              placeholder={props.searchPlaceholder ?? "Filter table..."}
              leadingIcon="i-lucide-search"
              class="max-w-xs min-w-[10ch] w-full"
              value={currentGlobalFilter()}
              onInput={(e: any) => updateGlobalFilter(e.target.value)}
            />
          </Show>

          {props.slots?.["toolbar"]
            ? props.slots["toolbar"]({ table: tableApi })
            : props.toolbar?.()}

          <div class="ml-auto flex items-center gap-2 shrink-0">
            <Show when={props.exportable}>
              <RLDropdownMenu
                label="Export"
                icon="i-lucide-download"
                items={exportDropdownItems()}
                content={{ align: "end" }}
                size="sm"
                color="neutral"
              />
            </Show>

            <Show when={props.showColumnsToggle}>
              <RLDropdownMenu
                label="Columns"
                icon="i-lucide-columns"
                items={columnDropdownItems()}
                content={{ align: "end" }}
                size="sm"
                color="neutral"
              />
            </Show>
          </div>
        </div>
      </Show>

      <div
        ref={(el) => (containerRef = el)}
        class="overflow-x-auto w-full relative"
        style={isVirtual() ? "max-height: 400px; overflow-y: auto;" : undefined}
      >
        <table ref={(el) => (tableElementRef = el)} class={classes().base} data-slot="base">
          <colgroup>
            <For each={visibleColumns()}>
              {(col) => {
                const colId = () => String(col.id || col.accessorKey || "");
                const styles = () => {
                  const sizeVal = currentColumnSizing()[colId()] ?? col.size;
                  const list: string[] = [];
                  if (typeof sizeVal === "number") list.push(`width: ${sizeVal}px;`);
                  else if (sizeVal) list.push(`width: ${sizeVal};`);
                  if (col.minSize) {
                    list.push(
                      `min-width: ${typeof col.minSize === "number" ? `${col.minSize}px` : col.minSize};`,
                    );
                  }
                  if (col.maxSize) {
                    list.push(
                      `max-width: ${typeof col.maxSize === "number" ? `${col.maxSize}px` : col.maxSize};`,
                    );
                  }
                  return list.join(" ") || undefined;
                };
                return <col data-col-id={colId()} style={styles()} />;
              }}
            </For>
          </colgroup>

          <Show when={props.caption || props.captionContent || props.slots?.["caption"]}>
            <caption class={classes().caption} data-slot="caption">
              {props.slots?.["caption"]
                ? props.slots["caption"]({ table: tableApi })
                : props.captionContent
                  ? props.captionContent()
                  : props.caption}
            </caption>
          </Show>

          {/* ── thead ── */}
          <Show when={visibleColumns().length > 0}>
            <thead class={classes().thead} data-slot="thead">
              <tr class={classes().tr} data-slot="tr">
                <For each={visibleColumns()}>
                  {(col) => {
                    const colId = () => String(col.id || col.accessorKey || "");
                    const pinned = () =>
                      colId() in columnOffsets().left || colId() in columnOffsets().right;
                    const pinStyle = () => {
                      if (colId() in columnOffsets().left) {
                        return `left: ${columnOffsets().left[colId()]}px;`;
                      }
                      if (colId() in columnOffsets().right) {
                        return `right: ${columnOffsets().right[colId()]}px;`;
                      }
                      return "";
                    };
                    const sizeStyle = () => {
                      const sizeVal = currentColumnSizing()[colId()] ?? col.size;
                      const styles: string[] = [];
                      if (typeof sizeVal === "number") styles.push(`width: ${sizeVal}px;`);
                      else if (sizeVal) styles.push(`width: ${sizeVal};`);
                      if (col.minSize) {
                        styles.push(
                          `min-width: ${typeof col.minSize === "number" ? `${col.minSize}px` : col.minSize};`,
                        );
                      }
                      if (col.maxSize) {
                        styles.push(
                          `max-width: ${typeof col.maxSize === "number" ? `${col.maxSize}px` : col.maxSize};`,
                        );
                      }
                      return styles.join(" ");
                    };
                    const metaThClass = () =>
                      typeof col.meta?.class?.th === "function"
                        ? col.meta.class.th(col)
                        : col.meta?.class?.th || "";
                    const metaThStyle = () =>
                      typeof col.meta?.style?.th === "function"
                        ? col.meta.style.th(col)
                        : col.meta?.style?.th || "";
                    const canSort = () =>
                      col.enableSorting !== false &&
                      !!(col.accessorKey || col.id || col.accessorFn) &&
                      colId() !== "actions" &&
                      colId() !== "select" &&
                      colId() !== "reorder" &&
                      colId() !== "dragHandle";

                    const activeSort = () => currentSorting().find((s) => s.id === colId());
                    const sortDir = () =>
                      activeSort() ? (activeSort()!.desc ? "desc" : "asc") : "none";

                    const slotHeader = props.slots?.[`${colId()}-header`];

                    const isDropTarget = () =>
                      dropTargetCol()?.id === colId() && draggedColId() !== colId();
                    const dropPosition = () =>
                      isDropTarget() ? dropTargetCol()?.position : undefined;

                    const headerLabel = () => {
                      if (typeof col.header === "function") {
                        return col.header({ column: col, table: tableApi });
                      }
                      if (col.header !== undefined && col.header !== null) {
                        return col.header;
                      }
                      if (
                        colId() === "reorder" ||
                        colId() === "select" ||
                        colId() === "actions" ||
                        colId() === "dragHandle"
                      ) {
                        return "";
                      }
                      return colId().charAt(0).toUpperCase() + colId().slice(1);
                    };

                    return (
                      <th
                        scope="col"
                        class={`${classes().th} ${pinned() ? "sticky bg-default z-10" : ""} ${metaThClass()}`}
                        style={`${sizeStyle()} ${pinStyle()} ${metaThStyle()}`}
                        data-col-id={colId()}
                        data-slot="th"
                        data-drop-position={dropPosition()}
                        onDragOver={(e) => {
                          if (!props.enableColumnReordering || !draggedColId()) return;
                          e.preventDefault();
                          const th = e.currentTarget as HTMLElement;
                          const rect = th.getBoundingClientRect();
                          const pos = e.clientX < rect.left + rect.width / 2 ? "left" : "right";
                          const cur = dropTargetCol();
                          if (!cur || cur.id !== colId() || cur.position !== pos) {
                            setDropTargetCol({ id: colId(), position: pos });
                          }
                        }}
                        onDragLeave={() => {
                          if (dropTargetCol()?.id === colId()) {
                            setDropTargetCol(null);
                          }
                        }}
                        onDrop={(e) => {
                          if (!props.enableColumnReordering || !draggedColId()) return;
                          e.preventDefault();
                          const sourceId = draggedColId()!;
                          const target = dropTargetCol();
                          setDraggedColId(null);
                          setDropTargetCol(null);
                          if (!target || sourceId === target.id) return;

                          const cols = resolvedColumns().map((c) =>
                            String(c.id || c.accessorKey || ""),
                          );
                          const fromIdx = cols.indexOf(sourceId);
                          if (fromIdx === -1) return;
                          const newOrder = [...cols];
                          newOrder.splice(fromIdx, 1);
                          let toIdx = newOrder.indexOf(target.id);
                          if (toIdx === -1) return;
                          if (target.position === "right") {
                            toIdx += 1;
                          }
                          newOrder.splice(toIdx, 0, sourceId);
                          updateColumnOrder(newOrder);
                        }}
                      >
                        <div class="flex items-center gap-1.5">
                          {/* Column Drag Handle */}
                          <Show
                            when={
                              props.enableColumnReordering &&
                              colId() !== "reorder" &&
                              colId() !== "select" &&
                              colId() !== "actions" &&
                              colId() !== "dragHandle"
                            }
                          >
                            <span
                              class={classes().dragHandle}
                              data-slot="drag-handle"
                              draggable="true"
                              onDragStart={(e) => {
                                setDraggedColId(colId());
                                e.dataTransfer?.setData("text/plain", colId());
                                if (e.dataTransfer) {
                                  e.dataTransfer.effectAllowed = "move";
                                }
                              }}
                              onDragEnd={() => {
                                setDraggedColId(null);
                                setDropTargetCol(null);
                              }}
                            >
                              <span class="i-lucide-grip-vertical size-3.5 opacity-40 hover:opacity-100" />
                            </span>
                          </Show>

                          <div class="flex-1 min-w-0">
                            <Show
                              when={!slotHeader}
                              fallback={slotHeader?.({ column: col, table: tableApi })}
                            >
                              <Show
                                when={canSort()}
                                fallback={
                                  typeof col.header === "function" ? (
                                    col.header({ column: col, table: tableApi })
                                  ) : (
                                    <span>{headerLabel()}</span>
                                  )
                                }
                              >
                                <button
                                  type="button"
                                  class="inline-flex items-center gap-1.5 hover:text-highlighted focus:outline-none transition-colors cursor-pointer group -mx-1 px-1 py-0.5 rounded"
                                  onClick={(e) => toggleSort(colId(), e.shiftKey)}
                                  aria-label={`Sort by ${colId()}`}
                                >
                                  {typeof col.header === "function" ? (
                                    col.header({ column: col, table: tableApi })
                                  ) : (
                                    <span>{headerLabel()}</span>
                                  )}
                                  <span
                                    class={`size-3.5 transition-all shrink-0 ${
                                      sortDir() === "asc"
                                        ? "i-lucide-arrow-up-narrow-wide text-primary"
                                        : sortDir() === "desc"
                                          ? "i-lucide-arrow-down-wide-narrow text-primary"
                                          : "i-lucide-arrow-up-down opacity-40 group-hover:opacity-100"
                                    }`}
                                  />
                                </button>
                              </Show>
                            </Show>
                          </div>
                        </div>

                        {/* Column Resizer Handle */}
                        <Show when={props.enableColumnResizing}>
                          <div
                            class={classes().resizer}
                            data-slot="resizer"
                            data-resizing={resizingColId() === colId() ? "true" : undefined}
                            onPointerDown={(e) => startResize(e, colId(), col.minSize, col.maxSize)}
                          />
                        </Show>
                      </th>
                    );
                  }}
                </For>
              </tr>
            </thead>
          </Show>

          {/* ── tbody ── */}
          <tbody class={classes().tbody} data-slot="tbody">
            {props.slots?.["body-top"]
              ? props.slots["body-top"]({ table: tableApi })
              : props.bodyTop?.()}

            <Show
              when={!props.loading}
              fallback={
                <tr>
                  <td
                    colspan={Math.max(1, visibleColumns().length)}
                    class={classes().loading}
                    data-slot="loading"
                  >
                    <Show
                      when={props.slots?.["loading"] || props.loadingContent}
                      fallback={
                        <div class="flex items-center justify-center gap-2 text-muted py-4">
                          <RLIcon
                            name="i-lucide-loader-2"
                            class="size-5 animate-spin text-primary"
                          />
                          <span>{uiT("table.loading")}</span>
                        </div>
                      }
                    >
                      {props.slots?.["loading"]
                        ? props.slots["loading"]({ table: tableApi })
                        : props.loadingContent?.()}
                    </Show>
                  </td>
                </tr>
              }
            >
              <Show
                when={paginatedItems().length > 0}
                fallback={
                  <tr>
                    <td
                      colspan={Math.max(1, visibleColumns().length)}
                      class={classes().empty}
                      data-slot="empty"
                    >
                      <Show
                        when={props.slots?.["empty"] || props.emptyContent}
                        fallback={
                          <div class="flex flex-col items-center justify-center py-6 gap-2 text-muted">
                            <RLIcon name="i-lucide-inbox" class="size-8 opacity-40" />
                            <p class="text-sm font-medium">{props.empty ?? "No data available"}</p>
                          </div>
                        }
                      >
                        {props.slots?.["empty"]
                          ? props.slots["empty"]({ table: tableApi })
                          : props.emptyContent?.()}
                      </Show>
                    </td>
                  </tr>
                }
              >
                {/* Virtual Top Spacer */}
                <Show when={isVirtual() && virtualizedView().padTop > 0}>
                  <tr>
                    <td
                      colspan={Math.max(1, visibleColumns().length)}
                      style={`height: ${virtualizedView().padTop}px; padding: 0; border: 0;`}
                    />
                  </tr>
                </Show>

                <For each={virtualizedView().items}>
                  {(item) => {
                    if (item.type === "group") {
                      const { group, depth } = item;
                      const groupHeaderSlot = props.slots?.["group-header"];

                      return (
                        <tr class={classes().trGroup} data-slot="tr-group" data-depth={depth}>
                          <td
                            colspan={Math.max(1, visibleColumns().length)}
                            class={classes().tdGroup}
                            style={{ "padding-left": `${depth * 1.5 + 1}rem` }}
                            data-slot="td-group"
                          >
                            <Show
                              when={groupHeaderSlot || props.groupHeader}
                              fallback={
                                <span class="flex items-center gap-2">
                                  <span class="i-lucide-layers size-3.5 text-primary opacity-70" />
                                  <span class="text-xs uppercase text-muted font-medium">
                                    {group.columnId}:
                                  </span>
                                  <span class="text-highlighted">{String(group.value)}</span>
                                  <span class="ml-auto text-muted font-normal normal-case">
                                    {group.rows.length} {group.rows.length === 1 ? "row" : "rows"}
                                  </span>
                                </span>
                              }
                            >
                              {groupHeaderSlot
                                ? groupHeaderSlot({
                                    group,
                                    colSpan: visibleColumns().length,
                                    table: tableApi,
                                  })
                                : props.groupHeader?.(group, visibleColumns().length)}
                            </Show>
                          </td>
                        </tr>
                      );
                    }

                    const { row } = item;
                    const trMetaClass = () =>
                      typeof props.meta?.class?.tr === "function"
                        ? props.meta.class.tr(row)
                        : props.meta?.class?.tr || "";
                    const trMetaStyle = () =>
                      typeof props.meta?.style?.tr === "function"
                        ? props.meta.style.tr(row)
                        : props.meta?.style?.tr || "";

                    const isRowDropTarget = () =>
                      dropTargetRow()?.id === row.id &&
                      draggedRowIndex() !== null &&
                      draggedRowIndex() !== row.index;
                    const rowDropPos = () =>
                      isRowDropTarget() ? dropTargetRow()?.position : undefined;

                    return (
                      <>
                        <tr
                          class={`${classes().tr} ${trMetaClass()}`}
                          style={trMetaStyle() || undefined}
                          data-slot="tr"
                          data-row-id={row.id}
                          data-selected={row.getIsSelected() ? "true" : undefined}
                          data-expanded={row.getIsExpanded() ? "true" : undefined}
                          data-pinned={row.getIsPinned() || undefined}
                          data-drop-position={rowDropPos()}
                          onDragOver={(e) => {
                            if (!props.enableRowReordering || draggedRowIndex() === null) return;
                            e.preventDefault();
                            const tr = e.currentTarget as HTMLElement;
                            const rect = tr.getBoundingClientRect();
                            const pos = e.clientY < rect.top + rect.height / 2 ? "top" : "bottom";
                            const cur = dropTargetRow();
                            if (!cur || cur.id !== row.id || cur.position !== pos) {
                              setDropTargetRow({ id: row.id, index: row.index, position: pos });
                            }
                          }}
                          onDragLeave={() => {
                            if (dropTargetRow()?.id === row.id) {
                              setDropTargetRow(null);
                            }
                          }}
                          onDrop={(e) => {
                            if (
                              !props.enableRowReordering ||
                              draggedRowIndex() === null ||
                              !props.data
                            )
                              return;
                            e.preventDefault();
                            const fromIdx = draggedRowIndex()!;
                            const target = dropTargetRow();
                            setDraggedRowIndex(null);
                            setDropTargetRow(null);
                            if (!target || fromIdx === target.index) return;

                            const newData = [...props.data];
                            const [movedItem] = newData.splice(fromIdx, 1);
                            if (movedItem !== undefined) {
                              let toIdx = target.index;
                              if (fromIdx < target.index && target.position === "top") {
                                toIdx = target.index - 1;
                              } else if (fromIdx > target.index && target.position === "bottom") {
                                toIdx = target.index + 1;
                              }
                              toIdx = Math.max(0, Math.min(newData.length, toIdx));
                              newData.splice(toIdx, 0, movedItem);
                              props.onRowReorder?.(newData, fromIdx, toIdx);
                            }
                          }}
                          onClick={(e) => {
                            const target = e.target as HTMLElement;
                            if (target.closest("a, button, input, select, textarea, [role=button]"))
                              return;
                            props.onSelect?.(e, row);
                          }}
                          onMouseEnter={(e) => props.onHover?.(e, row)}
                          onMouseLeave={(e) => props.onHover?.(e, null)}
                          onContextMenu={(e) => props.onContextmenu?.(e, row)}
                        >
                          <For each={visibleColumns()}>
                            {(col) => {
                              const colId = () => String(col.id || col.accessorKey || "");
                              const cellValue = () => {
                                if (typeof col.accessorFn === "function") {
                                  return col.accessorFn(row.original);
                                }
                                const key = (col.accessorKey || col.id || "") as string;
                                return key ? row.getValue(key) : undefined;
                              };
                              const pinned = () =>
                                colId() in columnOffsets().left || colId() in columnOffsets().right;

                              const metaTdClass = () =>
                                typeof col.meta?.class?.td === "function"
                                  ? col.meta.class.td(row)
                                  : col.meta?.class?.td || "";
                              const metaTdStyle = () =>
                                typeof col.meta?.style?.td === "function"
                                  ? col.meta.style.td(row)
                                  : col.meta?.style?.td || "";
                              const colSpanVal = () =>
                                typeof col.meta?.colspan?.td === "function"
                                  ? col.meta.colspan.td(row)
                                  : col.meta?.colspan?.td;
                              const rowSpanVal = () =>
                                typeof col.meta?.rowspan?.td === "function"
                                  ? col.meta.rowspan.td(row)
                                  : col.meta?.rowspan?.td;

                              const sizeStyle = () => {
                                const sizeVal = currentColumnSizing()[colId()] ?? col.size;
                                const styles: string[] = [];
                                if (typeof sizeVal === "number")
                                  styles.push(`width: ${sizeVal}px;`);
                                else if (sizeVal) styles.push(`width: ${sizeVal};`);
                                if (col.minSize) {
                                  styles.push(
                                    `min-width: ${typeof col.minSize === "number" ? `${col.minSize}px` : col.minSize};`,
                                  );
                                }
                                if (col.maxSize) {
                                  styles.push(
                                    `max-width: ${typeof col.maxSize === "number" ? `${col.maxSize}px` : col.maxSize};`,
                                  );
                                }
                                return styles.join(" ");
                              };

                              const pinStyle = () => {
                                if (colId() in columnOffsets().left) {
                                  return `left: ${columnOffsets().left[colId()]}px;`;
                                }
                                if (colId() in columnOffsets().right) {
                                  return `right: ${columnOffsets().right[colId()]}px;`;
                                }
                                return "";
                              };

                              const isEditing = () =>
                                currentEditingCell()?.rowId === row.id &&
                                currentEditingCell()?.columnId === colId();
                              const setEditing = (editing: boolean) => {
                                tableApi.setEditingCell(
                                  editing ? { rowId: row.id, columnId: colId() } : null,
                                );
                              };

                              const cellSlot = props.slots?.[`${colId()}-cell`];

                              return (
                                <td
                                  class={`${classes().td} ${pinned() ? "sticky bg-default z-10" : ""} ${metaTdClass()}`}
                                  style={`${sizeStyle()} ${pinStyle()} ${metaTdStyle()}`}
                                  colspan={colSpanVal()}
                                  rowspan={rowSpanVal()}
                                  data-slot="td"
                                  data-col-id={colId()}
                                >
                                  <Show
                                    when={!cellSlot}
                                    fallback={cellSlot?.({
                                      row,
                                      column: col,
                                      cell: { value: cellValue() },
                                      getValue: cellValue,
                                      renderValue: cellValue,
                                      isEditing,
                                      setEditing,
                                      table: tableApi,
                                    })}
                                  >
                                    {renderCellContent(row, col, cellValue, isEditing, setEditing)}
                                  </Show>
                                </td>
                              );
                            }}
                          </For>
                        </tr>

                        {/* Expanded sub-row content */}
                        <Show
                          when={
                            row.getCanExpand() &&
                            row.getIsExpanded() &&
                            (props.slots?.["expanded"] || props.expandedContent)
                          }
                        >
                          <tr class={classes().trExpanded} data-slot="tr-expanded">
                            <td
                              colspan={Math.max(1, visibleColumns().length)}
                              class={classes().tdExpanded}
                              data-slot="td-expanded"
                            >
                              {props.slots?.["expanded"]
                                ? props.slots["expanded"]({ row, table: tableApi })
                                : props.expandedContent?.(row)}
                            </td>
                          </tr>
                        </Show>

                        {/* Tree / Sub-rows */}
                        <Show when={row.getIsExpanded() && row.subRows && row.subRows.length > 0}>
                          <For each={row.subRows}>
                            {(subRow) => {
                              const subMetaClass = () =>
                                typeof props.meta?.class?.tr === "function"
                                  ? props.meta.class.tr(subRow)
                                  : props.meta?.class?.tr || "";
                              const subMetaStyle = () =>
                                typeof props.meta?.style?.tr === "function"
                                  ? props.meta.style.tr(subRow)
                                  : props.meta?.style?.tr || "";

                              return (
                                <tr
                                  class={`${classes().tr} ${subMetaClass()}`}
                                  style={subMetaStyle() || undefined}
                                  data-slot="tr"
                                  data-row-id={subRow.id}
                                  data-depth={subRow.depth}
                                  data-selected={subRow.getIsSelected() ? "true" : undefined}
                                  onClick={(e) => {
                                    const target = e.target as HTMLElement;
                                    if (
                                      target.closest(
                                        "a, button, input, select, textarea, [role=button]",
                                      )
                                    )
                                      return;
                                    props.onSelect?.(e, subRow);
                                  }}
                                  onMouseEnter={(e) => props.onHover?.(e, subRow)}
                                  onMouseLeave={(e) => props.onHover?.(e, null)}
                                  onContextMenu={(e) => props.onContextmenu?.(e, subRow)}
                                >
                                  <For each={visibleColumns()}>
                                    {(col) => {
                                      const colId = () => String(col.id || col.accessorKey || "");
                                      const cellValue = () => {
                                        if (typeof col.accessorFn === "function") {
                                          return col.accessorFn(subRow.original);
                                        }
                                        const key = (col.accessorKey || col.id || "") as string;
                                        return key ? subRow.getValue(key) : undefined;
                                      };
                                      const pinned = () =>
                                        colId() in columnOffsets().left ||
                                        colId() in columnOffsets().right;

                                      const metaTdClass = () =>
                                        typeof col.meta?.class?.td === "function"
                                          ? col.meta.class.td(subRow)
                                          : col.meta?.class?.td || "";
                                      const metaTdStyle = () =>
                                        typeof col.meta?.style?.td === "function"
                                          ? col.meta.style.td(subRow)
                                          : col.meta?.style?.td || "";
                                      const colSpanVal = () =>
                                        typeof col.meta?.colspan?.td === "function"
                                          ? col.meta.colspan.td(subRow)
                                          : col.meta?.colspan?.td;
                                      const rowSpanVal = () =>
                                        typeof col.meta?.rowspan?.td === "function"
                                          ? col.meta.rowspan.td(subRow)
                                          : col.meta?.rowspan?.td;

                                      const sizeStyle = () => {
                                        const sizeVal = currentColumnSizing()[colId()] ?? col.size;
                                        const styles: string[] = [];
                                        if (typeof sizeVal === "number")
                                          styles.push(`width: ${sizeVal}px;`);
                                        else if (sizeVal) styles.push(`width: ${sizeVal};`);
                                        if (col.minSize) {
                                          styles.push(
                                            `min-width: ${typeof col.minSize === "number" ? `${col.minSize}px` : col.minSize};`,
                                          );
                                        }
                                        if (col.maxSize) {
                                          styles.push(
                                            `max-width: ${typeof col.maxSize === "number" ? `${col.maxSize}px` : col.maxSize};`,
                                          );
                                        }
                                        return styles.join(" ");
                                      };

                                      const pinStyle = () => {
                                        if (colId() in columnOffsets().left) {
                                          return `left: ${columnOffsets().left[colId()]}px;`;
                                        }
                                        if (colId() in columnOffsets().right) {
                                          return `right: ${columnOffsets().right[colId()]}px;`;
                                        }
                                        return "";
                                      };

                                      const isEditing = () =>
                                        currentEditingCell()?.rowId === subRow.id &&
                                        currentEditingCell()?.columnId === colId();
                                      const setEditing = (editing: boolean) => {
                                        tableApi.setEditingCell(
                                          editing ? { rowId: subRow.id, columnId: colId() } : null,
                                        );
                                      };

                                      const cellSlot = props.slots?.[`${colId()}-cell`];

                                      return (
                                        <td
                                          class={`${classes().td} ${pinned() ? "sticky bg-default z-10" : ""} ${metaTdClass()}`}
                                          style={`${sizeStyle()} ${pinStyle()} ${metaTdStyle()}`}
                                          colspan={colSpanVal()}
                                          rowspan={rowSpanVal()}
                                          data-slot="td"
                                          data-col-id={colId()}
                                        >
                                          <Show
                                            when={!cellSlot}
                                            fallback={cellSlot?.({
                                              row: subRow,
                                              column: col,
                                              cell: { value: cellValue() },
                                              getValue: cellValue,
                                              renderValue: cellValue,
                                              isEditing,
                                              setEditing,
                                              table: tableApi,
                                            })}
                                          >
                                            {renderCellContent(
                                              subRow,
                                              col,
                                              cellValue,
                                              isEditing,
                                              setEditing,
                                            )}
                                          </Show>
                                        </td>
                                      );
                                    }}
                                  </For>
                                </tr>
                              );
                            }}
                          </For>
                        </Show>
                      </>
                    );
                  }}
                </For>

                {/* Virtual Bottom Spacer */}
                <Show when={isVirtual() && virtualizedView().padBottom > 0}>
                  <tr>
                    <td
                      colspan={Math.max(1, visibleColumns().length)}
                      style={`height: ${virtualizedView().padBottom}px; padding: 0; border: 0;`}
                    />
                  </tr>
                </Show>
              </Show>
            </Show>

            {props.slots?.["body-bottom"]
              ? props.slots["body-bottom"]({ table: tableApi })
              : props.bodyBottom?.()}
          </tbody>

          {/* ── tfoot ── */}
          <Show when={hasFooters()}>
            <tfoot class={classes().tfoot} data-slot="tfoot">
              <tr class={classes().tr} data-slot="tr">
                <For each={visibleColumns()}>
                  {(col) => {
                    const colId = () => String(col.id || col.accessorKey || "");
                    const footerSlot = props.slots?.[`${colId()}-footer`];

                    return (
                      <td class={classes().td} data-slot="td">
                        <Show
                          when={!footerSlot}
                          fallback={footerSlot?.({ column: col, table: tableApi })}
                        >
                          {typeof col.footer === "function"
                            ? col.footer({ column: col, table: tableApi })
                            : col.footer || ""}
                        </Show>
                      </td>
                    );
                  }}
                </For>
              </tr>
            </tfoot>
          </Show>
        </table>
      </div>
    </div>
  );
};
