import type { InferThemeProps } from "../../resolver";
import type { RLSliderTheme } from "./slider.theme";

export type RLSliderProps = Omit<
  InferThemeProps<typeof RLSliderTheme>,
  "value" | "defaultValue" | "onChange"
> & {
  /**
   * Controlled value. Omit for uncontrolled use.
   * @default undefined
   */
  value?: number | undefined;
  /**
   * Initial value when uncontrolled.
   * @default min
   */
  defaultValue?: number | undefined;
  /**
   * Called with the next value on each change.
   */
  onValueChange?: (value: number) => void;
  /**
   * Smallest selectable value.
   * @default 0
   */
  min?: number | undefined;
  /**
   * Largest selectable value.
   * @default 100
   */
  max?: number | undefined;
  /**
   * Distance between selectable values.
   * @default 1
   */
  step?: number | undefined;
  /**
   * Form field name for the underlying range input.
   * @default undefined
   */
  name?: string | undefined;
};
