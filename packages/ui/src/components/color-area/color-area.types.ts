import type { InferThemeProps } from "../../resolver";
import type { RLColorAreaTheme } from "./color-area.theme";

export type RLColorAreaProps = InferThemeProps<typeof RLColorAreaTheme> & {
  /**
   * Color space both axes are expressed in.
   * @default "hsl"
   */
  colorSpace?: "hsl" | "rgb" | "hsb";
  /**
   * Controlled hex color. Leave undefined for uncontrolled use.
   * @default undefined
   */
  value?: string;
  /**
   * Initial hex color when uncontrolled.
   * @default "#ff0000"
   */
  defaultValue?: string;
  /**
   * Disables pointer and keyboard interaction.
   * @default false
   */
  disabled?: boolean;
  /**
   * Form name of the hidden input holding the hex value. No input is rendered when omitted.
   * @default undefined
   */
  name?: string;
  /**
   * Channel mapped to the horizontal axis.
   * @default "saturation"
   */
  xChannel?: "hue" | "saturation" | "red" | "green" | "blue" | "alpha" | "lightness" | "brightness";
  /**
   * Form name of the hidden input holding the x channel value. No input is rendered when omitted.
   * @default undefined
   */
  xName?: string;
  /**
   * Channel mapped to the vertical axis.
   * @default "lightness"
   */
  yChannel?: "hue" | "saturation" | "red" | "green" | "blue" | "alpha" | "lightness" | "brightness";
  /**
   * Form name of the hidden input holding the y channel value. No input is rendered when omitted.
   * @default undefined
   */
  yName?: string;
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
