import type { RLLocaleSelectorProps, LocaleItem } from "./locale-selector.types";
import { RLLocaleSelectorTheme } from "./locale-selector.theme";
import { createMemo, createSignal, onSettled, type Component } from "solid-js";
import { RLSelect } from "../select/RLSelect";
import { getCurrentLocale, getLocaleInfo, getLocales, getLocaleUrl } from "@rimelight/i18n";
import { uiT } from "../../locale";

const OMIT_KEYS = [
  "locales",
  "currentLocale",
  "mode",
  "variant",
  "size",
  "labelSlot",
  "leading",
  "leadingIcon",
  "onSelect",
  "onChange",
] as const;

export const RLLocaleSelector: Component<RLLocaleSelectorProps> = (props) => {
  const { classes, rest } = RLLocaleSelectorTheme.setup(props, { omit: OMIT_KEYS });

  const currentCode = (): string => props.currentLocale ?? getCurrentLocale();

  const processedLocales = createMemo<LocaleItem[]>(() =>
    (props.locales ?? getLocales()).map((item) =>
      typeof item === "string"
        ? { code: item, label: getLocaleInfo(item).label }
        : { ...item, label: item.label || getLocaleInfo(item.code).label },
    ),
  );

  /** An item's own `href`, otherwise the current page in that locale. */
  const resolveTargetUrl = (item: LocaleItem, pathname: string, search: string): string =>
    item.href ?? getLocaleUrl(pathname + search, item.code);

  const [currentSearch, setCurrentSearch] = createSignal("");
  const [currentPathname, setCurrentPathname] = createSignal("/");

  onSettled(() => {
    if (typeof window === "undefined") return;
    setCurrentSearch(window.location.search);
    setCurrentPathname(window.location.pathname);
  });

  const items = createMemo(() =>
    processedLocales().map((item) => ({
      label: item.label,
      value: item.code,
      href: resolveTargetUrl(item, currentPathname(), currentSearch()),
    })),
  );

  const isIconMode = () => props.mode === "icon" || props.variant === "icon";

  const handleChange = (e: Event & { currentTarget: HTMLSelectElement }) => {
    const selectedCode = e.currentTarget.value;
    const found = processedLocales().find((i) => i.code === selectedCode);
    if (found) {
      const pathname = typeof window !== "undefined" ? window.location.pathname : currentPathname();
      const search = typeof window !== "undefined" ? window.location.search : currentSearch();
      const href = resolveTargetUrl(found, pathname, search);
      props.onSelect?.({ label: found.label, code: found.code, href });
      if (href && typeof window !== "undefined") {
        window.location.href = href;
      }
    }
    props.onChange?.(e);
  };

  return (
    <div
      class={classes().root}
      data-locale-selector
      data-mode={isIconMode() ? "icon" : "select"}
      data-theme={props.theme}
      {...rest}
    >
      <div class={classes().wrapper}>
        <RLSelect
          items={items()}
          value={currentCode()}
          onChange={handleChange}
          size={(props.size as any) || "md"}
          variant={isIconMode() ? "icon" : "default"}
          aria-label={uiT("localeSelector.label")}
          class={classes().select}
          leadingIcon={props.leadingIcon || "i-lucide-globe"}
          leading={props.leading}
        />
      </div>
      {props.children}
    </div>
  );
};
