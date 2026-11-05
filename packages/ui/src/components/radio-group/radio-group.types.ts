import type { JSX } from "@solidjs/web";
import type { InferThemeProps } from "../../resolver";
import type { RLRadioGroupTheme } from "./radio-group.theme";

/**
 * A single selectable option in a radio group.
 */
export type RLRadioGroupItem = {
  /**
   * Value submitted and reported when this option is selected.
   */
  value: string;
  /**
   * Visible label of the option.
   *
   * @default undefined
   */
  label?: JSX.Element;
  /**
   * Secondary text rendered under the label.
   *
   * @default undefined
   */
  description?: JSX.Element;
  /**
   * Disables this option only.
   *
   * @default false
   */
  disabled?: boolean;
};

export type RLRadioGroupProps = Omit<InferThemeProps<typeof RLRadioGroupTheme>, "orientation"> & {
  /**
   * Options to render, in order.
   *
   * @default []
   */
  items?: RLRadioGroupItem[];
  /**
   * Controlled selected value. `null` means nothing is selected. Omit for uncontrolled use.
   *
   * @default undefined
   */
  value?: string | null | undefined;
  /**
   * Initially selected value when uncontrolled.
   *
   * @default null
   */
  defaultValue?: string | null | undefined;
  /**
   * Called with the newly selected value.
   */
  onValueChange?: (value: string | null) => void;
  /**
   * Layout axis of the options.
   *
   * @default "vertical"
   */
  orientation?: "horizontal" | "vertical";
  /**
   * Disables every option in the group.
   *
   * @default false
   */
  disabled?: boolean;
  /**
   * Form field name shared by every option. Defaults to a generated unique name.
   *
   * @default undefined
   */
  name?: string | undefined;
  /**
   * Accessible name of the group.
   *
   * @default undefined
   */
  "aria-label"?: string;
  /**
   * Id of the element labelling the group.
   *
   * @default undefined
   */
  "aria-labelledby"?: string;
  /**
   * Id of the element describing the group.
   *
   * @default undefined
   */
  "aria-describedby"?: string;
};
