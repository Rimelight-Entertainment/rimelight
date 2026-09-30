export interface TableColumnMeta {
  class?: {
    td?: string | ((row: TableRow) => string);
    th?: string | ((column: TableColumn) => string);
  };
  style?: {
    td?: string | ((row: TableRow) => string);
    th?: string | ((column: TableColumn) => string);
  };
  colspan?: {
    td?: number | string | ((row: TableRow) => number | string);
  };
  rowspan?: {
    td?: number | string | ((row: TableRow) => number | string);
  };
  [key: string]: any;
}

export type TableAggregationFn<T = any> =
  | "count"
  | "sum"
  | "min"
  | "max"
  | "extent"
  | "mean"
  | "median"
  | "unique"
  | "uniqueCount"
  | ((values: any[], rows: TableRow<T>[]) => any);

import type { DropdownMenuItem } from "../dropdown-menu/dropdown-menu";

export interface TableColumn<T = any> {
  id?: string;
  accessorKey?: keyof T | string;
  accessorFn?: (row: T) => any;
  header?: string | ((props: { column: TableColumn<T>; table: any }) => any);
  cell?: (props: {
    row: TableRow<T>;
    getValue: () => any;
    renderValue: () => any;
    isEditing?: () => boolean;
    setEditing?: (editing: boolean) => void;
    column: TableColumn<T>;
    table: any;
  }) => any;
  actions?:
    | ((row: TableRow<T>) => DropdownMenuItem[] | DropdownMenuItem[][])
    | DropdownMenuItem[]
    | DropdownMenuItem[][];
  items?:
    | ((row: TableRow<T>) => DropdownMenuItem[] | DropdownMenuItem[][])
    | DropdownMenuItem[]
    | DropdownMenuItem[][];
  aggregatedCell?: (props: {
    row: TableRow<T>;
    getValue: () => any;
    renderValue: () => any;
    isEditing?: () => boolean;
    setEditing?: (editing: boolean) => void;
    column: TableColumn<T>;
    table: any;
  }) => any;
  footer?: string | ((props: { column: TableColumn<T>; table: any }) => any);
  meta?: TableColumnMeta;
  enableSorting?: boolean;
  enableHiding?: boolean;
  enablePinning?: boolean;
  aggregationFn?: TableAggregationFn<T>;
  size?: number | string;
  minSize?: number | string;
  maxSize?: number | string;
  [key: string]: any;
}

export interface TableRow<T = any> {
  id: string;
  original: T;
  index: number;
  depth: number;
  groupingColumnId?: string;
  groupingValue?: any;
  getValue: (key: string) => any;
  getIsSelected: () => boolean;
  getIsSomeSelected: () => boolean;
  toggleSelected: (value?: boolean) => void;
  getIsExpanded: () => boolean;
  toggleExpanded: (value?: boolean) => void;
  getToggleExpandedHandler: () => (e?: Event) => void;
  getToggleSelectedHandler: () => (e?: Event) => void;
  getIsPinned: () => boolean | "top" | "bottom";
  pin: (position: boolean | "top" | "bottom") => void;
  getIsGrouped: () => boolean;
  getCanExpand: () => boolean;
  subRows?: TableRow<T>[];
  [key: string]: any;
}

export interface TableGroup<T = any> {
  id: string;
  columnId: string;
  value: any;
  depth?: number;
  rows: TableRow<T>[];
}

export interface TableMeta<T = any> {
  class?: {
    tr?: string | ((row: TableRow<T>) => string);
  };
  style?: {
    tr?: string | ((row: TableRow<T>) => string);
  };
  [key: string]: any;
}

export interface TableSortingItem {
  id: string;
  desc: boolean;
}

export type SortingState = TableSortingItem[];

export interface TableColumnFilter {
  id: string;
  value: any;
}

export type ColumnFiltersState = TableColumnFilter[];

export interface TableRowPinningState {
  top?: string[];
  bottom?: string[];
}

export interface TableColumnPinningState {
  left?: string[];
  right?: string[];
}

export type TableColumnSizingState = Record<string, number>;
export type TableColumnOrderState = string[];
export type TableEditingCellState = { rowId: string; columnId: string } | null;

export interface TableExportOptions {
  filename?: string;
  selectedOnly?: boolean;
  columns?: string[];
}

export interface TablePaginationState {
  pageIndex: number;
  pageSize: number;
}

export interface TableVirtualizeOptions {
  estimateSize?: number | ((index: number) => number);
  overscan?: number;
  scrollMargin?: number;
  getScrollElement?: () => HTMLElement | null;
}

/**
 * Imperative API exposed by RLTable (via ref callback or instance).
 */
