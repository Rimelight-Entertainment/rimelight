import type { SlotRenderer, ThemeColor } from "../../types";
import type { InferThemeProps } from "../../resolver";
import type { RLSelectTheme } from "./select.theme";

export interface SelectItem {
  label?: string;
  value?: string | number;
  disabled?: boolean;
}

export type SelectVariant = "solid" | "outline" | "soft" | "subtle" | "ghost" | "link";
export type SelectLayout = "default" | "icon";

export type RLSelectProps = Omit<
  InferThemeProps<typeof RLSelectTheme>,
  "color" | "size" | "variant" | "layout" | "onChange" | "onBlur" | "ref"
> & {
  /**
   * Unique ID for the select element.
   */
  id?: string | undefined;

  /**
   * Form field name.
   */
  name?: string | undefined;

  /**
   * The controlled selected value.
   */
  value?: string | number | (string | number)[] | undefined;

  /**
   * The initial uncontrolled selected value.
   */
  defaultValue?: string | number | (string | number)[] | undefined;

  /**
   * Placeholder option shown when nothing is selected.
   */
  placeholder?: string | undefined;

  /**
   * Whether the select is disabled.
   */
  disabled?: boolean | undefined;

  /**
   * Whether a value is required.
   */
  required?: boolean | undefined;

  /**
   * Whether multiple values can be selected.
   */
  multiple?: boolean | undefined;

  /**
   * Color theme.
   * @default 'primary'
   */
  color?: ThemeColor | undefined;

  /**
   * Size scale.
   * @default 'md'
   */
  size?: "xs" | "sm" | "md" | "lg" | "xl" | undefined;

  /**
   * Visual style.
   * @default 'solid'
   */
  variant?: SelectVariant | undefined;

  /**
   * Layout preset. `icon` renders a compact icon-only control.
   * @default 'default'
   */
  layout?: SelectLayout | undefined;

  /**
   * Option items. Strings or objects with label/value.
   */
  items?: (SelectItem | string)[] | undefined;

  /**
   * Icon name rendered before the selected label.
   */
  leadingIcon?: string | undefined;

  /**
   * Custom leading content, rendered in place of `leadingIcon` when present.
   */
  leadingSlot?: SlotRenderer;

  /**
   * Native change event callback.
   */
  onChange?: (e: Event & { currentTarget: HTMLSelectElement }) => void;

  /**
   * Native blur event callback.
   */
  onBlur?: (e: FocusEvent & { currentTarget: HTMLSelectElement }) => void;

  /**
   * Ref to the native select element.
   */
  ref?: HTMLSelectElement | ((el: HTMLSelectElement) => void) | undefined;
};
