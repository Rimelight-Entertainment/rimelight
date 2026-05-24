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
   * Slot-specific CSS class overrides.
   */
  ui?: any
  /**
   * Additional CSS classes to apply to the root element.
   */
  class?: any
  [key: string]: unknown
}
