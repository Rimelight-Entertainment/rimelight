import type { RLScrollAreaProps } from "./scroll-area.types";
import { RLScrollAreaTheme } from "./scroll-area.theme";
import { createEffect, createSignal, onSettled, Show, type Component } from "solid-js";

const OMIT_KEYS = ["scrollHideDelay", "height", "orientation"] as const;

export const RLScrollArea: Component<RLScrollAreaProps> = (props) => {
  const [barsVisible, setBarsVisible] = createSignal(false);

  const { Tag, classes, rest, children, theme } = RLScrollAreaTheme.setup(props, {
    omit: OMIT_KEYS,
    variants: () => ({ visible: barsVisible(), sized: props.height !== undefined }),
  });

  const orientation = () => props.orientation ?? "vertical";
  const hideDelay = () => props.scrollHideDelay ?? 600;
  const heightValue = () => (typeof props.height === "number" ? `${props.height}px` : props.height);

  let viewportRef: HTMLDivElement | null = null;
  let vBarRef: HTMLDivElement | null = null;
  let hBarRef: HTMLDivElement | null = null;
  let vThumbRef: HTMLDivElement | null = null;
  let hThumbRef: HTMLDivElement | null = null;
  let hideTimer: ReturnType<typeof setTimeout> | undefined;

  const hideBars = () => {
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
      setBarsVisible(false);
    }, hideDelay());
  };

  const updateThumbs = () => {
    const vp = viewportRef;
    if (!vp) return;

    if (vThumbRef && vBarRef) {
      const ratio = vp.clientHeight / vp.scrollHeight;
      const thumbH = Math.max(ratio * vBarRef.clientHeight, 20);
      const thumbTop = (vp.scrollTop / vp.scrollHeight) * vBarRef.clientHeight;
      vThumbRef.style.height = `${thumbH}px`;
      vThumbRef.style.transform = `translateY(${thumbTop}px)`;
    }

    if (hThumbRef && hBarRef) {
      const ratio = vp.clientWidth / vp.scrollWidth;
      const thumbW = Math.max(ratio * hBarRef.clientWidth, 20);
      const thumbLeft = (vp.scrollLeft / vp.scrollWidth) * hBarRef.clientWidth;
      hThumbRef.style.width = `${thumbW}px`;
      hThumbRef.style.transform = `translateX(${thumbLeft}px)`;
    }
  };

  const handleScroll = () => {
    clearTimeout(hideTimer);
    setBarsVisible(true);
    updateThumbs();
    hideBars();
  };

  const setupDraggable = (
    thumb: HTMLDivElement | null,
    scrollProp: "scrollTop" | "scrollLeft",
    clientProp: "clientY" | "clientX",
    sizeProp: "scrollHeight" | "scrollWidth",
    clientSizeProp: "clientHeight" | "clientWidth",
  ) => {
    if (!thumb) return () => {};
    let startPos = 0;
    let startScroll = 0;

    const onMouseDown = (e: MouseEvent) => {
      const vp = viewportRef;
      if (!vp) return;
      e.preventDefault();
      startPos = e[clientProp];
      startScroll = vp[scrollProp];

      const onMouseMove = (ev: MouseEvent) => {
        const vpCurrent = viewportRef;
        if (!vpCurrent) return;
        const delta = ev[clientProp] - startPos;
        const ratio = vpCurrent[sizeProp] / vpCurrent[clientSizeProp];
        vpCurrent[scrollProp] = startScroll + delta * ratio;
      };

      const onMouseUp = () => {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      };

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    };

    thumb.addEventListener("mousedown", onMouseDown);
    return () => thumb.removeEventListener("mousedown", onMouseDown);
  };

  onSettled(() => {
    updateThumbs();
    const cleanV = setupDraggable(
      vThumbRef,
      "scrollTop",
      "clientY",
      "scrollHeight",
      "clientHeight",
    );
    const cleanH = setupDraggable(hThumbRef, "scrollLeft", "clientX", "scrollWidth", "clientWidth");

    return () => {
      clearTimeout(hideTimer);
      cleanV();
      cleanH();
    };
  });

  createEffect(
    () => children(),
    () => {
      requestAnimationFrame(() => updateThumbs());
    },
  );

  return (
    <Tag
      data-slot="root"
      data-theme={theme()}
      data-orientation={orientation()}
      class={classes().root}
      style={{ "--rl-scroll-area-height": heightValue() }}
      {...rest}
    >
      <div
        ref={(el) => (viewportRef = el)}
        class={classes().viewport}
        data-slot="viewport"
        onScroll={handleScroll}
      >
        {children()}
      </div>

      <Show when={orientation() !== "horizontal"}>
        <div
          ref={(el) => (vBarRef = el)}
          class={classes().scrollbar}
          data-slot="scrollbar"
          data-orientation="vertical"
          aria-hidden="true"
        >
          <div ref={(el) => (vThumbRef = el)} class={classes().thumb} data-slot="thumb" />
        </div>
      </Show>

      <Show when={orientation() === "horizontal" || orientation() === "both"}>
        <div
          ref={(el) => (hBarRef = el)}
          class={classes().scrollbar}
          data-slot="scrollbar"
          data-orientation="horizontal"
          aria-hidden="true"
        >
          <div ref={(el) => (hThumbRef = el)} class={classes().thumb} data-slot="thumb" />
        </div>
      </Show>
    </Tag>
  );
};
