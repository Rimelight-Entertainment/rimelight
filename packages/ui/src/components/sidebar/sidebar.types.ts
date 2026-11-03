import type { JSX } from "@solidjs/web";
import type { RLBadgeProps } from "../badge/badge.types";

export interface SidebarItem {
  label: string;
  href?: string | undefined;
  icon?: string | undefined;
  badge?: string | RLBadgeProps | undefined;
  active?: boolean | undefined;
  children?: SidebarItem[] | undefined;
  items?: SidebarItem[] | undefined;
  collapsed?: boolean | undefined;
}

export interface SidebarScope {
  id?: string | undefined;
  label: string;
  href?: string | undefined;
  icon?: string | undefined;
  items?: SidebarItem[] | undefined;
  collapsed?: boolean | undefined;
}

export interface RLSidebarProps {
  t?: (key: string) => string;
  _depth?: number;
  /**
   * The navigation links array.
   */
  items?: SidebarItem[];
  /**
   * Side of the page.
   */
  side?: "left" | "right";
  /**
   * Collapsible mode.
   */
  collapsible?: "icon" | "offcanvas" | "none";
  /**
   * The visual style variant of the sidebar.
   */
  variant?: "sidebar" | "floating" | "inset";
  /**
   * Header logo or text.
   */
  logo?: string;
  /**
   * Slot-specific CSS class overrides.
   */
  ui?: any;
  /**
   * Additional CSS classes to apply to the root element.
   */
  class?: any;
  children?: JSX.Element;
  headerSlot?: JSX.Element;
  footerSlot?: JSX.Element;
  [key: string]: unknown;
}
