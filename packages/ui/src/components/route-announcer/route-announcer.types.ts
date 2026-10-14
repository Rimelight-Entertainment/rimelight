export type RLRouteAnnouncerProgressSize = "xs" | "sm" | "md" | "lg";

export interface RLRouteAnnouncerProgressOptions {
  /**
   * Theme color name for the progress bar.
   * Defaults to `"primary"`.
   */
  color?: string;

  /**
   * Semantic height size for the progress bar.
   * Defaults to `"sm"`.
   */
  size?: RLRouteAnnouncerProgressSize;

  /**
   * Additional classes for the progress bar container.
   */
  class?: string;
}

export interface RLRouteAnnouncerProps {
  /**
   * Custom prefix to announce when `document.title` is empty.
   * Defaults to `"Navigated to"`.
   */
  prefix?: string;

  /**
   * Whether to display the visual top navigation progress bar during async route transitions.
   * Can be boolean or configuration options object.
   * Defaults to `true`.
   */
  progress?: boolean | RLRouteAnnouncerProgressOptions;

  /**
   * Color token for the progress bar when progress is enabled as boolean.
   * Defaults to `"primary"`.
   */
  color?: string;

  /**
   * Semantic size for the progress bar when progress is enabled as boolean.
   * Defaults to `"sm"`.
   */
  size?: RLRouteAnnouncerProgressSize;

  /**
   * Additional root classes.
   */
  class?: string;

  /**
   * Custom slot overrides.
   */
  ui?: Partial<{
    root?: string;
    announcer?: string;
    progressBar?: string;
    progressIndicator?: string;
  }>;
}
