export interface TableColumnMeta {
  class?: {
    td?: string | ((cell: any) => string)
    th?: string | ((column: any) => string)
  }
  style?: {
    td?: string | ((cell: any) => string)
    th?: string | ((column: any) => string)
  }
  colspan?: {
    td?: number | string | ((cell: any) => number | string)
  }
  rowspan?: {
    td?: number | string | ((cell: any) => number | string)
  }
  [key: string]: any
}

export interface TableColumn<T = any> {
  id?: string
  accessorKey?: keyof T | string
  header?: string | ((props: { column: TableColumn<T>; table: any }) => any)
  cell?: string | ((props: { row: TableRow<T>; getValue: () => any; renderValue: () => any; column: TableColumn<T>; table: any }) => any)
  footer?: string | ((props: { column: TableColumn<T>; table: any }) => any)
  meta?: TableColumnMeta
  enableSorting?: boolean
  enableHiding?: boolean
  size?: number | string
  aggregationFn?: string | ((rows: any[], id: string) => any)
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
  getIsPinned: () => boolean | 'top' | 'bottom'
  pin: (position: boolean | 'top' | 'bottom') => void
  getIsGrouped: () => boolean
  getCanExpand: () => boolean
  subRows?: TableRow<T>[]
  [key: string]: any
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

export interface TableColumnFilter {
  id: string
  value: any
}

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

export interface TableProps<T = any> {
  /**
   * Data rows array.
   */
  data?: T[]
  /**
   * Columns definition array.
   */
  columns?: TableColumn<T>[]
  /**
   * Column headers array (legacy/backwards-compatible mode).
   */
  headers?: Array<string | { label: string; key: string; class?: string }>
  /**
   * Data rows array (legacy/backwards-compatible mode).
   */
  rows?: Array<Record<string, any> | any[]>
  /**
   * Accessible description or title of the table.
   */
  caption?: string
  /**
   * Table meta properties (e.g., dynamic row classes).
   */
  meta?: TableMeta<T>
  /**
   * Sticky header or footer ('header', 'footer', or true for both).
   */
  sticky?: boolean | "header" | "footer"
  /**
   * Loading state.
   */
  loading?: boolean
  /**
   * Loading color variant.
   */
  loadingColor?: "primary" | "secondary" | "success" | "info" | "warning" | "error" | "neutral"
  /**
   * Loading animation variant.
   */
  loadingAnimation?: "carousel" | "carousel-inverse" | "swing" | "elastic"
  /**
   * Empty state text message.
   */
  empty?: string
  /**
   * Virtualization state or options object.
   */
  virtualize?: boolean | Record<string, any>
  /**
   * Striped row style.
   */
  striped?: boolean
  /**
   * Hoverable rows state.
   */
  hoverable?: boolean
  /**
   * Bordered cells.
   */
  bordered?: boolean
  /**
   * Global search filter text.
   */
  globalFilter?: string
  /**
   * Per-column filter criteria.
   */
  columnFilters?: TableColumnFilter[]
  /**
   * Column visibility toggles (e.g. { id: false }).
   */
  columnVisibility?: Record<string, boolean>
  /**
   * Column pinning state ({ left: string[], right: string[] }).
   */
  columnPinning?: TableColumnPinningState
  /**
   * Active column sorting list.
   */
  sorting?: TableSortingItem[]
  /**
   * Grouping column ids list.
   */
  grouping?: string[]
  /**
   * Row pinning state ({ top: string[], bottom: string[] }).
   */
  rowPinning?: TableRowPinningState
  /**
   * Selected row ids map.
   */
  rowSelection?: Record<string, boolean>
  /**
   * Expanded row ids map.
   */
  expanded?: Record<string, boolean>
  /**
   * Pagination state ({ pageIndex: number, pageSize: number }).
   */
  pagination?: TablePaginationState
  /**
   * Function to derive sub-rows for tree/hierarchical data.
   */
  getSubRows?: (row: T, index: number) => T[] | undefined
  /**
   * Custom function to derive unique row ID.
   */
  getRowId?: (row: T, index: number) => string
  /**
   * Row select callback.
   */
  onSelect?: (e: Event, row: TableRow<T>) => void
  /**
   * Row hover callback.
   */
  onHover?: (e: Event, row: TableRow<T> | null) => void
  /**
   * Row contextmenu callback.
   */
  onContextmenu?: (e: Event, row: TableRow<T>) => void
  /**
   * Enable integrated search toolbar input.
   */
  searchable?: boolean
  /**
   * Custom placeholder text for integrated search input.
   */
  searchPlaceholder?: string
  /**
   * Enable integrated column visibility dropdown toggle.
   */
  showColumnsToggle?: boolean
  /**
   * Slot-specific CSS class overrides.
   */
  ui?: any
  /**
   * Additional CSS classes to apply to root element.
   */
  class?: any
  [key: string]: unknown
}


