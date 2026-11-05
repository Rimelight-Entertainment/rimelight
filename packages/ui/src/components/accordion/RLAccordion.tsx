import type { AccordionItem, AccordionValue, RLAccordionProps } from "./accordion.types";
import { RLAccordionTheme } from "./accordion.theme";
import { createMemo, For, Show, untrack, type Component } from "solid-js";
import { RLIcon } from "../icon/RLIcon";
import { createControllable } from "../../controllable";
import { renderSlot } from "../../slot";

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
] as const;

const normalizeSingle = (value: AccordionValue): string | undefined =>
  Array.isArray(value) ? value[0] : value;

const normalizeMultiple = (value: AccordionValue): string[] =>
  value === undefined ? [] : Array.isArray(value) ? [...value] : [value];

export const RLAccordion: Component<RLAccordionProps> = (props) => {
  const { Tag, classes, rest, slots, children, theme, ui } = RLAccordionTheme.setup(props, {
    omit: OMIT_KEYS,
    slots: ["leadingSlot", "trailingSlot", "bodySlot"] as const,
  });
  const SummaryRoot = RLAccordionTheme.tag(props, "details");
  const summaryUi = () => ({ ...ui(), root: [ui()?.root, classes().item] });
  const summaryClasses = createMemo(() => RLAccordionTheme(props, { ui: summaryUi() }));

  const isMultiple = () => props.type === "multiple";
  const summaryItem = createMemo((): AccordionItem => ({
    label: props.summary,
    disabled: props.disabled,
  }));

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
    if (cur === val && props.collapsible === false) return;
    setValue(cur === val ? undefined : val);
  };

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
    const iconName = item.trailingIcon ?? props.trailingIcon ?? "chevron-down";
    if (!iconName) return null;
    return (
      <span class={classes().trailingIcon} data-slot="trailing-icon">
        <RLIcon name={iconName} size="md" />
      </span>
    );
  };

  const renderBody = (item: AccordionItem, index: number, open: boolean) => (
    <div class={classes().body} data-slot="body" data-state={open ? "open" : "closed"}>
      {renderSlot(slots.bodySlot(), { item, index }) ?? item.content}
    </div>
  );

  return (
    <Show
      when={props.items !== undefined}
      fallback={
        <SummaryRoot
          class={summaryClasses().root}
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
            {renderTrailing(summaryItem(), 0)}
          </summary>

          <div class={classes().body} data-slot="body">
            {children()}
          </div>
        </SummaryRoot>
      }
    >
      <Tag
        class={classes().root}
        data-slot="root"
        data-theme={theme()}
        data-value={isMultiple() ? openMultiple().join(" ") : (openSingle() ?? undefined)}
        {...rest}
      >
        <For each={props.items}>
          {(item, index) => {
            const val = () => item.value ?? String(index());
            const disabled = () => props.disabled === true || item.disabled === true;
            const open = () => isOpen(val());
            const itemUi = createMemo(() => {
              const base = item.ui ? { ...ui(), ...item.ui } : ui();
              if (!item.class) return base;
              return { ...base, item: [base?.item, item.class] };
            });
            const itemClasses = createMemo(() =>
              RLAccordionTheme({
                disabled: disabled(),
                ui: itemUi(),
              }),
            );
            return (
              <details
                class={itemClasses().item}
                data-slot="item"
                data-value={val()}
                data-state={open() ? "open" : "closed"}
                name={props.name}
                open={open()}
              >
                <summary
                  class={itemClasses().trigger}
                  data-slot="trigger"
                  aria-disabled={disabled() ? "true" : undefined}
                  onClick={(event) => {
                    event.preventDefault();
                    if (disabled()) return;
                    toggleValue(val());
                  }}
                >
                  {renderLeading(item, index())}
                  <span class={itemClasses().label} data-slot="label">
                    {item.label}
                  </span>
                  {renderTrailing(item, index())}
                </summary>

                <Show when={props.unmountOnHide === false || open()}>
                  {renderBody(item, index(), open())}
                </Show>
              </details>
            );
          }}
        </For>
      </Tag>
    </Show>
  );
};
