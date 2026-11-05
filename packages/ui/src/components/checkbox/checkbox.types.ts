import type { ValidComponent } from "@solidjs/web";
import type { ThemeColor } from "../../types";
import type { SlotRenderer } from "../../types";
import type { InferThemeProps } from "../../resolver";
import type { RLCheckboxTheme } from "./checkbox.theme";

export type CheckboxLayout = "list" | "card";
export type CheckboxSize = "xs" | "sm" | "md" | "lg" | "xl";
export type CheckboxSide = "start" | "end";

export type RLCheckboxProps = Omit<
  InferThemeProps<typeof RLCheckboxTheme>,
  "checked" | "onChange" | "autofocus" | "ref" | "side" | "hasIndicator"
> & {
  /**
   * Ref to the native checkbox input element.
   */
  ref?: HTMLInputElement | ((el: HTMLInputElement) => void) | undefined;

  /**
   * The element or component this component should render as.
   * @default 'label'
   */
  as?: ValidComponent;

  /**
   * Text label for the checkbox.
   */
  label?: string | undefined;

  /**
   * Description text rendered below the label.
   */
  description?: string | undefined;

  /**
   * Color theme variant.
   * @default 'primary'
   */
  color?: ThemeColor | undefined;

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
   * Edge the checkbox box sits on relative to the label.
   * @default 'start'
   */
  side?: CheckboxSide | undefined;

  /**
   * Whether the checkbox box is rendered. When `false`, `icon` is rendered above the label instead.
   * @default true
   */
  hasIndicator?: boolean | undefined;

  /**
   * Highlight the ring color like a focus state.
   * @default false
   */
  highlight?: boolean | undefined;

  /**
   * Bare lucide icon name displayed when checked, or above the label when `hasIndicator` is `false`.
   * @default 'check'
   */
  icon?: string | undefined;

  /**
   * Bare lucide icon name displayed when the checkbox is indeterminate.
   * @default 'minus'
   */
  indeterminateIcon?: string | undefined;

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
   * Whether the checkbox has a `form` owner and the `autofocus` attribute.
   */
  autofocus?: boolean | string | undefined;

  /**
   * ID of the form that owns the checkbox.
   */
  form?: string | undefined;

  /**
   * URL the owning form submits to when this checkbox is the submitter.
   */
  formaction?: string | undefined;

  /**
   * Encoding type used when the owning form is submitted.
   */
  formenctype?:
    | "application/x-www-form-urlencoded"
    | "multipart/form-data"
    | "text/plain"
    | undefined;

  /**
   * HTTP method used when the owning form is submitted.
   */
  formmethod?: "get" | "post" | "dialog" | undefined;

  /**
   * Bypass form validation when the owning form is submitted.
   */
  formnovalidate?: boolean | string | undefined;

  /**
   * Browsing context the owning form submits to.
   */
  formtarget?: string | undefined;

  /**
   * Native change event handler.
   */
  onChange?: ((e: Event & { currentTarget: HTMLInputElement }) => void) | undefined;

  /**
   * Checked state change callback.
   */
  onCheckedChange?: ((checked: boolean) => void) | undefined;

  /**
   * Replaces the label text. Receives the `label` prop.
   */
  labelSlot?: SlotRenderer<{ label: string | undefined }>;

  /**
   * Replaces the description text. Receives the `description` prop.
   */
  descriptionSlot?: SlotRenderer<{ description: string | undefined }>;
};
