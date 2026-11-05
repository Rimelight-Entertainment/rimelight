import type { JSX, ValidComponent } from "@solidjs/web";
import type { SlotRenderer, ThemeColor } from "../../types";
import type { InferThemeProps } from "../../resolver";
import type { RLContextMenuTheme } from "./context-menu.theme";

export type ContextMenuAlign = "start" | "center" | "end";
export type ContextMenuPlacement = "top" | "right" | "bottom" | "left";
export type ContextMenuSize = "sm" | "md" | "lg";

/** Slot keys rendered by the context menu theme. */
export type ContextMenuSlot =
  | "root"
  | "trigger"
  | "overlay"
  | "positioner"
  | "body"
  | "submenu"
  | "group"
  | "groupLabel"
  | "item"
  | "itemLeading"
  | "itemLeadingIcon"
  | "itemWrapper"
  | "itemLabel"
  | "itemDescription"
  | "itemTrailing"
  | "itemKbds"
  | "itemKbd"
  | "itemIndicator"
  | "itemSubIndicator"
  | "separator"
  | "itemContainer"
  | "sections";

/** Resolved class names for every context menu slot. */
export type ContextMenuClasses = Record<ContextMenuSlot, string>;

/** Pointer anchor position in viewport pixels. */
export interface ContextMenuCoords {
  /**
   * Horizontal position in pixels.
   */
  x: number;
  /**
   * Vertical position in pixels.
   */
  y: number;
}

export interface ContextMenuItemBase {
  /**
   * Primary label text or element.
   */
  label?: JSX.Element | undefined;
  /**
   * Secondary description text displayed below the label.
   */
  description?: JSX.Element | undefined;
  /**
   * Icon name displayed at the start of the item.
   */
  icon?: string | undefined;
  /**
   * Custom element displayed at the start of the item instead of `icon`.
   */
  iconSlot?: JSX.Element | undefined;
  /**
   * Array of keyboard shortcuts to display as keys.
   */
  kbds?: string[] | undefined;
  /**
   * Intent color of the item. `"error"` renders a destructive item.
   *
   * @default "neutral"
   */
  color?: ThemeColor | undefined;
  /**
   * Whether the item is non-interactive.
   *
   * @default false
   */
  disabled?: boolean | undefined;
}

export interface ContextMenuActionItem extends ContextMenuItemBase {
  type?: "item" | undefined;
  /**
   * Controlled open state for submenus.
   */
  open?: boolean | undefined;
  /**
   * Initial open state for submenus.
   */
  defaultOpen?: boolean | undefined;
  /**
   * Callback fired when a submenu's open state changes.
   */
  onOpenChange?: ((open: boolean) => void) | undefined;
  /**
   * Nested menu items for creating submenus.
   */
  children?: ContextMenuItem[] | ContextMenuItem[][] | undefined;
  /**
   * Event handler called when the item is activated.
   */
  onSelect?: ((event?: Event) => void) | undefined;
  /**
   * Optional link destination.
   */
  href?: string | undefined;
  /**
   * Optional link target.
   */
  target?: string | undefined;
}

export interface ContextMenuCheckboxItem extends ContextMenuItemBase {
  type: "checkbox";
  /**
   * Controlled checked state for checkbox items.
   */
  checked?: boolean | undefined;
  /**
   * Initial checked state for uncontrolled checkbox items.
   */
  defaultChecked?: boolean | undefined;
  /**
   * Event handler called when a checkbox item's state changes.
   */
  onCheckedChange?: ((checked: boolean) => void) | undefined;
  /**
   * Event handler called when the item is activated.
   */
  onSelect?: ((event?: Event) => void) | undefined;
}

export interface ContextMenuRadioItem extends ContextMenuItemBase {
  type: "radio";
  /**
   * Radio group identifier. Radio items with the same group are mutually exclusive.
   */
  group?: string | undefined;
  /**
   * Radio item value reported by onValueChange and used for grouped selection.
   */
  value?: string | undefined;
  /**
   * Controlled checked state for radio items.
   */
  checked?: boolean | undefined;
  /**
   * Initial checked state for uncontrolled radio items.
   */
  defaultChecked?: boolean | undefined;
  /**
   * Event handler called when a radio item is selected.
   */
  onValueChange?: ((value: string) => void) | undefined;
  /**
   * Event handler called when a radio item's checked state changes.
   */
  onCheckedChange?: ((checked: boolean) => void) | undefined;
  /**
   * Event handler called when the item is activated.
   */
  onSelect?: ((event?: Event) => void) | undefined;
}

export interface ContextMenuGroupItem extends ContextMenuItemBase {
  type: "group";
  /**
   * Child items in this group.
   */
  items?: ContextMenuItem[] | undefined;
}

export interface ContextMenuSeparatorItem extends ContextMenuItemBase {
  type: "separator";
}

export type ContextMenuItem =
  | ContextMenuActionItem
  | ContextMenuCheckboxItem
  | ContextMenuRadioItem
  | ContextMenuGroupItem
  | ContextMenuSeparatorItem;

export type ContextMenuItems = Array<ContextMenuItem | ContextMenuItem[]>;

/** A rendered section of the menu: a group of items or a separator. */
export interface ContextMenuSection {
  /**
   * Kind of section.
   */
  type: "group" | "separator";
  /**
   * Optional group heading.
   */
  label?: JSX.Element | undefined;
  /**
   * Items rendered inside the group.
   */
  items?: ContextMenuItem[] | undefined;
}

