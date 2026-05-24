export interface PaginationProps {
  /**
   * The currently active page (1-indexed).
   */
  currentPage?: number
  /**
   * Total number of pages.
   */
  totalPages?: number
  /**
   * The base URL used for links (e.g. `/blog?page=`).
   */
  baseUrl?: string
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
