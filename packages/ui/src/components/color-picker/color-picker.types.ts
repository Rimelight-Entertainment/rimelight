import type { InferThemeProps } from "../../resolver";
import type { RLColorPickerTheme } from "./color-picker.theme";

/**
 * Props for `RLColorPicker`. Combines a color area, a hue slider, and a hex field around one color.
 */
export type RLColorPickerProps = InferThemeProps<typeof RLColorPickerTheme> & {
  /**
   * Controlled hex color. Leave undefined to let the picker manage its own color.
   * @default undefined
   */
  value?: string | undefined;
  /**
   * Initial hex color when uncontrolled.
   * @default "#ff0000"
   */
  defaultValue?: string | undefined;
  /**
   * Called with the new hex color on every change.
   * @default undefined
   */
  onValueChange?: ((value: string) => void) | undefined;
  /**
   * Disables every control.
   * @default false
   */
  disabled?: boolean | undefined;
  /**
   * Accessible name for the picker group.
   * @default "Color picker"
   */
  "aria-label"?: string | undefined;
};
