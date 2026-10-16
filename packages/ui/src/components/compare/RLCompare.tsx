import type { RLCompareProps, CompareOrientation } from "./compare.types";
import { RLCompareTheme, LABEL_PLACEMENT_CLASSES } from "./compare.theme";
import {
  createMemo,
  createSignal,
  createEffect,
  isStatic,
  children,
  omit,
  type Component,
} from "solid-js";
import { dynamic } from "@solidjs/web";
import { RLIcon } from "../icon/RLIcon";

export const RLCompare: Component<RLCompareProps> = (props) => {
  const rest = omit(
    props,
    "value",
    "defaultValue",
    "min",
    "max",
    "step",
    "largeStep",
    "orientation",
    "before",
    "after",
    "beforeSrc",
    "afterSrc",
    "beforeAlt",
    "afterAlt",
    "beforeLabel",
    "afterLabel",
    "showLabels",
    "beforeLabelPlacement",
    "afterLabelPlacement",
    "handle",
    "handleIcon",
    "showHandle",
    "showDivider",
    "hover",
    "disabled",
    "autoplay",
    "autoplayDuration",
    "variant",
    "size",
    "color",
    "theme",
    "onValueChange",
    "onChange",
    "ariaLabel",
    "ariaLabelledby",
    "as",
    "ui",
    "class",
    "children",
  );

  const Root = dynamic(() => props.as ?? "div", { static: isStatic(props, "as") });
  const resolvedChildren = children(() => props.children);

  const min = () => props.min ?? 0;
  const max = () => props.max ?? 100;
  const step = () => props.step ?? 1;
  const largeStep = () => props.largeStep ?? 10;
  const orientation = (): CompareOrientation => props.orientation ?? "horizontal";
  const isHorizontal = () => orientation() === "horizontal";
  const isDisabled = () => Boolean(props.disabled);
  const showHandle = () => props.showHandle ?? true;
  const showDivider = () => props.showDivider ?? true;

  const [internalValue, setInternalValue] = createSignal<number>(
    () => props.value ?? props.defaultValue ?? 50,
  );

  const clampedValue = createMemo(() => {
    const raw = props.value !== undefined ? props.value : internalValue();
    return Math.min(max(), Math.max(min(), raw));
  });

  const updateValue = (nextVal: number) => {
    if (isDisabled()) return;
    const clamped = Math.min(max(), Math.max(min(), nextVal));
    if (props.value === undefined) {
      setInternalValue(clamped);
    }
    props.onValueChange?.(clamped);
    props.onChange?.(clamped);
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

  const classes = createMemo(() =>
    RLCompareTheme({
      orientation: orientation(),
      size: props.size ?? "md",
      variant: props.variant ?? "solid",
      color: props.color ?? "auto",
      disabled: isDisabled(),
      ui: props.ui,
      class: props.class,
    }),
  );

  const beforeLabelPlacementClass = () => {
    const custom = props.beforeLabelPlacement;
    if (custom && LABEL_PLACEMENT_CLASSES[custom]) {
      return LABEL_PLACEMENT_CLASSES[custom];
    }
    return LABEL_PLACEMENT_CLASSES["top-left"];
  };

  const afterLabelPlacementClass = () => {
    const custom = props.afterLabelPlacement;
    if (custom && LABEL_PLACEMENT_CLASSES[custom]) {
      return LABEL_PLACEMENT_CLASSES[custom];
    }
    return isHorizontal()
      ? LABEL_PLACEMENT_CLASSES["top-right"]
      : LABEL_PLACEMENT_CLASSES["bottom-left"];
  };

  const shouldShowLabels = () =>
    props.showLabels !== undefined
      ? props.showLabels
      : Boolean(props.beforeLabel || props.afterLabel);

  const renderBeforeContent = () => {
    if (typeof props.before === "function") {
      return props.before(clampedValue());
    }
    if (props.before !== undefined) {
      return props.before;
    }
    if (props.beforeSrc) {
      return (
        <img
          src={props.beforeSrc}
          alt={props.beforeAlt ?? "Before"}
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
    if (typeof props.after === "function") {
      return props.after(clampedValue());
    }
    if (props.after !== undefined) {
      return props.after;
    }
    if (props.afterSrc) {
      return (
        <img
          src={props.afterSrc}
          alt={props.afterAlt ?? "After"}
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
    if (typeof props.handle === "function") {
      return props.handle({ orientation: orientation(), value: clampedValue() });
    }
    if (props.handle !== undefined) {
      return props.handle;
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
    <Root
      ref={(el: HTMLElement) => (rootRef = el)}
      class={classes().root}
      data-slot="root"
      data-orientation={orientation()}
      data-disabled={isDisabled() ? "true" : undefined}
      data-theme={props.theme}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      {...rest}
    >
      <div class={classes().container} data-slot="container">
        {/* Base Layer: After */}
        <div class={classes().after} data-slot="after">
          {renderAfterContent()}
        </div>

        {/* Clipped Top Layer: Before */}
        <div class={classes().before} data-slot="before" style={clipStyle()}>
          {renderBeforeContent()}
        </div>

        {/* Before Label */}
        {shouldShowLabels() && props.beforeLabel ? (
          <span
            class={`${classes().beforeLabel} ${beforeLabelPlacementClass()}`}
            data-slot="before-label"
          >
            {props.beforeLabel}
          </span>
        ) : null}

        {/* After Label */}
        {shouldShowLabels() && props.afterLabel ? (
          <span
            class={`${classes().afterLabel} ${afterLabelPlacementClass()}`}
            data-slot="after-label"
          >
            {props.afterLabel}
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
            aria-label={props.ariaLabel ?? "Comparison slider"}
            aria-labelledby={props.ariaLabelledby}
            aria-disabled={isDisabled() ? "true" : undefined}
            onKeyDown={handleKeyDown}
            style={handleStyle()}
          >
            {renderHandle()}
          </div>
        ) : null}
      </div>
    </Root>
  );
};
