import type { JSX } from "@solidjs/web";
import type { InferThemeProps } from "../../resolver";
import type { ThemeColor } from "../../types";
import type { RLDropdownMenuTheme } from "./dropdown-menu.theme";

export interface DropdownMenuItem {
  label?: string | undefined;
  icon?: string | undefined;
  avatar?:
    | {
        src: string;
        loading?: "lazy" | "eager" | undefined;
        alt?: string | undefined;
      }
    | undefined;
  shortcut?: string | undefined;
  kbds?: string[] | undefined;
  type?: "link" | "label" | "separator" | "checkbox" | "item" | undefined;
  color?:
    | "primary"
    | "secondary"
    | "success"
    | "info"
    | "warning"
    | "error"
    | "neutral"
    | undefined;
  checked?: boolean | undefined;
  disabled?: boolean | undefined;
  slot?: string | undefined;
  onSelect?: ((e: Event) => void) | undefined;
  onCheckedChange?: ((checked: boolean) => void) | undefined;
  children?: DropdownMenuItem[] | DropdownMenuItem[][] | undefined;
  href?: string | undefined;
  target?: string | undefined;
}

export interface DropdownMenuContentOptions {
  /**
   * Horizontal alignment of the menu relative to the trigger.
   *
   * @default "start"
   */
  align?: "start" | "center" | "end" | undefined;
  /**
   * Side of the trigger the menu opens on.
   */
  side?: "top" | "right" | "bottom" | "left" | undefined;
  /**
   * Gap in pixels between the trigger and the menu.
   */
  sideOffset?: number | undefined;
}

export type RLDropdownMenuProps = Omit<InferThemeProps<typeof RLDropdownMenuTheme>, "color"> & {
  /**
   * The menu items array (single level or grouped array).
   */
  items?: DropdownMenuItem[] | DropdownMenuItem[][] | undefined;
  /**
   * The trigger button label.
   */
  label?: string | undefined;
  /**
   * Trigger button icon name.
   */
  icon?: string | undefined;
  /**
   * Intent color of the trigger.
   *
   * @default "neutral"
   */
  color?: ThemeColor | undefined;
  /**
   * Display an arrow alongside the menu.
   *
   * @default false
   */
  arrow?: boolean | undefined;
  /**
   * Content options like align and sideOffset.
   */
  content?: DropdownMenuContentOptions | undefined;
  /**
   * Disabled state.
   *
   * @default false
   */
  disabled?: boolean | undefined;
  /**
   * Controlled open state.
   */
  open?: boolean | undefined;
  /**
   * Initial open state when uncontrolled.
   *
   * @default false
   */
  defaultOpen?: boolean | undefined;
  /**
   * Trigger content. Takes precedence over `label` and `icon`.
   */
  children?: JSX.Element | undefined;
  /**
   * Trigger element. Always rendered, so it is plain JSX.
   */
  triggerSlot?: JSX.Element | undefined;
  /**
   * Called whenever the open state changes.
   */
  onOpenChange?: ((open: boolean) => void) | undefined;
};
