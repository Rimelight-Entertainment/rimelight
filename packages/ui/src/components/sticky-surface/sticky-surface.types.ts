import type { InferThemeProps } from "../../resolver";
import type { RLStickySurfaceTheme } from "./sticky-surface.theme";

export type RLStickySurfaceProps = Omit<
  InferThemeProps<typeof RLStickySurfaceTheme>,
  "stuckShadow"
> & {
  /**
   * Whether a shadow is applied once the surface is stuck to the top edge.
   *
   * @default true
   */
  stuckShadow?: boolean;
  /**
   * Pixels offset from top when sticky.
   *
   * @default 0
   */
  offsetTop?: number;
  /**
   * Z-index layer depth.
   *
   * @default 10
   */
  zIndex?: number;
};
