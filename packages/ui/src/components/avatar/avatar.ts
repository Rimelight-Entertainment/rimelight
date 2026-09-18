import type { ThemeColor } from "../../types"
import type { ChipProps } from "../chip/chip"

export interface AvatarProps {
  /**
   * The component the root element should render as.
   *
   * @default "span"
   */
  as?: any
  src?: string | undefined
  alt?: string | undefined
  icon?: any
  text?: string | undefined
  fallback?: string | undefined
  /**
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
    | undefined
  /**
   * @default "neutral"
   */
  color?: ThemeColor | undefined
  chip?: boolean | ChipProps | undefined
  badge?: boolean | string | number | undefined
  badgeColor?: string | undefined
  badgePosition?: "top-right" | "bottom-right" | "top-left" | "bottom-left" | undefined
  loading?: "lazy" | "eager" | undefined
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
    | undefined
  crossorigin?: "" | "anonymous" | "use-credentials" | undefined
  decoding?: "async" | "auto" | "sync" | undefined
  height?: string | number | undefined
  width?: string | number | undefined
  sizes?: string | undefined
  srcset?: string | undefined
  usemap?: string | undefined
  /**
   * Compact initials displayed inside the avatar circle (alias for fallback)
   */
  initials?: string | undefined
  /**
   * Display name rendered adjacent to the avatar (e.g. "Daniel Marchi")
   */
  title?: string | undefined
  /**
   * Secondary description rendered below the title (e.g. "Lead Developer")
   */
  subtitle?: string | undefined
  /**
   * Accessible aria-label fallback for screen readers when avatar is purely visual
   */
  label?: string
  /**
   * Slot-specific CSS class overrides.
   */
  ui?: any
  /**
   * Additional CSS classes to apply to the root element.
   */
  class?: any
  [key: string]: unknown
}
