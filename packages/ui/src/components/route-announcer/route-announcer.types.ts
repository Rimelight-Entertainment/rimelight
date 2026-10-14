export interface RLRouteAnnouncerProps {
  /**
   * Custom prefix to announce when `document.title` is empty.
   * Defaults to `"Navigated to"`.
   */
  prefix?: string;

  /**
   * Additional root classes.
   */
  class?: string;

  /**
   * Custom slot overrides.
   */
  ui?: Partial<{
    root?: string;
  }>;
}
