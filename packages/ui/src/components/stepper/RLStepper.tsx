import type { Component } from "solid-js";
import { For, Show } from "solid-js";
import type { RLStepperProps, StepperItem, StepperState } from "./stepper.types";
import { RLStepperTheme } from "./stepper.theme";
import { RLIcon } from "../icon/RLIcon";
import { RLButton } from "../button/RLButton";
import { createControllable } from "../../controllable";
import { renderSlot } from "../../slot";

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

export const RLStepper: Component<RLStepperProps> = (props) => {
  const { Tag, classes, rest, slots, children, theme } = RLStepperTheme.setup(props, {
    omit: OMIT_KEYS,
    slots: ["indicatorSlot", "wrapperSlot"] as const,
  });

  const items = (): StepperItem[] => props.items ?? [];

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

  const stateOf = (index: number): StepperState => {
    if (index < currentIndex()) return "completed";
    if (index === currentIndex()) return "active";
    return "inactive";
  };

  const isItemDisabled = (item: StepperItem, index: number): boolean =>
    props.disabled === true ||
    item.disabled === true ||
    (props.linear !== false && index > currentIndex() + 1);

  const goTo = (index: number) => {
    if (props.disabled === true) return;
    if (index < 0 || index >= items().length) return;
    if (props.linear !== false && index > currentIndex() + 1) return;

    const oldIndex = currentIndex();
    const item = items()[index];
    if (!item) return;
    const value = itemValue(item, index);
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
          {(item, index) => (
            <>
              <div
                class={classes().item}
                data-slot="item"
                data-index={index()}
                data-value={itemValue(item, index())}
                data-state={stateOf(index())}
                data-disabled={isItemDisabled(item, index()) ? "" : undefined}
              >
                <div class={classes().container} data-slot="container">
                  <RLButton
                    type="button"
                    class={classes().trigger}
                    data-slot="trigger"
                    disabled={isItemDisabled(item, index())}
                    onClick={() => goTo(index())}
                  >
                    <span class={classes().indicator} data-slot="indicator">
                      <Show
                        when={slots.indicatorSlot()}
                        fallback={
                          <Show when={item.icon} fallback={<span>{index() + 1}</span>}>
                            {(icon) => (
                              <RLIcon
                                name={icon()}
                                size="sm"
                                class={classes().icon}
                                data-slot="icon"
                              />
                            )}
                          </Show>
                        }
                      >
                        {(indicatorSlot) =>
                          renderSlot(indicatorSlot(), {
                            item,
                            index: index(),
                            state: stateOf(index()),
                          })
                        }
                      </Show>
                    </span>
                  </RLButton>
                </div>

                <Show when={item.title || item.description}>
                  <div class={classes().wrapper} data-slot="wrapper">
                    <Show
                      when={slots.wrapperSlot()}
                      fallback={
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
                      }
                    >
                      {(wrapperSlot) => renderSlot(wrapperSlot(), { item, index: index() })}
                    </Show>
                  </div>
                </Show>
              </div>

              <Show when={index() < items().length - 1}>
                <div
                  class={classes().separator}
                  data-slot="separator"
                  data-state={index() < currentIndex() ? "completed" : "inactive"}
                />
              </Show>
            </>
          )}
        </For>
      </div>

      <div class={classes().body} data-slot="body">
        {children()}
        <For each={items()}>
          {(item, index) => (
            <div
              class={classes().panel}
              data-slot="panel"
              data-value={itemValue(item, index())}
              data-state={index() === currentIndex() ? "active" : "inactive"}
              hidden={index() === currentIndex() ? undefined : "until-found"}
            >
              <Show when={item.content}>{(content) => <div>{content()}</div>}</Show>
            </div>
          )}
        </For>
      </div>
    </Tag>
  );
};
