import type { ValidComponent } from "@solidjs/web";
import type { JSX } from "@solidjs/web";

export type BrowserMockupVariant =
  | "default"
  | "dark"
  | "light"
  | "outline"
  | "solid"
  | "soft"
  | "subtle"
  | "ghost";
export type BrowserMockupSize = "xs" | "sm" | "md" | "lg" | "xl";
export type BrowserMockupColor =
  | "default"
  | "blue"
  | "green"
  | "purple"
  | "red"
  | "yellow"
  | "neutral";

export interface RLBrowserMockupProps {
  ui?: any;
  class?: any;
  children?: JSX.Element;
  variant?: BrowserMockupVariant;
  size?: BrowserMockupSize;
  color?: BrowserMockupColor;
  controls?: boolean;
  controlsVariant?: string;
  padded?: boolean;
  shadow?: boolean;
  rounded?: boolean;
  as?: ValidComponent;
  navigation?: boolean;
  url?: string | URL;
  urlSlot?: JSX.Element;
  urlPrefixSlot?: JSX.Element;
  urlSuffixSlot?: JSX.Element;
  urlIcon?: string;
  urlPrefix?: string | boolean;
  headerSlot?: JSX.Element;
  controlsSlot?: JSX.Element;
  navigationSlot?: JSX.Element;
  actionsSlot?: JSX.Element;
  ariaLabel?: string;
  [key: string]: unknown;
}
