import type { SlotRenderer } from "../../types";
import type { InferThemeProps } from "../../resolver";
import type { RLImageTheme } from "./image.theme";

export interface ImageMetadata {
  src: string;
  width?: number;
  height?: number;
  format?: string;
}

export type RLImageProps = InferThemeProps<typeof RLImageTheme> & {
  /**
   * Image source URL or metadata object.
   */
  src?: string | ImageMetadata | undefined;

  /**
   * Source displayed in light color mode.
   */
  lightSrc?: string | ImageMetadata | undefined;

  /**
   * Source displayed in dark color mode.
   */
  darkSrc?: string | ImageMetadata | undefined;

  /**
   * Source displayed below the breakpoint.
   */
  mobileSrc?: string | ImageMetadata | undefined;

  /**
   * Source displayed at or above the breakpoint.
   */
  desktopSrc?: string | ImageMetadata | undefined;

  /**
   * Breakpoint in pixels between mobile and desktop sources.
   * @default 768
   */
  breakpoint?: number | undefined;

  /**
   * Image formats offered to the browser.
   */
  formats?: string[] | undefined;

  /**
   * Image widths offered to the browser.
   */
  widths?: number[] | undefined;

  /**
   * Responsive sizes attribute.
   */
  sizes?: string | undefined;

  /**
   * Pixel densities offered to the browser.
   */
  densities?: number[] | undefined;

  /**
   * Alternative text describing the image.
   * @default ""
   */
  alt?: string | undefined;

  /**
   * Rendered height of the image.
   */
  height?: string | number | undefined;

  /**
   * Rendered width of the image.
   */
  width?: string | number | undefined;

  /**
   * Native image loading strategy.
   * @default "lazy"
   */
  loading?: "eager" | "lazy" | undefined;

  /**
   * Native image decoding strategy.
   * @default "async"
   */
  decoding?: "async" | "auto" | "sync" | undefined;

  /**
   * Caption displayed below the image.
   */
  caption?: string | undefined;

  /**
   * Wrap the image in a figure element.
   * @default Boolean(caption)
   */
  figure?: boolean | undefined;

  /**
   * Open the image in a lightbox dialog when clicked.
   * @default true
   */
  lightbox?: boolean | undefined;

  /**
   * Static metadata shown in the lightbox.
   */
  metadata?:
    | {
        size?: number;
        format?: string;
        dimensions?: { width: number; height: number };
      }
    | undefined;

  /**
   * Whether the lightbox dialog is open.
   * @default false
   */
  open?: boolean | undefined;

  /**
   * Event fired when the lightbox opens or closes.
   */
  onOpenChange?: ((open: boolean) => void) | undefined;

  /**
   * Show the source row in the lightbox.
   * @default true
   */
  metaSource?: boolean | undefined;

  /**
   * Show the format row in the lightbox.
   * @default true
   */
  metaFormat?: boolean | undefined;

  /**
   * Show the dimensions row in the lightbox.
   * @default true
   */
  metaDimensions?: boolean | undefined;

  /**
   * Show the size row in the lightbox.
   * @default true
   */
  metaSize?: boolean | undefined;

  /**
   * Show the alt text row in the lightbox.
   * @default true
   */
  metaAlt?: boolean | undefined;

  /**
   * Show the download button in the lightbox.
   * @default true
   */
  metaDownload?: boolean | undefined;

  /**
   * Custom JSX replacing the default trigger.
   */
  triggerSlot?: SlotRenderer;

  /**
   * Custom JSX rendered after the caption.
   */
  captionSlot?: SlotRenderer;
};