export interface TableApi<T = any> {
  tableRef: HTMLTableElement | null;
  getFilteredRows(): TableRow<T>[];
  getFlatRows(): TableRow<T>[];
  getSortedRows(): TableRow<T>[];
  getSelectedRows(): TableRow<T>[];
  getFilteredSelectedRowModel(): { rows: TableRow<T>[]; flatRows: TableRow<T>[] };
  getFilteredRowModel(): { rows: TableRow<T>[]; flatRows: TableRow<T>[] };
  getAllColumns(): TableColumn<T>[];
  getColumn(id: string): TableColumn<T> | undefined;
  getIsAllRowsSelected(): boolean;
  getIsSomeRowsSelected(): boolean;
  toggleAllRowsSelected(selected?: boolean): void;
  getIsAllPageRowsSelected(): boolean;
  getIsSomePageRowsSelected(): boolean;
  toggleAllPageRowsSelected(selected?: boolean): void;
  setGlobalFilter(value: string): void;
  setColumnFilter(id: string, value: any): void;
  setColumnVisibility(id: string, visible: boolean): void;
  setColumnPinning(pinning: TableColumnPinningState): void;
  setRowPinning(pinning: TableRowPinningState): void;
  setSorting(state: SortingState): void;
  setPagination(state: TablePaginationState): void;
  setPageIndex(pageIndex: number): void;
  setPageSize(pageSize: number): void;
  // Resizing & Ordering
  setColumnSizing(id: string, size: number): void;
  resetColumnSizing(): void;
  setColumnOrder(order: TableColumnOrderState): void;
  resetColumnOrder(): void;
  // Exporting
  exportToCsv(options?: TableExportOptions): string;
  exportToJson(options?: TableExportOptions): string;
  // Faceted statistics
  getFacetedUniqueValues(columnId: string): Map<any, number>;
  getFacetedMinMaxValues(columnId: string): [number, number] | undefined;
  // Inline editing support
  setEditingCell(cell: TableEditingCellState): void;
  getEditingCell(): TableEditingCellState;
  getState(): {
    sorting: SortingState;
    globalFilter: string;
    columnFilters: ColumnFiltersState;
    columnVisibility: Record<string, boolean>;
    columnPinning: TableColumnPinningState;
    columnSizing: TableColumnSizingState;
    columnOrder: TableColumnOrderState;
    rowSelection: Record<string, boolean>;
    expanded: Record<string, boolean>;
    rowPinning: TableRowPinningState;
    pagination: TablePaginationState;
    editingCell: TableEditingCellState;
  };
}

