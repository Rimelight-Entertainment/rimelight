import type { JSX } from "@solidjs/web";

export interface SearchResultItem {
  title?: string;
  url?: string;
  sourceType?: string;
  snippet?: string;
  [key: string]: any;
}

export interface RLSearchProps {
  /**
   * API endpoint to query results from.
   */
  endpoint?: string;
  /**
   * Search input placeholder.
   */
  placeholder?: string;
  /**
   * Custom labels and localization text.
   */
  messages?: {
    searchButtonLabel?: string;
    searchPlaceholder?: string;
    noResultsLabel?: string;
    footerCloseHint?: string;
    footerBackendHint?: string;
  };
  /**
   * Slot-specific CSS class overrides.
   */
  ui?: any;
  /**
   * Additional CSS classes to apply to the root element.
   */
  class?: any;
  children?: JSX.Element;
  triggerSlot?: JSX.Element;
  [key: string]: unknown;
}
