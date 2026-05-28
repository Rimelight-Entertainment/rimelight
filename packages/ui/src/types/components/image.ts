import type { ImageMetadata } from "astro"

export interface ImageMetadataInfo {
  width?: number
  height?: number
  size?: number
  format?: string
}

export interface ImageProps {
  src?: string | ImageMetadata
  mobileSrc?: string | ImageMetadata
  desktopSrc?: string | ImageMetadata
  breakpoint?: number
  formats?: ("avif" | "webp" | "png" | "jpg" | "jpeg" | "svg")[]
  alt?: string
  height?: string | number
  width?: string | number
  loading?: "lazy" | "eager"
  fit?: "cover" | "contain" | "fill" | "inside" | "outside"
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
