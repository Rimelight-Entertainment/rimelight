import type { InferThemeProps } from "../../resolver";
import type { RLColorSliderTheme } from "./color-slider.theme";

/**
 * Channel a color slider can control.
 */
export type RLColorSliderChannel =
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
export type RLColorSliderColorSpace = "hsl" | "rgb" | "hsb";

export type RLColorSliderProps = InferThemeProps<typeof RLColorSliderTheme> & {
  /**
   * Channel the slider controls. Required.
   */
  channel: RLColorSliderChannel;
  /**
   * Color space the channel is expressed in.
   * @default "hsl"
   */
  colorSpace?: RLColorSliderColorSpace;
  /**
   * Controlled hex color. Leave undefined for uncontrolled use.
   * @default undefined
   */
  value?: string;
  /**
   * Initial hex color when uncontrolled.
   * @default DEFAULT_COLOR_HEX
   */
  defaultValue?: string;
  /**
   * Disables pointer and keyboard interaction.
   * @default false
   */
  disabled?: boolean | undefined;
  /**
   * Reverses the direction of the channel along the track.
   * @default false
   */
  inverted?: boolean;
  /**
   * Form name of the hidden input holding the hex value. No input is rendered when omitted.
   * @default undefined
   */
  name?: string;
  /**
   * Track orientation.
   * @default "horizontal"
   */
  orientation?: "vertical" | "horizontal";
  /**
   * Keyboard and pointer step size in channel units.
   * @default 1
   */
  step?: number;
  /**
   * Accessible name of the slider thumb. Overrides the localized default.
   * @default undefined
   */
  "aria-label"?: string | undefined;
  /**
   * Element id that labels the slider thumb.
   * @default undefined
   */
  "aria-labelledby"?: string | undefined;
  /**
   * Element id that describes the slider thumb.
   * @default undefined
   */
  "aria-describedby"?: string | undefined;
  /**
   * Called with the new hex color on every change.
   * @default undefined
   */
  onValueChange?: (val: string) => void;
  /**
   * Called with the final hex color when a pointer drag or key press ends.
   * @default undefined
   */
  onValueChangeEnd?: (val: string) => void;
};
