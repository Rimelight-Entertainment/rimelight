import {
  children,
  createMemo,
  createSignal,
  For,
  onSettled,
  Show,
  omit,
  type Component
} from "solid-js";
import type { JSX } from "@solidjs/web";
import type { CarouselProps, CarouselSlide } from "./carousel";
import { carouselTheme } from "./carousel.theme";
import { RLIcon } from "../icon/RLIcon";

export interface RLCarouselProps extends CarouselProps {
  children?: JSX.Element;
}

const SLIDE_TRANSITION = "transform 500ms cubic-bezier(0.16, 1, 0.3, 1)";

const RLCarousel: Component<RLCarouselProps> = (allProps) => {
  const props = allProps;
  const rest = omit(allProps, "slides", "autoplay", "ui", "class", "children");

  const [index, setIndex] = createSignal(0);
  const [dragOffset, setDragOffset] = createSignal(0);
  const [isDragging, setIsDragging] = createSignal(false);

  const childrenContent = children(() => props.children);

  const slideCount = createMemo(() => {
    if (props.slides && props.slides.length > 0) return props.slides.length;
    return childrenContent.toArray().length;
  });

  let viewportRef: HTMLDivElement | undefined;
  let containerRef: HTMLDivElement | undefined;
  let startX = 0;
  let startY = 0;
  let hasDragged = false;
  let intervalId: ReturnType<typeof setInterval> | undefined;
  let lastBtnClickTime = 0;

  const resolvedClasses = createMemo(() =>
    carouselTheme({
      active: false,
      ui: props.ui,
      class: props.class
    })
  );

  const dotActiveClasses = createMemo(() =>
    carouselTheme({
      active: true,
      ui: props.ui,
      class: props.class
    })
  );

  const carouselId = `rl-carousel-${Math.random().toString(36).substring(2, 9)}`;
  const dots = createMemo(() => Array.from({ length: slideCount() }, (_, i) => i));

  const goTo = (n: number) => {
    const count = slideCount();
    if (count === 0) return;
    setIndex(((n % count) + count) % count);
  };

  const next = () => goTo(index() + 1);
  const prev = () => goTo(index() - 1);

  const startAutoplay = () => {
    if (props.autoplay && !intervalId) {
      intervalId = setInterval(() => goTo(index() + 1), 5000);
    }
  };

  const stopAutoplay = () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = undefined;
    }
  };

  onSettled(() => {
    startAutoplay();
    return stopAutoplay;
  });

  const handleBtnClick = (action: () => void) => {
    const now = Date.now();
    if (now - lastBtnClickTime < 500) return;
    lastBtnClickTime = now;
    stopAutoplay();
    action();
    startAutoplay();
  };

  const handlePointerDown = (e: PointerEvent) => {
    if (!viewportRef) return;
    stopAutoplay();
    startX = e.clientX;
    startY = e.clientY;
    hasDragged = false;
    setIsDragging(true);
    try {
      viewportRef.setPointerCapture(e.pointerId);
    } catch {}
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (!isDragging() || !viewportRef || !containerRef) return;
    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;

    if (!hasDragged) {
      if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 5) {
        setIsDragging(false);
        try {
          viewportRef.releasePointerCapture(e.pointerId);
        } catch {}
        return;
      }
      if (Math.abs(deltaX) > 5) {
        hasDragged = true;
      }
    }

    if (hasDragged) {
      e.preventDefault();
      const width = viewportRef.clientWidth;
      setDragOffset((deltaX / width) * 100);
    }
  };

  const handlePointerUp = (e: PointerEvent) => {
    if (!isDragging() || !viewportRef) return;
    setIsDragging(false);
    setDragOffset(0);
    try {
      viewportRef.releasePointerCapture(e.pointerId);
    } catch {}

    if (hasDragged) {
      const deltaX = e.clientX - startX;
      const width = viewportRef.clientWidth;
      const threshold = width * 0.15;
      if (deltaX < -threshold) {
        next();
      } else if (deltaX > threshold) {
        prev();
      }
    }
    hasDragged = false;
    startAutoplay();
  };

  const renderSlide = (slide: CarouselSlide) => (
    <div class={`${resolvedClasses().slide} rl-carousel-slide`} data-slot="slide">
      <div class="relative w-full aspect-video">
        {slide.imageSrc ? (
          <img
            src={slide.imageSrc}
            alt={slide.title || ""}
            class="w-full h-full object-cover rounded-lg"
            draggable="false"
          />
        ) : null}
        {slide.title || slide.description ? (
          <div class="absolute bottom-4 left-4 right-4 p-4 rounded-lg bg-black/60 backdrop-blur-sm text-white">
            {slide.title ? <h4 class="text-sm font-semibold">{slide.title}</h4> : null}
            {slide.description ? <p class="text-xs opacity-95 mt-1">{slide.description}</p> : null}
          </div>
        ) : null}
      </div>
    </div>
  );

  return (
    <div data-autoplay={props.autoplay ? "true" : "false"} class="contents" {...rest}>
      <div id={carouselId} class={resolvedClasses().root} data-slot="root">
        <div
          ref={(el) => (viewportRef = el)}
          class={resolvedClasses().viewport}
          data-slot="viewport"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <div
            ref={(el) => (containerRef = el)}
            class={resolvedClasses().container}
            data-slot="container"
            style={{
              transform: `translate3d(${-index() * 100 + dragOffset()}%, 0px, 0px)`,
              transition: isDragging() && hasDragged ? "none" : SLIDE_TRANSITION
            }}
          >
            {props.slides && props.slides.length > 0 ? (
              <For each={props.slides}>{(slide) => renderSlide(slide)}</For>
            ) : (
              childrenContent.toArray().map((child) => (
                <div class={`${resolvedClasses().slide} rl-carousel-slide`} data-slot="slide">
                  {child}
                </div>
              ))
            )}
          </div>
        </div>

        <button
          class={resolvedClasses().buttonPrev}
          data-slot="prev-button"
          type="button"
          aria-label="Previous slide"
          onClick={() => handleBtnClick(prev)}
        >
          <RLIcon name="i-rl-chevronLeft" class="size-5" aria-hidden="true" />
        </button>
        <button
          class={resolvedClasses().buttonNext}
          data-slot="next-button"
          type="button"
          aria-label="Next slide"
          onClick={() => handleBtnClick(next)}
        >
          <RLIcon name="i-rl-chevronRight" class="size-5" aria-hidden="true" />
        </button>

        <Show when={dots().length > 0}>
          <div class={resolvedClasses().dots} data-slot="dots">
            <For each={dots()}>
              {(i) => (
                <button
                  type="button"
                  class={index() === i ? dotActiveClasses().dot : resolvedClasses().dot}
                  data-slot="dot"
                  aria-label={`Go to slide ${i + 1}`}
                  onClick={() => handleBtnClick(() => goTo(i))}
                />
              )}
            </For>
          </div>
        </Show>
      </div>
    </div>
  );
};

export { RLCarousel };
