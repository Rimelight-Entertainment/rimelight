import type { InferThemeProps } from "../../resolver";
import type { RLColorFieldTheme } from "./color-field.theme";

/**
 * Channel a color field can edit.
 */
export type RLColorFieldChannel =
  | "hue"
  | "saturation"
  | "red"
  | "green"
  | "blue"
  | "alpha"
  | "lightness"
  | "brightness";

/**
 * Color space a channel is expressed in.
 */
export type RLColorFieldColorSpace = "hsl" | "rgb" | "hsb";

export type RLColorFieldProps = InferThemeProps<typeof RLColorFieldTheme> & {
  /**
   * Channel edited by the field. Without a channel the field edits the full hex value.
   * @default undefined
   */
  channel?: RLColorFieldChannel;
  /**
   * Color space used to read and write `channel`.
   * @default "hsl"
   */
  colorSpace?: RLColorFieldColorSpace;
  /**
   * Uncontrolled initial hex value.
   * @default DEFAULT_COLOR_HEX
   */
  defaultValue?: string;
  /**
   * Controlled hex value. When set, the field does not keep its own state.
   * @default undefined
   */
  value?: string;
  /**
   * Accessible name of the text input. Use when the field has no visible label.
   * @default undefined
   */
  "aria-label"?: string | undefined;
  /**
   * Element id that labels the text input.
   * @default undefined
   */
  "aria-labelledby"?: string | undefined;
  /**
   * Element id that describes the text input.
   * @default undefined
   */
  "aria-describedby"?: string | undefined;
  /**
   * Called with the new hex value on every change.
   * @default undefined
   */
  onValueChange?: (val: string) => void;
  /**
   * Disabled state.
   * @default false
   */
  disabled?: boolean | undefined;
  /**
   * Disables changing the channel with the mouse wheel.
   * @default false
   */
  disableWheelChange?: boolean;
  /**
   * Readonly state.
   * @default false
   */
  readonly?: boolean;
  /**
   * Required state.
   * @default false
   */
  required?: boolean;
  /**
   * Name for forms. Renders a hidden input carrying the hex value.
   * @default undefined
   */
  name?: string;
  /**
   * Placeholder text for the text input.
   * @default undefined
   */
  placeholder?: string;
  /**
   * Increment used by arrow keys and the mouse wheel. Shift multiplies it by 10.
   * @default 1
   */
  step?: number;
};
