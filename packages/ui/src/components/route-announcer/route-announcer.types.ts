import type { InferThemeProps } from "../../resolver";
import type { ThemeColor } from "../../types";
import type { RLRouteAnnouncerTheme } from "./route-announcer.theme";

export type RouteAnnouncerProgressSize = "xs" | "sm" | "md" | "lg" | "xl";

/**
 * Progress bar options. Used in place of the boolean `progress`.
 */
export interface RouteAnnouncerProgressOptions {
  /**
   * Theme color of the progress bar.
   * @default undefined; the `color` prop applies, otherwise "primary".
   */
  color?: ThemeColor;

  /**
   * Height of the progress bar.
   * @default undefined; the `size` prop applies, otherwise "md".
   */
  size?: RouteAnnouncerProgressSize;

  /**
   * Additional classes for the progress bar container.
   * @default undefined
   */
  class?: string;
}

/**
 * Route announcer props. `@status stable`.
 */
export type RLRouteAnnouncerProps = InferThemeProps<typeof RLRouteAnnouncerTheme> & {
  /**
   * Custom prefix to announce when `document.title` is empty.
   * @default translated "Navigated to"
   */
  prefix?: string;

  /**
   * Whether to display the visual top navigation progress bar during async route transitions.
   * Pass an options object to set the progress bar color, size and class.
   * @default true
   */
  progress?: boolean | RouteAnnouncerProgressOptions;
};
