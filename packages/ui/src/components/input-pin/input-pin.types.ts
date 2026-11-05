import type { InferThemeProps } from "../../resolver";
import type { RLInputTheme } from "../input/input.theme";
import type { RLInputPinTheme } from "./input-pin.theme";

export type RLInputPinProps = Omit<
  InferThemeProps<typeof RLInputPinTheme>,
  "onInput" | "onChange" | "onKeyDown"
> & {
  /**
   * Size of each digit cell, matching `RLInput`.
   * @default "md"
   */
  size?: InferThemeProps<typeof RLInputTheme>["size"];
  /**
   * Number of digit cells.
   * @default 4
   */
  length?: number;
  /**
   * Controlled value. Omit to let the component manage its own value.
   * @default undefined
   */
  value?: string;
  /**
   * Initial value when uncontrolled.
   * @default ""
   */
  defaultValue?: string;
  /**
   * Called with the new value whenever a digit changes.
   * @default undefined
   */
  onValueChange?: (value: string) => void;
  /**
   * Form field name. Each cell is submitted as `${name}-${index}`.
   * @default undefined
   */
  name?: string;
  /**
   * Disabled state.
   * @default false
   */
  disabled?: boolean;
  /**
   * Required state applied to every cell.
   * @default false
   */
  required?: boolean;
  /**
   * Accepted characters: digits only, letters and digits, or any text.
   * @default "numeric"
   */
  type?: "text" | "numeric" | "alphanumeric";
  /**
   * Accessible label for the group of cells. Falls back to the localized "One-time code" label.
   * @default undefined
   */
  "aria-label"?: string | undefined;
  /**
   * Element ID that labels the group of cells.
   * @default undefined
   */
  "aria-labelledby"?: string | undefined;
  /**
   * Element ID that describes the group of cells.
   * @default undefined
   */
  "aria-describedby"?: string | undefined;
  /**
   * Native input event handler, called for each cell.
   * @default undefined
   */
  onInput?: (e: InputEvent & { currentTarget: HTMLInputElement }) => void;
  /**
   * Native keydown event handler, called for each cell.
   * @default undefined
   */
  onKeyDown?: (e: KeyboardEvent & { currentTarget: HTMLInputElement }) => void;
  /**
   * Called with the full code once every cell is filled.
   * @default undefined
   */
  onComplete?: (value: string) => void;
};
