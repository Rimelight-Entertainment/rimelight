import type { InferThemeProps } from "../../resolver";
import type { SlotRenderer } from "../../types";
import type { RLButtonProps } from "../button/button.types";
import type { RLPageSectionTheme } from "./page-section.theme";

/** Page section props. */
export type RLPageSectionProps = Omit<
  InferThemeProps<typeof RLPageSectionTheme>,
  "layout" | "ctaVariant" | "orientation" | "contentVisibility" | "hasHeadline" | "hasTitle"
> & {
  /** Section layout. @default "default" */
  layout?: "default" | "hero" | "cta";
  /** Surface treatment used when `layout` is `"cta"`. @default "solid" */
  ctaVariant?: "solid" | "outline" | "soft" | "subtle" | "ghost";
  /** Eyebrow text rendered above the title. */
  headline?: string;
  /** Icon name rendered in the leading slot position. */
  icon?: string;
  /** Section title. Rendered as an `h1` in the hero layout and an `h2` otherwise. */
  title?: string;
  /** Section description rendered below the title. */
  description?: string;
  /** Links rendered in the footer. */
  links?: RLButtonProps[];
  /** Arrangement of the header and body. @default "vertical" */
  orientation?: "vertical" | "horizontal";
  /** Places the wrapper after the body on the default and cta layouts, and before it on hero. */
  reverse?: boolean;
  /** Skips rendering of offscreen content with `content-visibility: auto`. */
  contentVisibility?: "auto";
  /** Intrinsic size used while offscreen content is skipped, such as `"auto 500px"`. */
  containIntrinsicSize?: string;
  /** Replaces the background layer. */
  backgroundSlot?: SlotRenderer;
  /** Replaces the whole header block, including the default leading, title, and description. */
  headerSlot?: SlotRenderer;
  /** Replaces the leading icon. */
  leadingSlot?: SlotRenderer;
  /** Replaces the title text. */
  titleSlot?: SlotRenderer;
  /** Replaces the description text. */
  descriptionSlot?: SlotRenderer;
  /** Content rendered between the header and the footer. */
  bodySlot?: SlotRenderer;
  /** Replaces the footer, including `links` and `actionSlot`. */
  footerSlot?: SlotRenderer;
  /** Content rendered after `links` in the footer. */
  actionSlot?: SlotRenderer;
  style?: never;
};
