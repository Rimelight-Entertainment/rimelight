import type { ChipProps } from "./chip"

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
   * Slot-specific CSS class overrides.
   */
  ui?: any
  /**
   * Additional CSS classes to apply to the root element.
   */
  class?: any
  [key: string]: unknown
}
