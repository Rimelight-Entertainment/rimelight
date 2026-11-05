import type { JSX } from "@solidjs/web";
import type { InferThemeProps } from "../../resolver";
import type { RLButtonProps } from "../button/button.types";
import type { RLPageSectionTheme } from "./page-section.theme";

export type RLPageSectionProps = Omit<
  InferThemeProps<typeof RLPageSectionTheme>,
  | "layout"
  | "ctaVariant"
  | "orientation"
  | "reverse"
  | "headline"
  | "title"
  | "description"
  | "body"
> & {
  /**
   * The layout of the section.
   *
   * @default "default"
   */
  layout?: "default" | "hero" | "cta";
  /**
   * The variant of the section when it's a CTA.
   *
   * @default "solid"
   */
  ctaVariant?: "solid" | "outline" | "soft" | "subtle" | "ghost";
  /**
   * The headline displayed above the title.
   */
  headline?: string;
  /**
   * The icon displayed above the title.
   */
  icon?: string;
  /**
   * The section's title, displayed as a <h1> for the hero layout or <h2> otherwise.
   */
  title?: string;
  /**
   * The section's description, displayed under the title.
   */
  description?: string;
  /**
   * Display a list of buttons under the description.
   */
  links?: RLButtonProps[];
  /**
   * The orientation of the section.
   *
   * @default "vertical"
   */
  orientation?: "vertical" | "horizontal";
  /**
   * Reverse the order of the default slot.
   *
   * @default false
   */
  reverse?: boolean;
  /**
   * Set content-visibility for offscreen render painting optimization.
   */
  contentVisibility?: "auto" | "visible";
  /**
   * Dynamic intrinsic size fallback for content-visibility layout stability.
   */
  containIntrinsicSize?: string;
  backgroundSlot?: JSX.Element;
  headerSlot?: JSX.Element;
  leadingSlot?: JSX.Element;
  titleSlot?: JSX.Element;
  descriptionSlot?: JSX.Element;
  bodySlot?: JSX.Element;
  footerSlot?: JSX.Element;
  actionSlot?: JSX.Element;
  /** The root element owns its styling; `style` is not accepted. */
  style?: never;
};
