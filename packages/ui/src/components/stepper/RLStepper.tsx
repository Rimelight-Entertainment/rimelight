import type { Component } from "solid-js";
import { For, Show } from "solid-js";
import type { RLStepperProps, StepperItem } from "./stepper.types";
import { RLStepperTheme } from "./stepper.theme";
import { RLIcon } from "../icon/RLIcon";
import { createControllable } from "../../controllable";
import type { SlotRenderer } from "../../types";

const OMIT_KEYS = [
  "items",
  "value",
  "defaultValue",
  "onValueChange",
  "linear",
  "disabled",
  "onNext",
  "onPrev",
  "indicatorSlot",
  "wrapperSlot",
] as const;

const resolveSlot = <Ctx,>(renderer: SlotRenderer<Ctx> | undefined, ctx: Ctx) =>
  typeof renderer === "function" ? renderer(ctx) : renderer;

export const RLStepper: Component<RLStepperProps> = (props) => {
  const { Tag, classes, rest, slots, children, theme } = RLStepperTheme.setup(props, {
    omit: OMIT_KEYS,
    slots: ["indicatorSlot", "wrapperSlot"] as const,
  });

  const items = (): StepperItem[] => props.items ?? [];
  const linear = (): boolean => props.linear !== false;
  const isDisabled = (): boolean => props.disabled === true;

  const itemValue = (item: StepperItem, index: number): string | number => item.value ?? index;

  const [currentValue, setCurrentValue] = createControllable<string | number>(
    () => props.value,
    props.defaultValue ?? (props.items?.[0] ? itemValue(props.items[0], 0) : 0),
    props.onValueChange,
  );

  const currentIndex = (): number => {
    const idx = items().findIndex(
      (item, index) => String(itemValue(item, index)) === String(currentValue()),
    );
    return idx >= 0 ? idx : 0;
  };

  const goTo = (index: number) => {
    if (isDisabled()) return;
    if (index < 0 || index >= items().length) return;
    if (linear() && index > currentIndex() + 1) return;

    const oldIndex = currentIndex();
    const value = itemValue(items()[index]!, index);
    setCurrentValue(value);

    if (index > oldIndex) {
      props.onNext?.({ index, value });
    } else if (index < oldIndex) {
      props.onPrev?.({ index, value });
    }
  };

  return (
    <Tag class={classes().root} data-slot="root" data-theme={theme()} {...rest}>
      <div class={classes().header} data-slot="header">
        <For each={items()}>
          {(item, index) => {
            const isCompleted = index() < currentIndex();
            const isActive = index() === currentIndex();
            const isItemDisabled =
              isDisabled() || item.disabled || (linear() && index() > currentIndex());
            const state: "completed" | "active" | "inactive" = isCompleted
              ? "completed"
              : isActive
                ? "active"
                : "inactive";

            return (
              <>
                <div
                  class={classes().item}
                  data-slot="item"
                  data-index={index()}
                  data-value={itemValue(item, index())}
                  data-state={state}
                  data-disabled={isItemDisabled ? "true" : undefined}
                >
                  <div class={classes().container} data-slot="container">
                    <button
                      type="button"
                      class={classes().trigger}
                      data-slot="trigger"
                      disabled={isItemDisabled}
                      data-step-trigger={index()}
                      onClick={() => goTo(index())}
                    >
                      <span class={classes().indicator} data-slot="indicator">
                        {resolveSlot(slots.indicatorSlot(), { item, index: index(), state }) ??
                          (item.icon ? (
                            <RLIcon
                              name={item.icon}
                              size="sm"
                              class={classes().icon}
                              data-slot="icon"
                            />
                          ) : (
                            <span>{index() + 1}</span>
                          ))}
                      </span>
                    </button>
                  </div>

                  <Show when={item.title || item.description}>
                    <div class={classes().wrapper} data-slot="wrapper">
                      {resolveSlot(slots.wrapperSlot(), { item, index: index() }) ?? (
                        <>
                          <Show when={item.title}>
                            <div class={classes().title} data-slot="title">
                              {item.title}
                            </div>
                          </Show>
                          <Show when={item.description}>
                            <div class={classes().description} data-slot="description">
                              {item.description}
                            </div>
                          </Show>
                        </>
                      )}
                    </div>
                  </Show>
                </div>

                <Show when={index() < items().length - 1}>
                  <div
                    class={`${classes().separator} ${
                      index() < currentIndex() ? "bg-primary" : "bg-muted"
                    }`}
                    data-slot="separator"
                    data-separator-index={index()}
                  />
                </Show>
              </>
            );
          }}
        </For>
      </div>

      <div class={classes().content} data-slot="content">
        {children()}
        <For each={items()}>
          {(item, index) => {
            const panelActive = index() === currentIndex();
            return (
              <div
                data-stepper-panel={index()}
                data-value={itemValue(item, index())}
                hidden={panelActive ? undefined : "until-found"}
                class="w-full"
              >
                <Show when={item.content}>{(content) => <div>{content()}</div>}</Show>
              </div>
            );
          }}
        </For>
      </div>
    </Tag>
  );
};
