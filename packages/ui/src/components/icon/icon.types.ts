import type { InferThemeProps } from "../../resolver";
import type { RLIconTheme } from "./icon.theme";

/**
 * Renders a named icon as an inline element.
 */
export type RLIconProps = InferThemeProps<typeof RLIconTheme> & {
  /**
   * Icon name resolved by the icon registry.
   * @default undefined
   */
  name: string;
};
