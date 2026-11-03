import type { AccordionItem, AccordionValue, RLAccordionProps } from "./accordion.types";
import { RLAccordionTheme } from "./accordion.theme";
import { For, Show, untrack, type Component } from "solid-js";
import { RLIcon } from "../icon/RLIcon";
import { createControllable } from "../../controllable";
import type { SlotRenderer } from "../../types";

const OMIT_KEYS = [
  "items",
  "summary",
  "type",
  "collapsible",
  "defaultValue",
  "value",
  "onValueChange",
  "trailingIcon",
  "disabled",
  "unmountOnHide",
  "name",
  "trailingIconSlot",
  "leadingSlot",
  "trailingSlot",
  "bodySlot",
] as const;

const normalizeSingle = (value: AccordionValue): string | undefined =>
  Array.isArray(value) ? value[0] : value;

const normalizeMultiple = (value: AccordionValue): string[] =>
  value === undefined ? [] : Array.isArray(value) ? [...value] : [value];

const renderSlot = <Ctx,>(renderer: SlotRenderer<Ctx> | undefined, ctx: Ctx) =>
  typeof renderer === "function" ? renderer(ctx) : renderer;

export const RLAccordion: Component<RLAccordionProps> = (props) => {
  const { Tag, classes, rest, slots, children, theme, ui } = RLAccordionTheme.setup(props, {
    omit: OMIT_KEYS,
    slots: ["trailingIconSlot", "leadingSlot", "trailingSlot", "bodySlot"] as const,
  });
  const SummaryRoot = RLAccordionTheme.tag(props, "details");

  const isMultiple = () => props.type === "multiple";
  const collapsible = () => props.collapsible !== false;
  const unmountOnHide = () => props.unmountOnHide !== false;
  const defaultTrailingIcon = () => props.trailingIcon ?? "chevron-down";

  const [current, setValue] = createControllable<AccordionValue>(
    () => props.value,
    props.defaultValue ?? (props.collapsible === false ? "0" : undefined),
    props.onValueChange,
  );

  const openSingle = () => normalizeSingle(current());
  const openMultiple = () => normalizeMultiple(current());

  const isOpen = (val: string): boolean =>
    isMultiple() ? openMultiple().includes(val) : openSingle() === val;

  const toggleValue = (val: string) => {
    if (isMultiple()) {
      const list = untrack(openMultiple);
      setValue(list.includes(val) ? list.filter((v) => v !== val) : [...list, val]);
      return;
    }
    const cur = untrack(openSingle);
    if (cur === val && !collapsible()) return;
    setValue(cur === val ? undefined : val);
  };

  const itemVal = (item: AccordionItem, index: number): string => item.value ?? String(index);

  const renderLeading = (item: AccordionItem, index: number) => {
    const custom = renderSlot(slots.leadingSlot(), { item, index });
    if (custom !== undefined && custom !== null) return custom;
    if (!item.icon) return null;
    return (
      <span class={classes().leadingIcon} data-slot="leading-icon">
        <RLIcon name={item.icon} size="md" />
      </span>
    );
  };

  const renderTrailing = (item: AccordionItem, index: number) => {
    const custom = renderSlot(slots.trailingSlot(), { item, index });
    if (custom !== undefined && custom !== null) return custom;
    if (slots.trailingIconSlot()) {
      return (
        <span class={classes().trailingIcon} data-slot="trailing-icon">
          {slots.trailingIconSlot()}
        </span>
      );
    }
    const iconName = item.trailingIcon ?? defaultTrailingIcon();
    if (!iconName) return null;
    return (
      <span class={classes().trailingIcon} data-slot="trailing-icon">
        <RLIcon name={iconName} size="md" />
      </span>
    );
  };

  const renderContent = (item: AccordionItem, index: number, open: boolean) => {
    const ctx = { item, index };
    const body = renderSlot(slots.bodySlot(), ctx) ?? item.content;
    return (
      <div class={classes().content} data-slot="content" data-state={open ? "open" : "closed"}>
        <div class={classes().body} data-slot="body">
          {body}
        </div>
      </div>
    );
  };

  const rows = () => (
    <For each={props.items}>
      {(item, index) => {
        const val = () => itemVal(item, index());
        const disabled = () => props.disabled === true || item.disabled === true;
        const itemTheme = () =>
          RLAccordionTheme({
            disabled: disabled(),
            ui: item.ui || item.class ? { ...ui(), ...item.ui } : ui(),
          });
        const open = () => isOpen(val());
        return (
          <details
            class={`${itemTheme().item} ${(item.class as string | undefined) ?? ""}`}
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
                event.preventDefault();
                if (disabled()) return;
                toggleValue(val());
              }}
            >
              {renderLeading(item, index())}
              <span class={itemTheme().label} data-slot="label">
                {item.label}
              </span>
              {renderTrailing(item, index())}
            </summary>

            {!unmountOnHide() || open() ? renderContent(item, index(), open()) : null}
          </details>
        );
      }}
    </For>
  );

  const rootValue = () => (isMultiple() ? openMultiple().join(" ") : (openSingle() ?? undefined));

  return (
    <Show
      when={props.items !== undefined}
      fallback={
        <SummaryRoot
          class={`${classes().root} ${classes().item}`}
          data-slot="root"
          data-theme={theme()}
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
            <Show when={defaultTrailingIcon()}>
              <span class={classes().trailingIcon} data-slot="trailing-icon">
                {slots.trailingIconSlot() ?? <RLIcon name={defaultTrailingIcon()} size="md" />}
              </span>
            </Show>
          </summary>

          <div class={classes().content} data-slot="content">
            <div class={classes().body} data-slot="body">
              {children()}
            </div>
          </div>
        </SummaryRoot>
      }
    >
      <Tag
        class={classes().root}
        data-slot="root"
        data-theme={theme()}
        data-value={rootValue()}
        {...rest}
      >
        {rows()}
      </Tag>
    </Show>
  );
};
