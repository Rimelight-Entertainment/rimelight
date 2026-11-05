import type { JSX } from "@solidjs/web";
import type { InferThemeProps } from "../../resolver";
import type { RLBadgeProps } from "../badge/badge.types";
import type { RLSidebarTheme } from "./sidebar.theme";

/**
 * Badge shown beside a sidebar item. Shape follows `RLBadgeProps`: `label` is rendered as the
 * badge text; `color` and `variant` pass through to `RLBadge`.
 */
export type SidebarBadge = Pick<RLBadgeProps, "color" | "variant"> & {
  /**
   * Badge text, rendered as the `RLBadge` `label`.
   */
  label: string;
};

export interface SidebarItem {
  label: string;
  href?: string | undefined;
  /** Bare lucide icon name, e.g. `layers`. */
  icon?: string | undefined;
  badge?: string | SidebarBadge | undefined;
  active?: boolean | undefined;
  children?: SidebarItem[] | undefined;
}

export interface SidebarScope {
  id?: string | undefined;
  label: string;
  href?: string | undefined;
  /** Bare lucide icon name, e.g. `layers`. */
  icon?: string | undefined;
  items?: SidebarItem[] | undefined;
}

export type SidebarSlot =
  | "root"
  | "header"
  | "content"
  | "footer"
  | "item"
  | "itemLink"
  | "itemIcon"
  | "itemBadge"
  | "itemsContainer"
  | "itemText"
  | "itemSummary"
  | "itemChevron"
  | "itemDetails"
  | "itemChildren"
  | "subItemLink"
  | "subItemIcon"
  | "subItemChildren"
  | "logoWrapper"
  | "logoIcon"
  | "logoText"
  | "toggleButton"
  | "toggleIcon";

export type SidebarClasses = Record<SidebarSlot, string>;

export type RLSidebarProps = InferThemeProps<typeof RLSidebarTheme> & {
  /**
   * The navigation items. Rendered when no children are passed. @default []
   */
  items?: SidebarItem[] | undefined;
  /**
   * Header logo text, shown when no `headerSlot` is given. @default undefined
   */
  logo?: string | undefined;
  /**
   * Custom header content. @default undefined
   */
  headerSlot?: JSX.Element;
  /**
   * Custom footer content. @default undefined
   */
  footerSlot?: JSX.Element;
};

export type SidebarItemListProps = {
  /**
   * Items rendered at this level.
   */
  items: SidebarItem[];
  /**
   * Nesting level: 1 for top-level items, deeper for children.
   */
  depth: number;
  /**
   * Resolved sidebar theme classes.
   */
  itemClasses: SidebarClasses;
};
