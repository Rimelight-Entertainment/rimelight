import type { JSX } from "@solidjs/web";
import type { Theme, ThemeColor } from "../../types";

export type RLCheckboxColor = ThemeColor;
export type RLCheckboxVariant = "list" | "card";
export type RLCheckboxSize = "xs" | "sm" | "md" | "lg" | "xl";
export type RLCheckboxIndicator = "start" | "end" | "hidden";

export interface RLCheckboxSlots {
  label?: ((props: { label: string | undefined }) => JSX.Element) | JSX.Element;
  description?: ((props: { description: string | undefined }) => JSX.Element) | JSX.Element;
}

export interface RLCheckboxUiSlots {
  root?: string | undefined;
  container?: string | undefined;
  base?: string | undefined;
  indicator?: string | undefined;
  icon?: string | undefined;
  wrapper?: string | undefined;
  label?: string | undefined;
  description?: string | undefined;
  [key: string]: any;
}

export interface RLCheckboxProps<T = any> {
  /**
   * The element or component this component should render as.
   * @default 'div'
   */
  as?: any;

  /**
   * Text label for the checkbox.
   */
  label?: string | undefined;

  /**
   * Description text rendered below or beside the label.
   */
  description?: string | undefined;

  /**
   * Color theme variant.
   * @default 'primary'
   */
  color?: RLCheckboxColor | undefined;

  /**
   * Visual style variant.
   * @default 'list'
   */
  variant?: RLCheckboxVariant | undefined;

  /**
   * Size scale of the checkbox.
   * @default 'md'
   */
  size?: RLCheckboxSize | undefined;

  /**
   * Position of the indicator checkbox box.
   * @default 'start'
   */
  indicator?: RLCheckboxIndicator | undefined;

  /**
   * Highlight the ring color like a focus state.
   * @default false
   */
  highlight?: boolean | undefined;

  /**
   * The icon displayed when checked, or above the label when `indicator` is `hidden`.
   * Defaults to 'check'.
   */
  icon?: string | undefined;

  /**
   * The icon displayed when the checkbox is indeterminate.
   * Defaults to 'minus'.
   */
  indeterminateIcon?: string | undefined;

  /**
   * Slot-specific CSS class overrides.
   */
  ui?: RLCheckboxUiSlots | undefined;

  /**
   * Additional CSS classes to apply to the root element.
   */
  class?: any;

  /**
   * When `true`, prevents the user from interacting with the checkbox.
   */
  disabled?: boolean | undefined;

  /**
   * When `true`, indicates that the user must set the value before form submission.
   */
  required?: boolean | undefined;

  /**
   * The name of the field. Submitted with its owning form.
   */
  name?: string | undefined;

  /**
   * The value given as data when submitted with a `name`.
   * @default "on"
   */
  value?: any;

  /**
   * Unique ID for the input element.
   */
  id?: string | undefined;

  /**
   * The value of the checkbox when it is initially rendered (uncontrolled).
   */
  defaultValue?: T | "indeterminate" | undefined;

  /**
   * The controlled value of the checkbox (bindable).
   */
  modelValue?: T | "indeterminate" | null | undefined;

  /**
   * Legacy / alias for controlled checked state.
   */
  checked?: boolean | "indeterminate" | undefined;

  /**
   * The value used when the checkbox is checked. Defaults to `true`.
   */
  trueValue?: T | undefined;

  /**
   * The value used when the checkbox is unchecked. Defaults to `false`.
   */
  falseValue?: T | undefined;

  /**
   * Whether the checkbox is in indeterminate state.
   */
  indeterminate?: boolean | undefined;

  /**
   * Form-related native attributes.
   */
  autofocus?: boolean | string | undefined;
  form?: string | undefined;
  formaction?: string | undefined;
  formenctype?: string | undefined;
  formmethod?: string | undefined;
  formnovalidate?: boolean | string | undefined;
  formtarget?: string | undefined;

  /**
   * Theme mode override (pins colors to flat, light, or dark mode).
   */
  theme?: Theme | undefined;

  /**
   * Native change event handler.
   */
  onChange?: ((e: Event & { currentTarget: HTMLInputElement }) => void) | undefined;

  /**
   * Model update callback for reactive binding.
   */
  "onUpdate:modelValue"?: ((value: any) => void) | undefined;

  /**
   * Slot overrides.
   */
  labelSlot?: JSX.Element | ((props: { label: string | undefined }) => JSX.Element) | undefined;
  descriptionSlot?:
    | JSX.Element
    | ((props: { description: string | undefined }) => JSX.Element)
    | undefined;

  /**
   * Custom child content (rendered inside label container).
   */
  children?: JSX.Element;

  [key: string]: unknown;
}
