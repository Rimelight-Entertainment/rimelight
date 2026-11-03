import type { JSX } from "@solidjs/web";
import type { ThemeColor } from "../../types";

export interface LocaleItem {
  code: string;
  label: string;
  /**
   * The URL to navigate to when this locale is selected.
   *
   * When omitted, the current page in this locale (via i18n's `getLocaleUrl`).
   */
  href?: string;
}

export interface RLLocaleSelectorProps {
  /**
   * Array of available locales to display in the selector.
   *
   * Accepts plain locale code strings (`"en"`, `"pt"`) or full `LocaleItem` objects. Labels
   * default to each language's own name.
   *
   * When omitted, every locale configured in @rimelight/i18n.
   */
  locales?: string[] | LocaleItem[];
  /**
   * The currently active locale code. Used to pre-select the right option in the dropdown.
   *
   * When omitted, the current locale from @rimelight/i18n.
   */
  currentLocale?: string;
  /**
   * The display mode of the locale selector.
   *
   * @default "select"
   */
  mode?: "select" | "icon";
  /**
   * The styling variant of the language selection element.
   *
   * @default "default"
   */
  variant?: "default" | "outline" | "ghost" | "icon";
  /**
   * Color theme override.
   */
  color?: ThemeColor;
  /**
   * The size scale of typography and spacing metrics.
   *
   * @default "md"
   */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /**
   * The color theme mode override for this component.
   */
  theme?: "light" | "dark";
  /**
   * Slot-specific CSS class overrides.
   */
  ui?: any;
  /**
   * Additional CSS classes to apply to the root element.
   */
  class?: any;
  children?: JSX.Element;
  labelSlot?: JSX.Element;
  leadingSlot?: JSX.Element;
  leadingIcon?: string;
  onSelect?: (item: LocaleItem) => void;
  onChange?: (e: Event & { currentTarget: HTMLSelectElement }) => void;
  [key: string]: unknown;
}
