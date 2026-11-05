import type { RLTabsProps, TabItem } from "./tabs.types";
import { RLTabsTheme } from "./tabs.theme";
import { createEffect, createSignal, For, onSettled, Show, type Component } from "solid-js";
import { RLBadge } from "../badge/RLBadge";
import { RLIcon } from "../icon/RLIcon";
import { RLButton } from "../button/RLButton";
import { uiT } from "../../locale";
import { createControllable } from "../../controllable";

const OMIT_KEYS = [
  "items",
  "value",
  "defaultValue",
  "onValueChange",
  "body",
  "unmountOnHide",
  "maxTabs",
] as const;

const itemValue = (item: TabItem, index: number) => item.value ?? String(index);

const HIDDEN_INDICATOR = { hidden: true, x: "0px", y: "0px", w: "0px", h: "0px" } as const;

export const RLTabs: Component<RLTabsProps> = (props) => {
  const { Tag, classes, rest, children, theme } = RLTabsTheme.setup(props, {
    omit: OMIT_KEYS,
  });

  const items = () => props.items ?? [];
  const isVertical = () => props.orientation === "vertical";
  const showContent = () => props.body !== false;

  const [currentValue, setCurrentValue] = createControllable(
    () => props.value,
    props.defaultValue ?? itemValue(props.items?.[0] ?? {}, 0),
    props.onValueChange,
  );

  let listRef: HTMLDivElement | null = null;
  const [popoverOpen, setPopoverOpen] = createSignal(false);
  const [indicator, setIndicator] = createSignal<{
    hidden: boolean;
    x: string;
    y: string;
    w: string;
    h: string;
  }>(HIDDEN_INDICATOR);

  const updateIndicator = () => {
    const list = listRef;
    if (!list) return;
    const activeEl = list.querySelector<HTMLElement>(`[role=tab][data-state=active]`);
    if (!activeEl || getComputedStyle(activeEl).display === "none") {
      setIndicator(HIDDEN_INDICATOR);
      return;
    }

    const listRect = list.getBoundingClientRect();
    const triggerRect = activeEl.getBoundingClientRect();
    if (triggerRect.width === 0 && triggerRect.height === 0) {
      setIndicator(HIDDEN_INDICATOR);
      return;
    }

    setIndicator({
      hidden: false,
      x: `${triggerRect.left - listRect.left + list.scrollLeft}px`,
      y: `${triggerRect.top - listRect.top + list.scrollTop}px`,
      w: `${triggerRect.width}px`,
      h: `${triggerRect.height}px`,
    });
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
          class={classes().indicator}
          data-slot="indicator"
          hidden={indicator().hidden}
          style={{
            "--rl-indicator-x": indicator().x,
            "--rl-indicator-y": indicator().y,
            "--rl-indicator-w": indicator().w,
            "--rl-indicator-h": indicator().h,
          }}
        />

        <For each={renderedListItems()}>
          {(item, index) => {
            const itemVal = () => itemValue(item, index());
            const active = () => itemVal() === currentValue();

            return (
              <RLButton
                variant="ghost"
                color="neutral"
                type="button"
                class={classes().trigger}
                data-slot="trigger"
                role="tab"
                data-value={itemVal()}
                data-state={active() ? "active" : "inactive"}
                disabled={item.disabled}
                onClick={() => setCurrentValue(itemVal())}
              >
                <Show when={item.icon}>
                  <RLIcon
                    name={item.icon ?? ""}
                    class={classes().leadingIcon}
                    data-slot="leading-icon"
                  />
                </Show>
                <Show when={item.label}>
                  <span class={classes().label} data-slot="label">
                    {item.label}
                  </span>
                </Show>
                <Show when={item.badge !== undefined && item.badge !== null}>
                  <RLBadge
                    size="sm"
                    variant="soft"
                    color="neutral"
                    class={classes().trailingBadge}
                    data-slot="trailing-badge"
                  >
                    {typeof item.badge === "object" ? item.badge.label : item.badge}
                  </RLBadge>
                </Show>
              </RLButton>
            );
          }}
        </For>

        <Show when={needsOverflow() && overflowItems().length > 0}>
          <div class={classes().overflow} data-slot="overflow">
            <RLButton
              variant="ghost"
              color="neutral"
              type="button"
              class={[classes().trigger, classes().overflowTrigger].join(" ")}
              data-slot="overflow-trigger"
              aria-label={uiT("tabs.moreTabs")}
              aria-expanded={popoverOpen() ? "true" : "false"}
              onClick={() => setPopoverOpen(!popoverOpen())}
            >
              <span class={classes().overflowLabel} data-slot="overflow-label">
                +{overflowItems().length} {uiT("tabs.more")}
              </span>
              <RLIcon name="chevron-down" class={classes().overflowIcon} />
            </RLButton>

            <Show when={popoverOpen()}>
              <div
                class={classes().overflowMenu}
                data-slot="overflow-menu"
                onClick={() => setPopoverOpen(false)}
              >
                <For each={overflowItems()}>
                  {(item, index) => {
                    const itemVal = () => itemValue(item, effectiveMax() + index());
                    const active = () => itemVal() === currentValue();

                    return (
                      <RLButton
                        variant="ghost"
                        color="neutral"
                        type="button"
                        class={classes().overflowItem}
                        data-slot="overflow-item"
                        data-state={active() ? "active" : "inactive"}
                        onClick={() => setCurrentValue(itemVal())}
                      >
                        <span class={classes().label}>{item.label}</span>
                        <Show when={active()}>
                          <RLIcon name="check" class={classes().overflowCheck} />
                        </Show>
                      </RLButton>
                    );
                  }}
                </For>
              </div>
            </Show>
          </div>
        </Show>
      </div>

      <Show when={showContent()}>
        <div class={classes().panel}>
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
                        class={classes().body}
                        data-slot="body"
                        role="tabpanel"
                        data-value={itemVal()}
                        hidden={!active()}
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