export interface TableProps<T = any> {
  /**
   * Data rows. Auto-infers columns from the first row's keys when `columns` is omitted.
   */
  data?: T[] | undefined;
  /**
   * Column definitions.
   */
  columns?: TableColumn<T>[] | undefined;
  /**
   * Accessible table caption (visually hidden or styled).
   */
  caption?: string | undefined;
  /**
   * Table-level metadata, e.g. a per-row `class.tr` function.
   */
  meta?: TableMeta<T> | undefined;
  /**
   * Stick the header, footer, or both when the table scrolls.
   */
  sticky?: boolean | "header" | "footer" | undefined;
  /**
   * Enable virtualization for large datasets.
   */
  virtualize?: boolean | TableVirtualizeOptions | undefined;
  /**
   * Show a loading progress bar.
   */
  loading?: boolean | undefined;
  /**
   * Color of the loading bar. @default 'primary'
   */
  loadingColor?:
    | "primary"
    | "secondary"
    | "success"
    | "info"
    | "warning"
    | "error"
    | "neutral"
    | undefined;
  /**
   * Animation of the loading bar. @default 'carousel'
   */
  loadingAnimation?: "carousel" | "carousel-inverse" | "swing" | "elastic" | undefined;
  /**
   * Empty-state text. @default 'No data available'
   */
  empty?: string | undefined;
  /**
   * Alternate row background colors.
   */
  striped?: boolean | undefined;
  /**
   * Show borders on every cell.
   */
  bordered?: boolean | undefined;
  /**
   * Highlight row on hover.
   */
  hoverable?: boolean | undefined;
  /**
   * Global text filter across all columns.
   */
  globalFilter?: string | undefined;
  /**
   * Per-column filter state.
   */
  columnFilters?: ColumnFiltersState | undefined;
  /**
   * Column visibility map — `{ [columnId]: boolean }`.
   */
  columnVisibility?: Record<string, boolean> | undefined;
  /**
   * Sticky column pinning — `{ left?: string[], right?: string[] }`.
   */
  columnPinning?: TableColumnPinningState | undefined;
  /**
   * Active sort state.
   */
  sorting?: SortingState | undefined;
  /**
   * Column IDs to group rows by (first entry is used).
   */
  grouping?: string[] | undefined;
  /**
   * Row pinning — `{ top?: string[], bottom?: string[] }`.
   */
  rowPinning?: TableRowPinningState | undefined;
  /**
   * Row selection map — `{ [rowId]: boolean }`.
   */
  rowSelection?: Record<string, boolean> | undefined;
  /**
   * Expanded rows map — `{ [rowId]: boolean }`.
   */
  expanded?: Record<string, boolean> | undefined;
  /**
   * Pagination state.
   */
  pagination?: TablePaginationState | undefined;
  /**
   * Extract sub-rows for tree/hierarchical data.
   */
  getSubRows?: ((row: T, index: number) => T[] | undefined) | undefined;
  /**
   * Custom predicate to determine whether a row can be expanded. Defaults to checking if subRows
   * exist.
   */
  getRowCanExpand?: ((row: TableRow<T>) => boolean) | undefined;
  /**
   * Custom row ID extractor. Defaults to `row.id ?? String(index)`.
   */
  getRowId?: ((row: T, index: number) => string) | undefined;
  /**
   * Called when a data row is clicked (skips clicks on interactive elements).
   */
  onSelect?: ((e: Event, row: TableRow<T>) => void) | undefined;
  /**
   * Called when the pointer enters or leaves a row (`null` on leave).
   */
  onHover?: ((e: Event, row: TableRow<T> | null) => void) | undefined;
  /**
   * Called on row right-click.
   */
  onContextmenu?: ((e: Event, row: TableRow<T>) => void) | undefined;
  // Controlled-mode callbacks — provide these to take ownership of state externally
  onSortingChange?: ((state: SortingState) => void) | undefined;
  onColumnFiltersChange?: ((state: ColumnFiltersState) => void) | undefined;
  onGlobalFilterChange?: ((value: string) => void) | undefined;
  onColumnVisibilityChange?: ((state: Record<string, boolean>) => void) | undefined;
  onColumnPinningChange?: ((state: TableColumnPinningState) => void) | undefined;
  onRowSelectionChange?: ((state: Record<string, boolean>) => void) | undefined;
  onExpandedChange?: ((state: Record<string, boolean>) => void) | undefined;
  onRowPinningChange?: ((state: TableRowPinningState) => void) | undefined;
  onPaginationChange?: ((state: TablePaginationState) => void) | undefined;
  /**
   * Enable interactive drag resizing for columns.
   */
  enableColumnResizing?: boolean | undefined;
  /**
   * Column resize mode: "onChange" updates dynamically during drag, "onEnd" updates when mouse is
   * released. @default 'onChange'
   */
  columnResizeMode?: "onChange" | "onEnd" | undefined;
  /**
   * Controlled column sizing state — `{ [columnId]: widthInPixels }`.
   */
  columnSizing?: TableColumnSizingState | undefined;
  onColumnSizingChange?: ((state: TableColumnSizingState) => void) | undefined;
  /**
   * Enable drag-and-drop column reordering.
   */
  enableColumnReordering?: boolean | undefined;
  /**
   * Controlled column order state — `[columnId1, columnId2, ...]`.
   */
  columnOrder?: TableColumnOrderState | undefined;
  onColumnOrderChange?: ((state: TableColumnOrderState) => void) | undefined;
  /**
   * Enable drag-and-drop row reordering.
   */
  enableRowReordering?: boolean | undefined;
  /**
   * Called when a row is reordered via drag-and-drop.
   */
  onRowReorder?: ((newOrder: T[], fromIndex: number, toIndex: number) => void) | undefined;
  /**
   * Active cell being edited — `{ rowId: string, columnId: string } | null`.
   */
  editingCell?: TableEditingCellState | undefined;
  onEditingCellChange?: ((cell: TableEditingCellState) => void) | undefined;
  /**
   * Render a built-in search input in the toolbar.
   */
  searchable?: boolean | undefined;
  /**
   * Placeholder for the built-in search input. @default 'Filter table...'
   */
  searchPlaceholder?: string | undefined;
  /**
   * Render a column-visibility dropdown in the toolbar.
   */
  showColumnsToggle?: boolean | undefined;
  /**
   * Render an export dropdown (CSV, JSON) in the toolbar. @default false
   */
  exportable?: boolean | undefined;
  /**
   * Default filename prefix for exported files. @default 'export'
   */
  exportFilename?: string | undefined;
  /**
   * Row actions dropdown definition. Generates an Actions column automatically.
   */
  actions?:
    | ((row: TableRow<T>) => DropdownMenuItem[] | DropdownMenuItem[][])
    | DropdownMenuItem[]
    | DropdownMenuItem[][]
    | undefined;
  /**
   * Alias for actions.
   */
  rowActions?:
    | ((row: TableRow<T>) => DropdownMenuItem[] | DropdownMenuItem[][])
    | DropdownMenuItem[]
    | DropdownMenuItem[][]
    | undefined;
  /**
   * Per-slot class overrides.
   */
  ui?: Partial<Record<string, string>> | undefined;
  /**
   * Additional classes on the root element.
   */
  class?: any;
  /**
   * Solid slot overrides dictionary (e.g. { "name-cell": ({ row }) => ... })
   */
  slots?: Record<string, (props: any) => any> | undefined;
  [key: string]: unknown;
}
