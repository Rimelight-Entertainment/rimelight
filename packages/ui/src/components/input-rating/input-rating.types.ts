import type { InferThemeProps } from "../../resolver";
import type { RLInputRatingTheme } from "./input-rating.theme";

export type RLInputRatingProps = Omit<
  InferThemeProps<typeof RLInputRatingTheme>,
  "size" | "orientation" | "disabled" | "readonly"
> & {
  /**
   * Size of each rating item.
   * @default "md"
   */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /**
   * Layout direction of the rating items.
   * @default "horizontal"
   */
  orientation?: "horizontal" | "vertical";
  /**
   * Disabled state. Blocks interaction.
   * @default false
   */
  disabled?: boolean;
  /**
   * Readonly state. Shows the value without allowing changes.
   * @default false
   */
  readonly?: boolean;
  /**
   * Required state. Applies to the hidden form input.
   * @default false
   */
  required?: boolean;
  /**
   * Name for form submission (hidden input).
   * @default undefined
   */
  name?: string;
  /**
   * Icon name (string icon) for filled items.
   * @default "star"
   */
  icon?: string;
  /**
   * Icon name (string icon) for empty items. Falls back to `icon`.
   * @default undefined
   */
  emptyIcon?: string;
  /**
   * Controlled value. Leave `undefined` for uncontrolled use.
   * @default undefined
   */
  value?: number;
  /**
   * Initial value when uncontrolled.
   * @default 0
   */
  defaultValue?: number;
  /**
   * Called with the next value when the user changes the rating.
   * @default undefined
   */
  onValueChange?: (value: number) => void;
  /**
   * Number of rating items.
   * @default 5
   */
  length?: number;
  /**
   * Value increment per step. Use `0.5` for half steps.
   * @default 1
   */
  step?: number;
  /**
   * Clicking the current value clears the rating to `0`.
   * @default false
   */
  clearable?: boolean;
  /**
   * Previews the value under the pointer on hover.
   * @default false
   */
  hoverable?: boolean;
};
