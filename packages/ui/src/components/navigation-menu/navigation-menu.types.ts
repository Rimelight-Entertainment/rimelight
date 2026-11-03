import type { JSX } from "@solidjs/web";
import type { ThemeColor } from "../../types";
import type { RLLinkProps } from "../link/link.types";

export interface NavigationMenuItem extends Omit<RLLinkProps, "type" | "raw" | "custom"> {
  label?: string | undefined;
  icon?: string | undefined;
  badge?: string | number | undefined;
  avatar?: Record<string, any> | undefined;
  chip?: boolean | Record<string, any> | undefined;
  tooltip?: boolean | string | Record<string, any> | undefined;
  popover?: boolean | Record<string, any> | undefined;
  trailingIcon?: string | undefined;
  type?: "label" | "trigger" | "link" | undefined;
  /**
   * Key into the menu's `panels` prop. When set and a matching renderer exists, that
   * renderer replaces the default child list as this item's (mega-menu) panel.
   */
  panel?: string | undefined;
  value?: string | undefined;
  /**
   * Child links. A child that has its own `children` renders as a titled group.
   */
  children?: NavigationMenuChildItem[] | undefined;
  defaultOpen?: boolean | undefined;
  open?: boolean | undefined;
  onSelect?: ((e: Event) => void) | undefined;
  click?: ((event: MouseEvent) => void) | undefined;
  /**
   * Slot-specific CSS class overrides.
   */
  ui?: any;
  /**
   * Additional CSS classes to apply to the root element.
   */
  class?: any;
  [key: string]: any;
}

/**
 * Declared explicitly: `Omit<>` over a type with an index signature collapses every
 * known key into the index signature, which breaks `noPropertyAccessFromIndexSignature`.
 */
export interface NavigationMenuChildItem {
  label?: string | undefined;
  description?: string | undefined;
  icon?: string | undefined;
  leadingIcon?: string | undefined;
  href?: string | undefined;
  to?: string | undefined;
  /**
   * Localize this item's internal link (default true). A locale code targets that locale;
   * `false` keeps the href as-is.
   */
  localize?: boolean | string | undefined;
  active?: boolean | undefined;
  children?: NavigationMenuChildItem[] | undefined;
  class?: any;
  [key: string]: any;
}

export type NavigationMenuContentRenderer = (props: {
  item: NavigationMenuItem;
  index: number;
}) => JSX.Element;

export type NavigationMenuSlotRenderer = (item?: NavigationMenuItem, index?: number) => JSX.Element;

export interface RLNavigationMenuProps {
  theme?: string;
  /**
   * Main menu navigation links.
   */
  items?: NavigationMenuItem[];
  /**
   * Color theme.
   */
  color?: ThemeColor;
  /**
   * Visual variant (reserved; styling is driven by `ui`).
   */
  variant?: string;
  /**
   * Orientation of the menu.
   */
  orientation?: "horizontal" | "vertical";
  /**
   * Slot-specific CSS class overrides. `ui.link` styles both plain links and triggers.
   */
  ui?: any;
  /**
   * Additional CSS classes to apply to the root element.
   */
  class?: any;
  children?: JSX.Element;
  /**
   * Named mega-menu panels, matched by each item's `panel` key.
   * Horizontal menus show these as mega-menu panels; vertical menus render them inline in the accordion.
   */
  panels?: Record<string, NavigationMenuContentRenderer>;
  /**
   * Fallback panel renderer for items with no matching entry in `panels`.
   */
  contentSlot?: NavigationMenuContentRenderer;
  /**
   * Custom item renderer.
   */
  itemSlot?: (props: { item: NavigationMenuItem; index: number; active: boolean }) => JSX.Element;
  [key: string]: any;
}
