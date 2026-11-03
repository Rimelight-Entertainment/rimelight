import type { ValidComponent } from "@solidjs/web";
import type { JSX } from "@solidjs/web";
import type { RLButtonProps } from "../button/button.types";

export interface RLPageSectionProps {
  /**
   * The element or component this component should render as.
   *
   * @default "section"
   */
  as?: ValidComponent;
  /**
   * The variant of the section.
   *
   * @default "default"
   */
  variant?: "default" | "hero" | "cta" | "none";
  /**
   * The variant of the section when it's a CTA.
   *
   * @default "solid"
   */
  ctaVariant?: "solid" | "outline" | "soft" | "subtle" | "naked";
  /**
   * The headline displayed above the title.
   */
  headline?: string;
  /**
   * The icon displayed above the title.
   */
  icon?: string;
  /**
   * The section's title, displayed as a <h1> for the hero variant or <h2> otherwise.
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
   * Slot-specific CSS class overrides.
   */
  ui?: any;
  /**
   * Additional CSS classes to apply to the root element.
   */
  class?: any;
  /**
   * Set content-visibility for offscreen render painting optimization.
   */
  contentVisibility?: "auto" | "visible";
  /**
   * Dynamic intrinsic size fallback for content-visibility layout stability.
   */
  containIntrinsicSize?: string;
  backgroundSlot?: JSX.Element;
  topSlot?: JSX.Element;
  headerSlot?: JSX.Element;
  leadingSlot?: JSX.Element;
  headlineSlot?: JSX.Element;
  titleSlot?: JSX.Element;
  descriptionSlot?: JSX.Element;
  bodySlot?: JSX.Element;
  footerSlot?: JSX.Element;
  linksSlot?: JSX.Element;
  contentSlot?: JSX.Element;
  bottomSlot?: JSX.Element;
  children?: JSX.Element;
  [key: string]: unknown;
}
