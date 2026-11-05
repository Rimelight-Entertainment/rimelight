import type { Component } from "solid-js";
import type { RLInputRatingProps } from "./input-rating.types";
import { RLInputRatingTheme } from "./input-rating.theme";
import { createMemo, createSignal, For } from "solid-js";
import { RLIcon } from "../icon/RLIcon";
import { createControllable } from "../../controllable";

const OMIT_KEYS = [
  "id",
  "icon",
  "emptyIcon",
  "step",
  "required",
  "name",
  "defaultValue",
  "value",
  "length",
  "clearable",
  "hoverable",
  "onValueChange",
] as const;

export const RLInputRating: Component<RLInputRatingProps> = (props) => {
  const { Tag, classes, rest, children, theme, id } = RLInputRatingTheme.setup(props, {
    omit: OMIT_KEYS,
  });

  const step = () => props.step ?? 1;
  const length = () => props.length ?? 5;

  const [value, setValue] = createControllable(
    () => props.value,
    props.defaultValue ?? 0,
    (next) => props.onValueChange?.(next),
  );

  const [hoverValue, setHoverValue] = createSignal<number | null>(null);
  const display = (): number => hoverValue() ?? value();

  const items = createMemo(() => Array.from({ length: length() }, (_, idx) => idx + 1));

  const fillPercent = (itemIndex: number): number => {
    const val = display();
    if (val >= itemIndex) return 100;
    if (val <= itemIndex - 1) return 0;
    return Math.round((val - (itemIndex - 1)) * 100);
  };

  const getValueFromEvent = (e: MouseEvent, el: HTMLElement, index: number) => {
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const steppedX = Math.ceil(x / step()) * step();
    return Math.min(Math.max(index - 1 + steppedX, 0), length());
  };

  const handleMouseMove = (e: MouseEvent, el: HTMLElement, index: number) => {
    if (!props.hoverable) return;
    setHoverValue(getValueFromEvent(e, el, index));
  };

  const handleClick = (e: MouseEvent, el: HTMLElement, index: number) => {
    const val = getValueFromEvent(e, el, index);
    const next = props.clearable && value() === val ? 0 : val;
    setValue(next);
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
      setValue(next);
    }
  };

  return (
    <Tag
      data-slot="root"
      data-theme={theme()}
      class={classes().root}
      data-step={step()}
      data-length={length()}
      data-clearable={props.clearable ? "" : undefined}
      data-hoverable={props.hoverable ? "" : undefined}
      data-disabled={props.disabled ? "" : undefined}
      data-readonly={props.readonly ? "" : undefined}
      id={id()}
      role="slider"
      aria-valuenow={value()}
      aria-valuemin={0}
      aria-valuemax={length()}
      aria-readonly={props.readonly}
      aria-disabled={props.disabled}
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
      />

      <For each={items()}>
        {(i) => (
          <div
            class={classes().item}
            data-slot="item"
            data-index={i}
            onMouseMove={(e) => handleMouseMove(e, e.currentTarget, i)}
            onMouseLeave={() => setHoverValue(null)}
            onClick={(e) => handleClick(e, e.currentTarget, i)}
          >
            <div class={classes().emptyIcon} data-slot="empty-icon">
              <RLIcon
                name={props.emptyIcon || props.icon || "star"}
                size={props.size}
                class={classes().icon}
                aria-hidden="true"
              />
            </div>

            <div
              class={classes().indicator}
              data-slot="indicator"
              data-active={display() >= i - 0.99 ? "" : undefined}
              style={{ "--rl-progress": `${fillPercent(i)}%` }}
            >
              <RLIcon
                name={props.icon || "star"}
                size={props.size}
                class={classes().icon}
                aria-hidden="true"
              />
            </div>
          </div>
        )}
      </For>
      {children()}
    </Tag>
  );
};
