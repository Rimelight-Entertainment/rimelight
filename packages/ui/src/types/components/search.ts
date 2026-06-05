export interface SearchProps {
  /**
   * API endpoint to query results from.
   */
  endpoint?: string
  /**
   * Search input placeholder.
   */
  placeholder?: string
  /**
   * Custom labels and localization text.
   */
  messages?: {
    searchButtonLabel?: string
    searchPlaceholder?: string
    noResultsLabel?: string
    footerCloseHint?: string
    footerBackendHint?: string
  }
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
