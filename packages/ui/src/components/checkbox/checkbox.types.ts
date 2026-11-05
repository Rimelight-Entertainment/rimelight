import type { ValidComponent } from "@solidjs/web";
import type { JSX } from "@solidjs/web";
import type { Theme, ThemeColor } from "../../types";
import type { InferThemeProps } from "../../resolver";
import type { RLCheckboxTheme } from "./checkbox.theme";

export type CheckboxColor = ThemeColor;
export type CheckboxLayout = "list" | "card";
export type CheckboxSize = "xs" | "sm" | "md" | "lg" | "xl";
export type CheckboxIndicator = "start" | "end" | "hidden";

export interface CheckboxUi {
  root?: string | undefined;
  container?: string | undefined;
  base?: string | undefined;
  indicator?: string | undefined;
  icon?: string | undefined;
  wrapper?: string | undefined;
  label?: string | undefined;
  description?: string | undefined;
}

export type RLCheckboxProps = Omit<
  InferThemeProps<typeof RLCheckboxTheme>,
  "checked" | "onChange" | "autofocus" | "ref"
> & {
  /**
   * Ref to the native checkbox input element.
   */
  ref?: HTMLInputElement | ((el: HTMLInputElement) => void) | undefined;
  /**
   * The element or component this component should render as.
   * @default 'div'
   */
  as?: ValidComponent;

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
  color?: CheckboxColor | undefined;

  /**
   * Layout preset of the checkbox container.
   * @default 'list'
   */
  layout?: CheckboxLayout | undefined;

  /**
   * Size scale of the checkbox.
   * @default 'md'
   */
  size?: CheckboxSize | undefined;

  /**
   * Position of the indicator checkbox box.
   * @default 'start'
   */
  indicator?: CheckboxIndicator | undefined;

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
  ui?: CheckboxUi | undefined;

  /**
   * Additional CSS classes to apply to the root element.
   */
  class?: string | undefined;

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
  value?: string | number | undefined;

  /**
   * Unique ID for the input element.
   */
  id?: string | undefined;

  /**
   * The checked state of the checkbox when it is initially rendered (uncontrolled).
   */
  defaultChecked?: boolean | "indeterminate" | undefined;

  /**
   * The controlled checked state of the checkbox.
   */
  checked?: boolean | "indeterminate" | undefined;

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
   * Checked state change callback for reactive binding.
   */
  onCheckedChange?: ((checked: boolean) => void) | undefined;

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
};
