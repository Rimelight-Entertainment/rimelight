import type { JSX } from "@solidjs/web";
import type { InferThemeProps } from "../../resolver";
import type { SlotRenderer } from "../../types";
import type { RLErrorProps } from "../error/error.types";
import type { RLErrorBoundaryTheme } from "./error-boundary.theme";

/**
 * Error boundary props. Renders a themed `div` root (`as` changes the tag) around the children.
 * When a child throws, `RLError` (or a custom `fallbackSlot`) renders in place of the children.
 * `theme` is forwarded to the default `RLError`. `@status stable`.
 */
export type RLErrorBoundaryProps = Omit<
  InferThemeProps<typeof RLErrorBoundaryTheme>,
  "children"
> & {
  /**
   * Content to protect. Any error thrown while rendering it (including rejected
   * async reads) is caught here.
   */
  children: JSX.Element;

  /**
   * Fully custom fallback. Receives `{ error, reset }`, where `reset` re-runs the children.
   * When omitted, `RLError` is rendered.
   * @default undefined
   */
  fallbackSlot?: SlotRenderer<{ error: unknown; reset: () => void }>;

  /**
   * When this value changes while an error is shown, the boundary resets.
   * Pass the route pathname so navigating away clears the error.
   * @default undefined
   */
  resetKey?: unknown;

  /**
   * Called once per caught error, e.g. to report it.
   * @default console.error
   */
  onError?: (error: unknown) => void;

  /**
   * Props forwarded to the default `RLError` (`fullscreen`, `color`, …).
   * @default undefined
   */
  errorProps?: Omit<RLErrorProps, "error">;

  /**
   * Label of the retry button shown for 5xx errors.
   * @default translated "Try again"
   */
  retryLabel?: string;

  /**
   * Label of the home button.
   * @default translated "Go home"
   */
  homeLabel?: string;

  /**
   * Target of the home button, localized automatically.
   * @default "/"
   */
  homeHref?: string;
};
