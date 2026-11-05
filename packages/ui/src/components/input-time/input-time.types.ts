import type { InferThemeProps } from "../../resolver";
import type { RLInputProps } from "../input/input.types";
import type { RLInputTimeTheme } from "./input-time.theme";

export type RLInputTimeProps = Omit<
  InferThemeProps<typeof RLInputTimeTheme>,
  "onInput" | "onChange" | "onBlur" | "onFocus" | "onKeyDown" | "ref"
> & {
  /**
   * Control size, shared with `RLInput`.
   * @default "md"
   */
  size?: RLInputProps["size"];
  /**
   * Time value in `HH:mm` or `HH:mm:ss` format.
   * @default undefined
   */
  value?: string;
  /**
   * Initial time value for the uncontrolled input.
   * @default undefined
   */
  defaultValue?: string;
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
   * Earliest selectable time in `HH:mm` or `HH:mm:ss` format.
   * @default undefined
   */
  min?: string;
  /**
   * Latest selectable time in `HH:mm` or `HH:mm:ss` format.
   * @default undefined
   */
  max?: string;
  /**
   * Step interval in seconds.
   * @default undefined
   */
  step?: number;
  /**
   * Native `input` event handler.
   * @default undefined
   */
  onInput?: (e: InputEvent & { currentTarget: HTMLInputElement }) => void;
  /**
   * Called with the new value when the user changes the time.
   * @default undefined
   */
  onValueChange?: (value: string) => void;
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
  /**
   * Element or callback ref for the native input.
   * @default undefined
   */
  ref?: HTMLInputElement | ((el: HTMLInputElement) => void);
};
