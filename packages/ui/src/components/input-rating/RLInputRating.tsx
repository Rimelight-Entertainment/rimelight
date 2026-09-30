import { createMemo, createSignal, omit, For, type Component } from "solid-js";
import type { InputRatingProps } from "./input-rating";
import { inputRatingTheme } from "./input-rating.theme";
import { RLIcon } from "../icon/RLIcon";

export interface RLInputRatingProps extends InputRatingProps {
  onValueChange?: (value: number) => void;
}

const RLInputRating: Component<RLInputRatingProps> = (allProps) => {
  const props = allProps;
  const rest = omit(
    allProps,
    "id",
    "readonly",
    "icon",
    "emptyIcon",
    "color",
    "size",
    "orientation",
    "step",
    "disabled",
    "required",
    "name",
    "modelValue",
    "defaultValue",
    "value",
    "length",
    "clearable",
    "hoverable",
    "ui",
    "class",
    "onValueChange",
  );

  const resolvedClasses = createMemo(() =>
    inputRatingTheme({
      color: props.color ?? "primary",
      size: props.size ?? "md",
      orientation: props.orientation ?? "horizontal",
      readonly: !!props.readonly,
      disabled: !!props.disabled,
      ui: props.ui,
      class: props.class,
    }),
  );

  const step = () => props.step ?? 1;
  const length = () => props.length ?? 5;
  const hoverable = () => !!props.hoverable;
  const clearable = () => !!props.clearable;
  const itemSizeClass = () => {
    const map: Record<string, string> = {
      xs: "size-3",
      sm: "size-4",
      md: "size-5",
      lg: "size-6",
      xl: "size-7",
    };
    return map[props.size ?? "md"] || "size-5";
  };

  const [internalValue, setInternalValue] = createSignal<number>(
    props.value !== undefined
      ? props.value
      : props.modelValue !== undefined
        ? props.modelValue
        : (props.defaultValue ?? 0),
  );
  const value = () =>
    props.value !== undefined
      ? props.value
      : props.modelValue !== undefined
        ? props.modelValue
        : internalValue();

  const [hoverValue, setHoverValue] = createSignal<number | null>(null);
  const display = (): number => (hoverValue() !== null ? hoverValue()! : value());

  const items = createMemo(() => Array.from({ length: length() }, (_, idx) => idx + 1));

  const getWidthClass = (val: number, itemIndex: number) => {
    if (val >= itemIndex) return "w-full";
    if (val <= itemIndex - 1) return "w-0";
    const pct = Math.round((val - (itemIndex - 1)) * 100);
    return pct === 75 ? "w-3/4" : pct === 50 ? "w-1/2" : pct === 25 ? "w-1/4" : `w-[${pct}%]`;
  };

  const getValueFromEvent = (e: MouseEvent, el: HTMLElement, index: number) => {
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const steppedX = Math.ceil(x / step()) * step();
    return Math.min(Math.max(index - 1 + steppedX, 0), length());
  };

  const handleMouseMove = (e: MouseEvent, el: HTMLElement, index: number) => {
    if (!hoverable()) return;
    const val = getValueFromEvent(e, el, index);
    setHoverValue(val);
  };

  const handleMouseLeave = () => {
    setHoverValue(null);
  };

  const handleClick = (e: MouseEvent, el: HTMLElement, index: number) => {
    const val = getValueFromEvent(e, el, index);
    let next = val;
    if (clearable() && value() === val) {
      next = 0;
    }
    setInternalValue(next);
    props.onValueChange?.(next);
    setHoverValue(null);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (props.disabled || props.readonly) return;
    let next = value();
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      next = Math.min(value() + step(), length());
      e.preventDefault();
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      next = Math.max(value() - step(), 0);
      e.preventDefault();
    } else if (e.key === "Home") {
      next = 0;
      e.preventDefault();
    } else if (e.key === "End") {
      next = length();
      e.preventDefault();
    }
    if (next !== value()) {
      setInternalValue(next);
      props.onValueChange?.(next);
    }
  };

  return (
    <div
      class={resolvedClasses().root}
      data-slot="root"
      data-step={step()}
      data-length={length()}
      data-clearable={props.clearable ? "true" : "false"}
      data-hoverable={props.hoverable ? "true" : "false"}
      data-disabled={props.disabled ? "true" : "false"}
      data-readonly={props.readonly ? "true" : "false"}
      id={props.id}
      role="slider"
      aria-valuenow={value()}
      aria-valuemin={0}
      aria-valuemax={length()}
      aria-readonly={props.readonly ? "true" : "false"}
      aria-disabled={props.disabled ? "true" : "false"}
      tabindex={props.disabled || props.readonly ? undefined : 0}
      onKeyDown={handleKeyDown}
      {...rest}
    >
      <input
        type="hidden"
        name={props.name}
        value={value()}
        required={props.required}
        disabled={props.disabled || props.readonly}
        class="rating-hidden-input"
      />

      <For each={items()}>
        {(i) => (
          <div
            class={`input-rating-item ${resolvedClasses().item} ${itemSizeClass()}`}
            data-slot="item"
            data-index={i}
            onMouseMove={(e) => handleMouseMove(e, e.currentTarget, i)}
            onMouseLeave={handleMouseLeave}
            onClick={(e) => handleClick(e, e.currentTarget, i)}
          >
            <div class={resolvedClasses().emptyIcon} data-slot="emptyIcon">
              <RLIcon
                name={props.emptyIcon || props.icon || "star"}
                size={props.size ?? "md"}
                class={resolvedClasses().icon}
                aria-hidden="true"
              />
            </div>

            <div
              class={`rating-item-indicator ${resolvedClasses().indicator} ${getWidthClass(display(), i)}`}
              data-slot="indicator"
              data-state={display() >= i - 0.99 ? "active" : "inactive"}
            >
              <RLIcon
                name={props.icon || "star"}
                size={props.size ?? "md"}
                class={resolvedClasses().icon}
                aria-hidden="true"
              />
            </div>
          </div>
        )}
      </For>
    </div>
  );
};

export { RLInputRating };
