import type { JSX } from "@solidjs/web";
import type {
  CarouselAutoplayOptions,
  CarouselAutoScrollOptions,
  CarouselItemContext,
  CarouselSlide,
  CarouselStateClassesOptions,
  RLCarouselProps,
} from "./carousel.types";
import { RLCarouselTheme } from "./carousel.theme";
import { RLButton } from "../button/RLButton";
import { RLImage } from "../image/RLImage";
import { children, createEffect, createMemo, createSignal, For, onSettled, Show } from "solid-js";
import { uiT } from "../../locale";
import { renderSlot } from "../../slot";

const OMIT_KEYS = [
  "items",
  "prev",
  "prevIcon",
  "next",
  "nextIcon",
  "arrows",
  "hasDots",
  "autoplay",
  "autoScroll",
  "stateClasses",
  "fade",
  "wheelGestures",
  "slidesToScroll",
  "dragThreshold",
  "loop",
  "duration",
  "startIndex",
  "watchDrag",
  "watchFocus",
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

export const RLCarousel = <T = unknown,>(props: RLCarouselProps<T>) => {
  const [index, setIndex] = createSignal(props.startIndex ?? 0);
  const [isHovered, setIsHovered] = createSignal(false);

  const orientation = () => props.orientation ?? "horizontal";
  const controlsPlacement = () => props.controls ?? "outside";
  const isVertical = () => orientation() === "vertical";
  const isLoop = () => Boolean(props.loop);
  const isFade = () => Boolean(props.fade);
  const duration = () => props.duration ?? 500;
  const resolvedItems = (): T[] => props.items ?? [];

  const {
    Tag,
    classes,
    rest,
    theme,
    slots,
    children: childNodes,
  } = RLCarouselTheme.setup(props, {
    omit: OMIT_KEYS,
    slots: ["prevSlot", "nextSlot"] as const,
    variants: () => ({
      orientation: orientation(),
      controls: controlsPlacement(),
      fade: isFade(),
    }),
  });
  const triggerImageUi = () => ({ triggerImage: classes().image });
  const prevUi = () => ({ ...props.prev?.ui, root: classes().prev });
  const nextUi = () => ({ ...props.next?.ui, root: classes().next });

  const slideChildren = () => childNodes() as RLCarouselProps<T>["children"];

  const resolvedChildren = children(() => {
    const nodes = slideChildren();
    return typeof nodes === "function" ? null : nodes;
  });

  const slideCount = createMemo(() => {
    if (resolvedItems().length > 0) return resolvedItems().length;
    if (typeof slideChildren() === "function") return 0;
    return resolvedChildren.toArray().length;
  });

  const slideIndexes = createMemo(() => Array.from({ length: slideCount() }, (_, i) => i));

  const basisPercent = createMemo(() => parseBasisPercent(classes().item));
  const hasCustomBasis = createMemo(() => /(?:^|\s)basis-(?!full(?:\s|$))/.test(classes().item));

  let viewportRef: HTMLDivElement | undefined;
  let containerRef: HTMLDivElement | undefined;
  let startX = 0;
  let startY = 0;
  let isDragging = false;
  let hasDragged = false;
  let autoplayTimer: ReturnType<typeof setInterval> | undefined;
  let wheelThrottleTimer: ReturnType<typeof setTimeout> | undefined;

  const isSnapped = (i: number) => index() === i;
  const canScrollPrev = () => isLoop() || index() > 0;
  const canScrollNext = () => isLoop() || index() < slideCount() - 1;
  const scrollStep = () => props.slidesToScroll ?? 1;

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
    (state) => {
      const { autoplay, autoScroll, hovered, loop, count, step } = state;
      stopAutoplay();
      if ((!autoplay && !autoScroll) || hovered || count <= 1) return;

      const autoplayOpt: CarouselAutoplayOptions = typeof autoplay === "object" ? autoplay : {};
      const autoScrollOpt: CarouselAutoScrollOptions =
        typeof autoScroll === "object" ? autoScroll : {};

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
      clearTimeout(wheelThrottleTimer);
    };
  });

  const translateFor = (offsetPercent: number) =>
    isVertical()
      ? `translate3d(0px, ${offsetPercent}%, 0px)`
      : `translate3d(${offsetPercent}%, 0px, 0px)`;

  const transformTransition = () => `transform ${duration()}ms cubic-bezier(0.16, 1, 0.3, 1)`;

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
      const dragPercent = (delta / (dimension || 1)) * 100;

      containerRef.style.transition = "none";
      containerRef.style.transform = translateFor(-index() * basisPercent() + dragPercent);
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
        containerRef.style.transition = transformTransition();
        containerRef.style.transform = translateFor(-index() * basisPercent());
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

  const itemContent = (item: T, i: number): JSX.Element => {
    const renderer = slideChildren();
    if (typeof renderer === "function") {
      const ctx: CarouselItemContext<T> = { item, index: i };
      return renderer(ctx);
    }

    if (typeof item === "string") {
      return <RLImage src={item} alt="" lightbox={false} ui={triggerImageUi()} />;
    }

    if (typeof item === "object" && item !== null) {
      const slide = item as CarouselSlide;
      const imageSource = slide.imageSrc || slide.src;
      return (
        <div data-slot="media" class={classes().media}>
          <Show when={imageSource}>
            {(src) => (
              <RLImage
                src={src()}
                alt={slide.alt || slide.title || ""}
                lightbox={false}
                ui={triggerImageUi()}
              />
            )}
          </Show>
          <Show when={slide.title || slide.description}>
            <div data-slot="caption" class={classes().caption}>
              <Show when={slide.title}>
                {(title) => (
                  <h4 data-slot="caption-title" class={classes().captionTitle}>
                    {title()}
                  </h4>
                )}
              </Show>
              <Show when={slide.description}>
                {(description) => (
                  <p data-slot="caption-description" class={classes().captionDescription}>
                    {description()}
                  </p>
                )}
              </Show>
            </div>
          </Show>
        </div>
      );
    }

    return String(item);
  };

  const slideContent = (i: number): JSX.Element => {
    const items = resolvedItems();
    if (items.length > 0) return itemContent(items[i] as T, i);
    return resolvedChildren.toArray()[i];
  };

  const itemClassNames = (i: number) => {
    const base = hasCustomBasis()
      ? classes().item.replace(/(?:^|\s)basis-full(?:\s|$)/g, " ")
      : classes().item;
    if (!props.stateClasses || !isSnapped(i)) return base;

    const opt: CarouselStateClassesOptions =
      typeof props.stateClasses === "object" ? props.stateClasses : {};
    return `${base} ${opt.snapped || "is-snapped"} ${opt.inView || "is-in-view"}`;
  };

  const showArrows = () =>
    Boolean(props.arrows || props.prev !== undefined || props.next !== undefined);
  const hasDots = () => Boolean(props.hasDots) && slideCount() > 0;

  const prevLeadingIcon = () => (slots.prevSlot() ? undefined : (props.prevIcon ?? "chevron-left"));
  const nextLeadingIcon = () =>
    slots.nextSlot() ? undefined : (props.nextIcon ?? "chevron-right");

  return (
    <Tag
      role="region"
      aria-roledescription="carousel"
      aria-label={props["aria-label"] ?? uiT("carousel.label")}
      data-orientation={orientation()}
      data-slot="root"
      data-theme={theme()}
      class={classes().root}
      tabindex={0}
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
          class={classes().container}
          style={{
            "--rl-carousel-duration": isFade() ? `${duration()}ms` : undefined,
            "--rl-carousel-transform": isFade()
              ? undefined
              : translateFor(-index() * basisPercent()),
            "--rl-carousel-transition": isFade() ? undefined : transformTransition(),
          }}
          aria-live={autoplayTimer ? "off" : "polite"}
        >
          <For each={slideIndexes()}>
            {(i) => (
              <div
                data-slot="item"
                data-state={isSnapped(i) ? "active" : "inactive"}
                class={itemClassNames(i)}
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} / ${slideCount()}`}
              >
                {slideContent(i)}
              </div>
            )}
          </For>
        </div>
      </div>

      <Show when={showArrows()}>
        <RLButton
          {...props.prev}
          variant={props.prev?.variant ?? "link"}
          color={props.prev?.color ?? "neutral"}
          size={props.prev?.size ?? "md"}
          ui={prevUi()}
          leadingIcon={prevLeadingIcon()}
          data-slot="prev"
          aria-label={props.prev?.["aria-label"] ?? uiT("carousel.previous")}
          disabled={!canScrollPrev()}
          onClick={prev}
        >
          <Show when={slots.prevSlot()}>{(node) => renderSlot(node())}</Show>
        </RLButton>
        <RLButton
          {...props.next}
          variant={props.next?.variant ?? "link"}
          color={props.next?.color ?? "neutral"}
          size={props.next?.size ?? "md"}
          ui={nextUi()}
          leadingIcon={nextLeadingIcon()}
          data-slot="next"
          aria-label={props.next?.["aria-label"] ?? uiT("carousel.next")}
          disabled={!canScrollNext()}
          onClick={next}
        >
          <Show when={slots.nextSlot()}>{(node) => renderSlot(node())}</Show>
        </RLButton>
      </Show>

      <Show when={hasDots()}>
        <div
          data-slot="dots"
          role="tablist"
          aria-label={uiT("carousel.slides")}
          class={classes().dots}
        >
          <For each={slideIndexes()}>
            {(i) => (
              <RLButton
                type="button"
                variant="ghost"
                color="neutral"
                role="tab"
                data-slot="dot"
                data-state={isSnapped(i) ? "active" : "inactive"}
                aria-selected={isSnapped(i) ? "true" : "false"}
                aria-label={`${uiT("carousel.goToSlide")} ${i + 1}`}
                class={classes().dot}
                onClick={() => scrollTo(i)}
              />
            )}
          </For>
        </div>
      </Show>
    </Tag>
  );
};
