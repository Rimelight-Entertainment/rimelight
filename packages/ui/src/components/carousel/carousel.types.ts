import type { JSX } from "@solidjs/web";
import type { InferThemeProps } from "../../resolver";
import type { RLButtonProps } from "../button/button.types";
import type { RLCarouselTheme } from "./carousel.theme";

export interface CarouselSlide {
  src?: string | undefined;
  imageSrc?: string | undefined;
  alt?: string | undefined;
  caption?: string | undefined;
  title?: string | undefined;
  description?: string | undefined;
}

export type CarouselItem = CarouselSlide | string;

export interface CarouselAutoplayOptions {
  /** Delay in milliseconds between slide transitions. */
  delay?: number | undefined;
  /** Stop autoplay on user interaction. */
  stopOnInteraction?: boolean | undefined;
  /** Stop autoplay when hovering over the carousel. */
  stopOnMouseEnter?: boolean | undefined;
  /** Stop autoplay on reaching the last snap point. */
  stopOnLastSnap?: boolean | undefined;
  /** Start autoplay immediately on initialization. */
  playOnInit?: boolean | undefined;
}

export interface CarouselAutoScrollOptions {
  /** Scroll speed in pixels or rate. */
  speed?: number | undefined;
  /** Auto scroll direction. */
  direction?: "forward" | "backward" | undefined;
  /** Stop auto-scrolling on user interaction. */
  stopOnInteraction?: boolean | undefined;
  /** Stop auto-scrolling when hovering. */
  stopOnMouseEnter?: boolean | undefined;
  /** Start auto-scrolling immediately on initialization. */
  playOnInit?: boolean | undefined;
}

export interface CarouselAutoHeightOptions {
  /** Whether auto-height adjustment is active. */
  active?: boolean | undefined;
}

export interface CarouselClassNamesOptions {
  /** Class name applied to snapped slide. */
  snapped?: string | undefined;
  /** Class name applied to in-view slides. */
  inView?: string | undefined;
}

export interface CarouselFadeOptions {
  /** Whether fade transition is active. */
  active?: boolean | undefined;
}

export interface CarouselWheelGesturesOptions {
  /** Whether wheel gestures navigation is active. */
  active?: boolean | undefined;
}

export type RLCarouselProps<T = unknown> = Omit<
  InferThemeProps<typeof RLCarouselTheme>,
  "children" | "onSelect" | "ref"
> & {
  /**
   * List of items to render in the carousel.
   */
  items?: T[] | undefined;

  /**
   * Configure the prev button when arrows are enabled.
   * @default { size: 'md', color: 'neutral', variant: 'link' }
   */
  prev?: Omit<RLButtonProps, "href" | "to"> | undefined;

  /**
   * The icon name displayed in the prev button.
   * @default 'chevron-left'
   */
  prevIcon?: string | undefined;

  /**
   * Configure the next button when arrows are enabled.
   * @default { size: 'md', color: 'neutral', variant: 'link' }
   */
  next?: Omit<RLButtonProps, "href" | "to"> | undefined;

  /**
   * The icon name displayed in the next button.
   * @default 'chevron-right'
   */
  nextIcon?: string | undefined;

  /**
   * Display prev and next buttons to scroll the carousel.
   * @default false
   */
  arrows?: boolean | undefined;

  /**
   * Display dots to scroll to a specific slide.
   * @default false
   */
  dots?: boolean | undefined;

  /**
   * Enable Autoplay plugin or configuration object.
   * @default false
   */
  autoplay?: boolean | CarouselAutoplayOptions | undefined;

  /**
   * Enable Auto Scroll plugin or configuration object.
   * @default false
   */
  autoScroll?: boolean | CarouselAutoScrollOptions | undefined;

  /**
   * Enable Auto Height plugin or configuration object.
   * @default false
   */
  autoHeight?: boolean | CarouselAutoHeightOptions | undefined;

  /**
   * Enable Class Names plugin or configuration object.
   * @default false
   */
  classNames?: boolean | CarouselClassNamesOptions | undefined;

  /**
   * Enable Fade plugin or configuration object.
   * @default false
   */
  fade?: boolean | CarouselFadeOptions | undefined;

  /**
   * Enable Wheel Gestures plugin or configuration object.
   * @default false
   */
  wheelGestures?: boolean | CarouselWheelGesturesOptions | undefined;

  /**
   * Alignment of items in the viewport.
   * @default 'start'
   */
  align?:
    | "start"
    | "center"
    | "end"
    | ((viewSize: number, snapSize: number, index: number) => number)
    | undefined;

  /**
   * Contain scroll behavior.
   * @default 'trimSnaps'
   */
  containScroll?: false | "trimSnaps" | "keepSnaps" | undefined;

  /**
   * Number of slides to scroll on navigation.
   * @default 1
   */
  slidesToScroll?: number | "auto" | undefined;

  /**
   * Enable free dragging without snapping.
   * @default false
   */
  dragFree?: boolean | undefined;

  /**
   * Drag threshold in pixels before drag gesture activates.
   * @default 10
   */
  dragThreshold?: number | undefined;

  /**
   * In-view threshold for visibility calculation.
   * @default 0
   */
  inViewThreshold?: number | number[] | undefined;

  /**
   * Infinite loop navigation.
   * @default false
   */
  loop?: boolean | undefined;

  /**
   * Skip snaps during rapid navigation.
   * @default false
   */
  skipSnaps?: boolean | undefined;

  /**
   * Transition duration in milliseconds.
   * @default 500
   */
  duration?: number | undefined;

  /**
   * Starting slide index.
   * @default 0
   */
  startIndex?: number | undefined;

  /**
   * Watch drag pointer interactions.
   * @default true
   */
  watchDrag?: boolean | undefined;

  /**
   * Watch resize events.
   * @default true
   */
  watchResize?: boolean | undefined;

  /**
   * Watch slide mutations.
   * @default true
   */
  watchSlides?: boolean | undefined;

  /**
   * Watch focus events for keyboard navigation.
   * @default true
   */
  watchFocus?: boolean | undefined;

  /**
   * Breakpoint responsive configuration.
   */
  breakpoints?: Record<string, Partial<RLCarouselProps<T>>> | undefined;

  /**
   * Children content or scoped render function.
   */
  children?:
    | JSX.Element
    | ((item: T, index: () => number) => JSX.Element)
    | ((ctx: { item: T; index: number }) => JSX.Element)
    | undefined;

  /**
   * Event fired on slide selection with the selected index.
   */
  onSelect?: ((selectedIndex: number) => void) | undefined;

  /**
   * Ref handle callback.
   */
  ref?: ((handle: RLCarouselHandle) => void) | undefined;
};

export interface RLCarouselHandle {
  scrollTo: (index: number) => void;
  next: () => void;
  prev: () => void;
  selectedIndex: () => number;
  slideCount: () => number;
  canScrollNext: () => boolean;
  canScrollPrev: () => boolean;
}
