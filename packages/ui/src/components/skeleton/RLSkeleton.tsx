import type { RLSkeletonProps } from "./skeleton.types";
import { RLSkeletonTheme } from "./skeleton.theme";
import {
  createEffect,
  createMemo,
  createSignal,
  For,
  omit,
  onCleanup,
  Show,
  type Component,
} from "solid-js";
import { createResizeObserver, extractSkeletonRects, type SkeletonRect } from "./skeleton.dom";

export const RLSkeleton: Component<RLSkeletonProps> = (props) => {
  const rest = omit(
    props,
    "shape",
    "loading",
    "fallbackBorderRadius",
    "theme",
    "ui",
    "class",
    "children",
  );

  const isLoading = () => props.loading ?? true;
  const hasChildren = () => props.children !== undefined && props.children !== null;

  const classes = createMemo(() =>
    RLSkeletonTheme({
      shape: props.shape ?? "rounded",
      ui: props.ui,
      class: props.class,
    }),
  );

  // Standalone mode: simple placeholder box
  if (!hasChildren()) {
    return <div class={classes().root} data-slot="root" {...rest} />;
  }

  // Structural skeleton wrapper mode
  const [rects, setRects] = createSignal<SkeletonRect[]>([]);
  let measureRef: HTMLDivElement | undefined = undefined;

  const resolveBorderRadius = (rect: SkeletonRect) => {
    if (rect.borderRadius && rect.borderRadius !== "0px") {
      return rect.borderRadius;
    }
    if (props.fallbackBorderRadius !== undefined) {
      return `${props.fallbackBorderRadius}px`;
    }
    if (props.shape === "circle") return "9999px";
    if (props.shape === "rectangle") return "0px";
    return "6px";
  };

  createEffect(
    () => isLoading(),
    (loading) => {
      if (!loading || !measureRef) {
        setRects([]);
        return;
      }

      const measure = () => {
        if (!measureRef) return;
        try {
          const extracted = extractSkeletonRects(measureRef);
          setRects(extracted);
        } catch {
          // Safe fallback in SSR or detached DOM environments
        }
      };

      // Initial synchronous measurement
      measure();

      // Subscribe to resize / layout changes
      const cleanup = createResizeObserver(measureRef, measure);
      onCleanup(cleanup);
    },
  );

  return (
    <Show when={isLoading()} fallback={<>{props.children}</>}>
      <div class={classes().container} data-slot="container" {...rest}>
        {/* Render actual child structure with invisible text / hidden media */}
        <div
          ref={(el) => {
            measureRef = el;
          }}
          class={classes().measure}
          data-slot="measure"
          aria-hidden="true"
        >
          {props.children}
        </div>

        {/* Shimmer overlay based on extracted child geometry */}
        <div class={classes().overlay} data-slot="overlay">
          <For each={rects()}>
            {(rect) => (
              <div
                class={classes().shimmer}
                data-slot="shimmer"
                style={{
                  position: "absolute",
                  left: `${rect.x}px`,
                  top: `${rect.y}px`,
                  width: `${rect.width}px`,
                  height: `${rect.height}px`,
                  "border-radius": resolveBorderRadius(rect),
                }}
              >
                <div class={classes().highlight} data-slot="highlight" />
              </div>
            )}
          </For>
        </div>
      </div>
    </Show>
  );
};
