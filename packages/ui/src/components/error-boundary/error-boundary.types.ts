import type { JSX } from "@solidjs/web";
import type { RLErrorProps } from "../error/error.types";

export interface RLErrorBoundaryProps {
  /**
   * Content to protect. Any error thrown while rendering it (including rejected
   * async reads) is caught here.
   */
  children: JSX.Element;
  /**
   * Fully custom fallback. Receives the error and a `reset` function that re-runs the children.
   * When omitted, `RLError` is rendered.
   */
  fallback?: (error: unknown, reset: () => void) => JSX.Element;
  /**
   * When this value changes while an error is shown, the boundary resets.
   * Pass the route pathname so navigating away clears the error.
   */
  resetKey?: unknown;
  /**
   * Called once per caught error, e.g. to report it. (default: `console.error`)
   */
  onError?: (error: unknown) => void;
  /**
   * Props forwarded to the default `RLError` (`fullscreen`, `ui`, …).
   */
  errorProps?: Omit<RLErrorProps, "error">;
  /**
   * Label of the retry button shown for 5xx errors. (default: translated "Try again")
   */
  retryLabel?: string;
  /**
   * Label of the home button. (default: translated "Go home")
   */
  homeLabel?: string;
  /**
   * Target of the home button, localized automatically. (default: "/")
   */
  homeHref?: string;
}
