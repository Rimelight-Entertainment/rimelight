import { createMemo, createSignal, omit, untrack, For, type Component } from "solid-js";
import { dynamic, type JSX } from "@solidjs/web";
import type { AccordionItem, AccordionProps } from "./accordion";
import { accordionTheme } from "./accordion.theme";
import { RLIcon } from "../icon/RLIcon";

export type AccordionSlotRenderer = (item: AccordionItem, index: number) => JSX.Element;

export interface RLAccordionProps extends AccordionProps {
  children?: JSX.Element;
  /**
   * Custom trailing icon element applied to every item (overridden per item by the `trailing`
   * render prop, then by `item.trailingIcon`).
   *
   * Rimelight extra: not in Nuxt UI.
   */
  trailingIconSlot?: JSX.Element;
  /**
   * Custom leading content per item. Falls back to `item.icon`.
   *
   * Maps to Nuxt's `#leading` slot.
   */
  leading?: AccordionSlotRenderer;
  /**
   * Custom trailing content per item. Falls back to `trailingIconSlot`, then the `trailingIcon`
   * prop / `item.trailingIcon`.
   *
   * Maps to Nuxt's `#trailing` slot.
   */
  trailing?: AccordionSlotRenderer;
  /**
   * Custom content area per item. Falls back to the default content/body wrappers around the
   * resolved body.
   *
   * Maps to Nuxt's `#content` slot.
   */
  content?: AccordionSlotRenderer;
  /**
   * Custom body content per item. Falls back to per-item named slots, then `item.content`.
   *
   * Maps to Nuxt's `#body` slot.
   */
  body?: AccordionSlotRenderer;
  /**
   * Per-item named renderers, keyed by `item.slot` (and `item.slot + "-body"`), mirroring Nuxt's
   * `#{{ item.slot }}` templates.
   */
  slots?: Record<string, AccordionSlotRenderer>;
  /**
   * Called with the next open value whenever it changes. Pair with `value` for controlled state.
   *
   * Maps to Nuxt's `update:modelValue` emit.
   */
  onChange?: (value: string | string[] | undefined) => void;
}

/**
 * Dot-path getter for `valueKey` / `labelKey` (Nuxt supports nested keys).
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

/**
 * Merge root `ui` with per-item `ui` (item wins per slot) and fold `item.class` in as an
 * `item`-slot class. Arrays are flattened by the theme resolver's `cx`, so all class merging stays
 * behind the resolver — the component never concatenates classes itself.
 */
const mergeUi = (rootUi: any, itemUi: any, itemClass?: any): any => {
  const merged: Record<string, any> = { ...rootUi };
  if (itemUi) {
    for (const key of Object.keys(itemUi)) {
      const rootVal = merged[key];
      const itemVal = itemUi[key];
      if (typeof rootVal === "function" || typeof itemVal === "function") {
        merged[key] = itemVal ?? rootVal;
      } else if (rootVal === undefined) {
        merged[key] = itemVal;
      } else if (itemVal !== undefined) {
        merged[key] = [rootVal, itemVal];
      }
    }
  }
  if (itemClass !== undefined && itemClass !== null && itemClass !== "") {
    const prev = merged["item"];
    merged["item"] = prev === undefined ? itemClass : [prev, itemClass];
  }
  return merged;
};

const normalizeSingle = (value: string | string[] | undefined): string | undefined =>
  Array.isArray(value) ? value[0] : value;

const normalizeMultiple = (value: string | string[] | undefined): string[] =>
  value === undefined ? [] : Array.isArray(value) ? [...value] : [value];

