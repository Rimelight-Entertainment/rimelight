import type { JSX } from "@solidjs/web";
import type { InferThemeProps } from "../../resolver";
import type { RLHeaderTheme } from "./header.theme";

export type RLHeaderProps = Omit<
  InferThemeProps<typeof RLHeaderTheme>,
  "contain" | "sticky" | "fixed"
> & {
  /**
   * Whether the header content is constrained to the max-width container.
   *
   * @default true
   */
  contain?: boolean;
  /**
   * Whether the header sticks to the top of the viewport when scrolling.
   *
   * @default true
   */
  sticky?: boolean;
  /**
   * Whether the header is fixed to the viewport. Overrides `sticky`.
   *
   * @default false
   */
  fixed?: boolean;
  /**
   * Stacking order among registered headers.
   *
   * @default 0
   */
  stackIndex?: number;
  /**
   * Whether the header collapses when scrolling down.
   *
   * @default false
   */
  hideOnScroll?: boolean;
  /**
   * Layer role: a regular header or a banner stacked above it.
   *
   * @default "header"
   */
  layerType?: "header" | "banner";
  /**
   * Content rendered in the leading area.
   *
   * @default undefined
   */
  leadingSlot?: JSX.Element;
  /**
   * Replaces the center area content. Falls back to `children` when omitted.
   *
   * @default undefined
   */
  centerSlot?: JSX.Element;
  /**
   * Content rendered in the trailing area.
   *
   * @default undefined
   */
  trailingSlot?: JSX.Element;
};
