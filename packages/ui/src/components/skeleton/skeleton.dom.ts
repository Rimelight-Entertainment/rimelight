export interface SkeletonRect {
  x: number;
  y: number;
  width: number;
  height: number;
  tag: string;
  borderRadius: string;
}

interface LeafElement {
  element: Element;
  borderRadius: string;
}

interface WrappedCell {
  element: HTMLElement;
  span: HTMLSpanElement;
  borderRadius: string;
}

const ALWAYS_INCLUDE_TAGS = new Set([
  "img",
  "svg",
  "video",
  "canvas",
  "iframe",
  "input",
  "textarea",
  "button",
]);

const VOID_TAGS = new Set(["br", "wbr", "hr"]);

/**
 * Checks if an element is a "leaf" content element that should be represented as a skeleton block.
 */
export function isLeafElement(element: Element): boolean {
  const tag = element.tagName.toLowerCase();

  if (ALWAYS_INCLUDE_TAGS.has(tag)) {
    return true;
  }

  const hasRealChildren = Array.from(element.children).some(
    (child) => !VOID_TAGS.has(child.tagName.toLowerCase()),
  );

  return !hasRealChildren;
}

/**
 * Traverses the DOM tree and collects leaf elements.
 */
function collectLeafElements(
  element: Element,
  leafElements: LeafElement[],
  wrappedCells: WrappedCell[],
): void {
  // Skip elements explicitly marked to be ignored
  if (element.hasAttribute("data-skeleton-ignore") || element.hasAttribute("data-shimmer-ignore")) {
    return;
  }

  const isNoChildren =
    element.hasAttribute("data-skeleton-no-children") ||
    element.hasAttribute("data-shimmer-no-children");

  if (isNoChildren || isLeafElement(element)) {
    let borderRadius = "0px";
    if (typeof window !== "undefined") {
      const computedStyle = window.getComputedStyle(element);
      borderRadius = computedStyle.borderRadius || "0px";
    }

    // Handle text-only table cells specially
    const tag = element.tagName.toLowerCase();
    const isTableCell = tag === "td" || tag === "th";

    if (isTableCell && element.childNodes.length > 0 && typeof document !== "undefined") {
      const hasOnlyText = Array.from(element.childNodes).every(
        (node) => node.nodeType === Node.TEXT_NODE,
      );

      if (hasOnlyText) {
        const span = document.createElement("span");
        span.style.display = "inline";

        while (element.firstChild) {
          span.appendChild(element.firstChild);
        }
        element.appendChild(span);

        wrappedCells.push({
          element: element as HTMLElement,
          span,
          borderRadius,
        });
        return;
      }
    }

    leafElements.push({ element, borderRadius });
  } else {
    Array.from(element.children).forEach((child) => {
      collectLeafElements(child, leafElements, wrappedCells);
    });
  }
}

/**
 * Measures all collected leaf elements relative to the root container.
 */
function measureElements(
  leafElements: LeafElement[],
  wrappedCells: WrappedCell[],
  parentRect: DOMRect,
): SkeletonRect[] {
  const elements: SkeletonRect[] = [];

  leafElements.forEach(({ element, borderRadius }) => {
    const rect = element.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    elements.push({
      x: rect.left - parentRect.left,
      y: rect.top - parentRect.top,
      width: rect.width,
      height: rect.height,
      tag: element.tagName.toLowerCase(),
      borderRadius,
    });
  });

  wrappedCells.forEach(({ span, borderRadius }) => {
    const rect = span.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    elements.push({
      x: rect.left - parentRect.left,
      y: rect.top - parentRect.top,
      width: rect.width,
      height: rect.height,
      tag: span.parentElement?.tagName.toLowerCase() || "td",
      borderRadius,
    });
  });

  return elements;
}

/**
 * Cleans up temporary wrapper spans used for measuring table cells.
 */
function cleanupWrappedCells(wrappedCells: WrappedCell[]): void {
  wrappedCells.forEach(({ element, span }) => {
    while (span.firstChild) {
      element.insertBefore(span.firstChild, span);
    }
    element.removeChild(span);
  });
}

/**
 * Extracts dimension and coordinate information from all content elements within a container.
 */
export function extractSkeletonRects(rootElement: HTMLElement): SkeletonRect[] {
  const leafElements: LeafElement[] = [];
  const wrappedCells: WrappedCell[] = [];

  Array.from(rootElement.children).forEach((child) => {
    collectLeafElements(child, leafElements, wrappedCells);
  });

  const parentRect = rootElement.getBoundingClientRect();
  const rects = measureElements(leafElements, wrappedCells, parentRect);
  cleanupWrappedCells(wrappedCells);

  return rects;
}

/**
 * Creates a ResizeObserver on an element with requestAnimationFrame batching.
 */
export function createResizeObserver(element: HTMLElement, callback: () => void): () => void {
  if (typeof ResizeObserver === "undefined") {
    return () => {};
  }

  let rafId: number | null = null;

  const resizeObserver = new ResizeObserver(() => {
    if (rafId !== null && typeof cancelAnimationFrame !== "undefined") {
      cancelAnimationFrame(rafId);
    }

    if (typeof requestAnimationFrame !== "undefined") {
      rafId = requestAnimationFrame(() => {
        callback();
        rafId = null;
      });
    } else {
      callback();
    }
  });

  resizeObserver.observe(element);

  return () => {
    if (rafId !== null && typeof cancelAnimationFrame !== "undefined") {
      cancelAnimationFrame(rafId);
    }
    resizeObserver.disconnect();
  };
}
