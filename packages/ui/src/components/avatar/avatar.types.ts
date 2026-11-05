import type { JSX } from "@solidjs/web";
import type { InferThemeProps } from "../../resolver";
import type { SlotRenderer } from "../../types";
import type { RLChipProps } from "../chip/chip.types";
import type { RLAvatarTheme } from "./avatar.theme";

export type RLAvatarProps = InferThemeProps<typeof RLAvatarTheme> & {
  /**
   * Image URL. When omitted, the fallback content is rendered.
   * @default undefined
   */
  src?: string | undefined;
  /**
   * Alt text for the image. Also used to derive initials when no `text` is given.
   * @default undefined
   */
  alt?: string | undefined;
  /**
   * Bare lucide icon name rendered as the fallback content.
   * @default undefined
   */
  icon?: string | undefined;
  /**
   * Custom fallback content rendered in place of `icon`.
   * @default undefined
   */
  iconSlot?: SlotRenderer;
  /**
   * Fallback text (e.g. initials) rendered when no image is available.
   * When omitted, initials are derived from `alt`.
   * @default undefined
   */
  text?: string | undefined;
  /**
   * Chip (indicator) configuration. `true` renders an inset chip.
   * @default false
   */
  chip?: boolean | RLChipProps | undefined;
  /**
   * Badge content. A string or number is rendered as text; `true` renders an empty badge.
   * @default false
   */
  badge?: boolean | string | number | undefined;
  /**
   * Badge color. Forwarded to the chip.
   * @default undefined
   */
  badgeColor?: string | undefined;
  /**
   * Corner of the avatar where the badge is placed.
   * @default "bottom-right"
   */
  position?: "top-right" | "bottom-right" | "top-left" | "bottom-left" | undefined;
  /**
   * Image loading strategy.
   * @default undefined
   */
  loading?: "lazy" | "eager" | undefined;
  /**
   * Referrer policy used when fetching the image.
   * @default undefined
   */
  referrerpolicy?:
    | ""
    | "no-referrer"
    | "no-referrer-when-downgrade"
    | "origin"
    | "origin-when-cross-origin"
    | "same-origin"
    | "strict-origin"
    | "strict-origin-when-cross-origin"
    | "unsafe-url"
    | undefined;
  /**
   * CORS setting used when fetching the image.
   * @default undefined
   */
  crossorigin?: "" | "anonymous" | "use-credentials" | undefined;
  /**
   * Decoding hint for the image.
   * @default undefined
   */
  decoding?: "async" | "auto" | "sync" | undefined;
  /**
   * Intrinsic height of the image.
   * @default undefined
   */
  height?: string | number | undefined;
  /**
   * Intrinsic width of the image.
   * @default undefined
   */
  width?: string | number | undefined;
  /**
   * Sizes attribute of the image.
   * @default undefined
   */
  sizes?: string | undefined;
  /**
   * Srcset attribute of the image.
   * @default undefined
   */
  srcset?: string | undefined;
  /**
   * Image map name the image uses.
   * @default undefined
   */
  usemap?: string | undefined;
  /**
   * Display name rendered adjacent to the avatar (e.g. "Daniel Marchi"). Also used as the
   * accessible name when the avatar has no image.
   * @default undefined
   */
  title?: string | undefined;
  /**
   * Secondary description rendered below the title (e.g. "Lead Developer").
   * @default undefined
   */
  subtitle?: string | undefined;
  /**
   * Custom fallback content rendered in place of the icon and text.
   * @default undefined
   */
  fallbackSlot?: SlotRenderer;
  /**
   * Custom badge content rendered inside the chip. Replaces `badge` text.
   * @default undefined
   */
  badgeSlot?: SlotRenderer;
  /**
   * Extra attributes forwarded to the `<img>` element.
   * @default undefined
   */
  imgProps?: JSX.ImgHTMLAttributes<HTMLImageElement> | undefined;
};
