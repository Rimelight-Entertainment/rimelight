import type { JSX } from "@solidjs/web";
import type { InferThemeProps } from "../../resolver";
import type { ThemePreference } from "../../theme";
import type { ThemeColor } from "../../types";
import type { RLThemeSelectorTheme } from "./theme-selector.theme";

/**
 * Theme selector props. `@status stable`.
 */
export type RLThemeSelectorProps = InferThemeProps<typeof RLThemeSelectorTheme> & {
  /**
   * Display mode. `icon` renders a compact icon-only trigger.
   *
   * @default "select"
   */
  mode?: "select" | "icon" | undefined;

  /**
   * Color of the trigger.
   *
   * @default "primary"
   */
  color?: ThemeColor | undefined;

  /**
   * Size of the trigger.
   *
   * @default "md"
   */
  size?: "xs" | "sm" | "md" | "lg" | "xl" | undefined;

  /**
   * Called with the new preference after it is applied.
   */
  onValueChange?: ((theme: ThemePreference) => void) | undefined;

  /**
   * Content rendered after the select.
   */
  children?: JSX.Element | undefined;
};
