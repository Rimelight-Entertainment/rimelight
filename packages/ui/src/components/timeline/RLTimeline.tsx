import type { Component } from "solid-js";
import { For, Show } from "solid-js";
import type { RLTimelineProps, TimelineItem, TimelineSlotContext } from "./timeline.types";
import { RLTimelineTheme } from "./timeline.theme";
import type { SlotRenderer } from "../../types";
import { RLAvatar } from "../avatar/RLAvatar";
import { RLIcon } from "../icon/RLIcon";

const OMIT_KEYS = [
  "items",
  "size",
  "orientation",
  "value",
  "defaultValue",
  "reverse",
  "indicatorSlot",
  "wrapperSlot",
  "dateSlot",
  "titleSlot",
  "descriptionSlot",
] as const;

const resolveSlot = <Ctx,>(renderer: SlotRenderer<Ctx> | undefined, ctx: Ctx) =>
  typeof renderer === "function" ? renderer(ctx) : renderer;

export const RLTimeline: Component<RLTimelineProps> = (props) => {
  const reverse = (): boolean => props.reverse === true;

  const { Tag, classes, rest, slots, children, theme } = RLTimelineTheme.setup(props, {
    omit: OMIT_KEYS,
    slots: ["indicatorSlot", "wrapperSlot", "dateSlot", "titleSlot", "descriptionSlot"] as const,
    variants: () => ({
      reverse: reverse(),
    }),
  });

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
            const ctx = (): TimelineSlotContext => ({ item, index: index() });
            const state = () => getItemState(index());
            const isLast = () => index() === items().length - 1;

            return (
              <div data-slot="item" class={classes().item} data-state={state()}>
                <div data-slot="container" class={classes().container}>
                  <RLAvatar
                    size={props.size ?? "md"}
                    src={item.avatar?.src}
                    alt={item.avatar?.alt}
                    data-slot="indicator"
                    class={classes().indicator}
                    ui={{
                      icon: "text-highlighted group-data-[state=completed]:text-inverted group-data-[state=active]:text-inverted",
                      fallback:
                        "text-highlighted group-data-[state=completed]:text-inverted group-data-[state=active]:text-inverted",
                    }}
                  >
                    {resolveSlot(slots.indicatorSlot(), ctx()) ??
                      (item.icon ? <RLIcon name={item.icon} class="text-inherit" /> : null)}
                  </RLAvatar>

                  <Show when={!isLast()}>
                    <div
                      data-slot="separator"
                      class={classes().separator}
                      data-orientation={orientation()}
                    />
                  </Show>
                </div>

                <div data-slot="wrapper" class={classes().wrapper}>
                  {resolveSlot(slots.wrapperSlot(), ctx()) ?? (
                    <>
                      <Show when={item.date || slots.dateSlot()}>
                        <div data-slot="date" class={classes().date}>
                          {resolveSlot(slots.dateSlot(), ctx()) ?? item.date}
                        </div>
                      </Show>
                      <Show when={item.title || slots.titleSlot()}>
                        <div data-slot="title" class={classes().title}>
                          {resolveSlot(slots.titleSlot(), ctx()) ?? item.title}
                        </div>
                      </Show>
                      <Show when={item.description || slots.descriptionSlot()}>
                        <div data-slot="description" class={classes().description}>
                          {resolveSlot(slots.descriptionSlot(), ctx()) ?? item.description}
                        </div>
                      </Show>
                    </>
                  )}
                </div>
              </div>
            );
          }}
        </For>
      </Show>
    </Tag>
  );
};
