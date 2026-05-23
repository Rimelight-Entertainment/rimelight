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
   * UI mapping override.
   */
  ui?: any
  /**
   * Root CSS class override.
   */
  class?: any
  [key: string]: unknown
}
