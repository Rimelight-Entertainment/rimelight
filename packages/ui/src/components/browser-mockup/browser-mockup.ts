import type { ThemeColor } from "../../types";

export type BrowserMockupVariant = "outline" | "solid" | "soft" | "subtle" | "ghost";
export type BrowserMockupSize = "sm" | "md" | "lg" | "xl";
export type BrowserMockupColor =
  | "primary"
  | "secondary"
  | "success"
  | "info"
  | "warning"
  | "error"
  | "neutral"
  | ThemeColor;

export interface BrowserMockupUi {
  root?: string;
  header?: string;
  controls?: string;
  dot?: string;
  dotClose?: string;
  dotMinimize?: string;
  dotMaximize?: string;
  navigation?: string;
  navButton?: string;
  navBack?: string;
  navForward?: string;
  navReload?: string;
  urlBar?: string;
  urlPrefix?: string;
  urlIcon?: string;
  urlText?: string;
  urlSuffix?: string;
  actions?: string;
  body?: string;
  [key: string]: any;
}

export interface BrowserMockupProps {
  /**
   * The element or component this component should render as.
   *
   * @default "div"
   */
  as?: any;

  /**
   * Visual style variant.
   *
   * @default "outline"
   */
  variant?: BrowserMockupVariant | undefined;

  /**
   * Mockup size preset.
   *
   * @default "md"
   */
  size?: BrowserMockupSize | undefined;

  /**
   * Color theme variant for borders/accents.
   *
   * @default "neutral"
   */
  color?: BrowserMockupColor | undefined;

  /**
   * The URL or title displayed in the mock address bar.
   */
  url?: string | undefined;

  /**
   * Optional prefix inside URL bar (e.g. "https://" or lock icon).
   *
   * @default true
   */
  urlPrefix?: boolean | string | undefined;

  /**
   * Icon displayed inside the URL address bar (e.g., 'lock', 'search', 'link').
   *
   * @default "lock"
   */
  urlIcon?: string | undefined;

  /**
   * Whether to display the window control dots (close, minimize, expand).
   *
   * @default true
   */
  controls?: boolean | undefined;

  /**
   * Visual style for window control dots: colored (macOS style), monochrome (neutral style), or hidden.
   *
   * @default "color"
   */
  controlsVariant?: "color" | "monochrome" | "none" | undefined;

  /**
   * Whether to display navigation buttons (back, forward, refresh).
   *
   * @default false
   */
  navigation?: boolean | undefined;

  /**
   * Whether the body container has internal padding.
   *
   * @default true
   */
  padded?: boolean | undefined;

  /**
   * Whether the mockup has a drop shadow.
   *
   * @default true
   */
  shadow?: boolean | undefined;

  /**
   * Whether the mockup is rounded.
   *
   * @default true
   */
  rounded?: boolean | undefined;

  /**
   * Slot-specific CSS class overrides.
   */
  ui?: BrowserMockupUi | undefined;

  /**
   * Additional CSS classes to apply to the root element.
   */
  class?: any;

  /**
   * ARIA label for the browser mockup window.
   *
   * @default "Browser Mockup"
   */
  ariaLabel?: string | undefined;

  [key: string]: unknown;
}
