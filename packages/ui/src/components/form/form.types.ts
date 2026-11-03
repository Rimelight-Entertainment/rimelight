import type { InferThemeProps } from "../../resolver";
import type { RLFormTheme } from "./form.theme";

export type RLFormProps = Omit<InferThemeProps<typeof RLFormTheme>, "onSubmit"> & {
  /**
   * Native submit event on the form element.
   */
  onSubmit?: (event: Event & { currentTarget: HTMLFormElement }) => void;
};
