export interface TableColumnMeta {
  class?: {
    td?: string | ((row: TableRow) => string)
    th?: string | ((column: TableColumn) => string)
  }
  style?: {
    td?: string | ((row: TableRow) => string)
    th?: string | ((column: TableColumn) => string)
  }
  colspan?: {
    td?: number | string | ((row: TableRow) => number | string)
  }
  rowspan?: {
    td?: number | string | ((row: TableRow) => number | string)
  }
  [key: string]: any
}

export interface TableColumn<T = any> {
  id?: string
  accessorKey?: keyof T | string
  header?: string | ((props: { column: TableColumn<T>; table: any }) => any)
  cell?: (props: {
    row: TableRow<T>
    getValue: () => any
    renderValue: () => any
    column: TableColumn<T>
    table: any
  }) => any
  footer?: string | ((props: { column: TableColumn<T>; table: any }) => any)
  meta?: TableColumnMeta
  enableSorting?: boolean
  enableHiding?: boolean
  size?: number | string
  [key: string]: any
}

export interface TableRow<T = any> {
  id: string
  original: T
  index: number
  depth: number
  getValue: (key: string) => any
  getIsSelected: () => boolean
  toggleSelected: (value?: boolean) => void
  getIsExpanded: () => boolean
  toggleExpanded: (value?: boolean) => void
  getIsPinned: () => boolean | "top" | "bottom"
  pin: (position: boolean | "top" | "bottom") => void
  getIsGrouped: () => boolean
  getCanExpand: () => boolean
  subRows?: TableRow<T>[]
  [key: string]: any
}

export interface TableGroup<T = any> {
  id: string
  columnId: string
  value: any
  rows: TableRow<T>[]
}

export interface TableMeta<T = any> {
  class?: {
    tr?: string | ((row: TableRow<T>) => string)
  }
  style?: {
    tr?: string | ((row: TableRow<T>) => string)
  }
  [key: string]: any
}

export interface TableSortingItem {
  id: string
  desc: boolean
}

export type SortingState = TableSortingItem[]

export interface TableColumnFilter {
  id: string
  value: any
}

export type ColumnFiltersState = TableColumnFilter[]

export interface TableRowPinningState {
  top?: string[]
  bottom?: string[]
}

export interface TableColumnPinningState {
  left?: string[]
  right?: string[]
}

export interface TablePaginationState {
  pageIndex: number
  pageSize: number
}

/**
 * Imperative API exposed by RLATable (on the custom element) and RLSTable (via ref callback).
 */
export interface TableApi<T = any> {
  tableRef: HTMLTableElement | null
  getFilteredRows(): TableRow<T>[]
  getSortedRows(): TableRow<T>[]
  getSelectedRows(): TableRow<T>[]
  getAllColumns(): TableColumn<T>[]
  getColumn(id: string): TableColumn<T> | undefined
  setGlobalFilter(value: string): void
  setColumnFilter(id: string, value: any): void
  setColumnVisibility(id: string, visible: boolean): void
  setColumnPinning(pinning: TableColumnPinningState): void
  setRowPinning(pinning: TableRowPinningState): void
  setSorting(state: SortingState): void
  setPagination(state: TablePaginationState): void
  getState(): {
    sorting: SortingState
    globalFilter: string
    columnFilters: ColumnFiltersState
    columnVisibility: Record<string, boolean>
    columnPinning: TableColumnPinningState
    rowSelection: Record<string, boolean>
    expanded: Record<string, boolean>
    rowPinning: TableRowPinningState
    pagination: TablePaginationState
  }
}

export interface TableProps<T = any> {
  /**
   * Data rows. Auto-infers columns from the first row's keys when `columns` is omitted.
   */
  data?: T[]
  /**
   * Column definitions.
   */
  columns?: TableColumn<T>[]
  /**
   * Accessible table caption (visually hidden).
   */
  caption?: string
  /**
   * Table-level metadata, e.g. a per-row `class.tr` function.
   */
  meta?: TableMeta<T>
  /**
   * Stick the header, footer, or both when the table scrolls.
   */
  sticky?: boolean | "header" | "footer"
  /**
   * Show a loading progress bar.
   */
  loading?: boolean
  /**
   * Color of the loading bar. @default 'primary'
   */
  loadingColor?: "primary" | "secondary" | "success" | "info" | "warning" | "error" | "neutral"
  /**
   * Animation of the loading bar. @default 'carousel'
   */
  loadingAnimation?: "carousel" | "carousel-inverse" | "swing" | "elastic"
  /**
   * Empty-state text. @default 'No data available'
   */
  empty?: string
  /**
   * Alternate row background colors.
   */
  striped?: boolean
  /**
   * Show borders on every cell.
   */
  bordered?: boolean
  /**
   * Highlight row on hover.
   */
  hoverable?: boolean
  /**
   * Global text filter across all columns.
   */
  globalFilter?: string
  /**
   * Per-column filter state.
   */
  columnFilters?: ColumnFiltersState
  /**
   * Column visibility map — `{ [columnId]: boolean }`.
   */
  columnVisibility?: Record<string, boolean>
  /**
   * Sticky column pinning — `{ left?: string[], right?: string[] }`.
   */
  columnPinning?: TableColumnPinningState
  /**
   * Active sort state.
   */
  sorting?: SortingState
  /**
   * Column IDs to group rows by (first entry is used).
   */
  grouping?: string[]
  /**
   * Row pinning — `{ top?: string[], bottom?: string[] }`.
   */
  rowPinning?: TableRowPinningState
  /**
   * Row selection map — `{ [rowId]: boolean }`.
   */
  rowSelection?: Record<string, boolean>
  /**
   * Expanded rows map — `{ [rowId]: boolean }`.
   */
  expanded?: Record<string, boolean>
  /**
   * Pagination state.
   */
  pagination?: TablePaginationState
  /**
   * Extract sub-rows for tree/hierarchical data.
   */
  getSubRows?: (row: T, index: number) => T[] | undefined
  /**
   * Custom row ID extractor. Defaults to `row.id ?? String(index)`.
   */
  getRowId?: (row: T, index: number) => string
  /**
   * Called when a data row is clicked (skips clicks on interactive elements).
   */
  onSelect?: (e: Event, row: TableRow<T>) => void
  /**
   * Called when the pointer enters or leaves a row (`null` on leave).
   */
  onHover?: (e: Event, row: TableRow<T> | null) => void
  /**
   * Called on row right-click.
   */
  onContextmenu?: (e: Event, row: TableRow<T>) => void
  // Controlled-mode callbacks — provide these to take ownership of state externally
  onSortingChange?: (state: SortingState) => void
  onColumnFiltersChange?: (state: ColumnFiltersState) => void
  onGlobalFilterChange?: (value: string) => void
  onColumnVisibilityChange?: (state: Record<string, boolean>) => void
  onColumnPinningChange?: (state: TableColumnPinningState) => void
  onRowSelectionChange?: (state: Record<string, boolean>) => void
  onExpandedChange?: (state: Record<string, boolean>) => void
  onRowPinningChange?: (state: TableRowPinningState) => void
  onPaginationChange?: (state: TablePaginationState) => void
  /**
   * Render a built-in search input in the toolbar.
   */
  searchable?: boolean
  /**
   * Placeholder for the built-in search input. @default 'Filter table...'
   */
  searchPlaceholder?: string
  /**
   * Render a column-visibility dropdown in the toolbar.
   */
  showColumnsToggle?: boolean
  /**
   * Per-slot class overrides.
   */
  ui?: Partial<Record<string, string>>
  /**
   * Additional classes on the root element.
   */
  class?: any
  [key: string]: unknown
}
