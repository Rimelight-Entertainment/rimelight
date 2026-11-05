import {
  createSignal,
  createMemo,
  createEffect,
  onSettled,
  untrack,
  type Accessor,
} from "solid-js";

export interface HeaderLayer {
  id: string;
  order: number;
  type: "banner" | "header";
  height: number;
  sticky: boolean;
  fixed: boolean;
  hideOnScroll: boolean;
  visible: boolean;
  element?: HTMLElement | null | undefined;
}

export type MaybeAccessor<T> = T | Accessor<T>;

export interface RegisterHeaderOptions {
  id: MaybeAccessor<string>;
  order?: MaybeAccessor<number | undefined>;
  type?: MaybeAccessor<"banner" | "header" | undefined>;
  sticky?: MaybeAccessor<boolean | undefined>;
  fixed?: MaybeAccessor<boolean | undefined>;
  hideOnScroll?: MaybeAccessor<boolean | undefined>;
  visible?: MaybeAccessor<boolean | undefined>;
}

// Global singleton state shared across all header and banner islands
const [scrollY, setScrollY] = createSignal(0);
const [scrollDirection, setScrollDirection] = createSignal<"up" | "down">("up");
const [headers, setHeaders] = createSignal<HeaderLayer[]>([]);

let isScrollListening = false;

function initGlobalScroll() {
  if (isScrollListening || typeof window === "undefined") return;
  isScrollListening = true;

  let lastScroll = window.scrollY;
  setScrollY(lastScroll);

  const handleScroll = () => {
    const current = window.scrollY;
    if (current !== lastScroll) {
      setScrollDirection(current > lastScroll ? "down" : "up");
      setScrollY(current);
      lastScroll = Math.max(0, current);
    }
  };

  window.addEventListener("scroll", handleScroll, { passive: true });
}

function syncHeaderHeight(total: number) {
  if (typeof document !== "undefined") {
    document.documentElement.style.setProperty("--rl-header-height", `${total}px`);
  }
}

/**
 * SolidJS composable for managing stacked and collapsible headers/banners.
 *
 * Automatically tracks dynamic heights via ResizeObserver, computes dynamic top offsets, smoothly
 * collapses on scroll, and synchronizes the `--rl-header-height` CSS variable.
 */
