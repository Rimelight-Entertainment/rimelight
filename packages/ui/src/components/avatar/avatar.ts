import type { ChipProps } from "../chip/chip"

export interface AvatarProps {
  /**
   * The component the root element should render as.
   *
   * @default "span"
   */
  as?: any
  src?: string
  alt?: string
  icon?: any
  text?: string
  fallback?: string
  /**
   * @default "md"
   */
  size?: "3xs" | "2xs" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl"
  /**
   * @default "neutral"
   */
  color?:
    | "neutral"
    | "primary"
    | "secondary"
    | "info"
    | "success"
    | "warning"
    | "error"
    | "commentary"
    | "ideation"
    | "source"
  chip?: boolean | ChipProps
  badge?: boolean | string | number
  badgeColor?: string
  badgePosition?: "top-right" | "bottom-right" | "top-left" | "bottom-left"
  loading?: "lazy" | "eager"
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
  crossorigin?: "" | "anonymous" | "use-credentials"
  decoding?: "async" | "auto" | "sync"
  height?: string | number
  width?: string | number
  sizes?: string
  srcset?: string
  usemap?: string
  /**
   * Compact initials displayed inside the avatar circle (alias for fallback)
   */
  initials?: string
  /**
   * Display name rendered adjacent to the avatar (e.g. "Daniel Marchi")
   */
  title?: string
  /**
   * Secondary description rendered below the title (e.g. "Lead Developer")
   */
  subtitle?: string
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
