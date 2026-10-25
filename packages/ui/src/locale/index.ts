import { getCurrentLocale, t } from "@rimelight/i18n";
import en from "./en.json";
import pt from "./pt.json";
import es from "./es.json";

const messages: Record<string, Record<string, string>> = { en, pt, es };

/**
 * One of ui's built-in strings in the current locale.
 * Apps override it in their i18n JSON under `rimelight.ui` (e.g. `rimelight.ui.error.retry`).
 */
export const uiT = (key: string): string =>
  t.raw<string | undefined>(`rimelight.ui.${key}`) ??
  messages[getCurrentLocale()]?.[key] ??
  messages["en"]?.[key] ??
  key;
