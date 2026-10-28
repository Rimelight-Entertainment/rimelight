import type { JSX } from "@solidjs/web";
import { getCurrentLocale, t } from "@rimelight/i18n";
import en from "./en.json";
import pt from "./pt.json";
import es from "./es.json";

// Locale files are nested like every other Rimelight project; lookups use dotted keys.
type Dictionary = { [key: string]: string | Dictionary };
const flatten = (dict: Dictionary, prefix = ""): Record<string, string> =>
  Object.entries(dict).reduce<Record<string, string>>((out, [key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "string") out[path] = value;
    else Object.assign(out, flatten(value, path));
    return out;
  }, {});

const messages: Record<string, Record<string, string>> = {
  en: flatten(en),
  pt: flatten(pt),
  es: flatten(es),
};

/**
 * One of ui's built-in strings in the current locale.
 * Apps override it in their i18n JSON under `rimelight.ui` (e.g. `rimelight.ui.error.retry`).
 */
/**
 * A translated sentence with `{name}` tokens replaced by JSX nodes, e.g. keyboard keys.
 * Tokens without a matching node stay as literal text.
 */
export const uiNodes = (key: string, nodes: Record<string, JSX.Element>): JSX.Element[] =>
  uiT(key)
    .split(/(\{\w+\})/)
    .map((part) => {
      const name = part.match(/^\{(\w+)\}$/)?.[1];
      return name && name in nodes ? nodes[name] : part;
    });

export const uiT = (key: string): string =>
  t.raw<string | undefined>(`rimelight.ui.${key}`) ??
  messages[getCurrentLocale()]?.[key] ??
  messages["en"]?.[key] ??
  key;
