import type { JSX } from "@solidjs/web";
import type { RLCarouselProps, CarouselSlide } from "./carousel.types";
import { RLCarouselTheme } from "./carousel.theme";
import { RLButtonTheme } from "../button/button.theme";
import {
  children,
  createEffect,
  createMemo,
  createSignal,
  For,
  onSettled,
  Show,
  type Component,
} from "solid-js";
import { RLIcon } from "../icon/RLIcon";
import { uiT } from "../../locale";
import { cx } from "../../resolver";

const OMIT_KEYS = [
  "items",
  "prev",
  "prevIcon",
  "next",
  "nextIcon",
  "arrows",
  "dots",
  "autoplay",
  "autoScroll",
  "autoHeight",
  "classNames",
  "fade",
  "wheelGestures",
  "align",
  "containScroll",
  "slidesToScroll",
  "dragFree",
  "dragThreshold",
  "inViewThreshold",
  "loop",
  "skipSnaps",
  "duration",
  "startIndex",
  "watchDrag",
  "watchResize",
  "watchSlides",
  "watchFocus",
  "breakpoints",
  "onSelect",
  "aria-label",
  "ref",
] as const;

function parseBasisPercent(customClass?: string): number {
  if (!customClass) return 100;
  const fractionMatch = customClass.match(/basis-(\d+)\/(\d+)/);
  if (fractionMatch && fractionMatch[1] && fractionMatch[2]) {
    const num = parseFloat(fractionMatch[1]);
    const den = parseFloat(fractionMatch[2]);
    if (den > 0) return (num / den) * 100;
  }
  const percentMatch = customClass.match(/basis-\[(\d+(?:\.\d+)?)%\]/);
  if (percentMatch && percentMatch[1]) {
    return parseFloat(percentMatch[1]);
  }
  return 100;
}

