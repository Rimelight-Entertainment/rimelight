import type { JSX } from "@solidjs/web";

export interface LocaleItem {
  code: string;
  label: string;
  /**
   * The URL to navigate to when this locale is selected.
   *
   * Supply this to make the component fully routing-agnostic: it will use `href` directly. When
   * omitted, the component falls back to updating the first URL segment to match the locale code.
   */
  href?: string;
}

export interface RLLocaleSelectorProps {
  /**
   * Array of available locales to display in the selector.
   *
   * Accepts plain locale code strings (`"en"`, `"pt"`) or full `LocaleItem` objects. Supply an
   * `href` on each `LocaleItem` to make the component fully routing-agnostic — when every item has
   * an `href` the component no longer depends on Astro's i18n APIs at all.
   *
   * When omitted the component auto-detects available locales from `getRelativeLocaleUrlList()`
   * (requires Astro i18n).
   */
  locales?: string[] | LocaleItem[];
  /**
   * The currently active locale code. Used to pre-select the right option in the dropdown.
   *
   * When omitted the component falls back to `Astro.currentLocale`, which requires Astro's i18n
   * middleware to be running. Pass this prop explicitly when your project manages locale state
   * outside of Astro's built-in routing.
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
  leading?: JSX.Element;
  leadingIcon?: string;
  onSelect?: (item: LocaleItem) => void;
  onChange?: (e: Event & { currentTarget: HTMLSelectElement }) => void;
  [key: string]: unknown;
}
