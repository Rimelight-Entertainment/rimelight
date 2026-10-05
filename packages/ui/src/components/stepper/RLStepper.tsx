import { createMemo, createSignal, For, omit, type Component } from "solid-js";
import type { RLStepperProps, StepperItem } from "./stepper.types";
import { stepperTheme } from "./stepper.theme";
import { RLIcon } from "../icon/RLIcon";

export const RLStepper: Component<RLStepperProps> = (allProps) => {
  const props = allProps;
  const rest = omit(
    allProps,
    "items",
    "value",
    "defaultValue",
    "modelValue",
    "valueKey",
    "linear",
    "disabled",
    "orientation",
    "size",
    "color",
    "ui",
    "class",
    "children",
    "indicator",
    "wrapper",
    "onChange",
    "onNext",
    "onPrev",
  );

  const items = (): StepperItem[] => props.items ?? [];
  const valueKey = (): string => props.valueKey ?? "value";
  const linear = (): boolean => props.linear !== false;
  const isDisabled = (): boolean => props.disabled === true;

  const initialActiveValue =
    props.value ??
    props.modelValue ??
    props.defaultValue ??
    (items().length > 0 ? (items()[0]?.[valueKey()] ?? items()[0]?.value ?? 0) : 0);

  const activeIndex = items().findIndex((item, idx) => {
    const val = item[valueKey()] ?? item.value ?? idx;
    return String(val) === String(initialActiveValue);
  });

  const [currentIndex, setCurrentIndex] = createSignal(activeIndex >= 0 ? activeIndex : 0);

  const itemValue = (item: StepperItem, index: number): string | number =>
    item[valueKey()] ?? item.value ?? index;

  const goTo = (index: number) => {
    if (isDisabled()) return;
    if (index < 0 || index >= items().length) return;
    if (linear() && index > currentIndex() + 1) return;

    const oldIndex = currentIndex();
    setCurrentIndex(index);
    const value = itemValue(items()[index]!, index);

    if (index > oldIndex) {
      props.onNext?.({ index, value });
    } else if (index < oldIndex) {
      props.onPrev?.({ index, value });
    }
    props.onChange?.({ index, value });
  };

  const resolvedClasses = createMemo(() =>
    stepperTheme({
      size: props.size ?? "sm",
      color: props.color ?? "primary",
      orientation: props.orientation ?? "horizontal",
      ui: props.ui,
      class: props.class,
    }),
  );

  return (
    <div class={resolvedClasses().root} data-slot="root" {...rest}>
      <div class={resolvedClasses().header} data-slot="header">
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
                  class={`${resolvedClasses().item}  ${item.class || ""}`}
                  data-slot="item"
                  data-index={index()}
                  data-value={itemValue(item, index())}
                  data-state={state}
                  data-disabled={isItemDisabled ? "true" : undefined}
                >
                  <div class={resolvedClasses().container} data-slot="container">
                    <button
                      type="button"
                      class={resolvedClasses().trigger}
                      data-slot="trigger"
                      disabled={isItemDisabled}
                      data-step-trigger={index()}
                      onClick={() => goTo(index())}
                    >
                      <span class={resolvedClasses().indicator} data-slot="indicator">
                        {props.indicator ? (
                          props.indicator({ item, index: index(), state })
                        ) : item.icon ? (
                          <RLIcon
                            name={item.icon}
                            size="sm"
                            class={resolvedClasses().icon}
                            data-slot="icon"
                          />
                        ) : (
                          <span>{index() + 1}</span>
                        )}
                      </span>
                    </button>
                  </div>

                  {item.title || item.description ? (
                    <div class={resolvedClasses().wrapper} data-slot="wrapper">
                      {props.wrapper ? (
                        props.wrapper({ item, index: index() })
                      ) : (
                        <>
                          {item.title ? (
                            <div class={resolvedClasses().title} data-slot="title">
                              {item.title}
                            </div>
                          ) : null}
                          {item.description ? (
                            <div class={resolvedClasses().description} data-slot="description">
                              {item.description}
                            </div>
                          ) : null}
                        </>
                      )}
                    </div>
                  ) : null}
                </div>

                {index() < items().length - 1 ? (
                  <div
                    class={`${resolvedClasses().separator} ${
                      index() < currentIndex() ? "bg-primary" : "bg-muted"
                    }`}
                    data-slot="separator"
                    data-separator-index={index()}
                  />
                ) : null}
              </>
            );
          }}
        </For>
      </div>

      <div class={resolvedClasses().content} data-slot="content">
        {props.children}
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
                {item.content ? <div>{item.content}</div> : null}
              </div>
            );
          }}
        </For>
      </div>
    </div>
  );
};
