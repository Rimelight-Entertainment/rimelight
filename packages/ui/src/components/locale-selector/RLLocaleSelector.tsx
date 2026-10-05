import type { RLLocaleSelectorProps, LocaleItem } from "./locale-selector.types";
import { RLLocaleSelectorTheme } from "./locale-selector.theme";
import { createMemo, omit, type Component } from "solid-js";
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

export const RLLocaleSelector: Component<RLLocaleSelectorProps> = (allProps) => {
  const props = allProps;
  const rest = omit(
    allProps,
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

  const items = createMemo(() =>
    processedLocales().map((item) => {
      let targetUrl: string;
      const search = typeof window !== "undefined" ? window.location.search : "";
      const pathname = typeof window !== "undefined" ? window.location.pathname : "/";
      if (item.href !== undefined && item.href !== null) {
        targetUrl = item.href + (item.href.includes("?") ? "" : search);
      } else {
        const knownCodes = new Set(processedLocales().map((l) => l.code));
        const segments = pathname.split("/").filter(Boolean);
        const firstIsLocale = segments.length > 0 && knownCodes.has(segments[0]!);

        if (firstIsLocale) {
          segments[0] = item.code;
          targetUrl = `/${segments.join("/")}${pathname.endsWith("/") ? "/" : ""}${search}`;
        } else if (segments.length > 0) {
          targetUrl = `/${item.code}/${segments.join("/")}${pathname.endsWith("/") ? "/" : ""}${search}`;
        } else {
          targetUrl = `/${item.code}/${search}`;
        }
      }
      return { label: item.label, value: item.code, href: targetUrl };
    }),
  );

  const resolvedClasses = createMemo(() =>
    RLLocaleSelectorTheme({
      ui: props.ui,
      class: props.class,
    }),
  );

  const isIconMode = () => props.mode === "icon" || props.variant === "icon";

  const handleChange = (e: Event & { currentTarget: HTMLSelectElement }) => {
    const selectedCode = e.currentTarget.value;
    const found = items().find((i) => i.value === selectedCode);
    if (found) {
      props.onSelect?.({ label: found.label, code: found.value, href: found.href });
      if (found.href && typeof window !== "undefined") {
        window.location.href = found.href;
      }
    }
    props.onChange?.(e);
  };

  return (
    <div
      class={resolvedClasses().root}
      data-locale-selector
      data-mode={isIconMode() ? "icon" : "select"}
      data-theme={props.theme}
      {...rest}
    >
      <div class={resolvedClasses().wrapper}>
        <RLSelect
          items={items()}
          value={currentCode()}
          onChange={handleChange}
          size={(props.size as any) || "md"}
          variant={isIconMode() ? "icon" : "default"}
          aria-label="Select language"
          class={resolvedClasses().select}
          leadingIcon={props.leadingIcon || "globe"}
          leading={props.leading}
        />
      </div>
      {props.children}
    </div>
  );
};
