import type { JSX } from "@solidjs/web";
import type { InferThemeProps } from "../../resolver";
import type { RLVideoTheme } from "./video.theme";

export type RLVideoProps = InferThemeProps<typeof RLVideoTheme> & {
  /**
   * The URL of the YouTube video to embed.
   */
  src: string;
  /**
   * The title of the video. Used as the image alt text and the iframe title.
   *
   * @default "YouTube Video Player" (localized)
   */
  title?: string;
  /**
   * The name of the icon shown in the play trigger overlay.
   *
   * @default "play"
   */
  icon?: string;
  /**
   * Thumbnail image URL. When omitted, the YouTube thumbnail for `src` is used.
   */
  thumbnail?: string;
  /**
   * Custom content rendered in place of the play icon in the trigger overlay.
   */
  iconSlot?: JSX.Element;
  /**
   * Custom transcript content. Rendered below the player. Takes precedence over `children`.
   */
  transcriptSlot?: JSX.Element;
};
