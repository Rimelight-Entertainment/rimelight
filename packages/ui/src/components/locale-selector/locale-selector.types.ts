import type { JSX } from "@solidjs/web";
import type { InferThemeProps } from "../../resolver";
import type { RLLocaleSelectorTheme } from "./locale-selector.theme";

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

/**
 * Locale selector props. `@status stable`.
 */
export type RLLocaleSelectorProps = InferThemeProps<typeof RLLocaleSelectorTheme> & {
  /**
   * Locales to show. Accepts codes (`"en"`) or `LocaleItem` objects; labels default to
   * each language's own name.
   * @default every locale configured in @rimelight/i18n
   */
  locales?: string[] | LocaleItem[];

  /**
   * Active locale code, pre-selected in the dropdown.
   * @default the current locale from @rimelight/i18n
   */
  currentLocale?: string;

  /**
   * Display mode. `icon` renders a compact icon-only trigger.
   * @default "select"
   */
  mode?: "select" | "icon";

  /**
   * Called with the selected item before navigation.
   * @default undefined
   */
  onValueChange?: (item: LocaleItem) => void;

  /**
   * Icon shown in the trigger.
   * @default "i-lucide-globe"
   */
  leadingIcon?: string;

  /**
   * Content rendered before the select.
   * @default undefined
   */
  leadingSlot?: JSX.Element;

  /**
   * Content rendered after the select.
   * @default undefined
   */
  children?: JSX.Element;
};
