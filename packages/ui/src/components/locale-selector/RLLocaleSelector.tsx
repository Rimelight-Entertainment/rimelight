import type { RLLocaleSelectorProps, LocaleItem } from "./locale-selector.types";
import { RLLocaleSelectorTheme } from "./locale-selector.theme";
import { createMemo, type Component } from "solid-js";
import { RLSelect } from "../select/RLSelect";
import { getLocaleInfo, getLocales, getLocaleUrl } from "@rimelight/i18n";
import { useLocale } from "@rimelight/i18n/solid";
import { uiT } from "../../locale";

const OMIT_KEYS = ["locales", "currentLocale", "mode", "onValueChange", "leadingIcon"] as const;

export const RLLocaleSelector: Component<RLLocaleSelectorProps> = (props) => {
  const { Tag, children, classes, rest, slots, theme } = RLLocaleSelectorTheme.setup(props, {
    slots: ["leadingSlot"] as const,
    omit: OMIT_KEYS,
  });

  const locale = useLocale();

  const processedLocales = createMemo<LocaleItem[]>(() =>
    (props.locales ?? getLocales()).map((item) =>
      typeof item === "string"
        ? { code: item, label: getLocaleInfo(item).label }
        : { ...item, label: item.label || getLocaleInfo(item.code).label },
    ),
  );

  // Only label/value feed the select, so `items` must not depend on the window location.
  // Otherwise it rebuilds after hydration and <For> recreates every option.
  const items = createMemo(() =>
    processedLocales().map((item) => ({
      label: item.label,
      value: item.code,
    })),
  );

  const handleChange = (e: Event & { currentTarget: HTMLSelectElement }) => {
    const selectedCode = e.currentTarget.value;
    const found = processedLocales().find((i) => i.code === selectedCode);
    if (found) {
      // An item's own `href`, otherwise the current page in that locale.
      const href =
        found.href ?? getLocaleUrl(window.location.pathname + window.location.search, found.code);
      props.onValueChange?.({ label: found.label, code: found.code, href });
      if (href && typeof window !== "undefined") {
        window.location.href = href;
      }
    }
  };

  return (
    <Tag
      class={classes().root}
      data-slot="root"
      data-theme={theme()}
      data-locale-selector
      data-mode={props.mode === "icon" ? "icon" : "select"}
      {...rest}
    >
      <div class={classes().wrapper}>
        <RLSelect
          items={items()}
          value={props.currentLocale ?? locale()}
          onChange={handleChange}
          size={props.size}
          layout={props.mode === "icon" ? "icon" : "default"}
          variant={props.variant}
          color={props.color === "auto" ? undefined : props.color}
          aria-label={uiT("locale-selector.label")}
          class={classes().select}
          leadingIcon={props.leadingIcon || "i-lucide-globe"}
          leadingSlot={slots.leadingSlot()}
        />
      </div>
      {children()}
    </Tag>
  );
};
