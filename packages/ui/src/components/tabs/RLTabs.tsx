import type { RLTabsProps } from "./tabs.types";
import { RLTabsTheme } from "./tabs.theme";
import {
  createEffect,
  createMemo,
  createSignal,
  For,
  onSettled,
  Show,
  type Component,
} from "solid-js";
import { RLBadge } from "../badge/RLBadge";
import { RLIcon } from "../icon/RLIcon";
import { uiT } from "../../locale";

const OMIT_KEYS = [
  "items",
  "value",
  "defaultValue",
  "color",
  "content",
  "unmountOnHide",
  "valueKey",
  "labelKey",
  "maxTabs",
  "estimatedTabWidth",
  "onChange",
] as const;

export const RLTabs: Component<RLTabsProps> = (props) => {
  const items = () => props.items ?? [];
  const valueKey = () => props.valueKey ?? "value";
  const labelKey = () => props.labelKey ?? "label";
  const orientation = () => props.orientation ?? "horizontal";
  const showContent = () => props.content ?? true;

  const normalizedVariant = createMemo(() => {
    const v = props.variant ?? "pill";
    if (v === "solid" || v === "pills") return "pill";
    if (v === "link") return "underline";
    return v;
  });

  const { Tag, classes, rest } = RLTabsTheme.setup(props, {
    omit: OMIT_KEYS,
    variants: () => ({ variant: normalizedVariant() }),
  });

  const [internalValue, setInternalValue] = createSignal(() => {
    if (props.value !== undefined) return props.value;
    if (props.defaultValue !== undefined) return props.defaultValue;
    const list = items();
    if (list.length > 0) {
      return (list[0]?.[valueKey()] ?? list[0]?.value ?? "0") as string;
    }
    return "";
  });

  const currentValue = () => (props.value !== undefined ? props.value : internalValue());

  const handleSelect = (val: string) => {
    if (props.value === undefined) {
      setInternalValue(val);
    }
    props.onChange?.(val);
  };

  let listRef: HTMLDivElement | null = null;
  let indicatorRef: HTMLDivElement | null = null;
  const [popoverOpen, setPopoverOpen] = createSignal(false);

  const updateIndicator = () => {
    const list = listRef;
    const indicator = indicatorRef;
    if (!list || !indicator) return;
    const activeEl = list.querySelector(`[role=tab][data-state=active]`) as HTMLElement | null;
    if (!activeEl || getComputedStyle(activeEl).display === "none") {
      indicator.style.display = "none";
      return;
    }

    const listRect = list.getBoundingClientRect();
    const triggerRect = activeEl.getBoundingClientRect();

    if (triggerRect.width === 0 && triggerRect.height === 0) {
      indicator.style.display = "none";
      return;
    }

    indicator.style.display = "block";
    const isVert = orientation() === "vertical";

    if (isVert) {
      const top = triggerRect.top - listRect.top + list.scrollTop;
      const height = triggerRect.height;
      indicator.style.transform = `translateY(${top}px)`;
      indicator.style.height = `${height}px`;
    } else {
      const left = triggerRect.left - listRect.left + list.scrollLeft;
      const width = triggerRect.width;
      indicator.style.transform = `translateX(${left}px)`;
      indicator.style.width = `${width}px`;
    }
  };

  onSettled(() => {
    updateIndicator();
    if (typeof ResizeObserver !== "undefined" && listRef) {
      const ro = new ResizeObserver(() => updateIndicator());
      ro.observe(listRef);
      return () => ro.disconnect();
    }
    return undefined;
  });

  createEffect(
    () => currentValue(),
    () => {
      requestAnimationFrame(() => updateIndicator());
    },
  );

  const effectiveMax = () =>
    props.maxTabs !== undefined ? Math.max(1, props.maxTabs) : items().length;
  const renderedListItems = () => items().slice(0, effectiveMax());
  const overflowItems = () => items().slice(effectiveMax());
  const needsOverflow = () => items().length > 1 && orientation() === "horizontal";

  return (
    <Tag
      class={classes().root}
      data-slot="root"
      data-orientation={orientation()}
      data-variant={normalizedVariant()}
      data-value={currentValue()}
      {...rest}
    >
      <div ref={(el) => (listRef = el)} class={classes().list} data-slot="list" role="tablist">
        <div
          ref={(el) => (indicatorRef = el)}
          class={classes().indicator}
          data-slot="indicator"
          style={{ display: "none" }}
        />

        <For each={renderedListItems()}>
          {(item, index) => {
            const itemVal = () => (item[valueKey()] ?? item.value ?? String(index())) as string;
            const itemLabel = () => item[labelKey()] ?? item.label;
            const active = () => itemVal() === currentValue();

            return (
              <button
                type="button"
                class={classes().trigger}
                data-slot="trigger"
                role="tab"
                data-value={itemVal()}
                data-state={active() ? "active" : "inactive"}
                disabled={item.disabled}
                onClick={() => handleSelect(itemVal())}
              >
                {item.icon && (
                  <RLIcon name={item.icon} class={classes().leadingIcon} data-slot="leadingIcon" />
                )}
                {itemLabel() && (
                  <span class={classes().label} data-slot="label">
                    {itemLabel()}
                  </span>
                )}
                {item.badge !== undefined && item.badge !== null && (
                  <RLBadge
                    size="sm"
                    variant="soft"
                    color="neutral"
                    class={classes().trailingBadge}
                    data-slot="trailingBadge"
                  >
                    {typeof item.badge === "object" ? item.badge.label : item.badge}
                  </RLBadge>
                )}
              </button>
            );
          }}
        </For>

        <Show when={needsOverflow() && overflowItems().length > 0}>
          <div class="relative inline-flex items-center ml-auto">
            <button
              type="button"
              class={`${classes().trigger} rl-tb-overflow-btn`}
              data-slot="overflow-trigger"
              aria-label={uiT("tabs.more")}
              onClick={() => setPopoverOpen(!popoverOpen())}
            >
              <span class="rl-tb-label">+{overflowItems().length} more</span>
              <RLIcon name="chevron-down" class="ml-1 size-3.5 opacity-70" />
            </button>

            <Show when={popoverOpen()}>
              <div
                class="absolute right-0 top-full mt-1 z-50 rounded-lg border border-default bg-default p-1 shadow-lg backdrop-blur-sm min-w-[10rem] flex flex-col gap-0.5"
                onClick={() => setPopoverOpen(false)}
              >
                <For each={overflowItems()}>
                  {(item, index) => {
                    const itemVal = () =>
                      (item[valueKey()] ??
                        item.value ??
                        String(effectiveMax() + index())) as string;
                    const itemLabel = () => item[labelKey()] ?? item.label;
                    const active = () => itemVal() === currentValue();

                    return (
                      <button
                        type="button"
                        class={`w-full text-left px-3 py-1.5 text-sm rounded-md transition-colors flex items-center justify-between hover:bg-muted focus-visible:outline-none cursor-pointer ${
                          active() ? "bg-muted/80 font-medium" : ""
                        }`}
                        onClick={() => handleSelect(itemVal())}
                      >
                        <span class="truncate">{itemLabel()}</span>
                        <Show when={active()}>
                          <RLIcon name="check" class="size-4 opacity-100" />
                        </Show>
                      </button>
                    );
                  }}
                </For>
              </div>
            </Show>
          </div>
        </Show>
      </div>

      <Show when={showContent()}>
        <div class="flex-1">
          <Show
            when={props.children}
            fallback={
              <For each={items()}>
                {(item, index) => {
                  const itemVal = () =>
                    (item[valueKey()] ?? item.value ?? String(index())) as string;
                  const active = () => itemVal() === currentValue();

                  return (
                    <Show when={props.unmountOnHide === false || active()}>
                      <div
                        class={classes().content}
                        data-slot="content"
                        role="tabpanel"
                        data-value={itemVal()}
                        style={{ display: active() ? undefined : "none" }}
                      >
                        {item.content}
                      </div>
                    </Show>
                  );
                }}
              </For>
            }
          >
            {props.children}
          </Show>
        </div>
      </Show>
    </Tag>
  );
};
