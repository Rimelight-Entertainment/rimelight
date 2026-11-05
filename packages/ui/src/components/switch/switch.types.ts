import type { InferThemeProps } from "../../resolver";
import type { RLSwitchTheme } from "./switch.theme";

export type RLSwitchProps = Omit<
  InferThemeProps<typeof RLSwitchTheme>,
  "checked" | "disabled" | "name" | "value" | "onChange"
> & {
  /**
   * Whether the switch is on. Omit for uncontrolled use.
   * @default undefined
   */
  checked?: boolean | undefined;
  /**
   * Initial state when uncontrolled.
   * @default false
   */
  defaultChecked?: boolean | undefined;
  /**
   * Called with the next state when the user toggles the switch.
   */
  onValueChange?: (checked: boolean) => void;
  /**
   * Disables the switch.
   * @default false
   */
  disabled?: boolean | undefined;
  /**
   * Form field name for the underlying checkbox input.
   * @default undefined
   */
  name?: string | undefined;
  /**
   * Form value submitted with `name` when checked.
   * @default undefined
   */
  value?: string | undefined;
  /**
   * Text rendered next to the switch. Falls back to `children` when omitted.
   * @default undefined
   */
  label?: string | undefined;
  /** Native change event on the underlying checkbox input. */
  onChange?: (event: Event & { currentTarget: HTMLInputElement }) => void;
};
