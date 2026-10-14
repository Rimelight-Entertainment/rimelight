export type RLNavigationProgressSize = "xs" | "sm" | "md" | "lg";

export interface RLNavigationProgressProps {
  /**
   * Theme color name for the progress bar.
   * Defaults to `"primary"`.
   */
  color?: string;

  /**
   * Semantic height size for the progress bar.
   * Defaults to `"sm"`.
   */
  size?: RLNavigationProgressSize;

  /**
   * Additional root classes.
   */
  class?: string;

  /**
   * Custom slot overrides.
   */
  ui?: Partial<{
    root?: string;
    bar?: string;
  }>;
}
