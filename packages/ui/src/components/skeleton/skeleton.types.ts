import type { InferThemeProps } from "../../resolver";
import type { RLSkeletonTheme } from "./skeleton.theme";

/**
 * Loading placeholder. Wraps children to mirror their geometry while loading.
 */
export type RLSkeletonProps = InferThemeProps<typeof RLSkeletonTheme> & {
  /**
   * Whether the skeleton shimmer is shown instead of the children.
   * @default true
   */
  loading?: boolean | undefined;

  /**
   * Border radius in pixels used when a measured child has none.
   * @default undefined
   */
  fallbackBorderRadius?: number | undefined;
};
