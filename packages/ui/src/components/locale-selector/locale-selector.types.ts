import type { JSX } from "@solidjs/web";
import type { InferThemeProps } from "../../resolver";
import type { SlotRenderer } from "../../types";
import type { RLSelectProps } from "../select/select.types";
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
   * Icon name shown in the trigger.
   * @default "globe"
   */
  leadingIcon?: string;

  /**
   * Custom leading content, rendered in place of `leadingIcon` when present.
   * @default undefined
   */
  leadingSlot?: SlotRenderer;

  /**
   * Size scale, forwarded to the select.
   * @default "md"
   */
  size?: RLSelectProps["size"];

  /**
   * Visual style, forwarded to the select. `icon` mode defaults to `ghost`.
   * @default "solid"
   */
  variant?: RLSelectProps["variant"];

  /**
   * Content rendered after the select.
   * @default undefined
   */
  children?: JSX.Element;
};
