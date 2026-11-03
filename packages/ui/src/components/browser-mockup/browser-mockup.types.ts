import type { JSX } from "@solidjs/web";
import type { InferThemeProps } from "../../resolver";
import type { RLBrowserMockupTheme } from "./browser-mockup.theme";

export type RLBrowserMockupProps = InferThemeProps<typeof RLBrowserMockupTheme> & {
  /**
   * Shows the window controls (dots) in the header.
   *
   * @default true
   */
  controls?: boolean;
  /**
   * Shows the back, forward and reload buttons in the header.
   *
   * @default false
   */
  navigation?: boolean;
  /**
   * Address shown in the URL bar.
   */
  url?: string | URL;
  /**
   * Icon name shown as the URL prefix when `urlPrefix` is not a string.
   *
   * @default "lock"
   */
  urlIcon?: string;
  /**
   * URL prefix text. `false` hides the prefix; a string replaces the icon with text.
   *
   * @default true (renders `urlIcon`)
   */
  urlPrefix?: string | boolean;
  /**
   * Custom content that replaces the whole header.
   */
  headerSlot?: JSX.Element;
  /**
   * Custom content that replaces the window controls.
   */
  controlsSlot?: JSX.Element;
  /**
   * Custom content that replaces the navigation buttons.
   */
  navigationSlot?: JSX.Element;
  /**
   * Custom content that replaces the URL bar.
   */
  urlSlot?: JSX.Element;
  /**
   * Custom content rendered before the URL text.
   */
  urlPrefixSlot?: JSX.Element;
  /**
   * Custom content rendered after the URL text.
   */
  urlSuffixSlot?: JSX.Element;
  /**
   * Custom content rendered at the end of the header.
   */
  actionsSlot?: JSX.Element;
};
