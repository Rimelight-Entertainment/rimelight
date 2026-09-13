import { createMemo, createSignal, For, Show, type JSX } from "solid-js"
import type {
  TableProps,
  TableColumn,
  TableRow,
  TableGroup,
  TableApi,
  SortingState,
  ColumnFiltersState,
  TableColumnPinningState,
  TableRowPinningState,
  TablePaginationState
} from "./table"
import { tableTheme } from "./table.theme"
import RLSInput from "../input/RLSInput"
import RLSDropdownMenu from "../dropdown-menu/RLSDropdownMenu"

type AnyData = Record<string, any>

export interface RLSTableProps<T = any> extends TableProps<T> {
  ref?: (api: TableApi<T>) => void | TableApi<T>
  toolbar?: () => JSX.Element
  captionContent?: () => JSX.Element
  groupHeader?: (group: TableGroup<T>, colSpan: number) => JSX.Element
  expandedContent?: (row: TableRow<T>) => JSX.Element
  loadingContent?: () => JSX.Element
  emptyContent?: () => JSX.Element
  bodyTop?: () => JSX.Element
  bodyBottom?: () => JSX.Element
}

function getNestedValue(obj: AnyData, key: string): any {
  if (!obj || typeof obj !== "object") return undefined
  if (key.includes(".")) {
    return key.split(".").reduce((acc: any, k) => acc?.[k], obj)
  }
  return obj[key]
}

