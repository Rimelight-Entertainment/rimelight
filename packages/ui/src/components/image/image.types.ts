import type { JSX } from "@solidjs/web";

export interface ImageMetadata {
  src: string;
  width?: number;
  height?: number;
  format?: string;
}

export interface RLImageProps {
  src?: string | ImageMetadata | undefined;
  lightSrc?: string | ImageMetadata | undefined;
  darkSrc?: string | ImageMetadata | undefined;
  mobileSrc?: string | ImageMetadata | undefined;
  desktopSrc?: string | ImageMetadata | undefined;
  breakpoint?: number;
  formats?: string[];
  widths?: number[];
  sizes?: string;
  densities?: number[];
  alt?: string | undefined;
  height?: string | number | undefined;
  width?: string | number | undefined;
  loading?: "eager" | "lazy" | undefined;
  decoding?: "async" | "auto" | "sync" | undefined;
  fit?: "cover" | "contain" | "fill" | "none" | undefined;
  caption?: string | undefined;
  figure?: boolean | undefined;
  lightbox?: boolean | undefined;
  theme?: unknown;
  metadata?:
    | {
        size?: number;
        format?: string;
        dimensions?: { width: number; height: number };
      }
    | undefined;
  open?: boolean | undefined;
  metaSource?: boolean | undefined;
  metaFormat?: boolean | undefined;
  metaDimensions?: boolean | undefined;
  metaSize?: boolean | undefined;
  metaAlt?: boolean | undefined;
  metaDownload?: boolean | undefined;
  ui?: any;
  class?: any;
  trigger?: JSX.Element;
  captionSlot?: JSX.Element;
  children?: JSX.Element;
  [key: string]: unknown;
}
