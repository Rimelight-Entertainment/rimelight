import type { InferThemeProps } from "../../resolver";
import type { RLInputNumberTheme } from "./input-number.theme";

export type RLInputNumberProps = Omit<
  InferThemeProps<typeof RLInputNumberTheme>,
  "onInput" | "onChange" | "onBlur" | "onFocus" | "onKeyDown"
> & {
  /**
   * Numeric value. Setting it makes the input controlled.
   * @default undefined
   */
  value?: number | undefined;
  /**
   * Initial numeric value for the uncontrolled input.
   * @default undefined
   */
  defaultValue?: number | undefined;
  /**
   * Minimum allowed value. Values are clamped to it.
   * @default undefined
   */
  min?: number | undefined;
  /**
   * Maximum allowed value. Values are clamped to it.
   * @default undefined
   */
  max?: number | undefined;
  /**
   * Increment used by the stepper buttons, arrow keys and mouse wheel.
   * @default 1
   */
  step?: number | undefined;
  /**
   * Name for forms.
   * @default undefined
   */
  name?: string;
  /**
   * Placeholder text.
   * @default undefined
   */
  placeholder?: string;
  /**
   * Disabled state.
   * @default false
   */
  disabled?: boolean;
  /**
   * Readonly state.
   * @default false
   */
  readonly?: boolean;
  /**
   * Required field state.
   * @default false
   */
  required?: boolean;
  /**
   * Called with the clamped numeric value when it changes.
   * @default undefined
   */
  onValueChange?: (value: number) => void;
  /**
   * Native `input` event handler.
   * @default undefined
   */
  onInput?: (e: InputEvent & { currentTarget: HTMLInputElement }) => void;
  /**
   * Native `blur` event handler.
   * @default undefined
   */
  onBlur?: (e: FocusEvent & { currentTarget: HTMLInputElement }) => void;
  /**
   * Native `focus` event handler.
   * @default undefined
   */
  onFocus?: (e: FocusEvent & { currentTarget: HTMLInputElement }) => void;
  /**
   * Native `keydown` event handler.
   * @default undefined
   */
  onKeyDown?: (e: KeyboardEvent & { currentTarget: HTMLInputElement }) => void;
};
