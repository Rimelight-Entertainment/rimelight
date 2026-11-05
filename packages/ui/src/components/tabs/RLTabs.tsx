import type { RLTabsProps, TabItem } from "./tabs.types";
import { RLTabsTheme } from "./tabs.theme";
import { createEffect, createSignal, For, onSettled, Show, type Component } from "solid-js";
import { RLBadge } from "../badge/RLBadge";
import { RLIcon } from "../icon/RLIcon";
import { uiT } from "../../locale";
import { createControllable } from "../../controllable";

const OMIT_KEYS = [
  "items",
  "value",
  "defaultValue",
  "onValueChange",
  "content",
  "unmountOnHide",
  "maxTabs",
] as const;

const itemValue = (item: TabItem, index: number) => item.value ?? String(index);

export const RLTabs: Component<RLTabsProps> = (props) => {
  const { Tag, classes, rest, children, theme } = RLTabsTheme.setup(props, {
    omit: OMIT_KEYS,
  });

  const items = () => props.items ?? [];
  const isVertical = () => props.orientation === "vertical";
  const showContent = () => props.content !== false;

  const [currentValue, setCurrentValue] = createControllable(
    () => props.value,
    props.defaultValue ?? itemValue(props.items?.[0] ?? {}, 0),
    props.onValueChange,
  );

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

    if (isVertical()) {
      const top = triggerRect.top - listRect.top + list.scrollTop;
      indicator.style.transform = `translateY(${top}px)`;
      indicator.style.height = `${triggerRect.height}px`;
    } else {
      const left = triggerRect.left - listRect.left + list.scrollLeft;
      indicator.style.transform = `translateX(${left}px)`;
      indicator.style.width = `${triggerRect.width}px`;
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
  const needsOverflow = () => items().length > 1 && !isVertical();

  return (
    <Tag
      class={classes().root}
      data-slot="root"
      data-theme={theme()}
      data-orientation={isVertical() ? "vertical" : "horizontal"}
      data-value={currentValue()}
      {...rest}
    >
      <div ref={(el) => (listRef = el)} class={classes().list} data-slot="list" role="tablist">
        <div
          ref={(el) => (indicatorRef = el)}
          class={`${classes().indicator} hidden!`}
          data-slot="indicator"
        />

        <For each={renderedListItems()}>
          {(item, index) => {
            const itemVal = () => itemValue(item, index());
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
                onClick={() => setCurrentValue(itemVal())}
              >
                {item.icon && (
                  <RLIcon name={item.icon} class={classes().leadingIcon} data-slot="leading-icon" />
                )}
                {item.label && (
                  <span class={classes().label} data-slot="label">
                    {item.label}
                  </span>
                )}
                {item.badge !== undefined && item.badge !== null && (
                  <RLBadge
                    size="sm"
                    variant="soft"
                    color="neutral"
                    class={classes().trailingBadge}
                    data-slot="trailing-badge"
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
              aria-label={uiT("tabs.moreTabs")}
              onClick={() => setPopoverOpen(!popoverOpen())}
            >
              <span class="rl-tb-label">
                +{overflowItems().length} {uiT("tabs.more")}
              </span>
              <RLIcon name="chevron-down" class="ml-1 size-3.5 opacity-70" />
            </button>

            <Show when={popoverOpen()}>
              <div
                class="absolute right-0 top-full mt-1 z-50 rounded-lg border border-default bg-default p-1 shadow-lg backdrop-blur-sm min-w-[10rem] flex flex-col gap-0.5"
                onClick={() => setPopoverOpen(false)}
              >
                <For each={overflowItems()}>
                  {(item, index) => {
                    const itemVal = () => itemValue(item, effectiveMax() + index());
                    const active = () => itemVal() === currentValue();

                    return (
                      <button
                        type="button"
                        class={`w-full text-left px-3 py-1.5 text-sm rounded-md transition-colors flex items-center justify-between hover:bg-muted focus-visible:outline-none cursor-pointer ${
                          active() ? "bg-muted/80 font-medium" : ""
                        }`}
                        onClick={() => setCurrentValue(itemVal())}
                      >
                        <span class="truncate">{item.label}</span>
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
            when={children()}
            fallback={
              <For each={items()}>
                {(item, index) => {
                  const itemVal = () => itemValue(item, index());
                  const active = () => itemVal() === currentValue();

                  return (
                    <Show when={props.unmountOnHide === false || active()}>
                      <div
                        class={`${classes().content}${active() ? "" : " hidden!"}`}
                        data-slot="content"
                        role="tabpanel"
                        data-value={itemVal()}
                      >
                        {item.content}
                      </div>
                    </Show>
                  );
                }}
              </For>
            }
          >
            {children()}
          </Show>
        </div>
      </Show>
    </Tag>
  );
};
