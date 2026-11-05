import type { Component } from "solid-js";
import { createMemo } from "solid-js";
import { useLocale } from "@rimelight/i18n/solid";
import { uiT } from "../../locale";
import { RLSelect } from "../select/RLSelect";
import type { SelectLayout, SelectVariant } from "../select/select.types";
import { RLLocaleSelectorTheme } from "./locale-selector.theme";
import { normalizeLocales, selectLocale } from "./locale-selector.helpers";
import type { RLLocaleSelectorProps } from "./locale-selector.types";

const OMIT_KEYS = [
  "locales",
  "currentLocale",
  "mode",
  "onValueChange",
  "leadingIcon",
  "size",
  "variant",
] as const;

export const RLLocaleSelector: Component<RLLocaleSelectorProps> = (props) => {
  const { Tag, children, classes, rest, slots, theme } = RLLocaleSelectorTheme.setup(props, {
    slots: ["leadingSlot"] as const,
    omit: OMIT_KEYS,
  });

  const locale = useLocale();

  const locales = createMemo(() => normalizeLocales(props.locales));

  // Only label/value feed the select, so `items` must not depend on the window location.
  // Otherwise it rebuilds after hydration and <For> recreates every option.
  const items = createMemo(() =>
    locales().map((item) => ({
      label: item.label,
      value: item.code,
    })),
  );

  const isIcon = createMemo(() => props.mode === "icon");
  const mode = createMemo<"select" | "icon">(() => (isIcon() ? "icon" : "select"));
  const layout = createMemo<SelectLayout>(() => (isIcon() ? "icon" : "default"));
  const variant = createMemo<SelectVariant | undefined>(
    () => props.variant ?? (isIcon() ? "ghost" : undefined),
  );
  const value = createMemo(() => props.currentLocale ?? locale());
  const leadingIcon = createMemo(() => props.leadingIcon || "globe");

  const handleChange = (e: Event & { currentTarget: HTMLSelectElement }) => {
    const selection = selectLocale(
      locales(),
      e.currentTarget.value,
      window.location.pathname + window.location.search,
    );
    if (!selection) return;
    props.onValueChange?.(selection);
    if (selection.href) window.location.href = selection.href;
  };

  return (
    <Tag class={classes().root} data-slot="root" data-theme={theme()} data-mode={mode()} {...rest}>
      <div class={classes().wrapper}>
        <RLSelect
          items={items()}
          value={value()}
          onChange={handleChange}
          size={props.size}
          layout={layout()}
          variant={variant()}
          color={props.color}
          aria-label={uiT("locale-selector.label")}
          class={classes().select}
          leadingIcon={leadingIcon()}
          leadingSlot={slots.leadingSlot()}
        />
      </div>
      {children()}
    </Tag>
  );
};
