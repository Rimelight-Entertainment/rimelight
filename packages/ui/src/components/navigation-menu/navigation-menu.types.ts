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
  slot?: string | undefined;
  value?: string | undefined;
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

export interface NavigationMenuChildItem extends Omit<NavigationMenuItem, "type" | "ui"> {
  description?: string | undefined;
  [key: string]: any;
}

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
   * Orientation of the menu.
   */
  orientation?: "horizontal" | "vertical";
  /**
   * Slot-specific CSS class overrides.
   */
  ui?: any;
  /**
   * Additional CSS classes to apply to the root element.
   */
  class?: any;
  children?: JSX.Element;
  /**
   * Custom mega-menu or child content renderer for an active item.
   */
  contentSlot?: (props: { item: NavigationMenuItem; index: number }) => JSX.Element;
  /**
   * Custom item renderer.
   */
  itemSlot?: (props: { item: NavigationMenuItem; index: number; active: boolean }) => JSX.Element;
  [key: string]: any;
}
