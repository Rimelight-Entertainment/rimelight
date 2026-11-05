import { Show, children, createEffect, createSignal, type Component } from "solid-js";
import type { RLCompareProps } from "./compare.types";
import { RLCompareTheme } from "./compare.theme";
import { RLIcon } from "../icon/RLIcon";
import { RLImage } from "../image/RLImage";
import { createControllable } from "../../controllable";
import { uiT } from "../../locale";
import { renderSlot } from "../../slot";

const OMIT_KEYS = [
  "value",
  "defaultValue",
  "min",
  "max",
  "step",
  "largeStep",
  "beforeSrc",
  "afterSrc",
  "beforeAlt",
  "afterAlt",
  "showLabels",
  "beforeLabelPosition",
  "afterLabelPosition",
  "handleIcon",
  "hasHandle",
  "hasDivider",
  "hover",
  "autoplay",
  "autoplayDuration",
  "disabled",
  "onValueChange",
  "aria-label",
  "aria-labelledby",
] as const;

export const RLCompare: Component<RLCompareProps> = (props) => {
  const {
    Tag,
    classes,
    rest,
    slots,
    children: childNodes,
    theme,
  } = RLCompareTheme.setup(props, {
    omit: OMIT_KEYS,
    slots: [
      "beforeLayerSlot",
      "afterLayerSlot",
      "beforeLabelSlot",
      "afterLabelSlot",
      "handleSlot",
    ] as const,
    variants: () => ({
      afterLabelPosition:
        props.afterLabelPosition ??
        (props.orientation === "vertical" ? "bottom-left" : "top-right"),
    }),
  });

  const resolvedChildren = children(childNodes);

  const min = () => props.min ?? 0;
  const max = () => props.max ?? 100;
  const step = () => props.step ?? 1;
  const largeStep = () => props.largeStep ?? 10;
  const isHorizontal = () => props.orientation !== "vertical";
  const orientation = (): "horizontal" | "vertical" => (isHorizontal() ? "horizontal" : "vertical");
  const isDisabled = () => Boolean(props.disabled);

  const [valueState, setValueState] = createControllable(
    () => props.value,
    props.defaultValue ?? 50,
    (next) => props.onValueChange?.(next),
  );

  const clampedValue = () => Math.min(max(), Math.max(min(), valueState()));

  const updateValue = (nextVal: number) => {
    if (isDisabled()) return;
    setValueState(Math.min(max(), Math.max(min(), nextVal)));
  };

  let rootRef: HTMLElement | undefined;
  const [isDragging, setIsDragging] = createSignal(false);

  const calculatePercentageFromPointer = (clientX: number, clientY: number): number => {
    if (!rootRef) return clampedValue();
    const rect = rootRef.getBoundingClientRect();
    if (isHorizontal()) {
      if (rect.width <= 0) return clampedValue();
      const pos = ((clientX - rect.left) / rect.width) * 100;
      return Math.min(max(), Math.max(min(), pos));
    } else {
      if (rect.height <= 0) return clampedValue();
      const pos = ((clientY - rect.top) / rect.height) * 100;
      return Math.min(max(), Math.max(min(), pos));
    }
  };

  const handlePointerDown = (e: PointerEvent) => {
    if (isDisabled()) return;
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setIsDragging(true);
    const newPct = calculatePercentageFromPointer(e.clientX, e.clientY);
    updateValue(newPct);
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (isDisabled()) return;
    if (isDragging() || props.hover) {
      const newPct = calculatePercentageFromPointer(e.clientX, e.clientY);
      updateValue(newPct);
    }
  };

  const handlePointerUp = (e: PointerEvent) => {
    if (isDragging()) {
      if ((e.currentTarget as HTMLElement).hasPointerCapture(e.pointerId)) {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      }
      setIsDragging(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (isDisabled()) return;
    const current = clampedValue();
    let next: number | undefined;

    switch (e.key) {
      case "ArrowLeft":
      case "ArrowDown":
        e.preventDefault();
        next = current - step();
        break;
      case "ArrowRight":
      case "ArrowUp":
        e.preventDefault();
        next = current + step();
        break;
      case "PageDown":
        e.preventDefault();
        next = current - largeStep();
        break;
      case "PageUp":
        e.preventDefault();
        next = current + largeStep();
        break;
      case "Home":
        e.preventDefault();
        next = min();
        break;
      case "End":
        e.preventDefault();
        next = max();
        break;
      default:
        break;
    }

    if (next !== undefined) {
      updateValue(next);
    }
  };

  createEffect(
    () => ({
      autoplay: Boolean(props.autoplay),
      duration: props.autoplayDuration ?? 3000,
      disabled: isDisabled(),
    }),
    (state) => {
      if (!state.autoplay || state.disabled) return;
      let animId: number;
      let startTime: number | null = null;

      const animate = (timestamp: number) => {
        if (startTime === null) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = (elapsed % state.duration) / state.duration;
        const sinProgress = (Math.sin(progress * Math.PI * 2 - Math.PI / 2) + 1) / 2;
        const range = max() - min();
        const calculatedVal = min() + sinProgress * range;

        if (!isDragging()) {
          updateValue(calculatedVal);
        }
        animId = requestAnimationFrame(animate);
      };

      animId = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(animId);
    },
  );

  const shouldShowLabels = () =>
    props.showLabels !== undefined
      ? props.showLabels
      : Boolean(slots.beforeLabelSlot() || slots.afterLabelSlot());

  const visibleBeforeLabel = () => (shouldShowLabels() ? slots.beforeLabelSlot() : undefined);
  const visibleAfterLabel = () => (shouldShowLabels() ? slots.afterLabelSlot() : undefined);

  const renderBeforeContent = () => {
    const custom = slots.beforeLayerSlot();
    if (custom !== undefined) {
      return renderSlot(custom, clampedValue());
    }
    if (props.beforeSrc) {
      return (
        <RLImage
          src={props.beforeSrc}
          alt={props.beforeAlt ?? uiT("compare.beforeAlt")}
          class={classes().image}
          lightbox={false}
          draggable={false}
        />
      );
    }
    return resolvedChildren.toArray()[0] ?? null;
  };

  const renderAfterContent = () => {
    const custom = slots.afterLayerSlot();
    if (custom !== undefined) {
      return renderSlot(custom, clampedValue());
    }
    if (props.afterSrc) {
      return (
        <RLImage
          src={props.afterSrc}
          alt={props.afterAlt ?? uiT("compare.afterAlt")}
          class={classes().image}
          lightbox={false}
          draggable={false}
        />
      );
    }
    return resolvedChildren.toArray()[1] ?? null;
  };

  const renderHandle = () => {
    const handle = slots.handleSlot();
    if (handle !== undefined) {
      return renderSlot(handle, { orientation: orientation(), value: clampedValue() });
    }
    const defaultIconName = props.handleIcon
      ? props.handleIcon
      : isHorizontal()
        ? "chevrons-up-down"
        : "grip-horizontal";

    return <RLIcon name={defaultIconName} class={classes().handleIcon} aria-hidden="true" />;
  };

  // Runtime position only: the theme's orientation variants decide which axis it moves on.
  return (
    <Tag
      ref={(el: HTMLElement) => (rootRef = el)}
      class={classes().root}
      data-slot="root"
      data-orientation={orientation()}
      data-disabled={isDisabled() ? "" : undefined}
      data-theme={theme()}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      {...rest}
    >
      <div class={classes().container} data-slot="container">
        {/* Base layer: after */}
        <div class={classes().after} data-slot="after">
          {renderAfterContent()}
        </div>

        {/* Clipped top layer: before */}
        <div
          class={classes().before}
          data-slot="before"
          style={{
            "--rl-compare-clip": isHorizontal()
              ? `inset(0 calc(100% - ${clampedValue()}%) 0 0)`
              : `inset(0 0 calc(100% - ${clampedValue()}%) 0)`,
          }}
        >
          {renderBeforeContent()}
        </div>

        <Show when={visibleBeforeLabel()}>
          {(label) => (
            <span class={classes().beforeLabel} data-slot="before-label">
              {renderSlot(label())}
            </span>
          )}
        </Show>

        <Show when={visibleAfterLabel()}>
          {(label) => (
            <span class={classes().afterLabel} data-slot="after-label">
              {renderSlot(label())}
            </span>
          )}
        </Show>

        <Show when={props.hasDivider ?? true}>
          <div
            class={classes().divider}
            data-slot="divider"
            style={{ "--rl-compare-pos": `${clampedValue()}%` }}
            aria-hidden="true"
          />
        </Show>

        <Show when={props.hasHandle ?? true}>
          <div
            class={classes().handle}
            data-slot="handle"
            role="slider"
            tabindex={isDisabled() ? -1 : 0}
            aria-orientation={orientation()}
            aria-valuenow={Math.round(clampedValue())}
            aria-valuemin={min()}
            aria-valuemax={max()}
            aria-valuetext={`${Math.round(clampedValue())}%`}
            aria-label={props["aria-label"] ?? uiT("compare.label")}
            aria-labelledby={props["aria-labelledby"]}
            aria-disabled={isDisabled() ? "true" : undefined}
            onKeyDown={handleKeyDown}
            style={{ "--rl-compare-pos": `${clampedValue()}%` }}
          >
            {renderHandle()}
          </div>
        </Show>
      </div>
    </Tag>
  );
};
