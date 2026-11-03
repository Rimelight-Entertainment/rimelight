import type { JSX } from "@solidjs/web";
import type { SlotRenderer } from "../../types";
import type { InferThemeProps } from "../../resolver";
import type { RLNavigationMenuTheme } from "./navigation-menu.theme";

export interface NavigationMenuChildItem {
  /**
   * Visible label of the link, or of the group title when the child has `children`.
   */
  label?: string | undefined;
  /**
   * Secondary text rendered under the label.
   */
  description?: string | undefined;
  /**
   * Icon name rendered before the label.
   */
  icon?: string | undefined;
  /**
   * Link target. `to` is accepted as an alias for `href` (RLLink convention).
   */
  href?: string | undefined;
  to?: string | undefined;
  /**
   * Localize this item's internal link.
   * A locale code targets that locale; `false` keeps the href as-is.
   * @default true
   */
  localize?: boolean | string | undefined;
  /**
   * Forces the active state. When unset, the active state follows the current path.
   */
  active?: boolean | undefined;
  /**
   * Child links. A child that has its own `children` renders as a titled group.
   */
  children?: NavigationMenuChildItem[] | undefined;
}

export interface NavigationMenuItem extends NavigationMenuChildItem {
  /**
   * Key into the menu's `panels` prop. When set and a matching renderer exists, that
   * renderer replaces the default child list as this item's (mega-menu) panel.
   */
  panel?: string | undefined;
}

export interface NavigationMenuPanelContext {
  item: NavigationMenuItem;
  index: number;
}

export interface NavigationMenuItemContext extends NavigationMenuPanelContext {
  active: boolean;
}

export type NavigationMenuPanelRenderer = (context: NavigationMenuPanelContext) => JSX.Element;

export type RLNavigationMenuProps = InferThemeProps<typeof RLNavigationMenuTheme> & {
  /**
   * Main menu navigation links.
   */
  items?: NavigationMenuItem[] | undefined;
  /**
   * Named mega-menu panels, matched by each item's `panel` key.
   * Horizontal menus show these as mega-menu panels; vertical menus render them inline in the accordion.
   */
  panels?: Record<string, NavigationMenuPanelRenderer> | undefined;
  /**
   * Fallback panel renderer for items with no matching entry in `panels`.
   */
  panelSlot?: SlotRenderer<{ item: NavigationMenuItem; index: number }>;
  /**
   * Custom item renderer. Replaces the link or trigger of an item.
   */
  itemSlot?: SlotRenderer<NavigationMenuItemContext>;
};
