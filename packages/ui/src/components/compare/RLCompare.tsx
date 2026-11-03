import type { RLCompareProps } from "./compare.types";
import { RLCompareTheme, LABEL_PLACEMENT_CLASSES } from "./compare.theme";
import { createSignal, createEffect, children, type Component } from "solid-js";
import { RLIcon } from "../icon/RLIcon";
import { createControllable } from "../../controllable";
import { uiT } from "../../locale";

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
  "beforeLabelPlacement",
  "afterLabelPlacement",
  "handleIcon",
  "showHandle",
  "showDivider",
  "hover",
  "autoplay",
  "autoplayDuration",
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
      "leadingSlot",
      "trailingSlot",
      "beforeLabelSlot",
      "afterLabelSlot",
      "handleSlot",
    ] as const,
  });

  const resolvedChildren = children(childNodes);

  const min = () => props.min ?? 0;
  const max = () => props.max ?? 100;
  const step = () => props.step ?? 1;
  const largeStep = () => props.largeStep ?? 10;
  const isHorizontal = () => props.orientation !== "vertical";
  const orientation = () => (isHorizontal() ? "horizontal" : "vertical");
  const isDisabled = () => Boolean(props.disabled);
  const showHandle = () => props.showHandle ?? true;
  const showDivider = () => props.showDivider ?? true;

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
    ({ autoplay, duration, disabled }) => {
      if (!autoplay || disabled) return;
      let animId: number;
      let startTime: number | null = null;

      const animate = (timestamp: number) => {
        if (startTime === null) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = (elapsed % duration) / duration;
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

  const beforeLabelPlacementClass = () =>
    LABEL_PLACEMENT_CLASSES[props.beforeLabelPlacement ?? "top-left"];

  const afterLabelPlacementClass = () =>
    LABEL_PLACEMENT_CLASSES[
      props.afterLabelPlacement ?? (isHorizontal() ? "top-right" : "bottom-left")
    ];

  const shouldShowLabels = () =>
    props.showLabels !== undefined
      ? props.showLabels
      : Boolean(slots.beforeLabelSlot() || slots.afterLabelSlot());

  const renderBeforeContent = () => {
    const leading = slots.leadingSlot();
    if (typeof leading === "function") {
      return leading(clampedValue());
    }
    if (leading !== undefined) {
      return leading;
    }
    if (props.beforeSrc) {
      return (
        <img
          src={props.beforeSrc}
          alt={props.beforeAlt ?? uiT("compare.beforeAlt")}
          class={classes().image}
          draggable={false}
        />
      );
    }
    const arr = resolvedChildren.toArray();
    if (arr.length > 0) {
      return arr[0];
    }
    return null;
  };

  const renderAfterContent = () => {
    const trailing = slots.trailingSlot();
    if (typeof trailing === "function") {
      return trailing(clampedValue());
    }
    if (trailing !== undefined) {
      return trailing;
    }
    if (props.afterSrc) {
      return (
        <img
          src={props.afterSrc}
          alt={props.afterAlt ?? uiT("compare.afterAlt")}
          class={classes().image}
          draggable={false}
        />
      );
    }
    const arr = resolvedChildren.toArray();
    if (arr.length > 1) {
      return arr[1];
    }
    return null;
  };

  const renderHandle = () => {
    const handle = slots.handleSlot();
    if (typeof handle === "function") {
      return handle({ orientation: orientation(), value: clampedValue() });
    }
    if (handle !== undefined) {
      return handle;
    }
    const defaultIconName = props.handleIcon
      ? props.handleIcon
      : isHorizontal()
        ? "chevrons-up-down"
        : "grip-horizontal";

    return <RLIcon name={defaultIconName} class={classes().handleIcon} aria-hidden="true" />;
  };

  const clipStyle = () => ({
    "clip-path": isHorizontal()
      ? `inset(0 calc(100% - ${clampedValue()}%) 0 0)`
      : `inset(0 0 calc(100% - ${clampedValue()}%) 0)`,
  });

  const dividerStyle = () =>
    isHorizontal() ? { left: `${clampedValue()}%` } : { top: `${clampedValue()}%` };

  const handleStyle = () =>
    isHorizontal()
      ? { left: `${clampedValue()}%`, top: "50%" }
      : { left: "50%", top: `${clampedValue()}%` };

  return (
    <Tag
      ref={(el: HTMLElement) => (rootRef = el)}
      class={classes().root}
      data-slot="root"
      data-orientation={orientation()}
      data-disabled={isDisabled() ? "true" : undefined}
      data-theme={theme()}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      {...rest}
    >
      <div class={classes().container} data-slot="container">
        {/* Base Layer: Trailing */}
        <div class={classes().after} data-slot="after">
          {renderAfterContent()}
        </div>

        {/* Clipped Top Layer: Leading */}
        <div class={classes().before} data-slot="before" style={clipStyle()}>
          {renderBeforeContent()}
        </div>

        {/* Before Label */}
        {shouldShowLabels() && slots.beforeLabelSlot() ? (
          <span
            class={`${classes().beforeLabel} ${beforeLabelPlacementClass()}`}
            data-slot="before-label"
          >
            {slots.beforeLabelSlot()}
          </span>
        ) : null}

        {/* After Label */}
        {shouldShowLabels() && slots.afterLabelSlot() ? (
          <span
            class={`${classes().afterLabel} ${afterLabelPlacementClass()}`}
            data-slot="after-label"
          >
            {slots.afterLabelSlot()}
          </span>
        ) : null}

        {/* Divider Line */}
        {showDivider() ? (
          <div
            class={classes().divider}
            data-slot="divider"
            style={dividerStyle()}
            aria-hidden="true"
          />
        ) : null}

        {/* Interactive Handle */}
        {showHandle() ? (
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
            style={handleStyle()}
          >
            {renderHandle()}
          </div>
        ) : null}
      </div>
    </Tag>
  );
};
