export interface TableProps {
  /**
   * Column headers array.
   */
  headers?: Array<string | { label: string; key: string; class?: string }>
  /**
   * Data rows array.
   */
  rows?: Array<Record<string, any> | any[]>
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
   * UI class override map.
   */
  ui?: any
  /**
   * Root CSS class override.
   */
  class?: any
  [key: string]: unknown
}
