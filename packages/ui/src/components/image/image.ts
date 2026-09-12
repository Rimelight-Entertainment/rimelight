import type { ImageMetadata } from "astro"

export interface ImageMetadataInfo {
  width?: number
  height?: number
  size?: number
  format?: string
}

export interface ImageProps {
  src?: string | ImageMetadata
  lightSrc?: string | ImageMetadata
  darkSrc?: string | ImageMetadata
  mobileSrc?: string | ImageMetadata
  desktopSrc?: string | ImageMetadata
  breakpoint?: number
  formats?: ("avif" | "webp" | "png" | "jpg" | "jpeg" | "svg")[]
  widths?: (number | `${number}w` | `${number}x`)[] | number[]
  sizes?: string
  densities?: (number | `${number}x`)[]
  alt?: string
  height?: string | number
  width?: string | number
  loading?: "lazy" | "eager"
  decoding?: "async" | "sync" | "auto"
  fit?: "cover" | "contain" | "fill" | "none" | "scale-down" | "inside" | "outside"
  /**
   * Optional caption text rendered in a `<figcaption>`.
   */
  caption?: string
  /**
   * Whether to wrap the image in a semantic `<figure>` element. Defaults to `true` when `caption`
   * is present, or `false` otherwise.
   */
  figure?: boolean
  /**
   * Whether clicking the image opens the interactive metadata dialog / lightbox. Defaults to
   * `true`. Set to `false` for a lightweight, non-interactive image without modal or scripts.
   */
  lightbox?: boolean
  /**
   * Alias for `lightbox`.
   */
  interactive?: boolean
  /**
   * Theme override — pins the image rendering to `"light"` or `"dark"` color-scheme context,
   * causing `light-dark()` variables to resolve to the correct scheme regardless of the global page
   * mode.
   */
  theme?: "light" | "dark"
  metadata?: ImageMetadataInfo
  open?: boolean
  metaSource?: boolean
  metaFormat?: boolean
  metaDimensions?: boolean
  metaSize?: boolean
  metaAlt?: boolean
  metaDownload?: boolean
  ui?: any
  class?: any
  [key: string]: unknown
}
