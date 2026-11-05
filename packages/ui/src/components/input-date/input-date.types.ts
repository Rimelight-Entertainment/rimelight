import type { InferThemeProps } from "../../resolver";
import type { RLInputTheme } from "../input/input.theme";
import type { RLInputDateTheme } from "./input-date.theme";

export type RLInputDateProps = Omit<
  InferThemeProps<typeof RLInputDateTheme>,
  "onInput" | "onChange" | "onBlur" | "onFocus" | "onKeyDown" | "ref"
> & {
  /**
   * Size of the input, matching `RLInput`.
   * @default "md"
   */
  size?: InferThemeProps<typeof RLInputTheme>["size"];
  /**
   * Date value in `YYYY-MM-DD` format.
   * @default undefined
   */
  value?: string;
  /**
   * Initial date value for the uncontrolled input.
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
   * Earliest selectable date in `YYYY-MM-DD` format.
   * @default undefined
   */
  min?: string;
  /**
   * Latest selectable date in `YYYY-MM-DD` format.
   * @default undefined
   */
  max?: string;
  /**
   * Step interval in days.
   * @default undefined
   */
  step?: number;
  /**
   * Accessible label applied to the input.
   * @default undefined
   */
  "aria-label"?: string | undefined;
  /**
   * Element ID that labels the input.
   * @default undefined
   */
  "aria-labelledby"?: string | undefined;
  /**
   * Element ID that describes the input.
   * @default undefined
   */
  "aria-describedby"?: string | undefined;
  /**
   * Native `input` event handler.
   * @default undefined
   */
  onInput?: (e: InputEvent & { currentTarget: HTMLInputElement }) => void;
  /**
   * Called with the new value when the user changes the date.
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
