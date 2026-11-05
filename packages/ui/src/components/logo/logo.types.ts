import type { InferThemeProps } from "../../resolver";
import type { RLLogoTheme } from "./logo.theme";

export type RLLogoProps = Omit<InferThemeProps<typeof RLLogoTheme>, "as"> & {
  /**
   * Logo set key from the UI config `logos` map (e.g. `logomark`, `wordmark`).
   *
   * @default "logomark"
   */
  variant?: string;
  /**
   * Logo asset key within the set (e.g. `color`, `black`, `white`). When omitted, the
   * light and dark assets switch automatically.
   *
   * @default undefined
   */
  mode?: string;
  /**
   * Image URL that overrides the configured logo set.
   *
   * @default undefined
   */
  src?: string;
  /**
   * Alt text for the logo image. Also used as the root `aria-label`.
   *
   * @default ""
   */
  alt?: string;
  /**
   * Link target of the root element. Localized by the link.
   *
   * @default "/"
   */
  href?: string;
};
