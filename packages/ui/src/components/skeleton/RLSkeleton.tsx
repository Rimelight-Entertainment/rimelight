import type { Component } from "solid-js";
import { createEffect, createMemo, createSignal, For, Show } from "solid-js";
import type { RLSkeletonProps, SkeletonRect } from "./skeleton.types";
import { RLSkeletonTheme } from "./skeleton.theme";
import { createResizeObserver, extractSkeletonRects } from "./skeleton.helpers";

const OMIT_KEYS = ["loading", "fallbackBorderRadius"] as const;

export const RLSkeleton: Component<RLSkeletonProps> = (props) => {
  const { Tag, classes, rest, children, theme } = RLSkeletonTheme.setup(props, {
    omit: OMIT_KEYS,
  });

  const hasChildren = createMemo(() => children() !== undefined && children() !== null);
  const isMasking = createMemo(() => hasChildren() && (props.loading ?? true));
  const rootClass = createMemo(() => (hasChildren() ? classes().container : classes().root));

  const [rects, setRects] = createSignal<SkeletonRect[]>([]);
  let measureRef: HTMLDivElement | undefined = undefined;

  const borderRadiusOf = (rect: SkeletonRect): string | undefined => {
    if (rect.borderRadius && rect.borderRadius !== "0px") return rect.borderRadius;
    if (props.fallbackBorderRadius !== undefined) return `${props.fallbackBorderRadius}px`;
    return undefined;
  };

  createEffect(
    () => isMasking(),
    (active) => {
      if (!active || !measureRef) {
        setRects([]);
        return;
      }

      const measure = () => {
        if (!measureRef) return;
        try {
          setRects(extractSkeletonRects(measureRef));
        } catch {
          // Safe fallback in SSR or detached DOM environments
        }
      };

      measure();

      return createResizeObserver(measureRef, measure);
    },
  );

  return (
    <Tag class={rootClass()} data-slot="root" data-theme={theme()} {...rest}>
      <Show when={isMasking()} fallback={children()}>
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
        <div class={classes().overlay} data-slot="overlay">
          <For each={rects()}>
            {(rect) => (
              <div
                class={classes().shimmer}
                data-slot="shimmer"
                style={{
                  "--rl-skel-x": `${rect.x}px`,
                  "--rl-skel-y": `${rect.y}px`,
                  "--rl-skel-w": `${rect.width}px`,
                  "--rl-skel-h": `${rect.height}px`,
                  "--rl-skel-r": borderRadiusOf(rect),
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
