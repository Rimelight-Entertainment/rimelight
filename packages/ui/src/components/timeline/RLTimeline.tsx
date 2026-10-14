import type { RLTimelineProps, TimelineItem } from "./timeline.types";
import { RLTimelineTheme } from "./timeline.theme";
import { createMemo, For, omit, type Component } from "solid-js";
import { dynamic } from "@solidjs/web";
import type { JSX } from "@solidjs/web";
import { RLAvatar } from "../avatar/RLAvatar";
import { RLIcon } from "../icon/RLIcon";

export const RLTimeline: Component<RLTimelineProps> = (allProps) => {
  const props = allProps;
  const rest = omit(
    allProps,
    "as",
    "items",
    "size",
    "color",
    "orientation",
    "valueKey",
    "defaultValue",
    "value",
    "reverse",
    "ui",
    "class",
    "children",
    "indicator",
    "wrapper",
    "date",
    "title",
    "description",
  );

  const items = (): TimelineItem[] => props.items ?? [];
  const valueKey = (): string => props.valueKey ?? "value";
  const reverse = (): boolean => props.reverse === true;
  const orientation = (): string => props.orientation ?? "vertical";

  const getItemValue = (item: TimelineItem, index: number): string | number =>
    item[valueKey()] !== undefined ? item[valueKey()] : index;

  const getItemState = (_item: TimelineItem, index: number): "active" | "completed" | undefined => {
    const activeVal = props.value !== undefined ? props.value : props.defaultValue;
    if (activeVal === undefined) return undefined;

    let currentIndex = -1;
    if (items().length > 0) {
      if (typeof activeVal === "string") {
        currentIndex = items().findIndex((i) => getItemValue(i, items().indexOf(i)) === activeVal);
      } else if (typeof activeVal === "number") {
        currentIndex = reverse() ? items().length - 1 - activeVal : activeVal;
      }
    }

    if (currentIndex === -1) return undefined;
    if (index === currentIndex) return "active";
    if (reverse()) return index > currentIndex ? "completed" : undefined;
    return index < currentIndex ? "completed" : undefined;
  };

  const resolvedClasses = createMemo(() =>
    RLTimelineTheme({
      size: props.size ?? "md",
      color: props.color ?? "primary",
      orientation: props.orientation ?? "vertical",
      reverse: props.reverse ?? false,
      ui: props.ui,
      class: props.class,
    }),
  );

  const renderSlot = (
    slotFn: any,
    item: TimelineItem,
    index: number,
    fallback?: () => JSX.Element,
  ) => {
    if (typeof slotFn === "function") {
      const ctx = { ...item, item, index };
      return slotFn(ctx);
    }
    return fallback ? fallback() : null;
  };

  const Root = dynamic(() => props.as ?? "div");

  return (
    <Root
      data-slot="root"
      class={resolvedClasses().root}
      data-orientation={orientation()}
      {...rest}
    >
      {items().length > 0 ? (
        <For each={items()}>
          {(item, index) => {
            const state = getItemState(item, index());
            const isLast = index() === items().length - 1;
            const avatar =
              typeof item.avatar === "object" && item.avatar !== null ? item.avatar : undefined;

            return (
              <div
                data-slot="item"
                class={`${resolvedClasses().item}  ${item.ui?.item || ""}  ${item.class || ""}`}
                data-state={state}
              >
                <div
                  data-slot="container"
                  class={`${resolvedClasses().container}  ${item.ui?.container || ""}`}
                >
                  <RLAvatar
                    size={props.size ?? "md"}
                    src={avatar?.src}
                    alt={avatar?.alt}
                    {...(avatar ? avatar : {})}
                    data-slot="indicator"
                    class={`${resolvedClasses().indicator}  ${item.ui?.indicator || ""}`}
                    ui={{
                      icon: "text-highlighted group-data-[state=completed]:text-inverted group-data-[state=active]:text-inverted",
                      fallback:
                        "text-highlighted group-data-[state=completed]:text-inverted group-data-[state=active]:text-inverted",
                    }}
                  >
                    {props.indicator ? (
                      renderSlot(props.indicator, item, index())
                    ) : item.icon ? (
                      <RLIcon name={item.icon} class="text-inherit" />
                    ) : null}
                  </RLAvatar>

                  {!isLast ? (
                    <div
                      data-slot="separator"
                      class={`${resolvedClasses().separator}  ${item.ui?.separator || ""}`}
                      data-orientation={orientation()}
                    />
                  ) : null}
                </div>

                <div
                  data-slot="wrapper"
                  class={`${resolvedClasses().wrapper}  ${item.ui?.wrapper || ""}`}
                >
                  {props.wrapper ? (
                    renderSlot(props.wrapper, item, index())
                  ) : (
                    <>
                      {item.date || props.date ? (
                        <div
                          data-slot="date"
                          class={`${resolvedClasses().date}  ${item.ui?.date || ""}`}
                        >
                          {renderSlot(props.date, item, index(), () => item.date)}
                        </div>
                      ) : null}
                      {item.title || props.title ? (
                        <div
                          data-slot="title"
                          class={`${resolvedClasses().title}  ${item.ui?.title || ""}`}
                        >
                          {renderSlot(props.title, item, index(), () => item.title)}
                        </div>
                      ) : null}
                      {item.description ||
                      props.description ||
                      typeof props.children === "function" ? (
                        <div
                          data-slot="description"
                          class={`${resolvedClasses().description}  ${item.ui?.description || ""}`}
                        >
                          {typeof props.children === "function"
                            ? renderSlot(props.children, item, index(), () => item.description)
                            : renderSlot(props.description, item, index(), () => item.description)}
                        </div>
                      ) : null}
                    </>
                  )}
                </div>
              </div>
            );
          }}
        </For>
      ) : typeof props.children !== "function" ? (
        props.children
      ) : null}
    </Root>
  );
};