export interface ContextMenuTopRenderArgs {
  /**
   * Whether the menu is open.
   */
  open: boolean;
  /**
   * Closes the menu.
   */
  closeMenu: () => void;
}

export interface ContextMenuBottomRenderArgs {
  /**
   * Whether the menu is open.
   */
  open: boolean;
  /**
   * Closes the menu.
   */
  closeMenu: () => void;
}

export interface ContextMenuItemRenderArgs {
  /**
   * Item being rendered.
   */
  item: ContextMenuItem;
  /**
   * Flat index of the item across all sections.
   */
  index: number;
  /**
   * Whether the item is disabled.
   */
  disabled: boolean;
  /**
   * Whether the item is highlighted.
   */
  highlighted: boolean;
  /**
   * Whether the item is checked.
   */
  selected: boolean;
  /**
   * Whether the item's submenu is open.
   */
  expanded: boolean;
  /**
   * Closes the menu.
   */
  closeMenu: () => void;
}

export type RLContextMenuProps = Omit<InferThemeProps<typeof RLContextMenuTheme>, "size"> & {
  /**
   * Element or component the root should render as.
   *
   * @default "div"
   */
  as?: ValidComponent | undefined;
  /**
   * Alignment along the cross axis.
   *
   * @default "start"
   */
  align?: ContextMenuAlign | undefined;
  /**
   * Initial open state when uncontrolled.
   *
   * @default false
   */
  defaultOpen?: boolean | undefined;
  /**
   * Controlled open state.
   */
  open?: boolean | undefined;
  /**
   * Called whenever the open state changes.
   */
  onOpenChange?: ((open: boolean) => void) | undefined;
  /**
   * Whether trigger interactions should be ignored.
   *
   * @default false
   */
  disabled?: boolean | undefined;
  /**
   * Gap between the anchor and the content.
   *
   * @default 0
   */
  gutter?: number | undefined;
  /**
   * Unique identifier for the trigger element.
   */
  id?: string | undefined;
  /**
   * Padding applied to the overflow area when calculating position.
   *
   * @default 4
   */
  overflowPadding?: number | undefined;
  /**
   * Preferred side relative to the anchor.
   *
   * @default "right"
   */
  placement?: ContextMenuPlacement | undefined;
  /**
   * Whether body scroll should be locked while the menu is open.
   *
   * @default true
   */
  preventScroll?: boolean | undefined;
  /**
   * Cross-axis or alignment offset relative to the anchor.
   *
   * @default 0
   */
  shift?: number | undefined;
  /**
   * Visual size of menu items.
   *
   * @default "md"
   */
  size?: ContextMenuSize | undefined;
  /**
   * Items rendered in the menu body. Supports flat array, explicit group objects, or array-of-arrays.
   */
  items?: ContextMenuItems | undefined;
  /**
   * Icon name used for checked checkbox and radio items.
   *
   * @default "check"
   */
  checkedIcon?: string | undefined;
  /**
   * Icon name used for submenu trigger items.
   *
   * @default "chevron-right"
   */
  submenuIcon?: string | undefined;
  /**
   * Content rendered before the resolved item groups.
   */
  topSlot?: SlotRenderer<ContextMenuTopRenderArgs> | undefined;
  /**
   * Content rendered after the resolved item groups.
   */
  bottomSlot?: SlotRenderer<ContextMenuBottomRenderArgs> | undefined;
  /**
   * Renderer for each menu item.
   */
  itemSlot?: ((args: ContextMenuItemRenderArgs) => JSX.Element) | undefined;
  /**
   * Trigger element when not using `children`.
   */
  triggerSlot?: SlotRenderer | undefined;
  /**
   * Body content rendered after the items, for content that is not expressed as `items`.
   */
  bodySlot?: SlotRenderer | undefined;
  /**
   * Whether to render menu content inside a Portal. Pass an element to portal into it.
   *
   * @default true
   */
  portal?: boolean | HTMLElement | undefined;
  /**
   * When `true`, unmounts the menu content when closed.
   *
   * @default true
   */
  unmountOnHide?: boolean | undefined;
  /**
   * Long-press duration in milliseconds for touch/pen interactions.
   *
   * @default 700
   */
  longPressDelay?: number | undefined;
  /**
   * Accessible name of the trigger element.
   */
  "aria-label"?: string | undefined;
  /**
   * Id of the element that labels the trigger element.
   */
  "aria-labelledby"?: string | undefined;
  /**
   * Id of the element that describes the trigger element.
   */
  "aria-describedby"?: string | undefined;
  /**
   * Trigger children.
   */
  children?: JSX.Element | undefined;
};

/** Props for one menu layer (the root menu or a submenu). */
export type ContextMenuLayerProps = {
  /**
   * Sections rendered by this layer.
   */
  sections: ContextMenuSection[];
  /**
   * Accessor for resolved slot classes.
   */
  menuClasses: () => ContextMenuClasses;
  /**
   * Accessor for the icon used by checked checkbox and radio items.
   */
  checkedIcon: () => string;
  /**
   * Accessor for the icon used by submenu trigger items.
   */
  submenuIcon: () => string;
  /**
   * Renderer for each item.
   */
  renderItem?: ((args: ContextMenuItemRenderArgs) => JSX.Element) | undefined;
  /**
   * Whether this layer is a submenu.
   */
  isSubmenu?: boolean | undefined;
  /**
   * Closes this submenu layer.
   */
  closeLayer?: (() => void) | undefined;
  /**
   * Closes the whole menu.
   */
  closeRoot: () => void;
};
