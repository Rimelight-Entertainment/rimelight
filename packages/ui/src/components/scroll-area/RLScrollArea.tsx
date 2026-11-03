import type { RLScrollAreaProps } from "./scroll-area.types";
import { RLScrollAreaTheme } from "./scroll-area.theme";
import { createEffect, createSignal, onSettled, Show, type Component } from "solid-js";

const OMIT_KEYS = ["scrollHideDelay", "height"] as const;

export const RLScrollArea: Component<RLScrollAreaProps> = (props) => {
  const { Tag, classes, rest, children, theme } = RLScrollAreaTheme.setup(props, {
    omit: OMIT_KEYS,
  });

  const hideDelay = () => props.scrollHideDelay ?? 600;

  let viewportRef: HTMLDivElement | null = null;
  let vBarRef: HTMLDivElement | null = null;
  let hBarRef: HTMLDivElement | null = null;
  let vThumbRef: HTMLDivElement | null = null;
  let hThumbRef: HTMLDivElement | null = null;

  const [barsVisible, setBarsVisible] = createSignal(false);
  let hideTimer: ReturnType<typeof setTimeout> | undefined;

  const showBars = () => {
    setBarsVisible(true);
  };

  const hideBars = () => {
    if (hideTimer) clearTimeout(hideTimer);
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
    if (hideTimer) clearTimeout(hideTimer);
    showBars();
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
      if (hideTimer) clearTimeout(hideTimer);
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

  const heightClass = () =>
    props.height
      ? typeof props.height === "number"
        ? `h-[${props.height}px]`
        : `h-[${props.height}]`
      : "";

  return (
    <Tag
      data-slot="root"
      data-theme={theme()}
      class={`${classes().root} ${heightClass()}`}
      data-scroll-area
      data-orientation={props.orientation}
      data-hide-delay={hideDelay()}
      {...rest}
    >
      <div
        ref={(el) => (viewportRef = el)}
        class={classes().viewport}
        data-slot="viewport"
        data-scroll-viewport
        onScroll={handleScroll}
      >
        {children()}
      </div>

      <Show when={props.orientation !== "horizontal"}>
        <div
          ref={(el) => (vBarRef = el)}
          class={`${classes().scrollbar} transition-opacity ${
            barsVisible() ? "opacity-100" : "opacity-0"
          }`}
          data-slot="scrollbar"
          data-scroll-bar="vertical"
          aria-hidden="true"
        >
          <div
            ref={(el) => (vThumbRef = el)}
            class={classes().thumb}
            data-scroll-thumb="vertical"
          />
        </div>
      </Show>

      <Show when={props.orientation === "horizontal" || props.orientation === "both"}>
        <div
          ref={(el) => (hBarRef = el)}
          class={`absolute bottom-0 left-0 right-0 h-2.5 flex-row flex p-0.5 bg-transparent transition-colors duration-150 ease-out hover:bg-muted/10 transition-opacity ${
            barsVisible() ? "opacity-100" : "opacity-0"
          }`}
          data-slot="scrollbar"
          data-scroll-bar="horizontal"
          aria-hidden="true"
        >
          <div
            ref={(el) => (hThumbRef = el)}
            class={classes().thumb}
            data-scroll-thumb="horizontal"
          />
        </div>
      </Show>
    </Tag>
  );
};
