import type { RLAccordionProps, AccordionItem } from "./accordion.types";
import { RLAccordionTheme } from "./accordion.theme";
import { createMemo, createSignal, untrack, For, Show, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLIcon } from "../icon/RLIcon";

const OMIT_KEYS = [
  "items",
  "summary",
  "multiple",
  "type",
  "collapsible",
  "defaultValue",
  "value",
  "trailingIcon",
  "unmountOnHide",
  "valueKey",
  "labelKey",
  "onChange",
  "name",
] as const;

/**
 * Dot-path getter for `valueKey` / `labelKey`.
 */
const getPath = (obj: Record<string, unknown>, path: string): unknown => {
  if (!path.includes(".")) return obj[path];
  let current: unknown = obj;
  const parts = path.split(".");
  for (let i = 0; i < parts.length; i++) {
    if (current === null || current === undefined) return undefined;
    current = (current as Record<string, unknown>)[parts[i]!];
  }
  return current;
};

const normalizeSingle = (value: string | string[] | undefined): string | undefined =>
  Array.isArray(value) ? value[0] : value;

const normalizeMultiple = (value: string | string[] | undefined): string[] =>
  value === undefined ? [] : Array.isArray(value) ? [...value] : [value];

export const RLAccordion: Component<RLAccordionProps> = (props) => {
  const {
    Tag: ItemsRoot,
    classes,
    rest,
    slots,
  } = RLAccordionTheme.setup(props, {
    omit: OMIT_KEYS,
    slots: ["leadingSlot", "trailingSlot", "contentSlot", "bodySlot", "trailingIconSlot"] as const,
  });
  const SummaryRoot = RLAccordionTheme.tag(props, "details");

  const isMultiple = () => props.multiple === true || props.type === "multiple";
  const collapsible = () => props.collapsible !== false;
  const unmountOnHide = () => props.unmountOnHide !== false;
  const valueKey = () => props.valueKey ?? "value";
  const labelKey = () => props.labelKey ?? "label";

  // State initialization. Nuxt UI parity: `defaultValue` seeds internal state,
  // `value` (when supplied) drives controlled state.
  const [internalSingle, setInternalSingle] = createSignal<string | undefined>(
    normalizeSingle(props.defaultValue ?? (props.collapsible === false ? "0" : undefined)),
  );
  const [internalMultiple, setInternalMultiple] = createSignal<string[]>(
    normalizeMultiple(props.defaultValue),
  );

  const currentSingle = createMemo((): string | undefined =>
    !isMultiple() && props.value !== undefined ? normalizeSingle(props.value) : internalSingle(),
  );
  const currentMultiple = createMemo((): string[] =>
    isMultiple() && props.value !== undefined ? normalizeMultiple(props.value) : internalMultiple(),
  );

  const isOpen = (val: string): boolean =>
    isMultiple() ? currentMultiple().includes(val) : currentSingle() === val;

  const emitChange = (next: string | string[] | undefined) => {
    if (isMultiple()) {
      if (props.value === undefined) setInternalMultiple(next as string[]);
    } else if (props.value === undefined) {
      setInternalSingle(next as string | undefined);
    }
    props.onChange?.(next);
  };

  const toggleValue = (val: string) => {
    const snapshot = untrack(() => (isMultiple() ? [...currentMultiple()] : currentSingle()));
    if (isMultiple()) {
      const list = snapshot as string[];
      const next = list.includes(val) ? list.filter((v) => v !== val) : [...list, val];
      emitChange(next);
    } else {
      const current = snapshot as string | undefined;
      if (current === val && !collapsible()) return;
      emitChange(current === val ? undefined : val);
    }
  };

  const itemVal = (item: AccordionItem, index: number): string =>
    (getPath(item as Record<string, unknown>, valueKey()) as string | undefined) ??
    item.value ??
    String(index);

  const itemLabel = (item: AccordionItem): JSX.Element =>
    (getPath(item as Record<string, unknown>, labelKey()) ?? item.label) as JSX.Element;

  const defaultTrailingIcon = () => props.trailingIcon ?? "chevron-down";

  const handleSummaryClick = (event: MouseEvent, item: AccordionItem, val: string) => {
    if (props.disabled || item.disabled) {
      event.preventDefault();
      return;
    }
    event.preventDefault();
    toggleValue(val);
  };

  const renderLeading = (item: AccordionItem, index: number) => {
    const custom = slots.leadingSlot()?.(item, index);
    if (custom !== undefined && custom !== null) return custom;
    if (!item.icon) return null;
    return (
      <span class={classes().leadingIcon} data-slot="leading-icon">
        <RLIcon name={item.icon} size="md" />
      </span>
    );
  };

  const renderTrailing = (item: AccordionItem, index: number) => {
    const custom = slots.trailingSlot()?.(item, index);
    if (custom !== undefined && custom !== null) return custom;
    if (slots.trailingIconSlot()) {
      return (
        <span class={classes().trailingIcon} data-slot="trailing-icon">
          {slots.trailingIconSlot()}
        </span>
      );
    }
    const iconName = (item.trailingIcon as string | undefined) || defaultTrailingIcon();
    if (!iconName) return null;
    return (
      <span class={classes().trailingIcon} data-slot="trailing-icon">
        <RLIcon name={iconName} size="md" />
      </span>
    );
  };

  const renderBodyInner = (item: AccordionItem, index: number) => {
    const custom = slots.bodySlot()?.(item, index);
    if (custom !== undefined && custom !== null) return custom;
    return item.content;
  };

  const renderContent = (item: AccordionItem, index: number, val: string) => {
    const custom = slots.contentSlot()?.(item, index);
    if (custom !== undefined && custom !== null) return custom;
    return (
      <div
        class={classes().content}
        data-slot="content"
        data-state={isOpen(val) ? "open" : "closed"}
      >
        <div class={classes().body} data-slot="body">
          {renderBodyInner(item, index)}
        </div>
      </div>
    );
  };

  // Rows as a shared definition so the `as` branches below don't duplicate
  // the whole For block.
  const rows = () => (
    <For each={props.items}>
      {(item: AccordionItem, index) => {
        const val = () => itemVal(item, index());
        const disabled = () => !!(props.disabled || item.disabled);
        const itemTheme = () =>
          RLAccordionTheme({
            disabled: disabled(),
            ui:
              item.ui || item.class
                ? {
                    ...props.ui,
                    ...item.ui,
                    ...(item.class ? { item: [props.ui?.item, item.ui?.item, item.class] } : {}),
                  }
                : props.ui,
          });
        const open = () => isOpen(val());
        return (
          <details
            class={itemTheme().item}
            data-slot="item"
            data-value={val()}
            data-state={open() ? "open" : "closed"}
            name={props.name}
            open={open()}
          >
            <summary
              class={itemTheme().trigger}
              data-slot="trigger"
              aria-disabled={disabled() ? "true" : undefined}
              onClick={(event) => {
                const currentVal = untrack(val);
                handleSummaryClick(event, item, currentVal);
              }}
            >
              {renderLeading(item, index())}
              <span class={itemTheme().label} data-slot="label">
                {itemLabel(item)}
              </span>
              {renderTrailing(item, index())}
            </summary>

            {!unmountOnHide() || open() ? renderContent(item, index(), val()) : null}
          </details>
        );
      }}
    </For>
  );

  const rootValue = () =>
    isMultiple() ? currentMultiple().join(" ") : (currentSingle() ?? undefined);

  const hasItems = () => props.items !== undefined;

  return (
    <Show
      when={hasItems()}
      fallback={
        <SummaryRoot
          class={`${classes().root} ${classes().item}`}
          data-slot="root"
          name={props.name}
          {...rest}
        >
          <summary
            class={classes().trigger}
            data-slot="trigger"
            aria-disabled={props.disabled ? "true" : undefined}
            onClick={(event) => {
              if (props.disabled) event.preventDefault();
            }}
          >
            <span class={classes().label} data-slot="label">
              {props.summary}
            </span>
            {defaultTrailingIcon() ? (
              <span class={classes().trailingIcon} data-slot="trailing-icon">
                {slots.trailingIconSlot() ?? <RLIcon name={defaultTrailingIcon()} size="md" />}
              </span>
            ) : null}
          </summary>

          <div class={classes().content} data-slot="content">
            <div class={classes().body} data-slot="body">
              {props.children}
            </div>
          </div>
        </SummaryRoot>
      }
    >
      <ItemsRoot class={classes().root} data-slot="root" data-value={rootValue()} {...rest}>
        {rows()}
      </ItemsRoot>
    </Show>
  );
};
