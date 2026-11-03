import type { JSX } from "@solidjs/web";
import type { InferThemeProps } from "../../resolver";
import type { RLChipProps } from "../chip/chip.types";
import type { RLAvatarTheme } from "./avatar.theme";

export type RLAvatarProps = InferThemeProps<typeof RLAvatarTheme> & {
  /**
   * Image URL. When omitted, the fallback content is rendered.
   */
  src?: string | undefined;
  /**
   * Alt text for the image. Also used to derive initials when no `text` is given.
   */
  alt?: string | undefined;
  /**
   * Icon name rendered as the fallback content (e.g. `i-lucide-user`).
   */
  icon?: string | undefined;
  /**
   * Custom fallback content rendered in place of `icon`.
   */
  iconSlot?: JSX.Element | undefined;
  /**
   * Fallback text (e.g. initials) rendered when no image is available.
   * When omitted, initials are derived from `alt`.
   */
  text?: string | undefined;
  /**
   * Chip (indicator) configuration. `true` renders an inset chip.
   *
   * @default false
   */
  chip?: boolean | RLChipProps | undefined;
  /**
   * Badge content. A string or number is rendered as text; `true` renders an empty badge.
   *
   * @default false
   */
  badge?: boolean | string | number | undefined;
  /**
   * Badge color. Forwarded to the chip.
   */
  badgeColor?: string | undefined;
  /**
   * Image loading strategy.
   */
  loading?: "lazy" | "eager" | undefined;
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
  crossorigin?: "" | "anonymous" | "use-credentials" | undefined;
  decoding?: "async" | "auto" | "sync" | undefined;
  height?: string | number | undefined;
  width?: string | number | undefined;
  sizes?: string | undefined;
  srcset?: string | undefined;
  usemap?: string | undefined;
  /**
   * Display name rendered adjacent to the avatar (e.g. "Daniel Marchi"). Also used as the
   * accessible name when the avatar has no image.
   */
  title?: string | undefined;
  /**
   * Secondary description rendered below the title (e.g. "Lead Developer").
   */
  subtitle?: string | undefined;
  /**
   * Custom fallback content rendered in place of the icon and text.
   */
  fallbackSlot?: JSX.Element | undefined;
  /**
   * Custom badge content rendered inside the chip.
   */
  badgeSlot?: JSX.Element | undefined;
  /**
   * Extra attributes forwarded to the `<img>` element.
   */
  imgProps?: JSX.ImgHTMLAttributes<HTMLImageElement> | undefined;
};
