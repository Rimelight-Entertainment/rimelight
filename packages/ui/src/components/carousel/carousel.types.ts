import type { JSX } from "@solidjs/web";
import type { InferThemeProps } from "../../resolver";
import type { SlotRenderer } from "../../types";
import type { RLButtonProps } from "../button/button.types";
import type { RLCarouselTheme } from "./carousel.theme";

export interface CarouselSlide {
  /** Image source for an object-shaped item. */
  src?: string | undefined;
  /** Image source for an object-shaped item; takes precedence over `src`. */
  imageSrc?: string | undefined;
  /** Accessible text for the image. */
  alt?: string | undefined;
  /** Caption heading rendered over the image. */
  title?: string | undefined;
  /** Caption body rendered under the title. */
  description?: string | undefined;
}

export interface CarouselItemContext<T> {
  /** The item being rendered. */
  item: T;
  /** Zero-based index of the item. */
  index: number;
}

export interface CarouselAutoplayOptions {
  /** Delay in milliseconds between slide transitions. */
  delay?: number | undefined;
  /** Pause autoplay while the pointer is over the carousel. */
  stopOnMouseEnter?: boolean | undefined;
  /** Stop autoplay on reaching the last slide. */
  stopOnLastSnap?: boolean | undefined;
}

export interface CarouselAutoScrollOptions {
  /** Scroll speed in slides per second. */
  speed?: number | undefined;
}

export interface CarouselStateClassesOptions {
  /** Class name applied to the snapped slide. */
  snapped?: string | undefined;
  /** Class name applied to the snapped slide, alongside `snapped`. */
  inView?: string | undefined;
}

export type RLCarouselProps<T = unknown> = Omit<
  InferThemeProps<typeof RLCarouselTheme>,
  "children" | "fade" | "onSelect" | "ref"
> & {
  /**
   * List of items to render in the carousel. When omitted, `children` render the slides.
   */
  items?: T[] | undefined;

  /**
   * Button configuration for the previous arrow. Setting `prev` or `next` also shows the arrows.
   * @default { variant: 'link', color: 'neutral', size: 'md' }
   */
  prev?: Omit<RLButtonProps, "href" | "to"> | undefined;

  /**
   * Icon name displayed in the previous arrow.
   * @default 'chevron-left'
   */
  prevIcon?: string | undefined;

  /**
   * Custom content rendered inside the previous arrow instead of `prevIcon`.
   */
  prevSlot?: SlotRenderer | undefined;

  /**
   * Button configuration for the next arrow. Setting `prev` or `next` also shows the arrows.
   * @default { variant: 'link', color: 'neutral', size: 'md' }
   */
  next?: Omit<RLButtonProps, "href" | "to"> | undefined;

  /**
   * Icon name displayed in the next arrow.
   * @default 'chevron-right'
   */
  nextIcon?: string | undefined;

  /**
   * Custom content rendered inside the next arrow instead of `nextIcon`.
   */
  nextSlot?: SlotRenderer | undefined;

  /**
   * Display previous and next arrows to scroll the carousel.
   * @default false
   */
  arrows?: boolean | undefined;

  /**
   * Display dots to scroll to a specific slide.
   * @default false
   */
  hasDots?: boolean | undefined;

  /**
   * Enable autoplay, or pass an options object.
   * @default false
   */
  autoplay?: boolean | CarouselAutoplayOptions | undefined;

  /**
   * Enable continuous auto scroll, or pass an options object.
   * @default false
   */
  autoScroll?: boolean | CarouselAutoScrollOptions | undefined;

  /**
   * Add state classes to slides: `snapped` on the active slide and `inView` on visible slides.
   * Pass an object to rename the classes.
   * @default false
   */
  stateClasses?: boolean | CarouselStateClassesOptions | undefined;

  /**
   * Cross-fade slides instead of sliding them.
   * @default false
   */
  fade?: boolean | undefined;

  /**
   * Navigate slides with the mouse wheel or trackpad.
   * @default false
   */
  wheelGestures?: boolean | undefined;

  /**
   * Number of slides to scroll on navigation.
   * @default 1
   */
  slidesToScroll?: number | undefined;

  /**
   * Drag distance in pixels before a drag gesture activates.
   * @default 10
   */
  dragThreshold?: number | undefined;

  /**
   * Wrap navigation from the last slide to the first and back.
   * @default false
   */
  loop?: boolean | undefined;

  /**
   * Transition duration in milliseconds.
   * @default 500
   */
  duration?: number | undefined;

  /**
   * Index of the initially selected slide.
   * @default 0
   */
  startIndex?: number | undefined;

  /**
   * Enable pointer dragging.
   * @default true
   */
  watchDrag?: boolean | undefined;

  /**
   * Enable keyboard navigation.
   * @default true
   */
  watchFocus?: boolean | undefined;

  /**
   * Slide content. Pass JSX for static slides, or a function that receives each item and its index.
   */
  children?: JSX.Element | ((ctx: CarouselItemContext<T>) => JSX.Element) | undefined;

  /**
   * Called with the selected index whenever the selected slide changes.
   */
  onSelect?: ((selectedIndex: number) => void) | undefined;

  /**
   * Receives a handle for programmatic navigation.
   */
  ref?: ((handle: CarouselHandle) => void) | undefined;
};

export interface CarouselHandle {
  scrollTo: (index: number) => void;
  next: () => void;
  prev: () => void;
  selectedIndex: () => number;
  slideCount: () => number;
  canScrollNext: () => boolean;
  canScrollPrev: () => boolean;
}
