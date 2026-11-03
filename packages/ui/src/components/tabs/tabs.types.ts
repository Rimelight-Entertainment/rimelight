import type { InferThemeProps } from "../../resolver";
import type { RLTabsTheme } from "./tabs.theme";

export interface TabItem {
  /**
   * Visible label of the tab.
   */
  label?: string | undefined;
  /**
   * Value that identifies the tab. Defaults to the item's index when unset.
   */
  value?: string | undefined;
  /**
   * Icon name rendered before the label.
   */
  icon?: string | undefined;
  /**
   * Badge rendered after the label. An object uses its `label`.
   */
  badge?: string | number | { label?: string | number | undefined } | undefined;
  /**
   * Panel content rendered when the tab is active.
   */
  content?: string | undefined;
  /**
   * Disables the tab.
   * @default false
   */
  disabled?: boolean | undefined;
}

export type RLTabsProps<T extends TabItem = TabItem> = InferThemeProps<typeof RLTabsTheme> & {
  /**
   * The tab items.
   */
  items?: T[] | undefined;
  /**
   * Active tab value. Setting it makes the component controlled.
   */
  value?: string | undefined;
  /**
   * Initially active tab value when uncontrolled. Defaults to the first item's value.
   */
  defaultValue?: string | undefined;
  /**
   * Called with the tab value when the user selects a tab.
   */
  onValueChange?: ((value: string) => void) | undefined;
  /**
   * Whether to render content panels automatically. Set to false for tab bar only.
   * @default true
   */
  content?: boolean | undefined;
  /**
   * Unmount hidden tab panels from DOM. If false, panels are hidden via CSS/attribute.
   * @default true
   */
  unmountOnHide?: boolean | undefined;
  /**
   * Maximum number of tab triggers to render in the tab list. Tabs beyond this cap are placed in a
   * native popover accessible via a '+N more' overflow button at the end of the tab list.
   *
   * Additionally, container queries will progressively hide visible triggers from right to left as
   * the container narrows, surfacing those in the popover as well.
   *
   * When undefined, all tabs are rendered in the list.
   */
  maxTabs?: number | undefined;
};
