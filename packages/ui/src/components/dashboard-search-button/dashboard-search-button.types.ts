import type { JSX } from "@solidjs/web";
import type { InferThemeProps } from "../../resolver";
import type { RLDashboardSearchButtonTheme } from "./dashboard-search-button.theme";

export type RLDashboardSearchButtonProps = InferThemeProps<typeof RLDashboardSearchButtonTheme> & {
  /**
   * Icon name, or `false` to hide the icon.
   * @default "search"
   */
  icon?: string | false;
  /**
   * Visible label text.
   * @default uiT("search.label")
   */
  label?: string;
  /**
   * Keyboard shortcut hints. A `"meta"` key renders as ⌘.
   * @default [{ value: "meta" }, { value: "k" }]
   */
  kbds?: Array<string | { value: string; variant?: string }>;
  /**
   * Replaces the default keyboard shortcut hints.
   */
  trailingSlot?: JSX.Element;
};
