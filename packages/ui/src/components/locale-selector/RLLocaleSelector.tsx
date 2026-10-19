import type { RLLocaleSelectorProps, LocaleItem } from "./locale-selector.types";
import { RLLocaleSelectorTheme } from "./locale-selector.theme";
import { createMemo, createSignal, omit, onSettled, type Component } from "solid-js";
import { RLSelect } from "../select/RLSelect";

const getLocaleDisplayName = (localeCode: string): string => {
  try {
    const formatter = new Intl.DisplayNames([localeCode], { type: "language" });
    const nativeName = formatter.of(localeCode);
    return nativeName
      ? nativeName.charAt(0).toUpperCase() + nativeName.slice(1)
      : localeCode.toUpperCase();
  } catch {
    return localeCode.toUpperCase();
  }
};

export const RLLocaleSelector: Component<RLLocaleSelectorProps> = (props) => {
  const rest = omit(
    props,
    "locales",
    "currentLocale",
    "mode",
    "variant",
    "size",
    "theme",
    "ui",
    "class",
    "children",
    "labelSlot",
    "leading",
    "leadingIcon",
    "onSelect",
    "onChange",
  );

  const currentCode = (): string => props.currentLocale ?? "en";

  const processedLocales = createMemo<LocaleItem[]>(() =>
    (props.locales ?? []).map((item) =>
      typeof item === "string"
        ? { code: item, label: getLocaleDisplayName(item) }
        : { ...item, label: item.label || getLocaleDisplayName(item.code) },
    ),
  );

  const resolveTargetUrl = (item: LocaleItem, pathname: string, search: string): string => {
    if (item.href !== undefined && item.href !== null) {
      return item.href + (item.href.includes("?") ? "" : search);
    }
    const knownCodes = new Set(processedLocales().map((l) => l.code));
    const segments = pathname.split("/").filter(Boolean);
    const firstIsLocale = segments.length > 0 && knownCodes.has(segments[0]!);

    if (firstIsLocale) {
      segments[0] = item.code;
      return `/${segments.join("/")}${pathname.endsWith("/") ? "/" : ""}${search}`;
    }
    if (segments.length > 0) {
      return `/${item.code}/${segments.join("/")}${pathname.endsWith("/") ? "/" : ""}${search}`;
    }
    return `/${item.code}/${search}`;
  };

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

  const classes = createMemo(() =>
    RLLocaleSelectorTheme({
      ui: props.ui,
      class: props.class,
    }),
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
          aria-label="Select language"
          class={classes().select}
          leadingIcon={props.leadingIcon || "i-lucide-globe"}
          leading={props.leading}
        />
      </div>
      {props.children}
    </div>
  );
};