export function RLSTable<T = any>(props: RLSTableProps<T>) {
  let tableElementRef: HTMLTableElement | null = null

  // ─── Controlled / Uncontrolled State Store ──────────────────────────────────
  const [internalSorting, setInternalSorting] = createSignal<SortingState>(props.sorting ?? [])
  const [internalGlobalFilter, setInternalGlobalFilter] = createSignal<string>(
    props.globalFilter ?? ""
  )
  const [internalColumnFilters, setInternalColumnFilters] = createSignal<ColumnFiltersState>(
    props.columnFilters ?? []
  )
  const [internalColumnVisibility, setInternalColumnVisibility] = createSignal<
    Record<string, boolean>
  >(props.columnVisibility ?? {})
  const [internalColumnPinning, setInternalColumnPinning] = createSignal<TableColumnPinningState>(
    props.columnPinning ?? {}
  )
  const [internalRowSelection, setInternalRowSelection] = createSignal<Record<string, boolean>>(
    props.rowSelection ?? {}
  )
  const [internalExpanded, setInternalExpanded] = createSignal<Record<string, boolean>>(
    props.expanded ?? {}
  )
  const [internalRowPinning, setInternalRowPinning] = createSignal<TableRowPinningState>(
    props.rowPinning ?? {}
  )
  const [internalPagination, setInternalPagination] = createSignal<
    TablePaginationState | undefined
  >(props.pagination)

  // Reactive state readers that prefer controlled props if provided
  const currentSorting = () => (props.sorting !== undefined ? props.sorting : internalSorting())
  const currentGlobalFilter = () =>
    props.globalFilter !== undefined ? props.globalFilter : internalGlobalFilter()
  const currentColumnFilters = () =>
    props.columnFilters !== undefined ? props.columnFilters : internalColumnFilters()
  const currentColumnVisibility = () =>
    props.columnVisibility !== undefined ? props.columnVisibility : internalColumnVisibility()
  const currentColumnPinning = () =>
    props.columnPinning !== undefined ? props.columnPinning : internalColumnPinning()
  const currentRowSelection = () =>
    props.rowSelection !== undefined ? props.rowSelection : internalRowSelection()
  const currentExpanded = () => (props.expanded !== undefined ? props.expanded : internalExpanded())
  const currentRowPinning = () =>
    props.rowPinning !== undefined ? props.rowPinning : internalRowPinning()
  const currentPagination = () =>
    props.pagination !== undefined ? props.pagination : internalPagination()

  const updateSorting = (next: SortingState) => {
    setInternalSorting(next)
    props.onSortingChange?.(next)
  }
  const updateGlobalFilter = (val: string) => {
    setInternalGlobalFilter(val)
    props.onGlobalFilterChange?.(val)
  }
  const updateColumnFilters = (next: ColumnFiltersState) => {
    setInternalColumnFilters(next)
    props.onColumnFiltersChange?.(next)
  }
  const updateColumnVisibility = (next: Record<string, boolean>) => {
    setInternalColumnVisibility(next)
    props.onColumnVisibilityChange?.(next)
  }
  const updateRowSelection = (next: Record<string, boolean>) => {
    setInternalRowSelection(next)
    props.onRowSelectionChange?.(next)
  }
  const updateExpanded = (next: Record<string, boolean>) => {
    setInternalExpanded(next)
    props.onExpandedChange?.(next)
  }
  const updateColumnPinning = (next: TableColumnPinningState) => {
    setInternalColumnPinning(next)
    props.onColumnPinningChange?.(next)
  }
  const updateRowPinning = (next: TableRowPinningState) => {
    setInternalRowPinning(next)
    props.onRowPinningChange?.(next)
  }
  const updatePagination = (next: TablePaginationState) => {
    setInternalPagination(next)
    props.onPaginationChange?.(next)
  }

  // ─── Column resolution ───────────────────────────────────────────────────────
  const resolvedColumns = createMemo<TableColumn<T>[]>(() => {
    if (props.columns && props.columns.length > 0) {
      return props.columns
    }
    const d = props.data
    if (d && d.length > 0 && typeof d[0] === "object" && d[0] !== null) {
      const firstRow = d[0] as AnyData
      return Object.keys(firstRow).map((key) => ({
        id: key,
        accessorKey: key as any,
        header: key.charAt(0).toUpperCase() + key.slice(1),
        enableSorting: true
      }))
    }
    return []
  })

  const visibleColumns = createMemo(() => {
    const visibility = currentColumnVisibility()
    return resolvedColumns().filter((col) => {
      const id = (col.id || col.accessorKey || "") as string
      if (!id) return true
      if (col.enableHiding === false) return true
      return visibility[id] !== false
    })
  })

  // ─── Row Hierarchy Building ──────────────────────────────────────────────────
  const buildRowTree = (rawItems: T[], parentDepth = 0): TableRow<T>[] => {
    return rawItems.map((item, idx) => {
      const rId = props.getRowId
        ? props.getRowId(item, idx)
        : (item as any)?.id !== undefined
          ? String((item as any).id)
          : String(idx)

      let subRowsList: TableRow<T>[] | undefined = undefined
      if (props.getSubRows) {
        const children = props.getSubRows(item, idx)
        if (children && children.length > 0) {
          subRowsList = buildRowTree(children, parentDepth + 1)
        }
      } else if (Array.isArray((item as any)?.children) && (item as any).children.length > 0) {
        subRowsList = buildRowTree((item as any).children, parentDepth + 1)
      }

      const rowObj: TableRow<T> = {
        id: rId,
        original: item,
        index: idx,
        depth: parentDepth,
        getValue: (key: string) => getNestedValue(item as AnyData, key),
        getIsSelected: () => !!currentRowSelection()[rId],
        toggleSelected: (val?: boolean) => {
          const nextVal = val !== undefined ? val : !currentRowSelection()[rId]
          updateRowSelection({ ...currentRowSelection(), [rId]: nextVal })
        },
        getIsExpanded: () => !!currentExpanded()[rId],
        toggleExpanded: (val?: boolean) => {
          const nextVal = val !== undefined ? val : !currentExpanded()[rId]
          updateExpanded({ ...currentExpanded(), [rId]: nextVal })
        },
        getToggleExpandedHandler: () => (e?: Event) => {
          e?.stopPropagation?.()
          const nextVal = !currentExpanded()[rId]
          updateExpanded({ ...currentExpanded(), [rId]: nextVal })
        },
        getToggleSelectedHandler: () => (e?: Event) => {
          e?.stopPropagation?.()
          const nextVal = !currentRowSelection()[rId]
          updateRowSelection({ ...currentRowSelection(), [rId]: nextVal })
        },
        getIsPinned: () => {
          const pin = currentRowPinning()
          if (pin.top?.includes(rId)) return "top"
          if (pin.bottom?.includes(rId)) return "bottom"
          return false
        },
        pin: (position: boolean | "top" | "bottom") => {
          const current = currentRowPinning()
          const nextTop = (current.top || []).filter((id) => id !== rId)
          const nextBottom = (current.bottom || []).filter((id) => id !== rId)
          if (position === "top") nextTop.push(rId)
          else if (position === "bottom") nextBottom.push(rId)
          updateRowPinning({ top: nextTop, bottom: nextBottom })
        },
        getIsGrouped: () => false,
        getCanExpand: () => !!(subRowsList && subRowsList.length > 0) || !!props.expandedContent,
        ...(subRowsList ? { subRows: subRowsList } : {})
      }
      return rowObj
    })
  }

  // ─── Filter pipeline ─────────────────────────────────────────────────────────
  const filteredRows = createMemo(() => {
    let rows = buildRowTree(props.data ?? [])
    const q = currentGlobalFilter().toLowerCase().trim()
    if (q) {
      rows = rows.filter((r) => {
        if (typeof r.original !== "object" || !r.original) {
          return String(r.original).toLowerCase().includes(q)
        }
        return Object.values(r.original as AnyData).some((val) =>
          String(val ?? "")
            .toLowerCase()
            .includes(q)
        )
      })
    }

    const colFilters = currentColumnFilters()
    if (colFilters && colFilters.length > 0) {
      for (const filter of colFilters) {
        if (
          !filter.id ||
          filter.value === undefined ||
          filter.value === null ||
          filter.value === ""
        )
          continue
        const fVal = String(filter.value).toLowerCase()
        rows = rows.filter((r) =>
          String(r.getValue(filter.id) ?? "")
            .toLowerCase()
            .includes(fVal)
        )
      }
    }
    return rows
  })

  // ─── Sort pipeline ───────────────────────────────────────────────────────────
  const sortedRows = createMemo(() => {
    const sorts = currentSorting()
    if (!sorts || sorts.length === 0) return filteredRows()

    return [...filteredRows()].sort((a, b) => {
      for (const { id, desc } of sorts) {
        const valA = a.getValue(id)
        const valB = b.getValue(id)
        if (valA === valB) continue
        if (valA === undefined || valA === null) return 1
        if (valB === undefined || valB === null) return -1
        let cmp: number
        if (typeof valA === "number" && typeof valB === "number") {
          cmp = valA - valB
        } else {
          cmp = String(valA).localeCompare(String(valB))
        }
        return desc ? -cmp : cmp
      }
      return 0
    })
  })

  // ─── Grouping pipeline ───────────────────────────────────────────────────────
  type GroupedItem = { type: "group"; group: TableGroup<T> } | { type: "row"; row: TableRow<T> }

  const groupedItems = createMemo<GroupedItem[]>(() => {
    const sRows = sortedRows()
    const grp = props.grouping
    if (!grp || grp.length === 0) {
      return sRows.map((r) => ({ type: "row", row: r }))
    }

    const groupColId = grp[0]!
    const groupMap = new Map<string, TableRow<T>[]>()
    const groupOrder: string[] = []

    for (const row of sRows) {
      const val = String(row.getValue(groupColId) ?? "")
      if (!groupMap.has(val)) {
        groupMap.set(val, [])
        groupOrder.push(val)
      }
      groupMap.get(val)!.push(row)
    }

    const result: GroupedItem[] = []
    for (const val of groupOrder) {
      const rows = groupMap.get(val)!
      const group: TableGroup<T> = {
        id: `group-${groupColId}-${val}`,
        columnId: groupColId,
        value: val,
        rows
      }
      result.push({ type: "group", group })
      for (const row of rows) {
        result.push({ type: "row", row })
      }
    }
    return result
  })

  // ─── Row Pinning ─────────────────────────────────────────────────────────────
  const pinnedItems = createMemo<GroupedItem[]>(() => {
    const items = groupedItems()
    const pin = currentRowPinning()
    if ((!pin.top || pin.top.length === 0) && (!pin.bottom || pin.bottom.length === 0)) {
      return items
    }

    const topItems: GroupedItem[] = []
    const midItems: GroupedItem[] = []
    const botItems: GroupedItem[] = []

    for (const item of items) {
      if (item.type === "row") {
        if (pin.top?.includes(item.row.id)) topItems.push(item)
        else if (pin.bottom?.includes(item.row.id)) botItems.push(item)
        else midItems.push(item)
      } else {
        midItems.push(item)
      }
    }
    return [...topItems, ...midItems, ...botItems]
  })

  // ─── Pagination ──────────────────────────────────────────────────────────────
  const paginatedItems = createMemo<GroupedItem[]>(() => {
    const items = pinnedItems()
    const pag = currentPagination()
    if (!pag) return items

    const { pageIndex, pageSize } = pag
    const rowItems = items.filter((i) => i.type === "row") as { type: "row"; row: TableRow<T> }[]
    const pageRows = rowItems.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize)
    const pageRowIds = new Set(pageRows.map((i) => i.row.id))

    if (props.grouping && props.grouping.length > 0) {
      const result: GroupedItem[] = []
      for (const item of items) {
        if (item.type === "group") {
          if (item.group.rows.some((r) => pageRowIds.has(r.id))) result.push(item)
        } else if (pageRowIds.has(item.row.id)) {
          result.push(item)
        }
      }
      return result
    }
    return pageRows
  })

  // ─── Column offsets ──────────────────────────────────────────────────────────
  const columnOffsets = createMemo(() => {
    const cols = resolvedColumns()
    const pin = currentColumnPinning()
    const left: Record<string, number> = {}
    const right: Record<string, number> = {}

    if (pin.left && pin.left.length > 0) {
      let offset = 0
      for (const colId of pin.left) {
        left[colId] = offset
        const col = cols.find((c) => (c.id || c.accessorKey) === colId)
        offset += typeof col?.size === "number" ? col.size : 150
      }
    }

    if (pin.right && pin.right.length > 0) {
      let offset = 0
      for (const colId of [...pin.right].reverse()) {
        right[colId] = offset
        const col = cols.find((c) => (c.id || c.accessorKey) === colId)
        offset += typeof col?.size === "number" ? col.size : 150
      }
    }

    return { left, right }
  })

  const toggleSort = (colId: string, isMulti = false) => {
    const current = currentSorting()
    const existing = current.find((s) => s.id === colId)

    let next: SortingState
    if (!existing) {
      const newItem = { id: colId, desc: false }
      next = isMulti ? [...current, newItem] : [newItem]
    } else if (!existing.desc) {
      const updated = { id: colId, desc: true }
      next = isMulti ? current.map((s) => (s.id === colId ? updated : s)) : [updated]
    } else {
      next = isMulti ? current.filter((s) => s.id !== colId) : []
    }
    updateSorting(next)
  }

  // ─── Expose TableApi ─────────────────────────────────────────────────────────
  const tableApi: TableApi<T> = {
    get tableRef() {
      return tableElementRef
    },
    getFilteredRows: () => filteredRows(),
    getSortedRows: () => sortedRows(),
    getSelectedRows: () => filteredRows().filter((r) => r.getIsSelected()),
    getAllColumns: () => resolvedColumns(),
    getColumn: (id: string) => resolvedColumns().find((c) => (c.id || c.accessorKey) === id),
    setGlobalFilter: (val: string) => updateGlobalFilter(val),
    setColumnFilter: (id: string, val: any) => {
      const current = currentColumnFilters().filter((f) => f.id !== id)
      if (val !== undefined && val !== null && val !== "") {
        current.push({ id, value: val })
      }
      updateColumnFilters(current)
    },
    setColumnVisibility: (id: string, visible: boolean) => {
      updateColumnVisibility({ ...currentColumnVisibility(), [id]: visible })
    },
    setColumnPinning: (pinning: TableColumnPinningState) => updateColumnPinning(pinning),
    setRowPinning: (pinning: TableRowPinningState) => updateRowPinning(pinning),
    setSorting: (st: SortingState) => updateSorting(st),
    setPagination: (pag: TablePaginationState) => updatePagination(pag),
    getState: () => ({
      sorting: currentSorting(),
      globalFilter: currentGlobalFilter(),
      columnFilters: currentColumnFilters(),
      columnVisibility: currentColumnVisibility(),
      columnPinning: currentColumnPinning(),
      rowSelection: currentRowSelection(),
      expanded: currentExpanded(),
      rowPinning: currentRowPinning(),
      pagination: currentPagination() || { pageIndex: 0, pageSize: 10 }
    })
  }

  if (typeof props.ref === "function") {
    props.ref(tableApi)
  }

  // ─── Theme Resolution ────────────────────────────────────────────────────────
  const classes = createMemo(() =>
    tableTheme({
      sticky: props.sticky,
      loading: props.loading,
      loadingColor: props.loadingColor ?? "primary",
      loadingAnimation: props.loadingAnimation ?? "carousel",
      striped: props.striped,
      bordered: props.bordered,
      hoverable: props.hoverable,
      ui: props.ui,
      class: props.class,
      externalScroll: false
    })
  )

  const showToolbar = createMemo(
    () => props.searchable || props.showColumnsToggle || !!props.toolbar
  )

  const columnDropdownItems = createMemo(() =>
    resolvedColumns()
      .filter((col) => col.enableHiding !== false)
      .map((col) => {
        const colId = (col.id || col.accessorKey || "") as string
        const rawLabel = typeof col.header === "string" ? col.header : colId
        return {
          id: colId,
          label: rawLabel.charAt(0).toUpperCase() + rawLabel.slice(1),
          type: "checkbox" as const,
          checked: currentColumnVisibility()[colId] !== false,
          onUpdateChecked: (checked: boolean) => {
            tableApi.setColumnVisibility(colId, checked)
          }
        }
      })
  )

  const hasFooters = createMemo(() =>
    visibleColumns().some((col) => typeof col.footer === "function" || col.footer)
  )

  return (
    <div class={classes().root} data-slot="root">
      <Show when={showToolbar()}>
        <div
          class="flex items-center gap-3 px-3.5 py-3 border-b border-default bg-muted/20 overflow-x-auto"
          data-slot="toolbar"
        >
          <Show when={props.searchable}>
            <RLSInput
              type="search"
              placeholder={props.searchPlaceholder ?? "Filter table..."}
              leadingIcon="i-lucide-search"
              class="max-w-xs min-w-[10ch] w-full"
              value={currentGlobalFilter()}
              onInput={(e: any) => updateGlobalFilter(e.target.value)}
            />
          </Show>

          {props.toolbar?.()}

          <Show when={props.showColumnsToggle}>
            <div class="ml-auto shrink-0">
              <RLSDropdownMenu
                label="Columns"
                icon="i-lucide-columns"
                items={columnDropdownItems()}
                content={{ align: "end" }}
                size="sm"
                color="neutral"
              />
            </div>
          </Show>
        </div>
      </Show>

      <div class="overflow-x-auto w-full">
        <table ref={(el) => (tableElementRef = el)} class={classes().base} data-slot="base">
          <Show when={props.caption || props.captionContent}>
            <caption class={classes().caption} data-slot="caption">
              {props.captionContent ? props.captionContent() : props.caption}
            </caption>
          </Show>

          {/* ── thead ── */}
          <Show when={visibleColumns().length > 0}>
            <thead class={classes().thead} data-slot="thead">
              <tr class={classes().tr} data-slot="tr">
                <For each={visibleColumns()}>
                  {(col) => {
                    const colId = () => (col.id || col.accessorKey || "") as string
                    const pinned = () =>
                      colId() in columnOffsets().left || colId() in columnOffsets().right
                    const pinStyle = () => {
                      if (colId() in columnOffsets().left) {
                        return `left: ${columnOffsets().left[colId()]}px;`
                      }
                      if (colId() in columnOffsets().right) {
                        return `right: ${columnOffsets().right[colId()]}px;`
                      }
                      return ""
                    }
                    const metaThClass = () =>
                      typeof col.meta?.class?.th === "function"
                        ? col.meta.class.th(col)
                        : col.meta?.class?.th || ""
                    const metaThStyle = () =>
                      typeof col.meta?.style?.th === "function"
                        ? col.meta.style.th(col)
                        : col.meta?.style?.th || ""
                    const canSort = () =>
                      col.enableSorting !== false &&
                      !!(col.accessorKey || col.id) &&
                      colId() !== "actions" &&
                      colId() !== "select"

                    const activeSort = () => currentSorting().find((s) => s.id === colId())
                    const sortDir = () =>
                      activeSort() ? (activeSort()!.desc ? "desc" : "asc") : "none"

                    const sizeStyle = () =>
                      col.size
                        ? `width: ${typeof col.size === "number" ? `${col.size}px` : col.size};`
                        : ""

                    return (
                      <th
                        scope="col"
                        class={`${classes().th} ${pinned() ? "sticky bg-default z-10" : ""} ${metaThClass()}`}
                        style={`${sizeStyle()} ${pinStyle()} ${metaThStyle()}`}
                        data-col-id={colId()}
                        data-slot="th"
                      >
                        <Show
                          when={canSort()}
                          fallback={
                            typeof col.header === "function"
                              ? col.header({ column: col, table: tableApi })
                              : col.header || colId()
                          }
                        >
                          <button
                            type="button"
                            class="inline-flex items-center gap-1.5 hover:text-highlighted focus:outline-none transition-colors cursor-pointer group -mx-1 px-1 py-0.5 rounded"
                            onClick={(e) => toggleSort(colId(), e.shiftKey)}
                            aria-label={`Sort by ${colId()}`}
                          >
                            <span>
                              {typeof col.header === "function"
                                ? col.header({ column: col, table: tableApi })
                                : col.header || colId()}
                            </span>
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
                      </th>
                    )
                  }}
                </For>
              </tr>
            </thead>
          </Show>

          {/* ── tbody ── */}
          <tbody class={classes().tbody} data-slot="tbody">
            {props.bodyTop?.()}

            <Show
              when={!props.loading}
              fallback={
                <tr>
                  <td
                    colSpan={Math.max(1, visibleColumns().length)}
                    class={classes().loading}
                    data-slot="loading"
                  >
                    <Show
                      when={props.loadingContent}
                      fallback={
                        <div class="flex items-center justify-center gap-2 text-muted py-4">
                          <span class="i-lucide-loader-2 size-5 animate-spin text-primary" />
                          <span>Loading...</span>
                        </div>
                      }
                    >
                      {props.loadingContent?.()}
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
                      colSpan={Math.max(1, visibleColumns().length)}
                      class={classes().empty}
                      data-slot="empty"
                    >
                      <Show
                        when={props.emptyContent}
                        fallback={
                          <div class="flex flex-col items-center justify-center py-6 gap-2 text-muted">
                            <span class="i-lucide-inbox size-8 opacity-40" />
                            <p class="text-sm font-medium">{props.empty ?? "No data available"}</p>
                          </div>
                        }
                      >
                        {props.emptyContent?.()}
                      </Show>
                    </td>
                  </tr>
                }
              >
                <For each={paginatedItems()}>
                  {(item) => {
                    if (item.type === "group") {
                      const { group } = item
                      return (
                        <tr class={classes().trGroup} data-slot="tr-group">
                          <td
                            colSpan={Math.max(1, visibleColumns().length)}
                            class={classes().tdGroup}
                            data-slot="td-group"
                          >
                            <Show
                              when={props.groupHeader}
                              fallback={
                                <span class="flex items-center gap-2">
                                  <span class="i-lucide-layers size-3.5 text-primary opacity-70" />
                                  <span class="text-highlighted">{String(group.value)}</span>
                                  <span class="ml-auto text-muted font-normal normal-case">
                                    {group.rows.length} {group.rows.length === 1 ? "row" : "rows"}
                                  </span>
                                </span>
                              }
                            >
                              {props.groupHeader?.(group, visibleColumns().length)}
                            </Show>
                          </td>
                        </tr>
                      )
                    }

                    const { row } = item
                    const trMetaClass = () =>
                      typeof props.meta?.class?.tr === "function"
                        ? props.meta.class.tr(row)
                        : props.meta?.class?.tr || ""
                    const trMetaStyle = () =>
                      typeof props.meta?.style?.tr === "function"
                        ? props.meta.style.tr(row)
                        : props.meta?.style?.tr || ""

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
                          onClick={(e) => {
                            const target = e.target as HTMLElement
                            if (target.closest("a, button, input, select, textarea, [role=button]"))
                              return
                            props.onSelect?.(e, row)
                          }}
                          onMouseEnter={(e) => props.onHover?.(e, row)}
                          onMouseLeave={(e) => props.onHover?.(e, null)}
                          onContextMenu={(e) => props.onContextmenu?.(e, row)}
                        >
                          <For each={visibleColumns()}>
                            {(col) => {
                              const colId = () => (col.id || col.accessorKey || "") as string
                              const accessorKey = () => (col.accessorKey || col.id || "") as string
                              const cellValue = () =>
                                accessorKey() ? row.getValue(accessorKey()) : undefined
                              const pinned = () =>
                                colId() in columnOffsets().left || colId() in columnOffsets().right

                              const metaTdClass = () =>
                                typeof col.meta?.class?.td === "function"
                                  ? col.meta.class.td(row)
                                  : col.meta?.class?.td || ""
                              const metaTdStyle = () =>
                                typeof col.meta?.style?.td === "function"
                                  ? col.meta.style.td(row)
                                  : col.meta?.style?.td || ""
                              const colSpanVal = () =>
                                typeof col.meta?.colspan?.td === "function"
                                  ? col.meta.colspan.td(row)
                                  : col.meta?.colspan?.td
                              const rowSpanVal = () =>
                                typeof col.meta?.rowspan?.td === "function"
                                  ? col.meta.rowspan.td(row)
                                  : col.meta?.rowspan?.td

                              const pinStyle = () => {
                                if (colId() in columnOffsets().left) {
                                  return `left: ${columnOffsets().left[colId()]}px;`
                                }
                                if (colId() in columnOffsets().right) {
                                  return `right: ${columnOffsets().right[colId()]}px;`
                                }
                                return ""
                              }

                              return (
                                <td
                                  class={`${classes().td} ${pinned() ? "sticky bg-default z-10" : ""} ${metaTdClass()}`}
                                  style={`${pinStyle()} ${metaTdStyle()}`}
                                  colSpan={colSpanVal()}
                                  rowSpan={rowSpanVal()}
                                  data-slot="td"
                                  data-col-id={colId()}
                                >
                                  {typeof col.cell === "function"
                                    ? col.cell({
                                        row,
                                        getValue: cellValue,
                                        renderValue: cellValue,
                                        column: col,
                                        table: tableApi
                                      })
                                    : cellValue() !== undefined && cellValue() !== null
                                      ? String(cellValue())
                                      : "—"}
                                </td>
                              )
                            }}
                          </For>
                        </tr>

                        {/* Expanded sub-row content */}
                        <Show when={row.getIsExpanded() && props.expandedContent}>
                          <tr class={classes().trExpanded} data-slot="tr-expanded">
                            <td
                              colSpan={Math.max(1, visibleColumns().length)}
                              class={classes().tdExpanded}
                              data-slot="td-expanded"
                            >
                              {props.expandedContent?.(row)}
                            </td>
                          </tr>
                        </Show>

                        {/* Tree / Sub-rows */}
                        <Show when={row.getIsExpanded() && row.subRows && row.subRows.length > 0}>
                          <For each={row.subRows}>
                            {(subRow) => (
                              <tr
                                class={classes().tr}
                                data-slot="tr"
                                data-row-id={subRow.id}
                                data-depth={subRow.depth}
                              >
                                <For each={visibleColumns()}>
                                  {(col) => {
                                    const colId = () => (col.id || col.accessorKey || "") as string
                                    const accessorKey = () =>
                                      (col.accessorKey || col.id || "") as string
                                    const cellValue = () =>
                                      accessorKey() ? subRow.getValue(accessorKey()) : undefined
                                    return (
                                      <td class={classes().td} data-slot="td" data-col-id={colId()}>
                                        {typeof col.cell === "function"
                                          ? col.cell({
                                              row: subRow,
                                              getValue: cellValue,
                                              renderValue: cellValue,
                                              column: col,
                                              table: tableApi
                                            })
                                          : cellValue() !== undefined && cellValue() !== null
                                            ? String(cellValue())
                                            : "—"}
                                      </td>
                                    )
                                  }}
                                </For>
                              </tr>
                            )}
                          </For>
                        </Show>
                      </>
                    )
                  }}
                </For>
              </Show>
            </Show>

            {props.bodyBottom?.()}
          </tbody>

          {/* ── tfoot ── */}
          <Show when={hasFooters()}>
            <tfoot class={classes().tfoot} data-slot="tfoot">
              <tr class={classes().tr} data-slot="tr">
                <For each={visibleColumns()}>
                  {(col) => {
                    return (
                      <td class={classes().td} data-slot="td">
                        {typeof col.footer === "function"
                          ? col.footer({ column: col, table: tableApi })
                          : col.footer || ""}
                      </td>
                    )
                  }}
                </For>
              </tr>
            </tfoot>
          </Show>
        </table>
      </div>
    </div>
  )
}

export default RLSTable
