import type { InferThemeProps } from "../../resolver";
import type { RLInputMenuTheme } from "./input-menu.theme";

export type InputMenuItem = {
  /** Text shown in the list and in the trigger. */
  label: string;
  /** Value reported through `onValueChange` when the item is selected. */
  value: string;
};

export type RLInputMenuProps = InferThemeProps<typeof RLInputMenuTheme> & {
  /**
   * Selectable options. A string is used as both label and value.
   * @default []
   */
  items?: (string | InputMenuItem)[];
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
   * Called with the selected item's value.
   * @default undefined
   */
  onValueChange?: (value: string) => void;
  /**
   * Text shown in the trigger when no item is selected.
   * @default undefined (falls back to the localized "Select item...")
   */
  placeholder?: string;
  /**
   * Disabled state.
   * @default false
   */
  disabled?: boolean;
  /**
   * Form field name for the hidden input that holds the value.
   * @default undefined
   */
  name?: string;
  /**
   * Visible label rendered above the trigger.
   * @default undefined
   */
  label?: string;
};