export function useHeaderStack() {
  onSettled(() => {
    initGlobalScroll();
  });

  const registerHeader = (options: RegisterHeaderOptions) => {
    let el: HTMLElement | undefined;
    let observer: ResizeObserver | undefined;

    const idOpt = options.id;
    const idAccessor: () => string = typeof idOpt === "function" ? idOpt : () => idOpt;

    const typeOpt = options.type;
    const typeAccessor: () => "banner" | "header" =
      typeof typeOpt === "function" ? () => typeOpt() ?? "header" : () => typeOpt ?? "header";

    const orderOpt = options.order;
    const orderAccessor: () => number =
      typeof orderOpt === "function" ? () => orderOpt() ?? 0 : () => orderOpt ?? 0;

    const stickyOpt = options.sticky;
    const stickyAccessor: () => boolean =
      typeof stickyOpt === "function" ? () => stickyOpt() ?? true : () => stickyOpt ?? true;

    const fixedOpt = options.fixed;
    const fixedAccessor: () => boolean =
      typeof fixedOpt === "function" ? () => fixedOpt() ?? false : () => fixedOpt ?? false;

    const hideOnScrollOpt = options.hideOnScroll;
    const hideOnScrollAccessor: () => boolean =
      typeof hideOnScrollOpt === "function"
        ? () => hideOnScrollOpt() ?? false
        : () => hideOnScrollOpt ?? false;

    const visibleOpt = options.visible;
    const isVisibleAccessor: () => boolean =
      typeof visibleOpt === "function"
        ? () => Boolean(visibleOpt())
        : () => Boolean(visibleOpt ?? true);

    const getHeaderEntry = (height: number): HeaderLayer => ({
      id: idAccessor(),
      order: orderAccessor(),
      type: typeAccessor(),
      height,
      sticky: stickyAccessor(),
      fixed: fixedAccessor(),
      hideOnScroll: hideOnScrollAccessor(),
      visible: isVisibleAccessor(),
      element: el,
    });

    onSettled(() => {
      initGlobalScroll();
      if (!el) return;

      let rafId: number | undefined;

      const updateHeight = () => {
        if (!el) return;
        const height = Math.round(el.getBoundingClientRect().height);
        const newEntry = getHeaderEntry(height);

        untrack(() => {
          setHeaders((prev) => {
            const index = prev.findIndex((h) => h.id === newEntry.id);
            if (index !== -1) {
              const existing = prev[index];
              if (
                existing &&
                existing.height === height &&
                existing.visible === newEntry.visible &&
                existing.hideOnScroll === newEntry.hideOnScroll &&
                existing.order === newEntry.order &&
                existing.type === newEntry.type &&
                existing.sticky === newEntry.sticky &&
                existing.fixed === newEntry.fixed
              ) {
                return prev;
              }
              const copy = [...prev];
              copy[index] = newEntry;
              return copy;
            }
            return [...prev, newEntry];
          });
        });
      };

      if (typeof window !== "undefined" && typeof requestAnimationFrame !== "undefined") {
        rafId = requestAnimationFrame(updateHeight);
      } else {
        updateHeight();
      }

      if (typeof ResizeObserver !== "undefined") {
        observer = new ResizeObserver(() => {
          updateHeight();
        });
        observer.observe(el);
      }

      return () => {
        if (rafId !== undefined && typeof cancelAnimationFrame !== "undefined") {
          cancelAnimationFrame(rafId);
        }
        if (observer) {
          observer.disconnect();
        }
        const currentId = idAccessor();
        queueMicrotask(() => {
          setHeaders((prev) => prev.filter((h) => h.id !== currentId));
        });
      };
    });

    createEffect(
      () => ({
        id: idAccessor(),
        order: orderAccessor(),
        type: typeAccessor(),
        sticky: stickyAccessor(),
        fixed: fixedAccessor(),
        hideOnScroll: hideOnScrollAccessor(),
        visible: isVisibleAccessor(),
      }),
      (entryProps) => {
        if (!el) return;
        const height = Math.round(el.getBoundingClientRect().height);
        untrack(() => {
          setHeaders((prev) => {
            const index = prev.findIndex((h) => h.id === entryProps.id);
            if (index === -1) return prev;
            const copy = [...prev];
            const existing = copy[index];
            if (existing) {
              copy[index] = { ...existing, ...entryProps, height, element: el };
            }
            return copy;
          });
        });
      },
    );

    const isCollapsed = createMemo(() => {
      const hide = hideOnScrollAccessor();
      if (!hide) return false;
      return scrollY() > 50 && (scrollDirection() === "down" || scrollY() > 100);
    });

    const topOffset = createMemo(() => {
      const currentId = idAccessor();
      const list = headers()
        .slice()
        .sort((a, b) => {
          if (a.type !== b.type) return a.type === "banner" ? -1 : 1;
          return a.order - b.order;
        });

      const index = list.findIndex((h) => h.id === currentId);
      if (index <= 0) return 0;

      let top = 0;
      for (let i = 0; i < index; i++) {
        const prev = list[i];
        if (!prev || !prev.visible) continue;

        const prevCollapsed =
          prev.hideOnScroll && scrollY() > 50 && (scrollDirection() === "down" || scrollY() > 100);
        if (!prevCollapsed) {
          top += prev.height;
        }
      }
      return top;
    });

    return {
      ref: (node: HTMLElement) => {
        el = node;
      },
      topOffset,
      isCollapsed,
    };
  };

  const totalOffset = createMemo(() => {
    const list = headers();
    let total = 0;
    for (const h of list) {
      if (!h || !h.visible) continue;
      const isCollapsed =
        h.hideOnScroll && scrollY() > 50 && (scrollDirection() === "down" || scrollY() > 100);
      if (!isCollapsed) {
        total += h.height;
      }
    }
    syncHeaderHeight(total);
    return total;
  });

  createEffect(
    () => totalOffset(),
    (offset) => {
      syncHeaderHeight(offset);
    },
  );

  return {
    scrollY,
    scrollDirection,
    headers,
    registerHeader,
    totalOffset,
  };
}