const RLAccordion: Component<RLAccordionProps> = (allProps) => {
  const props = allProps;
  const rest = omit(
    allProps,
    "as",
    "items",
    "summary",
    "multiple",
    "type",
    "collapsible",
    "defaultValue",
    "value",
    "trailingIcon",
    "disabled",
    "unmountOnHide",
    "valueKey",
    "labelKey",
    "name",
    "ui",
    "class",
    "children",
    "trailingIconSlot",
    "leading",
    "trailing",
    "content",
    "body",
    "slots",
    "onChange",
  );

  const valueKey = () => props.valueKey ?? "value";
  const labelKey = () => props.labelKey ?? "label";
  const isMultiple = () =>
    props.type === "multiple" || (props.type === undefined && props.multiple === true);
  const collapsible = () => props.collapsible ?? true;
  const unmountOnHide = () => props.unmountOnHide ?? true;

  // No auto-generated `name`: data-derived hashes collide across accordions
  // with identical values (e.g. two demos with values "0|1|2"), merging
  // independent accordions into one native exclusive group whose native
  // toggling then fights Solid's `open` state (observed: all-closed).
  // Single-open exclusivity is enforced by component state in toggleValue;
  // `name` renders only when explicitly passed (native grouping opt-in).

  const [internalSingle, setInternalSingle] = createSignal<string | undefined>(
    normalizeSingle(props.defaultValue),
  );
  const [internalMultiple, setInternalMultiple] = createSignal<string[]>(
    normalizeMultiple(props.defaultValue),
  );

  // NOTE: no createEffect syncing props.value -> internal signals. Effects are
  // client-only by nature and asymmetric under SSR hydration; the memos below
  // already prefer props.value whenever it is defined, which covers both
  // controlled usage and uncontrolled usage. (Switching a mounted instance
  // from controlled back to uncontrolled keeps the last controlled value as
  // its uncontrolled seed — acceptable; RLTabs keeps an effect for that edge.)
  const currentSingle = createMemo((): string | undefined =>
    !isMultiple() && props.value !== undefined ? normalizeSingle(props.value) : internalSingle(),
  );
  const currentMultiple = createMemo((): string[] =>
    isMultiple() && props.value !== undefined ? normalizeMultiple(props.value) : internalMultiple(),
  );

  const isOpen = (itemVal: string): boolean =>
    isMultiple() ? currentMultiple().includes(itemVal) : currentSingle() === itemVal;

  const emitChange = (next: string | string[] | undefined) => {
    if (isMultiple()) {
      if (props.value === undefined) setInternalMultiple(next as string[]);
    } else if (props.value === undefined) {
      setInternalSingle(next as string | undefined);
    }
    props.onChange?.(next);
  };

  const toggleValue = (itemVal: string) => {
    // One-time snapshot: event handlers are imperative, wrap in untrack().
    const snapshot = untrack(() => (isMultiple() ? [...currentMultiple()] : currentSingle()));
    if (isMultiple()) {
      const list = snapshot as string[];
      const next = list.includes(itemVal) ? list.filter((v) => v !== itemVal) : [...list, itemVal];
      emitChange(next);
    } else {
      const current = snapshot as string | undefined;
      if (current === itemVal && !collapsible()) return;
      emitChange(current === itemVal ? undefined : itemVal);
    }
  };

  const itemVal = (item: AccordionItem, index: number): string =>
    (getPath(item as Record<string, unknown>, valueKey()) as string | undefined) ??
    item.value ??
    String(index);

  const itemLabel = (item: AccordionItem): JSX.Element =>
    (getPath(item as Record<string, unknown>, labelKey()) ?? item.label) as JSX.Element;

  const resolvedClasses = createMemo(() =>
    accordionTheme({
      disabled: props.disabled ? true : false,
      ui: props.ui,
      class: props.class,
    }),
  );

  const defaultTrailingIcon = () => props.trailingIcon ?? "chevronDown";

  const handleSummaryClick = (event: MouseEvent, item: AccordionItem, val: string) => {
    if (props.disabled || item.disabled) {
      event.preventDefault();
      return;
    }
    // Take over from the native <details> toggle so controlled state,
    // `collapsible={false}` and `unmountOnHide` stay consistent.
    event.preventDefault();
    toggleValue(val);
  };

  const renderLeading = (item: AccordionItem, index: number) => {
    const custom = props.leading?.(item, index);
    if (custom !== undefined && custom !== null) return custom;
    if (!item.icon) return null;
    return (
      <span class={resolvedClasses().leadingIcon} data-slot="leading-icon">
        <RLIcon name={item.icon} size="md" />
      </span>
    );
  };

  const renderTrailing = (item: AccordionItem, index: number) => {
    const custom = props.trailing?.(item, index);
    if (custom !== undefined && custom !== null) return custom;
    if (props.trailingIconSlot) {
      return (
        <span class={resolvedClasses().trailingIcon} data-slot="trailing-icon">
          {props.trailingIconSlot}
        </span>
      );
    }
    const iconName = (item.trailingIcon as string | undefined) || defaultTrailingIcon();
    if (!iconName) return null;
    return (
      <span class={resolvedClasses().trailingIcon} data-slot="trailing-icon">
        <RLIcon name={iconName} size="md" />
      </span>
    );
  };

  const renderBodyInner = (item: AccordionItem, index: number) => {
    if (item.slot && props.slots?.[`${item.slot}-body`]) {
      return props.slots[`${item.slot}-body`]!(item, index);
    }
    if (item.slot && props.slots?.[item.slot]) {
      return props.slots[item.slot]!(item, index);
    }
    const custom = props.body?.(item, index);
    if (custom !== undefined && custom !== null) return custom;
    return item.content;
  };

  const renderContent = (item: AccordionItem, index: number, val: string) => {
    const custom = props.content?.(item, index);
    if (custom !== undefined && custom !== null) return custom;
    return (
      <div
        class={resolvedClasses().content}
        data-slot="content"
        data-state={isOpen(val) ? "open" : "closed"}
      >
        <div class={resolvedClasses().body} data-slot="body">
          {renderBodyInner(item, index)}
        </div>
      </div>
    );
  };

  // Rows as a shared definition so the `as` branches below don't duplicate
  // the whole For block. Only the taken branch calls rows(), so the JSX is
  // inserted exactly once.
  const rows = () => (
    <For each={props.items}>
      {(item: AccordionItem, index) => {
        const val = () => itemVal(item, index());
        const disabled = () => !!(props.disabled || item.disabled);
        // Plain function (not a memo): per-row memos register hydration keys
        // asymmetrically between SSR and client, breaking hydration of the
        // whole row. accordionTheme is pure string concat, cheap to re-run,
        // and all class merging stays behind the resolver via mergeUi.
        const itemTheme = () =>
          accordionTheme({
            disabled: disabled(),
            ui: mergeUi(props.ui, item.ui, item.class),
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
                // Snapshot: click handlers are imperative, not tracking scopes.
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

  // Hoisted per instance (not per render): <Dynamic> is deprecated because it
  // rebuilds a fresh factory at every call site. dynamic() defaults keep the
  // hot path on plain tags with identical output.
  const ItemsRoot = dynamic(() => props.as ?? "div");
  const SummaryRoot = dynamic(() => props.as ?? "details");

  if (props.items && props.items.length > 0) {
    return (
      <ItemsRoot class={resolvedClasses().root} data-slot="root" data-value={rootValue()} {...rest}>
        {rows()}
      </ItemsRoot>
    );
  }

  const summaryRoot = (
    <>
      <summary
        class={resolvedClasses().trigger}
        data-slot="trigger"
        aria-disabled={props.disabled ? "true" : undefined}
        onClick={(event) => {
          if (props.disabled) event.preventDefault();
        }}
      >
        <span class={resolvedClasses().label} data-slot="label">
          {props.summary}
        </span>
        {defaultTrailingIcon() ? (
          <span class={resolvedClasses().trailingIcon} data-slot="trailing-icon">
            {props.trailingIconSlot ?? <RLIcon name={defaultTrailingIcon()} size="md" />}
          </span>
        ) : null}
      </summary>

      <div class={resolvedClasses().content} data-slot="content">
        <div class={resolvedClasses().body} data-slot="body">
          {props.children}
        </div>
      </div>
    </>
  );

  return (
    <SummaryRoot
      class={`${resolvedClasses().root} ${resolvedClasses().item}`}
      data-slot="root"
      name={props.name}
      {...rest}
    >
      {summaryRoot}
    </SummaryRoot>
  );
};

export { RLAccordion };