export const RLCarousel: Component<RLCarouselProps> = (props) => {
  const [index, setIndex] = createSignal(props.startIndex ?? 0);
  const [isHovered, setIsHovered] = createSignal(false);

  const orientation = () => props.orientation ?? "horizontal";
  const controlsPlacement = () => props.controls ?? "outside";
  const isVertical = () => orientation() === "vertical";
  const isLoop = () => Boolean(props.loop);
  const isFade = () => Boolean(props.fade);

  const resolvedItems = createMemo(() => {
    if (props.items && Array.isArray(props.items)) return props.items;
    return [];
  });

  const {
    Tag,
    classes,
    rest,
    ui,
    theme,
    children: childNodes,
  } = RLCarouselTheme.setup(props, {
    omit: OMIT_KEYS,
    variants: () => ({
      orientation: orientation(),
      controls: controlsPlacement(),
      active: false,
    }),
  });

  const resolvedChildren = children(() =>
    typeof childNodes() === "function" ? null : childNodes(),
  );

  const slideCount = createMemo(() => {
    const items = resolvedItems();
    if (items.length > 0) return items.length;
    if (typeof childNodes() === "function") return 0;
    const ch = resolvedChildren.toArray();
    return ch.length;
  });

  const itemOverrideClass = (): string => {
    const override = ui()?.item;
    if (typeof override === "function") return override(classes().item);
    return cx(override);
  };
  const basisPercent = createMemo(() => parseBasisPercent(itemOverrideClass()));

  let viewportRef: HTMLDivElement | undefined;
  let containerRef: HTMLDivElement | undefined;
  let startX = 0;
  let startY = 0;
  let isDragging = false;
  let hasDragged = false;
  let autoplayTimer: ReturnType<typeof setInterval> | undefined;
  let wheelThrottleTimer: ReturnType<typeof setTimeout> | undefined;

  const dotActiveClasses = RLCarouselTheme.use(props, () => ({
    orientation: orientation(),
    controls: controlsPlacement(),
    active: true,
  }));

  const dots = createMemo(() => Array.from({ length: slideCount() }, (_, i) => i));

  const canScrollPrev = () => isLoop() || index() > 0;
  const canScrollNext = () => isLoop() || index() < slideCount() - 1;

  const scrollStep = () => {
    if (typeof props.slidesToScroll === "number") return props.slidesToScroll;
    return 1;
  };

  const scrollTo = (n: number) => {
    const count = slideCount();
    if (count === 0) return;

    let target = n;
    if (isLoop()) {
      target = ((target % count) + count) % count;
    } else {
      target = Math.max(0, Math.min(count - 1, target));
    }

    if (target !== index()) {
      setIndex(target);
      props.onSelect?.(target);
    }
  };

  const next = () => scrollTo(index() + scrollStep());
  const prev = () => scrollTo(index() - scrollStep());

  const prevButtonClass = () => {
    const custom = props.prev;
    if (!custom) return classes().prev;
    const btnCls = RLButtonTheme({
      variant: custom["variant"] || "link",
      color: custom["color"],
      size: custom["size"] || "md",
      class: custom["class"],
    }).root;
    return `${classes().prev} ${btnCls}`.trim();
  };

  const nextButtonClass = () => {
    const custom = props.next;
    if (!custom) return classes().next;
    const btnCls = RLButtonTheme({
      variant: custom["variant"] || "link",
      color: custom["color"],
      size: custom["size"] || "md",
      class: custom["class"],
    }).root;
    return `${classes().next} ${btnCls}`.trim();
  };

  const stopAutoplay = () => {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = undefined;
    }
  };

  createEffect(
    () => ({
      autoplay: props.autoplay,
      autoScroll: props.autoScroll,
      hovered: isHovered(),
      loop: isLoop(),
      count: slideCount(),
      step: scrollStep(),
    }),
    ({ autoplay, autoScroll, hovered, loop, count, step }) => {
      stopAutoplay();
      if ((!autoplay && !autoScroll) || hovered || count <= 1) return;

      const autoplayOpt = typeof autoplay === "object" ? autoplay : {};
      const autoScrollOpt = typeof autoScroll === "object" ? autoScroll : {};

      if (autoplayOpt.stopOnMouseEnter !== false && hovered) return;

      const delay =
        autoplayOpt.delay ??
        (autoScroll ? (autoScrollOpt.speed ? 1000 / autoScrollOpt.speed : 2000) : 2000);

      autoplayTimer = setInterval(() => {
        const cur = index();
        if (!loop && cur >= count - 1) {
          if (autoplayOpt.stopOnLastSnap) {
            stopAutoplay();
            return;
          }
          scrollTo(0);
        } else {
          scrollTo(cur + step);
        }
      }, delay);
      return stopAutoplay;
    },
  );

  onSettled(() => {
    if (props.ref) {
      props.ref({
        scrollTo,
        next,
        prev,
        selectedIndex: index,
        slideCount,
        canScrollNext,
        canScrollPrev,
      });
    }
    return () => {
      stopAutoplay();
      if (wheelThrottleTimer) clearTimeout(wheelThrottleTimer);
    };
  });

  const handlePointerDown = (e: PointerEvent) => {
    if (props.watchDrag === false) return;
    if (!viewportRef) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;

    startX = e.clientX;
    startY = e.clientY;
    hasDragged = false;
    isDragging = true;

    try {
      viewportRef.setPointerCapture(e.pointerId);
    } catch {}
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (!isDragging || !viewportRef) return;

    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;
    const threshold = props.dragThreshold ?? 10;

    if (!hasDragged) {
      if (isVertical()) {
        if (Math.abs(deltaY) > threshold) {
          hasDragged = true;
        } else if (Math.abs(deltaX) > threshold) {
          isDragging = false;
          try {
            viewportRef.releasePointerCapture(e.pointerId);
          } catch {}
          return;
        }
      } else {
        if (Math.abs(deltaX) > threshold) {
          hasDragged = true;
        } else if (Math.abs(deltaY) > threshold) {
          isDragging = false;
          try {
            viewportRef.releasePointerCapture(e.pointerId);
          } catch {}
          return;
        }
      }
    }

    if (hasDragged && containerRef && !isFade()) {
      e.preventDefault();
      const dimension = isVertical() ? viewportRef.clientHeight : viewportRef.clientWidth;
      const delta = isVertical() ? deltaY : deltaX;
      const basis = basisPercent();
      const dragPercent = (delta / (dimension || 1)) * 100;

      containerRef.style.transition = "none";
      const totalOffset = -index() * basis + dragPercent;
      if (isVertical()) {
        containerRef.style.transform = `translate3d(0px, ${totalOffset}%, 0px)`;
      } else {
        containerRef.style.transform = `translate3d(${totalOffset}%, 0px, 0px)`;
      }
    }
  };

  const handlePointerUp = (e: PointerEvent) => {
    if (!isDragging || !viewportRef) return;

    isDragging = false;
    try {
      viewportRef.releasePointerCapture(e.pointerId);
    } catch {}

    if (hasDragged) {
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      const dimension = isVertical() ? viewportRef.clientHeight : viewportRef.clientWidth;
      const delta = isVertical() ? deltaY : deltaX;
      const threshold = Math.min(50, Math.max(15, (dimension || 300) * 0.1));

      if (delta < -threshold && canScrollNext()) {
        next();
      } else if (delta > threshold && canScrollPrev()) {
        prev();
      }

      if (containerRef && !isFade()) {
        const duration = props.duration ?? 500;
        containerRef.style.transition = `transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1)`;
        const finalOffset = -index() * basisPercent();
        if (isVertical()) {
          containerRef.style.transform = `translate3d(0px, ${finalOffset}%, 0px)`;
        } else {
          containerRef.style.transform = `translate3d(${finalOffset}%, 0px, 0px)`;
        }
      }
    }

    hasDragged = false;
  };

  const handleWheel = (e: WheelEvent) => {
    if (!props.wheelGestures) return;
    if (wheelThrottleTimer) return;

    const delta = isVertical() ? e.deltaY : e.deltaX || e.deltaY;
    if (Math.abs(delta) > 15) {
      e.preventDefault();
      if (delta > 0) {
        next();
      } else {
        prev();
      }
      wheelThrottleTimer = setTimeout(() => {
        wheelThrottleTimer = undefined;
      }, 300);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (props.watchFocus === false) return;

    if (isVertical()) {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        prev();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        next();
      }
    } else {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        next();
      }
    }

    if (e.key === "Home") {
      e.preventDefault();
      scrollTo(0);
    } else if (e.key === "End") {
      e.preventDefault();
      scrollTo(slideCount() - 1);
    }
  };

  const renderSingleSlideContent = (item: unknown, i: number) => {
    if (typeof childNodes() === "function") {
      const renderFn = childNodes() as unknown as (
        ctx: { item: unknown; index: number },
        index: () => number,
      ) => JSX.Element;
      return renderFn({ item, index: i }, () => i);
    }

    if (typeof item === "object" && item !== null) {
      const slide = item as CarouselSlide;
      if (slide.imageSrc || slide.src) {
        return (
          <div class="relative w-full aspect-video select-none pointer-events-none">
            <img
              src={slide.imageSrc || slide.src}
              alt={slide.alt || slide.title || ""}
              class="w-full h-full object-cover rounded-lg pointer-events-none"
              draggable={false}
            />
            <Show when={slide.title || slide.description}>
              <div class="absolute bottom-4 left-4 right-4 p-4 rounded-lg bg-black/60 backdrop-blur-sm text-white">
                <Show when={slide.title}>
                  {(title) => <h4 class="text-sm font-semibold">{title()}</h4>}
                </Show>
                <Show when={slide.description}>
                  {(description) => <p class="text-xs opacity-95 mt-1">{description()}</p>}
                </Show>
              </div>
            </Show>
          </div>
        );
      }
    }

    if (typeof item === "string") {
      return (
        <img
          src={item}
          alt=""
          class="w-full h-auto object-cover rounded-lg select-none pointer-events-none"
          draggable={false}
        />
      );
    }

    return String(item);
  };

  const containerClasses = () => {
    const baseContainer = classes().container;
    if (isFade()) {
      return "grid grid-cols-1 grid-rows-1 relative w-full items-start overflow-hidden";
    }
    return baseContainer;
  };

  const itemClassNames = (i: number) => {
    const isSnapped = index() === i;
    const rawBaseItemClass = isFade() ? "col-start-1 row-start-1 w-full min-w-0" : classes().item;
    const hasCustomBasis = /(?:^|\s)basis-/.test(itemOverrideClass());
    const baseItemClass = hasCustomBasis
      ? rawBaseItemClass.replace(/(?:^|\s)basis-full(?:\s|$)/g, " ")
      : rawBaseItemClass;

    let itemClasses = baseItemClass;

    if (props.classNames) {
      const opt = typeof props.classNames === "object" ? props.classNames : {};
      const snappedCls = opt.snapped || "is-snapped";
      const inViewCls = opt.inView || "is-in-view";
      if (isSnapped) {
        itemClasses = `${itemClasses} ${snappedCls} ${inViewCls}`;
      }
    }

    if (isFade()) {
      const duration = props.duration ?? 500;
      itemClasses = `${itemClasses} transition-opacity duration-${duration} ease-in-out ${
        isSnapped ? "opacity-100 z-10 pointer-events-auto" : "opacity-0 z-0 pointer-events-none"
      }`;
    }

    return itemClasses.trim();
  };

  const containerStyle = () => {
    if (isFade()) return undefined;
    const duration = props.duration ?? 500;
    const transition = `transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1)`;
    const offset = -index() * basisPercent();

    if (isVertical()) {
      return {
        transform: `translate3d(0px, ${offset}%, 0px)`,
        transition,
      };
    }

    return {
      transform: `translate3d(${offset}%, 0px, 0px)`,
      transition,
    };
  };

  const showArrows = () =>
    Boolean(props.arrows || props.prev !== undefined || props.next !== undefined);
  const showDots = () => Boolean(props.dots) && dots().length > 0;

  return (
    <Tag
      role="region"
      aria-roledescription="carousel"
      aria-label={props["aria-label"] ?? uiT("carousel.label")}
      data-orientation={orientation()}
      data-slot="root"
      data-theme={theme()}
      class={classes().root}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...rest}
    >
      <div
        ref={(el) => (viewportRef = el)}
        data-slot="viewport"
        class={classes().viewport}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onDragStart={(e: DragEvent) => e.preventDefault()}
        onWheel={handleWheel}
      >
        <div
          ref={(el) => (containerRef = el)}
          data-slot="container"
          class={containerClasses()}
          style={containerStyle()}
          aria-live={autoplayTimer ? "off" : "polite"}
        >
          <Show
            when={resolvedItems().length > 0}
            fallback={
              <For each={resolvedChildren.toArray()}>
                {(child, i) => (
                  <div
                    data-slot="item"
                    class={itemClassNames(i())}
                    role="group"
                    aria-roledescription="slide"
                    aria-label={`${i() + 1} / ${slideCount()}`}
                  >
                    {child}
                  </div>
                )}
              </For>
            }
          >
            <For each={resolvedItems()}>
              {(item, i) => (
                <div
                  data-slot="item"
                  class={itemClassNames(i())}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${i() + 1} / ${slideCount()}`}
                >
                  {renderSingleSlideContent(item, i())}
                </div>
              )}
            </For>
          </Show>
        </div>
      </div>

      <Show when={showArrows()}>
        <div data-slot="arrows" class={classes().arrows}>
          <button
            type="button"
            aria-label={uiT("carousel.previous")}
            disabled={!canScrollPrev()}
            class={prevButtonClass()}
            data-slot="prev"
            onClick={prev}
          >
            <RLIcon name={props.prevIcon || "chevron-left"} class="size-4" />
          </button>
          <button
            type="button"
            aria-label={uiT("carousel.next")}
            disabled={!canScrollNext()}
            class={nextButtonClass()}
            data-slot="next"
            onClick={next}
          >
            <RLIcon name={props.nextIcon || "chevron-right"} class="size-4" />
          </button>
        </div>
      </Show>

      <Show when={showDots()}>
        <div
          data-slot="dots"
          role="tablist"
          aria-label={uiT("carousel.slides")}
          class={classes().dots}
        >
          <For each={dots()}>
            {(i) => (
              <button
                type="button"
                role="tab"
                data-slot="dot"
                data-state={index() === i ? "active" : undefined}
                aria-selected={index() === i ? "true" : "false"}
                aria-label={`${uiT("carousel.goToSlide")} ${i + 1}`}
                class={index() === i ? dotActiveClasses().dot : classes().dot}
                onClick={() => scrollTo(i)}
              />
            )}
          </For>
        </div>
      </Show>
    </Tag>
  );
};
