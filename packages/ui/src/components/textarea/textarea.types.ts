import type { InferThemeProps } from "../../resolver";
import type { RLTextareaTheme } from "./textarea.theme";

export type RLTextareaProps = Omit<
  InferThemeProps<typeof RLTextareaTheme>,
  "value" | "defaultValue" | "onInput" | "onChange" | "onBlur" | "onFocus" | "onKeyDown" | "ref"
> & {
  /**
   * Controlled text value. Omit for uncontrolled use.
   * @default undefined
   */
  value?: string | undefined;
  /**
   * Initial text when uncontrolled.
   * @default ""
   */
  defaultValue?: string | undefined;
  /**
   * Called with the next text on each input.
   */
  onValueChange?: (value: string) => void;
  /**
   * Shows the error styling.
   * @default false
   */
  invalid?: boolean | undefined;
  /**
   * Text shown while the field is empty.
   * @default undefined
   */
  placeholder?: string | undefined;
  /**
   * Disables the field.
   * @default false
   */
  disabled?: boolean | undefined;
  /**
   * Makes the field read-only.
   * @default false
   */
  readonly?: boolean | undefined;
  /**
   * Marks the field as required.
   * @default false
   */
  required?: boolean | undefined;
  /**
   * Form field name.
   * @default undefined
   */
  name?: string | undefined;
  /**
   * Visible line count. Ignored when `autoGrow` is set.
   * @default 4
   */
  rows?: number | undefined;
  /**
   * Grows the field with its content instead of scrolling.
   * @default false
   */
  autoGrow?: boolean | undefined;
  /** Textarea element reference. */
  ref?: HTMLTextAreaElement | ((el: HTMLTextAreaElement) => void);
  /** Native input event on the textarea. */
  onInput?: (event: InputEvent & { currentTarget: HTMLTextAreaElement }) => void;
  /** Native change event on the textarea. */
  onChange?: (event: Event & { currentTarget: HTMLTextAreaElement }) => void;
  /** Native blur event on the textarea. */
  onBlur?: (event: FocusEvent & { currentTarget: HTMLTextAreaElement }) => void;
  /** Native focus event on the textarea. */
  onFocus?: (event: FocusEvent & { currentTarget: HTMLTextAreaElement }) => void;
  /** Native keydown event on the textarea. */
  onKeyDown?: (event: KeyboardEvent & { currentTarget: HTMLTextAreaElement }) => void;
};
