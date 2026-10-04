import type { JSX } from "@solidjs/web";
import type { ThemeColor } from "../../types";
import type { RLChipProps } from "../chip/chip";

export interface RLAvatarProps {
  /**
   * The element or component this component should render as.
   *
   * @default "span"
   */
  as?: any;
  src?: string | undefined;
  alt?: string | undefined;
  icon?: any;
  text?: string | undefined;
  /**
   * Fallback text (alias for text / initials).
   */
  fallback?: string | undefined;
  /**
   * Compact initials displayed inside the avatar (alias for text / fallback).
   */
  initials?: string | undefined;
  /**
   * Avatar size.
   *
   * @default "md"
   */
  size?:
    | "3xs"
    | "2xs"
    | "xs"
    | "sm"
    | "md"
    | "lg"
    | "xl"
    | "2xl"
    | "3xl"
    | "4xl"
    | "5xl"
    | "6xl"
    | "7xl"
    | "8xl"
    | "9xl"
    | "10xl"
    | "11xl"
    | "12xl"
    | (string & {})
    | undefined;
  /**
   * Color variant.
   *
   * @default "neutral"
   */
  color?:
    | "error"
    | "primary"
    | "secondary"
    | "success"
    | "info"
    | "warning"
    | "neutral"
    | ThemeColor
    | undefined;
  chip?: boolean | RLChipProps | undefined;
  badge?: boolean | string | number | undefined;
  badgeColor?: string | undefined;
  badgePosition?: "top-right" | "bottom-right" | "top-left" | "bottom-left" | undefined;
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
   * Display name rendered adjacent to the avatar (e.g. "Daniel Marchi")
   */
  title?: string | undefined;
  /**
   * Secondary description rendered below the title (e.g. "Lead Developer")
   */
  subtitle?: string | undefined;
  /**
   * Accessible aria-label fallback for screen readers when avatar is purely visual
   */
  label?: string;
  /**
   * Slot-specific CSS class overrides.
   */
  ui?: {
    root?: any;
    image?: any;
    fallback?: any;
    icon?: any;
    badge?: any;
    wrapper?: any;
    title?: any;
    subtitle?: any;
  };
  /**
   * Additional CSS classes to apply to the root element.
   */
  class?: any;
  children?: JSX.Element;
  fallbackSlot?: JSX.Element;
  badgeSlot?: JSX.Element;
  imgProps?: JSX.ImgHTMLAttributes<HTMLImageElement>;
  [key: string]: unknown;
}
