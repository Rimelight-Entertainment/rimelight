import type { Component } from "solid-js";
import { createMemo, For, Show } from "solid-js";
import type { RLTimelineProps, TimelineItem, TimelineSlotContext } from "./timeline.types";
import { RLTimelineTheme } from "./timeline.theme";
import { renderSlot } from "../../slot";
import { RLAvatar } from "../avatar/RLAvatar";
import { RLIcon } from "../icon/RLIcon";

const OMIT_KEYS = ["items", "size", "orientation", "value", "defaultValue", "reverse"] as const;

export const RLTimeline: Component<RLTimelineProps> = (props) => {
  const reverse = (): boolean => props.reverse === true;

  const { Tag, classes, rest, slots, children, theme } = RLTimelineTheme.setup(props, {
    omit: OMIT_KEYS,
    slots: ["indicatorSlot", "wrapperSlot", "dateSlot", "titleSlot", "descriptionSlot"] as const,
    variants: () => ({
      reverse: reverse(),
    }),
  });

  const indicatorUi = createMemo(() => ({
    icon: classes().indicatorIcon,
    fallback: classes().indicatorFallback,
  }));

  const items = (): TimelineItem[] => props.items ?? [];
  const orientation = (): "horizontal" | "vertical" =>
    props.orientation === "horizontal" ? "horizontal" : "vertical";

  const getItemValue = (item: TimelineItem, index: number): string | number => item.value ?? index;

  const getItemState = (index: number): "active" | "completed" | undefined => {
    const activeVal = props.value ?? props.defaultValue;
    if (activeVal === undefined) return undefined;

    let currentIndex = -1;
    if (items().length > 0) {
      if (typeof activeVal === "string") {
        currentIndex = items().findIndex(
          (item, idx) => String(getItemValue(item, idx)) === activeVal,
        );
      } else {
        currentIndex = reverse() ? items().length - 1 - activeVal : activeVal;
      }
    }

    if (currentIndex === -1) return undefined;
    if (index === currentIndex) return "active";
    if (reverse()) return index > currentIndex ? "completed" : undefined;
    return index < currentIndex ? "completed" : undefined;
  };

  return (
    <Tag
      data-slot="root"
      data-theme={theme()}
      class={classes().root}
      data-orientation={orientation()}
      {...rest}
    >
      <Show when={items().length > 0} fallback={children()}>
        <For each={items()}>
          {(item, index) => {
            const slotCtx = (): TimelineSlotContext => ({ item, index: index() });
            const state = () => getItemState(index());
            const isLast = () => index() === items().length - 1;

            return (
              <div data-slot="item" class={classes().item} data-state={state()}>
                <div data-slot="container" class={classes().container}>
                  <span data-slot="indicator" class={classes().indicator}>
                    <RLAvatar
                      size={props.size ?? "md"}
                      src={item.avatar?.src}
                      alt={item.avatar?.alt}
                      ui={indicatorUi()}
                    >
                      <Show
                        when={slots.indicatorSlot()}
                        fallback={
                          <Show when={item.icon}>{(icon) => <RLIcon name={icon()} />}</Show>
                        }
                      >
                        {renderSlot(slots.indicatorSlot(), slotCtx())}
                      </Show>
                    </RLAvatar>
                  </span>

                  <Show when={!isLast()}>
                    <div
                      data-slot="separator"
                      class={classes().separator}
                      data-orientation={orientation()}
                    />
                  </Show>
                </div>

                <div data-slot="wrapper" class={classes().wrapper}>
                  <Show
                    when={slots.wrapperSlot()}
                    fallback={
                      <>
                        <Show when={slots.dateSlot() || item.date}>
                          <div data-slot="date" class={classes().date}>
                            <Show when={slots.dateSlot()} fallback={item.date}>
                              {renderSlot(slots.dateSlot(), slotCtx())}
                            </Show>
                          </div>
                        </Show>
                        <Show when={slots.titleSlot() || item.title}>
                          <div data-slot="title" class={classes().title}>
                            <Show when={slots.titleSlot()} fallback={item.title}>
                              {renderSlot(slots.titleSlot(), slotCtx())}
                            </Show>
                          </div>
                        </Show>
                        <Show when={slots.descriptionSlot() || item.description}>
                          <div data-slot="description" class={classes().description}>
                            <Show when={slots.descriptionSlot()} fallback={item.description}>
                              {renderSlot(slots.descriptionSlot(), slotCtx())}
                            </Show>
                          </div>
                        </Show>
                      </>
                    }
                  >
                    {renderSlot(slots.wrapperSlot(), slotCtx())}
                  </Show>
                </div>
              </div>
            );
          }}
        </For>
      </Show>
    </Tag>
  );
};
