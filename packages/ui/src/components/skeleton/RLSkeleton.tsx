import type { Component } from "solid-js";
import { createEffect, createSignal, For, Show } from "solid-js";
import type { RLSkeletonProps } from "./skeleton.types";
import { RLSkeletonTheme } from "./skeleton.theme";
import { createResizeObserver, extractSkeletonRects, type SkeletonRect } from "./skeleton.dom";

const OMIT_KEYS = ["loading", "fallbackBorderRadius"] as const;

export const RLSkeleton: Component<RLSkeletonProps> = (props) => {
  const { Tag, classes, rest, children, theme } = RLSkeletonTheme.setup(props, {
    omit: OMIT_KEYS,
  });

  const isLoading = () => props.loading ?? true;
  const hasChildren = () => children() !== undefined && children() !== null;

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
    () => hasChildren() && isLoading(),
    (active) => {
      if (!active || !measureRef) {
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
      return createResizeObserver(measureRef, measure);
    },
  );

  return (
    <Tag
      class={hasChildren() ? classes().container : classes().root}
      data-slot="root"
      data-theme={theme()}
      {...rest}
    >
      <Show when={hasChildren() && isLoading()} fallback={children()}>
        {/* Render actual child structure with invisible text / hidden media */}
        <div
          ref={(el) => {
            measureRef = el;
          }}
          class={classes().measure}
          data-slot="measure"
          aria-hidden="true"
        >
          {children()}
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
      </Show>
    </Tag>
  );
};
