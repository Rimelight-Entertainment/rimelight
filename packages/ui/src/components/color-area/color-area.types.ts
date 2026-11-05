import type { InferThemeProps } from "../../resolver";
import type { RLColorAreaTheme } from "./color-area.theme";

/**
 * Channel an axis of the color area can map to.
 */
export type RLColorAreaChannel =
  | "hue"
  | "saturation"
  | "red"
  | "green"
  | "blue"
  | "alpha"
  | "lightness"
  | "brightness";

/**
 * Color space both axes are expressed in.
 */
export type RLColorAreaColorSpace = "hsl" | "rgb" | "hsb";

/**
 * Snapshot of every channel derived from the current hex value.
 */
export interface RLColorAreaChannelState {
  /** Hue in degrees. Keeps its previous value for achromatic colors. */
  hue: number;
  /** HSL saturation in percent. */
  sat: number;
  /** HSL lightness in percent. */
  light: number;
  /** HSB brightness in percent. */
  bright: number;
  /** Red channel, 0-255. */
  red: number;
  /** Green channel, 0-255. */
  green: number;
  /** Blue channel, 0-255. */
  blue: number;
}

export type RLColorAreaProps = InferThemeProps<typeof RLColorAreaTheme> & {
  /**
   * Color space both axes are expressed in.
   * @default "hsl"
   */
  colorSpace?: RLColorAreaColorSpace;
  /**
   * Controlled hex color. Leave undefined for uncontrolled use.
   * @default undefined
   */
  value?: string;
  /**
   * Initial hex color when uncontrolled.
   * @default DEFAULT_COLOR_AREA_HEX
   */
  defaultValue?: string;
  /**
   * Disables pointer and keyboard interaction.
   * @default false
   */
  disabled?: boolean | undefined;
  /**
   * Form name of the hidden input holding the hex value. No input is rendered when omitted.
   * @default undefined
   */
  name?: string;
  /**
   * Channel mapped to the horizontal axis.
   * @default "saturation"
   */
  xChannel?: RLColorAreaChannel;
  /**
   * Form name of the hidden input holding the x channel value. No input is rendered when omitted.
   * @default undefined
   */
  xName?: string;
  /**
   * Channel mapped to the vertical axis.
   * @default "lightness"
   */
  yChannel?: RLColorAreaChannel;
  /**
   * Form name of the hidden input holding the y channel value. No input is rendered when omitted.
   * @default undefined
   */
  yName?: string;
  /**
   * Accessible name of the thumb. Overrides the localized default.
   * @default undefined
   */
  "aria-label"?: string | undefined;
  /**
   * Element id that labels the thumb.
   * @default undefined
   */
  "aria-labelledby"?: string | undefined;
  /**
   * Element id that describes the thumb.
   * @default undefined
   */
  "aria-describedby"?: string | undefined;
  /**
   * Called with the new hex color on every change.
   * @default undefined
   */
  onValueChange?: (value: string) => void;
  /**
   * Called with the final hex color when a pointer drag or key press ends.
   * @default undefined
   */
  onValueChangeEnd?: (value: string) => void;
};
