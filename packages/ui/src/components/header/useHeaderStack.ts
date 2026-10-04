import { createSignal, createMemo, createEffect, onSettled, type Accessor } from "solid-js";

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

export interface RegisterHeaderOptions {
  id: string;
  order?: number;
  type?: "banner" | "header";
  sticky?: boolean;
  fixed?: boolean;
  hideOnScroll?: boolean;
  visible?: boolean | Accessor<boolean>;
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

function syncTotalHeaderHeight(total: number) {
  if (typeof document !== "undefined") {
    document.documentElement.style.setProperty("--rl-total-header-height", `${total}px`);
  }
}

/**
 * SolidJS composable for managing stacked and collapsible headers/banners.
 *
 * Automatically tracks dynamic heights via ResizeObserver, computes dynamic top offsets, smoothly
 * collapses on scroll, and synchronizes the `--rl-total-header-height` CSS variable.
 */
export function useHeaderStack() {
  onSettled(() => {
    initGlobalScroll();
  });

  const registerHeader = (options: RegisterHeaderOptions) => {
    let el: HTMLElement | undefined;
    let observer: ResizeObserver | undefined;

    const isVisibleAccessor: () => boolean =
      typeof options.visible === "function"
        ? options.visible
        : () => Boolean(options.visible ?? true);

    onSettled(() => {
      initGlobalScroll();
      if (!el) return;

      const updateHeight = () => {
        if (!el) return;
        const height = Math.round(el.getBoundingClientRect().height);
        const visible: boolean = isVisibleAccessor();

        setHeaders((prev) => {
          const index = prev.findIndex((h) => h.id === options.id);
          const newEntry: HeaderLayer = {
            id: options.id,
            order: options.order ?? (options.type === "banner" ? 0 : 1),
            type: options.type ?? "header",
            height,
            sticky: options.sticky ?? true,
            fixed: options.fixed ?? false,
            hideOnScroll: options.hideOnScroll ?? false,
            visible,
            element: el,
          };

          if (index !== -1) {
            const existing = prev[index];
            if (
              existing &&
              existing.height === height &&
              existing.visible === visible &&
              existing.hideOnScroll === newEntry.hideOnScroll &&
              existing.order === newEntry.order &&
              existing.type === newEntry.type
            ) {
              return prev;
            }
            const copy = [...prev];
            copy[index] = newEntry;
            return copy;
          }
          return [...prev, newEntry];
        });
      };

      updateHeight();

      if (typeof ResizeObserver !== "undefined") {
        observer = new ResizeObserver(() => {
          updateHeight();
        });
        observer.observe(el);
      }

      return () => {
        if (observer) {
          observer.disconnect();
        }
        setHeaders((prev) => prev.filter((h) => h.id !== options.id));
      };
    });

    if (typeof options.visible === "function") {
      const vis = options.visible;
      createEffect(
        () => vis(),
        (visible) => {
          if (!el) return;
          const height = Math.round(el.getBoundingClientRect().height);
          setHeaders((prev) => {
            const index = prev.findIndex((h) => h.id === options.id);
            if (index === -1) return prev;
            const copy = [...prev];
            const existing = copy[index];
            if (existing) {
              copy[index] = { ...existing, height, visible: Boolean(visible) };
            }
            return copy;
          });
        },
      );
    }

    const isCollapsed = createMemo(() => {
      const hide = options.hideOnScroll ?? false;
      if (!hide) return false;
      return scrollY() > 50 && (scrollDirection() === "down" || scrollY() > 100);
    });

    const topOffset = createMemo(() => {
      const list = headers()
        .slice()
        .sort((a, b) => {
          if (a.type !== b.type) return a.type === "banner" ? -1 : 1;
          return a.order - b.order;
        });

      const index = list.findIndex((h) => h.id === options.id);
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
    syncTotalHeaderHeight(total);
    return total;
  });

  createEffect(
    () => totalOffset(),
    (offset) => {
      syncTotalHeaderHeight(offset);
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
