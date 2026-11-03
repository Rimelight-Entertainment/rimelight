import type { JSX } from "@solidjs/web";
import type { InferThemeProps } from "../../resolver";
import type { ThemePreference } from "../../theme";
import type { RLThemeSelectorTheme } from "./theme-selector.theme";

/**
 * Theme selector props. `@status stable`.
 */
export type RLThemeSelectorProps = InferThemeProps<typeof RLThemeSelectorTheme> & {
  /**
   * Display mode. `icon` renders a compact icon-only trigger.
   * @default "select"
   */
  mode?: "select" | "icon";

  /**
   * Called with the new preference after it is applied.
   * @default undefined
   */
  onValueChange?: (theme: ThemePreference) => void;

  /**
   * Content rendered after the select.
   * @default undefined
   */
  children?: JSX.Element;
};
