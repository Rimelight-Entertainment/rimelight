import type { JSX } from "@solidjs/web";
import type { InferThemeProps } from "../../resolver";
import type { RLSearchTheme } from "./search.theme";

export interface SearchResultItem {
  /**
   * Result heading. Falls back to a localized "Untitled".
   */
  title?: string;
  /**
   * Link target for the result.
   */
  url?: string;
  /**
   * Source label shown as a badge.
   */
  sourceType?: string;
  /**
   * Short excerpt shown under the heading.
   */
  snippet?: string;
}

export type RLSearchProps = InferThemeProps<typeof RLSearchTheme> & {
  /**
   * API endpoint queried with `?q=`.
   * @default "/api/search"
   */
  endpoint?: string | undefined;
  /**
   * Search input placeholder. Falls back to `messages.searchPlaceholder`, then a localized default.
   * @default uiT("search.placeholder")
   */
  placeholder?: string | undefined;
  /**
   * Custom labels. Each entry falls back to a localized default when omitted.
   * @default undefined
   */
  messages?:
    | {
        /** @default uiT("search.placeholder") */
        searchPlaceholder?: string;
        /** @default uiT("search.no-results") */
        noResultsLabel?: string;
        /** @default uiT("search.site-search") */
        footerBackendHint?: string;
      }
    | undefined;
  /**
   * Controlled open state of the search dialog. Omit for uncontrolled use.
   * @default undefined
   */
  open?: boolean | undefined;
  /**
   * Initial open state when uncontrolled.
   * @default false
   */
  defaultOpen?: boolean | undefined;
  /**
   * Called with the next open state when the dialog opens or closes.
   */
  onOpenChange?: (open: boolean) => void;
  /**
   * Replaces the default trigger button.
   */
  triggerSlot?: JSX.Element;
  children?: JSX.Element;
};
